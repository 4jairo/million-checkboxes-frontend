<script lang="ts">
  import ClickIcon from "./icons/clickIcon.svelte";
  import HoverIcon from "./icons/hoverIcon.svelte";

  export let elmt: HTMLElement
  let listenersOn = false

  const multipleCheckboxHover = () => {
    let clicking = false
    let eventType = 'click'
    let prevCheckbox: EventTarget
    let firstCheckbox: EventTarget

    const onMove = (target: EventTarget | null) => {
      if (!clicking || !target || (target as HTMLElement).tagName !== 'INPUT' || [prevCheckbox, firstCheckbox].includes(target)) {
        return
      }

      prevCheckbox = target
      target.dispatchEvent(new Event(eventType))
    }
 
    elmt.onmousemove = (e) => onMove(e.target)

    // const scrollElmt = elmt.querySelector<HTMLElement>('.virtual-list-wrapper')
    // if(scrollElmt) scrollElmt.onscroll = (e) => onMove(e.target)
 
    // e.button -> 0: left, 1: middle, 2: right
    window.onmousedown = (e) => {
      if ((e.button === 0 || e.button === 2) && e.target) {
        clicking = true
        eventType = e.button === 0 ? 'click' : 'contextmenu'
        firstCheckbox = e.target
      }
    }

    window.onmouseup = (e) => {
      if (e.button === 0 || e.button === 2) clicking = false
    }

    window.onblur = () => {
      clicking = false
    }
  }

  $: if(elmt) {
    if(listenersOn) {
      multipleCheckboxHover()  
    }
    else {
      // const scrollElmt = elmt.querySelector<HTMLElement>('.virtual-list-wrapper')
      // if(scrollElmt) scrollElmt.onscroll = null
      elmt.onmousemove = null
      window.onmousedown = null
      window.onmouseup = null
      window.onblur = null
    }
  }
</script>

<div>
  <button on:click={() => listenersOn = !listenersOn}>
    {#if listenersOn}
      <HoverIcon /> Checking with hover
    {:else}
      <ClickIcon /> Checking with click
    {/if}
  </button>
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
