const BASE_URL = `http://localhost:8900`
//const BASE_URL = `https://million-checkboxes.4jairo.tech/api`
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