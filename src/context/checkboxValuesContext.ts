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

const enum WsMessageType {
  Add,
  Sub,
  Set
}
type WsMessage = 
  | { msgType: WsMessageType.Add }
  | { msgType: WsMessageType.Sub }
  | { msgType: WsMessageType.Set, value: number }

const createContext = () => {
  let socket: WebSocket | null = null
  let fetchValuesFailed = false

  const State = writable<{
    wsConnected: WsConnectionState,
    values: Uint8Array
  }>({
    wsConnected: WsConnectionState.Disconnected,
    values: new Uint8Array(UINT8ARRAY_SIZE)
  })
  
  const incrementValue = (i: number) => {
    if(socket && socket.readyState == WebSocket.OPEN) {
      socket.send(`${i};add`)
    }
  }

  const decrementValue = (i: number) => {
    if(socket && socket.readyState == WebSocket.OPEN) {
      socket.send(`${i};sub`)
    }
  }

  const setValue = (i: number, value: number) => {
    if(socket && socket.readyState == WebSocket.OPEN && value >= 0 && value <= 15) {
      socket.send(`${i};set;${value}`)
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

  const connectWsInner = async () => {
    setConnectionState(WsConnectionState.Connecting)

    return new Promise(async (resolve, reject) => { 
      const ws = new WebSocket(WS_URL)

      ws.onmessage = (e) => {
        const msg = e.data as string // msg -> "1234;true"
        console.log({msg})

        const [i, operation, newValueSet] = msg.split(';')
        const parsedI = parseInt(i)
        let ws_msg: WsMessage;
        
        if(operation === 'add') {
          ws_msg = { msgType: WsMessageType.Add }
        } else if(operation === 'sub') {
          ws_msg = { msgType: WsMessageType.Sub }
        } else if(operation === 'set') {
          ws_msg = { msgType: WsMessageType.Set, value: parseInt(newValueSet) }
        } else {
          return
        }

        setValueOnBuf(parsedI, ws_msg)
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
      prev.values = result
      return prev
    })
    
  }

  const setValueOnBuf = (i: number, ws_msg: WsMessage) => {
    if (i > CHECKBOX_COUNT || i < 0) return

    const byte = Math.floor((i * 4 ) / 8)
    const first4Bits = (i * 4) % 8 == 0

    State.update((prev) => {
      let bitsValue = first4Bits
        ? prev.values[byte] >> 4
        : prev.values[byte] & 0b00001111

      if(ws_msg.msgType === WsMessageType.Add) {
        bitsValue += 1
      } else if(ws_msg.msgType === WsMessageType.Sub) {
        bitsValue -= 1
      } else if(ws_msg.msgType === WsMessageType.Set) {
        bitsValue = ws_msg.value
      }

      if (bitsValue > 15) bitsValue = 0
      if (bitsValue < 0) bitsValue = 15

      prev.values[byte] = first4Bits
        ? (prev.values[byte] & 0b00001111) | (bitsValue << 4)
        : (prev.values[byte] & 0b11110000) | bitsValue

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