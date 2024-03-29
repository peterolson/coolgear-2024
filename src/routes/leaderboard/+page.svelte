<script lang="ts">
	import { levels } from '$lib/levels/levels';
	import type { PageData } from './$types';

	export let data: PageData;
	let { userNames, leaderboards } = data;
</script>

<h1>Leaderboard</h1>

{#each levels as level, i}
	{@const leaderboard = leaderboards[i]}
	<h2>Level {i + 1}: {level.name}</h2>
	<table>
		<thead>
			<tr>
				<th>Rank</th>
				<th>User</th>
				<th>Score</th>
				<th>Submitted</th>
			</tr>
		</thead>
		<tbody>
			{#each leaderboard as { _id, avgScore, submittedAt }, i}
				<tr>
					<td>{i + 1}</td>
					<td>{userNames[_id]}</td>
					<td>{avgScore.toFixed(4)}</td>
					<td>{submittedAt.toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/each}
