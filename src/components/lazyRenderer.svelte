<!-- svelte-ignore a11y-autofocus -->

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { CHECKBOX_COUNT, CheckboxValuesContext } from "../context/checkboxValuesContext";
  import { ColorPickerContext } from "../context/colorPickerContext";
  import { ShowHeaderContext } from "../context/showHeaderCtx";

  export let setFocusCheckbox: (f: ((focusedCheckboxIdx: number) => Promise<void>) | null) => void
  let containerElmt: HTMLElement
  let contentElmt: HTMLElement
  $: checkboxValuesContext = $CheckboxValuesContext
  $: colorPickerCtx = $ColorPickerContext
  $: showHeader = $ShowHeaderContext

  const OVERCOUNT_ROWS = 1
  const MAX_CHECKBOX_PER_ROW = 40
  const CHECKBOX_SIZE = 24 // 20 + (2+2 margin)
  let checkboxsInRow = 0
  let renderRows = 0
  let rowIdx = 0

  $: renderRowsArr = Array(renderRows).fill(0)
  $: checkboxsInRowArr = Array(checkboxsInRow).fill(0)

  const handleResize = () => {
    const { width } = contentElmt.getBoundingClientRect()
    const { height } = containerElmt.getBoundingClientRect()
    
    renderRows = Math.floor(height / CHECKBOX_SIZE) + OVERCOUNT_ROWS
    checkboxsInRow = Math.min(Math.floor(width / CHECKBOX_SIZE), MAX_CHECKBOX_PER_ROW)
  }

  const handleScroll = () => {
    // value between 0 - 1 -> containerElmt.scrollTop / (containerElmt.scrollHeight - containerElmt.clientHeight)
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
    const checkboxRow = Math.floor(focusedCheckboxIdx / checkboxsInRow)

    containerElmt.scrollTo({
      top: (checkboxRow - (renderRows / 2)) * CHECKBOX_SIZE,
      behavior: 'smooth'
    })
    
    let row = document.getElementById(`row-${checkboxRow}`)
    while(row === null) {
      await new Promise((r) => setTimeout(r, 30))
      row = document.getElementById(`row-${checkboxRow}`)
    }

    const input = row.querySelector(`input:nth-child(${focusedCheckboxIdx % checkboxsInRow + 1})`) as HTMLInputElement
    if (input) input.focus()
  }

  $: {
    showHeader;
    tick().then(() => {
      if(containerElmt && contentElmt) handleResize()
    })
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

<main class="containerElmt" bind:this={containerElmt}>
  <div 
    class="contentElmt"
    style="height: {CHECKBOX_COUNT / checkboxsInRow * CHECKBOX_SIZE}px"
    bind:this={contentElmt}
  >
    {#each renderRowsArr as _, row (row)}
      {@const rowI = row + rowIdx}
      <div class="row" id="row-{rowI}" style="top: {rowI * CHECKBOX_SIZE}px">
        {#each checkboxsInRowArr as _, col (col)}
          {@const i = rowI * checkboxsInRow + col}
          {@const value = CheckboxValuesContext.getValue(i, checkboxValuesContext.values)}

          <input
            type="checkbox"
            class="color-{value}"
            checked={value > 0}
            on:click|preventDefault={() => handleClick(true, i)}
            on:contextmenu|preventDefault={() => handleClick(false, i)}
          />
        {/each}
      </div>
    {/each}
  </div>
</main>

<style>
  .containerElmt {
    width: 100%;
    height: 100%;
    position: relative;
    overflow-y: scroll;
  }
  .contentElmt {
    position: absolute;
    inset: 0;
    width: 100%;
  }

  .row {
    position: absolute;
    display: flex;
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
  .color-1 {
    background-color: #047878;
    border: var(--pico-border-width) soild #047878;
  }
  .color-1:focus {
    --pico-box-shadow: 0 0 0 2px #003f3f;
  }
  .color-2 {
    background-color: #ADD8E6;
    border: var(--pico-border-width) soild #ADD8E6;
  }
  .color-2:focus {
    --pico-box-shadow: 0 0 0 2px #35659c;
  }
  .color-3 {
    background-color: #0000FF;
    border: var(--pico-border-width) soild #0000FF;
  }
  .color-3:focus {
    --pico-box-shadow: 0 0 0 2px #00005E;
  }
  .color-4 {
    background-color: #800080;
    border: var(--pico-border-width) soild #800080;
  }
  .color-4:focus {
    --pico-box-shadow: 0 0 0 2px #3A003A;
  }
  .color-5 {
    background-color: #FF00FF;
    border: var(--pico-border-width) soild #FF00FF;
  }
  .color-5:focus {
    --pico-box-shadow: 0 0 0 2px #6A006A;
  }
  .color-6 {
    background-color: #FFC0CB;
    border: var(--pico-border-width) soild #FFC0CB;
  }
  .color-6:focus {
    --pico-box-shadow: 0 0 0 2px #ff87c3;
  }
  .color-7 {
    background-color: #FFFFFF;
    border: var(--pico-border-width) soild #FFFFFF;
  }
  .color-7:focus {
    --pico-box-shadow: 0 0 0 2px #B0B0B0;
  }
  .color-8 {
    background-color: #D3D3D3;
    border: var(--pico-border-width) soild #D3D3D3;
  }
  .color-8:focus {
    --pico-box-shadow: 0 0 0 2px #808080;
  }
  .color-9 {
    background-color: #080808;
    border: var(--pico-border-width) soild #080808;
  }
  .color-9:focus {
    --pico-box-shadow: 0 0 0 2px #000000;
  }
  .color-10 {
    background-color: #8B4513;
    border: var(--pico-border-width) soild #8B4513;
  }
  .color-10:focus {
    --pico-box-shadow: 0 0 0 2px #3E1F0E;
  }
  .color-11 {
    background-color: #FF0000;
    border: var(--pico-border-width) soild #FF0000;
  }
  .color-11:focus {
    --pico-box-shadow: 0 0 0 2px #8B0000;
  }
  .color-12 {
    background-color: #FFA500;
    border: var(--pico-border-width) soild #FFA500;
  }
  .color-12:focus {
    --pico-box-shadow: 0 0 0 2px #CC8400;
  }
  .color-13 {
    background-color: #FFFF00;
    border: var(--pico-border-width) soild #FFFF00;
  }
  .color-13:focus {
    --pico-box-shadow: 0 0 0 2px #AFAF00;
  }
  .color-14 {
    background-color: #00FF00;
    border: var(--pico-border-width) soild #00FF00;
  }
  .color-14:focus {
    --pico-box-shadow: 0 0 0 2px #003300;
  }
  .color-15 {
    background-color: #008000;
    border: var(--pico-border-width) soild #008000;
  }
  .color-15:focus {
    --pico-box-shadow: 0 0 0 2px #003600;
  }
</style>