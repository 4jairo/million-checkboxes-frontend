import { writable } from "svelte/store"

export const COLORS = [
  'rgba(0, 0, 0, 0.13)',
  'rgba(4, 120, 120, 1.00)',
  'rgba(173, 216, 230, 1.00)',
  'rgba(0, 0, 255, 1.00)',
  'rgba(128, 0, 128, 1.00)',
  'rgba(255, 0, 255, 1.00)',
  'rgba(255, 192, 203, 1.00)',
  'rgba(255, 255, 255, 1.00)',
  'rgba(211, 211, 211, 1.00)',
  'rgba(8, 8, 8, 1.00)',
  'rgba(139, 69, 19, 1.00)',
  'rgba(255, 0, 0, 1.00)',
  'rgba(255, 165, 0, 1.00)',
  'rgba(255, 255, 0, 1.00)',
  'rgba(0, 255, 0, 1.00)',
  'rgba(0, 128, 0, 1.00)'
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