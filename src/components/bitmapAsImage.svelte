<script lang="ts">
  import { CHECKBOX_COUNT, CHECKBOX_PER_ROW, CheckboxValuesContext, TOTAL_ROWS, WsConnectionState } from "../context/checkboxValuesContext";
  import { COLORS } from "../context/colorPickerContext";
  import ImageIcon from "./icons/imageIcon.svelte";
  
  $: checkboxValuesContext = $CheckboxValuesContext
  const RECT_SIZE = 2

  const getAsImage = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = CHECKBOX_PER_ROW * RECT_SIZE
    canvas.height = TOTAL_ROWS * RECT_SIZE

    for (let i = 0; i < CHECKBOX_COUNT; i++) {
      const num = CheckboxValuesContext.getValue(i, checkboxValuesContext.bitmap)
      const color = COLORS[num]

      const x = (i % CHECKBOX_PER_ROW) * RECT_SIZE
      const y = Math.floor(i / CHECKBOX_PER_ROW) * RECT_SIZE

      ctx.fillStyle = color
      ctx.fillRect(x, y, RECT_SIZE, RECT_SIZE)
    } 

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = 'millionCheckboxes.png'
    link.textContent = 'Download PNG'
    link.click()
  }
</script>

<div>
  <button on:click={getAsImage} disabled={checkboxValuesContext.wsConnected !== WsConnectionState.Connected}>
    <ImageIcon />
    Get as image
  </button>
</div>

<style>
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px
  }
</style>