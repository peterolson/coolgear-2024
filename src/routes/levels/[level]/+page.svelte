<script lang="ts">
	import WorldGrid from '$lib/WorldGrid.svelte';
	import { levels } from '$lib/levels/levels';
	import type { PageData } from './$types';

	export let data: PageData;
	let { lib, level, user, codeVersions } = data;

	const currentLevel = levels[level - 1];
	const { generator, defaultCode, name, scoring } = currentLevel;
</script>

{#if user}
	<WorldGrid {generator} {defaultCode} {lib} {user} {level} {name} {scoring} {codeVersions} />
{:else}
	<p>You must be logged in to play.</p>
{/if}
