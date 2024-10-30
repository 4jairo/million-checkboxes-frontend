<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<script lang="ts">
  import { ColorPickerContext, COLORS } from "../context/colorPickerContext";

  $: colorPickerCtx = $ColorPickerContext
</script>


<div class="color-picker">
  <div 
    class="color noColor {-1 === colorPickerCtx.colorIdx ? 'selected' : ''}" 
    on:click={() => ColorPickerContext.setColor(-1)}
  >
    <div style="background-color: transparent">
     <p>auto</p>
    </div>
  </div>

  {#each COLORS as color, i}
    <div 
      class="color {i === colorPickerCtx.colorIdx ? 'selected' : ''}" 
      on:click={() => ColorPickerContext.setColor(i)}  
    >
      <div style="background-color: {color}"></div>
    </div>
  {/each}
</div>


<style>
  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }



  .selected {
    background-color: var(--pico-form-element-border-color);
    border-radius: 5px;
  }
  .color {
    width: 35px;
    height: 35px;
    padding: 2px;
    cursor: pointer;
  }
  .color > div {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: var(--pico-border-width) solid var(--pico-form-element-border-color);
  }

  .noColor > div {
    border: var(--pico-border-width) solid var(--pico-primary);
  }
  
  /* draw a / on the center of .noColor */
  .noColor > div {
    position: relative;
  }
  .noColor p {
    font-size: 12px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* .noColor > div::before {
    content: "auto";
    position: absolute;
    height: 100%;
    border-left: var(--pico-border-width) solid var(--pico-primary);
    rotate: 45deg;
    left: 50%;
  } */
</style>
