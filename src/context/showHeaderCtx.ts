import { writable } from "svelte/store"

// function createContext() {
//   const State = writable(true)

//   return {
//     subscribe: State.subscribe,
//   }
// }

export const ShowHeaderContext = writable(true)