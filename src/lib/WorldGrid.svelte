<script lang="ts">
	import type { World } from './world.types';

	export let world: World;
	console.log(world);
</script>

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

<style>
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
