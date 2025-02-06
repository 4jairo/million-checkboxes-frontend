<!-- svelte-ignore a11y-autofocus -->

<script lang="ts">
  import { CHECKBOX_COUNT, CheckboxValuesContext, WsConnectionState } from "../context/checkboxValuesContext";
  import LoadingGif from "./icons/loadingGif.svelte";
  import MultipleCheckboxHover from "./multipleCheckboxHover.svelte";
  import ServerIcon from "./icons/serverIcon.svelte";
  import ServerOffIcon from "./icons/serverOffIcon.svelte";
  import ColorPicker from "./colorPicker.svelte";
  import LazyRenderer from "./lazyRenderer.svelte";

  let checkboxContainer: HTMLElement
  let focusCheckbox: ((focused: number) => Promise<void>) | null = null
  $: checkboxValuesContext = $CheckboxValuesContext

  CheckboxValuesContext.connectWs({ attepmts: 3, timeBetween: 500 })

  const handleGoToCheckbox = async (e: SubmitEvent & {currentTarget: EventTarget & HTMLFormElement}) => {
    const number = parseInt(e.currentTarget.number.value) -1
    if(focusCheckbox) focusCheckbox(number)
  }

  const preventOverCheckboxCount = (e: Event & {currentTarget: EventTarget & HTMLInputElement}) => {
    const num = parseInt(e.currentTarget.value)
    if (num > CHECKBOX_COUNT) e.currentTarget.value = CHECKBOX_COUNT.toString()
    if (num < 1) e.currentTarget.value = '1'
  }
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

    <div class="lazyRenderer">
      <LazyRenderer setFocusCheckbox={(f) => focusCheckbox = f}/>
    </div>
  {/await}
</main>


<style>
  main {
    width: 100%;
    height: 100%;
    padding: 0 10px 10px 10px;
    margin: 0 auto;
    max-width: 1024px;
    display: flex;
    flex-direction: column;
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
  .lazyRenderer {
    flex: 1;
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
</style>