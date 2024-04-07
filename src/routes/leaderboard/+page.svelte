<script lang="ts">
	import { levels } from '$lib/levels/levels';
	import type { PageData } from './$types';

	export let data: PageData;
	let { userNames, leaderboards } = data;

	function viewCode(
		leaderboard: { _id: string; avgScore: number; code: string },
		selfSolution: { avgScore: number } | undefined,
		highestBest: boolean
	) {
		if (!selfSolution) {
			alert(
				'You are not allowed to view the code for this solution until you have solved it yourself.'
			);
			return;
		}
		console.log(leaderboard, selfSolution);
		const { code, _id, avgScore } = leaderboard;
		let isBetter = selfSolution.avgScore <= avgScore;
		if (highestBest) isBetter = selfSolution.avgScore >= avgScore;
		if (!isBetter) {
			alert('You are not allowed to view the code for a solution that is better than yours.');
			return;
		}
		const newTab = window.open();
		if (!newTab) return;
		const userName = userNames[_id];
		newTab.document.write(`<pre>${code}</pre>`);
		newTab.document.title = `${userName} - ${avgScore.toFixed(2)}`;
	}
</script>

<h1>Leaderboard</h1>

{#each levels as level, i}
	{@const highestBest = level.scoring.highestBest}
	{@const leaderboard = leaderboards[i].sort((a, b) =>
		highestBest ? b.avgScore - a.avgScore : a.avgScore - b.avgScore
	)}
	<h2>Level {i + 1}: {level.name}</h2>
	<table>
		<thead>
			<tr>
				<th>Rank</th>
				<th>User</th>
				<th>Score</th>
				<th>Submitted</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each leaderboard as { _id, avgScore, submittedAt }, i}
				{@const selfSolution = leaderboard.find(({ _id }) => _id === data.user?._id)}
				<tr class:self={_id === data.user?._id}>
					<td class="rank">{i + 1}</td>
					<td class="user">{userNames[_id]}</td>
					<td class="score">{avgScore.toFixed(2)}</td>
					<td class="submitted">{submittedAt.toLocaleString()}</td>
					<td class="view-code">
						<button on:click={() => viewCode(leaderboard[i], selfSolution, highestBest)}
							>View Code</button
						>
					</td>
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

	tr.self {
		background-color: rgb(255, 255, 194);
		font-weight: bold;
	}
</style>
