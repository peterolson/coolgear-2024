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
		{#each Array(world.size) as _, y}
			{#each Array(world.size) as _, x}
				{@const piece = world.pieces.find((p) => p.x === x && p.y === y)}
				{#if piece}
					<img
						class="grid-cell"
						src={`/pieces/${piece.type}${piece.gender || ''}.svg`}
						alt="piece"
						width="100"
						height="100"
						title={`${piece.owner} ${piece.type} ${piece.gender || ''} (${piece.x}, ${piece.y})`}
					/>
				{:else}
					<div class="grid-cell"></div>
				{/if}
			{/each}
		{/each}
	</div>
	<CodeEditor {defaultCode} {lib} bind:world />
</main>

<style>
	main {
		display: flex;
		align-items: center;
		height: calc(100svh - 64px);
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
		aspect-ratio: 1 / 1;
	}

	.grid-cell {
		width: 100%;
		aspect-ratio: 1 / 1;
	}
</style>
