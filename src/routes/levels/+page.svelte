<script lang="ts">
	import { levels } from '$lib/levels/levels';
</script>

<h1>Levels</h1>

<ol>
	{#each levels as level, i}
		<li><a href={`levels/${i + 1}`}>{level.name}</a></li>
	{/each}
</ol>
