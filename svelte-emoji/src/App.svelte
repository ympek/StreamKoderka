<script lang="ts">
  import EmojiPicker from "./EmojiPicker.svelte";

  let selected: boolean[] = [];
  let groupIndex = 0;
  let counter = 0;
  let emojisPromise = downloadData();

  async function downloadData() {
    console.log('downloadData');
    const resp = await fetch("http://localhost:7001/data.json");
    const emojis = await resp.json();
    console.log(`Loaded ${emojis.length} emojis.`);
    selected = emojis.map(() => true);
    return emojis;
  }



  function incrementGroupIfNeeded(group: number) {
    if(group != groupIndex) {
      groupIndex = group;
      return true;
    }
    return false;
  }

  async function toggleWholeGroup(group: number) {
    const emojis = await emojisPromise;
    console.log(emojis);
    counter++;
    let val;
    if (counter % 2 === 0) {
      val = true;
    } else {
      val = false;
    }
    console.log(group);
    emojis.forEach((emojiObj: any, i: number) => {
      if (emojiObj.group === group) {
        selected[i] = val;
      }
    });
  }
</script>

<main>
  <h1>Vite + Svelte</h1>

  <p>
    Hello there
    <EmojiPicker />
  </p>
  <div>
    <button on:click={() => toggleWholeGroup(0)}>toggle whole group</button>
  </div>
  {#await emojisPromise}
    <p>Loading emojis...</p>
  {:then emojis}
    <!-- promise was fulfilled or not a Promise -->
    {#each emojis as emojiObj, i}
      {#if incrementGroupIfNeeded(emojiObj.group)}
        <br/><br/>
        <div>
          <button on:click={() => toggleWholeGroup(emojiObj.group)}>toggle whole group</button>
        </div>
      {/if}
      <div class="emoji">
        <input id={`emoji${i}`} type="checkbox" bind:checked={selected[i]} />
        <label for={`emoji${i}`}>{emojiObj.emoji}</label>
      </div>
    {/each}
  {:catch error}
    <!-- promise was rejected -->
    <p>Something went wrong: {error.message}</p>
  {/await}

</main>

<style>
  .emoji {
    font-size: 28px;
    display: inline-block;
  }

  input, label, .emoji {
    cursor: pointer;
  }

  input:not(:checked) + label {
    filter: grayscale(1);
    opacity: 0.2;
  }

</style>
