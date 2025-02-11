<script lang="ts">
  import { ShowHeaderContext } from "../context/showHeaderCtx";
  import DownIcon from "./icons/downIcon.svelte";
  import UpIcon from "./icons/upIcon.svelte";

  $: showHeader = $ShowHeaderContext
</script>


<div>
  <button on:click={() => ShowHeaderContext.update(prev => !prev)}>
    {#if showHeader}
      <DownIcon />
    {:else}
      <UpIcon />
    {/if}
  </button>

  {#if showHeader}
    <header>
      <h1>Million checkboxes</h1>
      <p>Check some boxes and everyone will see your changes in real-time.</p>
      <p>⚠️It's recommended to have a window of at least 1250 pixels wide⚠️</p>
    </header>
  {/if}

</div>


<style>
  header {
    position: relative;
    text-align: center;
  }
  div {
    margin: 10px auto;
    max-width: 1250px;
    width: 100%; 
  }
  button {
    display: flex;
    padding: 2px;
  }
  header h1 {
    padding: 10px
  }
</style>

