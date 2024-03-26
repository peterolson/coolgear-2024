<script lang="ts">
	import WorldGrid from '$lib/WorldGrid.svelte';
	import { levels } from '$lib/levels/levels';
	import type { PageData } from './$types';

	export let data: PageData;
	let { lib, level } = data;

	const currentLevel = levels[level - 1];
	const { generator, defaultCode } = currentLevel;

	let world = generator('hello10');
</script>

<WorldGrid {world} {defaultCode} {lib} />
