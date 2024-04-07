<script lang="ts">
	import CodeEditor from './CodeEditor.svelte';
	import type { CodeVersion, User } from './db/db';
	import type { World, WorldGenerator, WorldScoring } from './world';
	import { shortcut } from './ui/shortcut';

	export let generator: WorldGenerator;
	export let defaultCode: string;
	export let lib: Record<string, string>;
	export let user: User;
	export let level: number;
	export let name: string;
	export let codeVersions: CodeVersion[];
	export let scoring: WorldScoring;

	let randomSeed = '1';
	let world = generator(randomSeed, user.displayName);

	function resetWorld() {
		world = generator(randomSeed, user.displayName);
	}

	let isRunning = false;

	// filter generator from hex code: https://codepen.io/sosuke/pen/Pjoqqp
	let colorFilters = {
		map: '',
		[user.displayName]:
			'filter: invert(18%) sepia(38%) saturate(5630%) hue-rotate(230deg) brightness(80%) contrast(141%)', // blue
		boss: 'filter: invert(13%) sepia(95%) saturate(3553%) hue-rotate(355deg) brightness(84%) contrast(120%);' // red
	};
</script>

<svelte:head>
	<title>Level {level}: {name}</title>
</svelte:head>

<main>
	<div class="grid-container">
		<h3>Level {level}: {name}</h3>
		<div
			class="grid"
			style={`grid-template-columns: repeat(${world.size}, 1fr); grid-template-rows: repeat(${world.size}, 1fr)`}
		>
			{#each Array(world.size) as _, y}
				{#each Array(world.size) as _, x}
					{@const piece = world.pieces.find((p) => p.x === x && p.y === y)}
					{@const colorFilter = piece ? colorFilters[piece.owner] : colorFilters.map}
					{#if piece}
						<img
							class="grid-cell"
							src={`/pieces/${piece.type}${piece.gender || ''}.svg`}
							alt="piece"
							width="100"
							height="100"
							title={`${piece.owner} ${piece.type} ${piece.gender || ''} (${piece.x}, ${piece.y}) ${piece.hitpoints}/${piece.maxHitpoints}HP ${piece.attack} attack`}
							style={colorFilter}
						/>
					{:else}
						<div class="grid-cell"></div>
					{/if}
				{/each}
			{/each}
		</div>
		<div>
			<label>
				Random seed:
				<input type="text" bind:value={randomSeed} />
			</label>
			<button
				on:click={resetWorld}
				disabled={isRunning}
				use:shortcut={{ control: true, code: 'KeyR' }}
				title="Hotkey: Ctrl + R"
			>
				Reset
			</button>
		</div>
	</div>
	<CodeEditor
		{defaultCode}
		{lib}
		user={user.displayName}
		{level}
		bind:codeVersions
		bind:world
		bind:isRunning
		{generator}
		{scoring}
	/>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		height: calc(100svh - 80px);
	}

	.grid-container {
		width: min(100%, 500px);
	}

	h3 {
		margin: 4px;
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
		border: 1px dotted rgba(0, 0, 255, 0.1);
		box-sizing: border-box;
	}

	input {
		width: 50px;
	}
</style>
