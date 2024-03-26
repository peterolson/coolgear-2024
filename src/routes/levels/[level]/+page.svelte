<script lang="ts">
	import { generator, defaultCode } from '$lib/levels/1_eat_food';
	import WorldGrid from '$lib/WorldGrid.svelte';
	import type { PageData } from './$types';

	let world = generator('hello10');
	export let data: PageData;
</script>

<WorldGrid {world} {defaultCode} lib={data.lib} />
