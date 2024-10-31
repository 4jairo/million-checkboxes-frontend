const BASE_URL = import.meta.env.VITE_BASE_URL_API
export const WS_URL = `${BASE_URL}/ws`

export const fetchGetCheckboxValues = async () => {
  try {
    const response = await fetch(`${BASE_URL}/bits`);
    const values = response.ok 
      ? await response.arrayBuffer() 
      : new ArrayBuffer(0)
  
    return new Uint8Array(values);
  } catch (error) {
    return new Uint8Array(0)
  }
}