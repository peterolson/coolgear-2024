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
					<td class="rank">{i + 1}</td>
					<td class="user">{userNames[_id]}</td>
					<td class="score">{avgScore.toFixed(4)}</td>
					<td class="submitted">{submittedAt.toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/each}

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
	}

	th {
		background-color: #f2f2f2;
	}

	tr:nth-child(even) {
		background-color: #f2f2f2;
	}

	td.rank {
		text-align: right;
	}
	td {
		text-align: center;
	}
</style>
