<script lang="ts">
	import { onMount } from 'svelte';
	import type { World, WorldGenerator, WorldScoring } from './world';

	export let world: World;
	export let delayMs: number;
	export let generator: WorldGenerator;
	export let run: () => Promise<void>;
	export let user: string;
	export let scoring: WorldScoring;
	export let level: number;
	export let codeText: string;
	export let onClose: () => void;

	let results: {
		seed: number;
		solved: boolean;
		score: number;
	}[] = [];
	let solvedAll = false;
	let inProgress = false;

	async function runSolution(seed: number) {
		const originalDelay = delayMs;
		const originalWorld = world;
		delayMs = 0;
		world = generator(String(seed), user);
		await run();
		const result = {
			seed,
			solved: world.isSolved(),
			score: scoring.evaluator(world)
		};
		delayMs = originalDelay;
		world = originalWorld;
		return result;
	}

	let currentSeed = 1;
	let totalScore = 0;

	onMount(async () => {
		inProgress = true;
		solvedAll = true;
		for (currentSeed = 1; currentSeed <= 100; currentSeed++) {
			const result = await runSolution(currentSeed);
			results = [...results, result];
			totalScore += result.score;
			if (!result.solved) {
				solvedAll = false;
				break;
			}
		}
		if (solvedAll) {
			await fetch(`/levels/${level}/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code: codeText, scores: results.map((r) => r.score) })
			});
		}
		inProgress = false;
	});
</script>

<div class="backdrop">
	<dialog open={true}>
		<h3>
			{#if inProgress}
				⌛ Submitting solution...
			{:else if solvedAll}
				✅ Solution submitted!
			{:else}❌ Failed to solve seed {currentSeed}{/if}
		</h3>
		{#if inProgress}
			<p>Running solution for seed {currentSeed}...</p>
		{:else if solvedAll}
			<p>All seeds solved!</p>
		{:else}
			<p>Failed to solve seed {currentSeed}.</p>
		{/if}
		<p>Average {scoring.title}: <strong>{(totalScore / currentSeed).toFixed(3)}</strong></p>
		{#if !inProgress}
			<button on:click={onClose}>Close</button>
		{/if}
		<table>
			<thead>
				<tr>
					<th>Seed</th>
					<th>Solved</th>
					<th>{scoring.title}</th>
				</tr>
			</thead>
			<tbody>
				{#each results as { seed, solved, score }, i}
					<tr>
						<td>{seed}</td>
						<td>{solved ? '✅' : '❌'}</td>
						<td>{score}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</dialog>
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5;
	}

	dialog {
		background: white;
		padding: 20px;
		border-radius: 5px;
		max-height: 80vh;
		overflow: auto;
	}

	td,
	th {
		text-align: center;
	}

	table {
		width: 300px;
	}
</style>
