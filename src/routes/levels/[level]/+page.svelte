<script lang="ts">
	import WorldGrid from '$lib/WorldGrid.svelte';
	import { levels } from '$lib/levels/levels';
	import type { PageData } from './$types';

	export let data: PageData;
	let { lib, level, user } = data;

	const currentLevel = levels[level - 1];
	const { generator, defaultCode, name } = currentLevel;
</script>

{#if user}
	<WorldGrid {generator} {defaultCode} {lib} {user} {level} {name} />
{:else}
	<p>You must be logged in to play.</p>
{/if}
