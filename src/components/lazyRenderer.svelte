<!-- svelte-ignore a11y-autofocus -->

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { CHECKBOX_COUNT, CheckboxValuesContext } from "../context/checkboxValuesContext";
  import { ColorPickerContext } from "../context/colorPickerContext";
  import { ShowHeaderContext } from "../context/showHeaderCtx";

  export let setFocusCheckbox: (f: ((focusedCheckboxIdx: number) => Promise<void>) | null) => void
  let containerElmt: HTMLElement
  $: checkboxValuesContext = $CheckboxValuesContext
  $: colorPickerCtx = $ColorPickerContext
  $: showHeader = $ShowHeaderContext

  const CHECKBOX_PER_ROW = 50
  const CHECKBOX_SIZE = 24 // 20 + (2+2 margin)
  const TOTAL_ROWS = CHECKBOX_COUNT / CHECKBOX_PER_ROW
  let renderRows = 0
  let rowIdx = 0
  let extraScrollHeight = 0

  $: renderRowsArr = Array(renderRows).fill(0)
  const checkboxsInRowArr = Array(CHECKBOX_PER_ROW).fill(0)

  const handleResize = () => {
    if(!containerElmt) return
    renderRows = Math.floor((containerElmt.clientHeight) / CHECKBOX_SIZE)
   
    const fitRows = Math.floor((containerElmt.scrollHeight - containerElmt.clientHeight) / CHECKBOX_SIZE) + renderRows
    if(fitRows < TOTAL_ROWS) {
      extraScrollHeight = (TOTAL_ROWS - fitRows) * CHECKBOX_SIZE
    }
  }

  const handleScroll = () => {
    rowIdx = Math.floor(containerElmt.scrollTop / CHECKBOX_SIZE)
  }

  const handleClick = (incrementOrDecrement: boolean, i: number) => {
    if(colorPickerCtx.colorIdx > -1) {
      CheckboxValuesContext.setValue(i, colorPickerCtx.colorIdx)
    } else if (incrementOrDecrement) {
      CheckboxValuesContext.incrementValue(i)
    } else {
      CheckboxValuesContext.decrementValue(i)
    }
  }

  const scrollToCheckbox = async (focusedCheckboxIdx: number) => {
    const checkboxRow = Math.floor(focusedCheckboxIdx / CHECKBOX_PER_ROW)

    containerElmt.scrollTo({
      top: (checkboxRow - (renderRows / 2)) * CHECKBOX_SIZE,
      behavior: 'smooth'
    })
    
    let row = document.getElementById(`row-${checkboxRow}`)
    while(row === null) {
      await new Promise((r) => setTimeout(r, 30))
      row = document.getElementById(`row-${checkboxRow}`)
    }

    const input = row.querySelector(`input:nth-child(${focusedCheckboxIdx % CHECKBOX_PER_ROW + 1})`) as HTMLInputElement
    if (input) input.focus()
  }

  $: {
    showHeader;
    tick().then(handleResize)
  }

  onMount(() => {
    setFocusCheckbox(scrollToCheckbox)
    handleResize()
    containerElmt.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
  })

  onDestroy(() => {
    window.removeEventListener('resize', handleResize)
    containerElmt.removeEventListener('scroll', handleScroll)
  })
</script>

<div class="containerElmt" bind:this={containerElmt}>
  <div
    class="scroll"
    style="height: {TOTAL_ROWS * CHECKBOX_SIZE + extraScrollHeight}px"
  > 
  </div>

  {#each renderRowsArr as _, row (row)}
    {@const rowI = row + rowIdx}
  
    <div class="row" id="row-{rowI}" style="top: {CHECKBOX_SIZE * row}px">
      {#each checkboxsInRowArr as _, col (col)}
        {@const i = rowI * CHECKBOX_PER_ROW + col}
        {@const value = CheckboxValuesContext.getValue(i, checkboxValuesContext.bitmap)}
  
        <input
          type="checkbox"
          class="focus-{value >= 7 && value <= 8 ? 'black' : 'white'} color-{value}"
          checked={value > 0}
          on:click|preventDefault={() => handleClick(true, i)}
          on:contextmenu|preventDefault={() => handleClick(false, i)}
        />
      {/each}
    </div>
  {/each}
</div>


<style>
  .containerElmt {
    inset: 0;
    position: absolute;
    overflow-y: scroll
  }
  .scroll {
    position: absolute;
    width: 100%;
  }

  .row {
    position: sticky;
    inset: 0;
    display: flex;
    width: 1200px; /* CHECKBOX_SIZE * CHECKBOX_PER_ROW */
    justify-content: center;
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 2px;
  }

  /* 
  #047878 (Cyan) → #003f3f (Darker Cyan)
  #ADD8E6 (Light Blue) → #0E4C92 (Very Dark Steel Blue)
  #0000FF (Blue) → #00005E (Darker Blue)
  #800080 (Purple) → #3A003A (Very Dark Purple)
  #FF00FF (Magenta) → #6A006A (Very Dark Magenta)
  #FFC0CB (Light Pink) → #FF69B4 (Deep Pink)
  #FFFFFF (White) → #B0B0B0 (Medium Gray)
  #D3D3D3 (Light Gray) → #808080 (Gray)
  #080808 (Black) → #000000 (Black) - no darker available.
  #8B4513 (Saddle Brown) → #3E1F0E (Very Dark Saddle Brown)
  #FF0000 (Red) → #8B0000 (Dark Red)
  #FFA500 (Orange) → #CC8400 (Very Dark Orange)
  #FFFF00 (Yellow) → #AFAF00 (Darker Yellow)
  #00FF00 (Green) → #003300 (Very Dark Green)
  #008000 (Green) → #003600 (Darker Green)
  */
  .focus-white:focus {
    --pico-box-shadow: 0 0 0 2px #fff
  }
  .focus-black:focus {
    --pico-box-shadow: 0 0 0 2px #000
  }
  .color-1 {
    background-color: #047878;
    border: var(--pico-border-width) solid #047878;
  }
  .color-2 {
    background-color: #ADD8E6;
    border: var(--pico-border-width) solid #ADD8E6;
  }
  .color-3 {
    background-color: #0000FF;
    border: var(--pico-border-width) solid #0000FF;
  }
  .color-4 {
    background-color: #800080;
    border: var(--pico-border-width) solid #800080;
  }
  .color-5 {
    background-color: #FF00FF;
    border: var(--pico-border-width) solid #FF00FF;
  }
  .color-6 {
    background-color: #FFC0CB;
    border: var(--pico-border-width) solid #FFC0CB;
  }
  .color-7 {
    background-color: #FFFFFF;
    border: var(--pico-border-width) solid #FFFFFF;
  }
  .color-8 {
    background-color: #D3D3D3;
    border: var(--pico-border-width) solid #D3D3D3;
  }
  .color-9 {
    background-color: #080808;
    border: var(--pico-border-width) solid #080808;
  }
  .color-10 {
    background-color: #8B4513;
    border: var(--pico-border-width) solid #8B4513;
  }
  .color-11 {
    background-color: #FF0000;
    border: var(--pico-border-width) solid #FF0000;
  }
  .color-12 {
    background-color: #FFA500;
    border: var(--pico-border-width) solid #FFA500;
  }
  .color-13 {
    background-color: #FFFF00;
    border: var(--pico-border-width) solid #FFFF00;
  }
  .color-14 {
    background-color: #00FF00;
    border: var(--pico-border-width) solid #00FF00;
  }
  .color-15 {
    background-color: #008000;
    border: var(--pico-border-width) solid #008000;
  }
</style>