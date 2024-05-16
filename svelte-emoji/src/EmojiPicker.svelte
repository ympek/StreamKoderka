<script lang="ts">
	import 'emoji-picker-element';

	export let emoji = '🚀';

	let button: HTMLButtonElement;
	let popover: HTMLDivElement;
	let pickerVisible = false;

	function handleButtonClick() {
		pickerVisible = !pickerVisible;
		setPickerPosition();
		console.log('Button clicked');
		console.log('emoji', emoji);
	}

	function handlePick(e: CustomEvent) {
		pickerVisible = false;
		emoji = e.detail.unicode;
	}

	function setPickerPosition() {
		const buttonRect = button.getBoundingClientRect();
		popover.style.top = `${buttonRect.bottom - 100}px`;
		popover.style.left = `${buttonRect.right}px`;
	}
</script>

<div class="wrapper">
	<button type="button" bind:this={button} on:click={handleButtonClick}>{emoji}</button>
	<div bind:this={popover} class="popover" class:visible={pickerVisible}>
    <emoji-picker 
      data-source="http://localhost:7001/data.json"
      on:emoji-click={handlePick}>
    </emoji-picker>
	</div>
</div>

<style>
	button {
		border: none;
		background: #333442;
		border-radius: 5px;
		padding: 0.5rem 0.7rem;
		cursor: pointer;
	}

	button:focus-visible {
		outline: 2px solid #b5b5ff;
		border-radius: 5px;
	}

	.wrapper {
		position: relative;
	}

	.popover {
		position: fixed;
		z-index: 1000;
		top: 0;
		left: 0;
		display: none;
	}

	.popover.visible {
		display: block;
	}

	emoji-picker {
		--num-columns: 7;
	}
</style>
