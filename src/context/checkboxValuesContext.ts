import { writable } from "svelte/store";
import { fetchGetCheckboxValues, WS_URL } from "../lib/fetch";

export const BTIS_PER_CHECKBOX = 4;
export const CHECKBOX_COUNT = 1_000_000;
export const UINT8ARRAY_SIZE = CHECKBOX_COUNT * BTIS_PER_CHECKBOX / 8;


export const enum WsConnectionState {
  Connecting = 'Connecting...',
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}

/* msg examples:

[---2bits----|---------2bits----------|-4bits-|-32bits--]
[ msg type   | sub msg                |       |         ]
---------------------------------------------------------
[   bitmap   | BitmapMessage.Add      |       |checkbox ]
[   bitmap   | BitmapMessage.Sub      |       |checkbox ]
[   bitmap   | BitmapMessage.Set      | 0-15  |checkbox ]
---------------------------------------------------------
[online users|                        |       |users num]

*/

enum WsMessage {
  Bitmap,
  OnlineUsers
}
enum BitmapMessage {
  Add,
  Sub,
  Set
}

type BitmapMessageType = 
  | { bitmap: BitmapMessage.Add, value: undefined }
  | { bitmap: BitmapMessage.Sub, value: undefined }
  | { bitmap: BitmapMessage.Set, value: number }

const createContext = () => {
  let socket: WebSocket | null = null
  let fetchValuesFailed = false

  const State = writable<{
    wsConnected: WsConnectionState,
    bitmap: Uint8Array,
    onlineUsers: number
  }>({
    wsConnected: WsConnectionState.Disconnected,
    bitmap: new Uint8Array(UINT8ARRAY_SIZE),
    onlineUsers: 0
  })
  
  const incrementValue = (i: number) => {
    if(socket && socket.readyState == WebSocket.OPEN) {
      const msg = new Uint8Array(5)
      msg[0] = (WsMessage.Bitmap << 6) | (BitmapMessage.Add << 4)
      new DataView(msg.buffer).setUint32(1, i, true)
      socket.send(msg)
    }
  }

  const decrementValue = (i: number) => {
    if(socket && socket.readyState == WebSocket.OPEN) {
      const msg = new Uint8Array(5)
      msg[0] = (WsMessage.Bitmap << 6) | (BitmapMessage.Sub << 4)
      new DataView(msg.buffer).setUint32(1, i, true)
      socket.send(msg)
    }
  }

  const setValue = (i: number, value: number) => {
    if(socket && socket.readyState == WebSocket.OPEN && value >= 0 && value <= 15) {
      const msg = new Uint8Array(5)
      msg[0] = (WsMessage.Bitmap << 6) | (BitmapMessage.Set << 4) | value
      new DataView(msg.buffer).setUint32(1, i, true)
      socket.send(msg)
    }
  }

  const connectWs = async (conf: { attepmts: number, timeBetween: number }) => {
    for (let i = 0; i < conf.attepmts; i++) {
      if(fetchValuesFailed) {
    
        setConnectionState(WsConnectionState.Disconnected)
        return
      }

      try {
        socket = await connectWsInner()
        break
      } catch (error) {
        await new Promise(r => setTimeout(r, conf.timeBetween))
      }
    }
  }

  const onWsMessage = (msg: Uint8Array) => {
    const byte1 = msg[0]
    const type = (byte1 >> 6) & 0b11 // first 2 bits
    const operation = (byte1 >> 4) & 0b11 // next 2 bits
    const i = new DataView(msg.buffer).getUint32(1, true) // last 32 bits

    if(type === WsMessage.Bitmap) {
      const newValueSet = byte1 & 0b1111 // last 4 bits

      if (!(operation in BitmapMessage) || (operation === BitmapMessage.Set && !newValueSet)) {
        return
      }

      let ws_msg: BitmapMessageType = {
        bitmap: operation,
        value: operation === BitmapMessage.Set ? newValueSet : undefined
      }
   
      setValueOnBuf(i, ws_msg)
    } else {
      updateOnlineUsers(i)
    }
  }

  const connectWsInner = async () => {
    setConnectionState(WsConnectionState.Connecting)

    return new Promise(async (resolve, reject) => { 
      const ws = new WebSocket(WS_URL)

      ws.onmessage = async (e) => {
        const arrayBuffer = await (e.data as Blob).arrayBuffer()
        const u8Array = new Uint8Array(arrayBuffer)

        console.log(u8Array)
        if(u8Array.length === 5) {
          onWsMessage(u8Array)
        }
      }

      ws.onopen	= () => {
        setConnectionState(WsConnectionState.Connected)
        resolve(ws)
      }

      ws.onclose = () => {
        setConnectionState(WsConnectionState.Disconnected)
        reject()
      }
    }) as Promise<WebSocket>
  }

  const setConnectionState = (c: WsConnectionState) => {
    State.update((prev) => {
      prev.wsConnected = c
      return prev
    })
  }

  const fetchValues = async () => {
    const result = await fetchGetCheckboxValues()

    if (result.length !== UINT8ARRAY_SIZE) {
      setConnectionState(WsConnectionState.Disconnected)
      fetchValuesFailed = true
      socket = null
      return
    }

    State.update((prev) => {
      prev.bitmap = result
      return prev
    })
    
  }

  const setValueOnBuf = (i: number, ws_msg: BitmapMessageType) => {
    if (i > CHECKBOX_COUNT || i < 0) return

    const byte = Math.floor((i * 4 ) / 8)
    const first4Bits = (i * 4) % 8 == 0

    State.update((prev) => {
      let bitsValue = first4Bits
        ? prev.bitmap[byte] >> 4
        : prev.bitmap[byte] & 0b00001111

      if(ws_msg.bitmap === BitmapMessage.Add) {
        bitsValue += 1
      } else if(ws_msg.bitmap === BitmapMessage.Sub) {
        bitsValue -= 1
      } else if(ws_msg.bitmap === BitmapMessage.Set) {
        bitsValue = ws_msg.value
      }

      if (bitsValue > 15) bitsValue = 0
      if (bitsValue < 0) bitsValue = 15

      prev.bitmap[byte] = first4Bits
        ? (prev.bitmap[byte] & 0b00001111) | (bitsValue << 4)
        : (prev.bitmap[byte] & 0b11110000) | bitsValue

      return prev
    })
  }

  const updateOnlineUsers = (newValue: number) => {
    State.update((prev) => {
      prev.onlineUsers = newValue
      return prev
    })
  }

  const getValue = (i: number, arr: Uint8Array) => {
    if(i > CHECKBOX_COUNT || i < 0) {
      return 0
    }

    const byte = Math.floor((i * 4) / 8)
    const first4Bits = (i * 4) % 8 == 0

    return first4Bits
      ? (arr[byte] >> 4)
      : (arr[byte] & 0b00001111)
  }

  return {
    subscribe: State.subscribe,
    fetchValues,
    connectWs,
    incrementValue,
    decrementValue,
    setValue,
    getValue
  }
} 

export const CheckboxValuesContext = createContext()