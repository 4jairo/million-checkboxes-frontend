import { writable } from "svelte/store";
import { fetchGetCheckboxValues, WS_URL } from "../lib/fetch";

export const CHECKBOX_COUNT = 1_000_000;


const enum WsConnectionState {
  Connecting = 'Connecting...',
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}

const createContext = () => {
  //let values = new Uint8Array(CHECKBOX_COUNT)
  let socket: WebSocket | null = null

  const State = writable<{
    wsConnected: WsConnectionState,
    values: Uint8Array
  }>({
    wsConnected: WsConnectionState.Disconnected,
    values: new Uint8Array(CHECKBOX_COUNT)
  })
  
  const setValue = (i: number, value: boolean) => {
    if(socket && socket.readyState == WebSocket.OPEN) {
      socket.send(`${i};${value}`)
    }
  }

  const connectWs = async (conf: { attepmts: number, timeBetween: number }) => {
    for (let i = 0; i < conf.attepmts; i++) {
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

        const [i, value] = msg.split(';')
        const parsedI = parseInt(i)
        const parsedValue = value === 'true'
        setValueOnBuf(parsedI, parsedValue)
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
    try {
      const result = await fetchGetCheckboxValues()
      if (result.length !== CHECKBOX_COUNT / 8) {
        throw new Error("invalid checkbox length")
      }

      State.update((prev) => {
        prev.values = result
        return prev
      })
    } catch (error) {
      throw error 
    }
  }

  const setValueOnBuf = (i: number, value: boolean) => {
    if (i > CHECKBOX_COUNT || i < 0) return

    const idx = Math.floor(i / 8)
    const bit = 7 - (i % 8)

    State.update((prev) => {
      if (value) {
        prev.values[idx] |= 1 << bit
      } else {
        prev.values[idx] &= ~(1 << bit)
      }
      return prev
    })
  }

  const getValue = (i: number, arr: Uint8Array) => {
    if(i > CHECKBOX_COUNT || i < 0) {
      return false
    }

    const idx = Math.floor(i / 8)
    const bit = 7 - (i % 8)
    return (arr[idx] & (1 << bit)) !== 0
  }

  // const valueOf = (i: number) => {
  //   if(i > CHECKBOX_COUNT || i < 0) {
  //     return false
  //   }

  //   const idx = Math.floor(i / 8)
  //   const bit = i % 8
  //   const { values } = get(State)
  //   return (values[idx] & (1 << bit)) !== 0
  // }

  return {
    subscribe: State.subscribe,
    fetchValues,
    connectWs,
    setValue,
    getValue,
  }
} 

export const CheckboxValuesContext = createContext()