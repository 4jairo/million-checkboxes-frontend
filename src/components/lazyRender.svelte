<!-- svelte-ignore a11y-autofocus -->
 
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import VirtualList from 'svelte-tiny-virtual-list';
  import { CHECKBOX_COUNT, CheckboxValuesContext } from "../context/checkboxValuesContext";
  import LoadingGif from "./icons/loadingGif.svelte";
  import MultipleCheckboxHover from "./multipleCheckboxHover.svelte";

  const CHECKBOX_SIZE = 20 + 4
  let checkboxContainer: HTMLElement
  let viewHeightWindow = window.innerHeight * 0.75
  let checkboxsInRow = 0
  let scrollOffset = 0
  let focusedCheckboxIdx = -1
  $: checkboxValuesContext = $CheckboxValuesContext

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

<main bind:this={checkboxContainer}>
  {#await CheckboxValuesContext.fetchValues()}  
    <div class="loading">
      <LoadingGif size={30}/>
    </div>
  {:then _}
    <div class="header">
      <p>
        socket state: {checkboxValuesContext.wsConnected}
      </p>

      <MultipleCheckboxHover elmt={checkboxContainer} />
      
      <form on:submit|preventDefault={handleGoToCheckbox}>
        <input type="number" name="number" placeholder="go to checkbox" on:input={preventOverCheckboxCount}/>
        <button>Go</button>
      </form>
    </div>


    <VirtualList
      width="100%"
      height={viewHeightWindow}
      itemCount={Math.ceil(CHECKBOX_COUNT / checkboxsInRow)}
      itemSize={CHECKBOX_SIZE}
      {scrollOffset}
    >
      <div class="listRow" slot="item" let:index let:style {style}>
        <div>
          {#each Array(checkboxsInRow) as _, rowI}
            {@const i = index * checkboxsInRow + rowI}
  
            {#if i <= CHECKBOX_COUNT -1}
              <input
                type="checkbox"
                id="checkbox-{i}"
                autofocus={focusedCheckboxIdx === i}
                checked={CheckboxValuesContext.getValue(i, checkboxValuesContext.values)}
                on:click|preventDefault={(e) => CheckboxValuesContext.setValue(i, e.currentTarget.checked)}
              />
            {/if}
          {/each}
        </div>
      </div>
    </VirtualList>
  {:catch err}
    <div class="loading">
      <div>
        <b>Unexpected error!</b>
        <p>{err}</p>
      </div>
    </div>
  {/await}
</main>


<style>
  .header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
  }
  .header > * {
    margin: 10px;
    width: 30%;
    display: flex;
    align-items: center;
  }
  .header input, .header button {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .loading {
    margin-top: 50px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  main {
    margin: 0 auto;
    max-width: 1024px;
  }

  main :global(.virtual-list-wrapper) {
    margin: auto
  }
  .listRow {
    display: flex;
    justify-content: center;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 2px;
    background-color: blu;
  }
</style>