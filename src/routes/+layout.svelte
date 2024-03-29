<script lang="ts">
	import type { LayoutData } from './$types';
	export let data: LayoutData;
</script>

<nav>
	<a href="/" class="home"><b>Cool</b><i>Gear</i> 2024</a>
	<a href="/levels">Levels</a>
	<a href="/leaderboard">Leaderboard</a>
	<span>
		{#if data.user}
			Logged in as <strong>{data.user.displayName}</strong>
			<form action="/logout" method="post">
				<button type="submit">Log out</button>
			</form>
		{:else}
			<a href="/login">Login</a>
		{/if}
	</span>
</nav>
<main>
	<slot />
</main>

<style>
	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
		margin: 0;
		padding: 0;
	}

	nav {
		display: flex;
		gap: 8px;
		padding: 8px;
		background-color: #222222;
		color: rgb(250, 250, 250);
		align-items: center;
	}

	nav a {
		color: inherit;
	}

	nav span {
		flex: 1;
		text-align: right;
	}

	nav form {
		display: inline;
		margin-left: 8px;
	}

	nav form button {
		background: none;
		color: inherit;
		cursor: pointer;
	}

	.home {
		text-decoration: none;
		color: inherit;
		font-size: 120%;
	}

	main {
		padding: 16px;
	}
</style>
