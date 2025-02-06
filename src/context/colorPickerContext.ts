import { writable } from "svelte/store"

export const COLORS = [
  '#00000020',
  '#047878',
  '#ADD8E6',
  '#0000FF',
  '#800080',
  '#FF00FF',
  '#FFC0CB',
  '#FFFFFF',
  '#D3D3D3',
  '#080808',
  '#8B4513',
  '#FF0000',
  '#FFA500',
  '#FFFF00',
  '#00FF00',
  '#008000',
]

function createContext() {
  const State = writable({
    colorIdx: -1,
  })



  const setColor = (colorIdx: number) => {
    State.update(state => {
      state.colorIdx = colorIdx
      return state
    })
  }

  return {
    subscribe: State.subscribe,
    setColor,
  }
}

export const ColorPickerContext = createContext()