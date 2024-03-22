<script lang="ts">
	import CodeEditor from './CodeEditor.svelte';
	import type { World } from './world';

	export let world: World;
	export let defaultCode: string;
	export let lib: Record<string, string>;
</script>

<main>
	<div
		class="grid"
		style={`grid-template-columns: repeat(${world.size}, 1fr); grid-template-rows: repeat(${world.size}, 1fr)`}
	>
		{#each world.pieces as piece}
			<div style={`grid-row: ${piece.y} / ${piece.y}; grid-column: ${piece.x} / ${piece.x}`}>
				<img src={`pieces/${piece.type.toLowerCase()}.svg`} alt="piece" />
			</div>
		{/each}
	</div>
	<CodeEditor {defaultCode} {lib} bind:world />
</main>

<style>
	main {
		display: flex;
		align-items: center;
		height: calc(100svh - 2rem);
	}

	.grid {
		display: grid;
		border: 1px solid #ccc;
		width: min(100%, 500px);
		aspect-ratio: 1 / 1;
	}
	img {
		width: 100%;
		height: 100%;
	}
</style>
