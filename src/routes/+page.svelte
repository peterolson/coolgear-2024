<script lang="ts">
	import { generator } from '$lib/levels/1_eat_food';
	import WorldGrid from '../lib/WorldGrid.svelte';
	import type { World } from '../lib/world.types';

	let world = generator('hello10');
</script>

<WorldGrid {world} />
