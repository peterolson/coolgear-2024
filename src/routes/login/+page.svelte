<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Log in</title>
</svelte:head>

<h1>Log in</h1>

<form method="post">
	<label for="username">Username</label>
	<input type="text" id="username" name="username" required value={form?.username ?? ''} />
	<label for="password">Password</label>
	<input type="password" id="password" name="password" required />
	<button type="submit">Log in</button>
	{#if form?.error}
		<div class="error">{form.error}</div>
	{/if}
</form>

<style>
	form {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		max-width: 600px;
	}

	button {
		grid-column: span 2;
	}

	.error {
		color: rgb(90, 0, 0);
		background-color: rgb(253, 187, 187);
		border: 1px solid rgb(255, 100, 100);
		padding: 0.5rem;
		border-radius: 4px;
		grid-column: span 2;
	}
</style>
