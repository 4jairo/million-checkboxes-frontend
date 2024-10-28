<script lang="ts">
  export let elmt: HTMLElement
  let listenersOn = false

  const multipleCheckboxHover = () => {
    let clicking = false
    let prevCheckbox: EventTarget
    let firstCheckbox: EventTarget
 
    elmt.onmousemove = (e) => {
      //@ts-ignore -> only input[type="checkbox"] with checked = false 
      if (!clicking || !e.target || e.target.tagName !== 'INPUT' || [undefined, true].includes(e.target.checked) || [prevCheckbox, firstCheckbox].includes(e.target)) {
        return
      }

      prevCheckbox = e.target

      //@ts-ignore
      e.target.checked = true
      e.target.dispatchEvent(new Event('click'))
    }
 
    // buttons -> 0: left, 1: middle, 2: right
    window.onmousedown = (e) => {
      if (e.button === 0) {
        clicking = true
        //@ts-ignore
        firstCheckbox = e.target
      }
    }
    window.onmouseup = (e) => {
      if (e.button === 0) clicking = false
    }
    window.onblur = () => clicking = false
  }

  $: if(elmt) {
    if(listenersOn) {
      multipleCheckboxHover()
    }
    else {
      elmt.onmousemove = null
      window.onmousedown = null
      window.onmouseup = null
      window.onblur = null
    }
  }
</script>

<div>
  <button on:click={() => listenersOn = !listenersOn}>
    Check checkboxes with hover: {listenersOn ? '✔️' : '❌'}
  </button>
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  button {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
</style>
