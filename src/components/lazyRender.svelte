<!-- svelte-ignore a11y-autofocus -->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import VirtualList from 'svelte-tiny-virtual-list';
  import { CHECKBOX_COUNT, CheckboxValuesContext, WsConnectionState } from "../context/checkboxValuesContext";
  import LoadingGif from "./icons/loadingGif.svelte";
  import MultipleCheckboxHover from "./multipleCheckboxHover.svelte";
  import ServerIcon from "./icons/serverIcon.svelte";
  import ServerOffIcon from "./icons/serverOffIcon.svelte";
  import ColorPicker from "./colorPicker.svelte";
  import { ColorPickerContext } from "../context/colorPickerContext";

  const CHECKBOX_SIZE = 20 + 4
  let checkboxContainer: HTMLElement
  let viewHeightWindow = window.innerHeight * 0.75
  let checkboxsInRow = 0
  let scrollOffset = 0
  let focusedCheckboxIdx = -1
  $: checkboxValuesContext = $CheckboxValuesContext
  $: colorPickerCtx = $ColorPickerContext

  CheckboxValuesContext.connectWs({ attepmts: 3, timeBetween: 500 })

  const handleGoToCheckbox = async (e: SubmitEvent & {currentTarget: EventTarget & HTMLFormElement}) => {
    const number = parseInt(e.currentTarget.number.value) -1

    const rowOffset = (Math.floor(number / checkboxsInRow) +1) * CHECKBOX_SIZE

    focusedCheckboxIdx = number
    scrollOffset = rowOffset - (viewHeightWindow / 2)
  }

  const preventOverCheckboxCount = (e: Event & {currentTarget: EventTarget & HTMLInputElement}) => {
    const num = parseInt(e.currentTarget.value)
    if (num > CHECKBOX_COUNT) e.currentTarget.value = CHECKBOX_COUNT.toString()
    if (num < 1) e.currentTarget.value = '1'
  }

  const handleClick = (incrementOrDecrement: boolean, i: number) => {
    if(colorPickerCtx.colorIdx > -1) {
      CheckboxValuesContext.setValue(i, colorPickerCtx.colorIdx + 1)
    } else if (incrementOrDecrement) {
      CheckboxValuesContext.incrementValue(i)
    } else {
      CheckboxValuesContext.decrementValue(i)
    }
  }

  const updateOnResize = () => {
    viewHeightWindow = window.innerHeight * 0.75

    const bounds = checkboxContainer.getBoundingClientRect()
    checkboxsInRow = Math.floor(bounds.width / CHECKBOX_SIZE) -2
  }
  
  onMount(() => {
    updateOnResize()
    window.onresize = updateOnResize
  })
  onDestroy(() => {
    window.onresize = null
  })
</script>

<main
  bind:this={checkboxContainer}
  on:contextmenu|preventDefault
>
  {#await CheckboxValuesContext.fetchValues()}  
    <div class="loading">
      <LoadingGif size={30}/>
    </div>
  {:then _}
    <div class="header">
      <p>
        <code style="border-color: {checkboxValuesContext.wsConnected == WsConnectionState.Connected ? 'green' : 'red'};"> 
          {#if checkboxValuesContext.wsConnected == WsConnectionState.Connected}
            <ServerIcon size={20} />
          {:else}
            <ServerOffIcon size={20} />
          {/if}
          {checkboxValuesContext.wsConnected}
        </code>
      </p>

      <MultipleCheckboxHover elmt={checkboxContainer} />
      
      <form on:submit|preventDefault={handleGoToCheckbox}>
        <input type="number" name="number" placeholder="go to checkbox" on:input={preventOverCheckboxCount}/>
        <button>Go</button>
      </form>
    </div>

    <div class="colorPicker">
      <ColorPicker />
    </div>

    <VirtualList
      width="100%"
      height={viewHeightWindow}
      itemCount={Math.ceil(CHECKBOX_COUNT / checkboxsInRow)}
      overscanCount={5}
      itemSize={CHECKBOX_SIZE}
      {scrollOffset}
    >
      <div class="listRow" slot="item" let:index let:style {style}>
        <div>
          {#each Array(checkboxsInRow) as _, rowI}
            {@const i = index * checkboxsInRow + rowI}
            {@const value = CheckboxValuesContext.getValue(i, checkboxValuesContext.values)}
  
            {#if i <= CHECKBOX_COUNT -1}
              <input
                type="checkbox"
                id="checkbox-{i}"
                class="color-{value}"
                autofocus={focusedCheckboxIdx === i}
                checked={value > 0}
                on:click|preventDefault={() => handleClick(true, i)}
                on:contextmenu|preventDefault={() => handleClick(false, i)}
              />
            {/if}
          {/each}
        </div>
      </div>
    </VirtualList>
  {/await}
</main>


<style>
  main {
    margin: 0 auto;
    max-width: 1024px;
  }

  main :global(.virtual-list-wrapper) {
    margin: auto
  }
  .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 15px;
    margin: 10px 0;
    border-bottom: solid var(--pico-border-width) var(--pico-form-element-border-color);
    border-top: solid var(--pico-border-width) var(--pico-form-element-border-color);
  }
  .header > * {
    display: flex;
  }
  .colorPicker {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
  code {
    display: flex;
    align-items: center;
    gap: 10px;
    border: var(--pico-border-width) solid transparent;
  }

  .loading {
    margin-top: 50px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .listRow {
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