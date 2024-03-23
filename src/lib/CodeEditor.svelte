<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import type * as m from 'monaco-editor';
	import type { World } from './world';

	export const ssr = false;
	export let defaultCode: string;
	export let lib: Record<string, string>;
	export let world: World;

	let monaco: typeof m;
	let editorElement: HTMLDivElement;
	let editor: m.editor.IStandaloneCodeEditor;
	let model: m.editor.ITextModel;

	onMount(async () => {
		monaco = await import('monaco-editor');
		self.MonacoEnvironment = {
			getWorker: function (_: any) {
				return new tsWorker();
			}
		};

		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

		for (const key in lib) {
			const libSource = lib[key];
			const libUri = `ts:filename/${key}.d.ts`;
			monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);
			monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
		}

		editor = monaco.editor.create(editorElement, {
			value: defaultCode,
			language: 'typescript'
		});
		model = monaco.editor.createModel(defaultCode, 'typescript');
		editor.setModel(model);
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});

	async function getCompiledCode() {
		const worker = await monaco.languages.typescript.getTypeScriptWorker();
		const client = await worker(model.uri);
		const response = await client.getEmitOutput(model.uri.toString());
		return response.outputFiles[0].text;
	}

	let isRunning = false;

	async function runStep() {
		isRunning = true;
		const compiledCode = await getCompiledCode();
		world.setCode('human', compiledCode);
		await world.step();
		world.pieces = world.pieces;
		world.logs = world.logs;
		scrollToBottom();
		isRunning = false;
	}

	let delayMs = 100;
	let logDiv: HTMLDivElement;

	async function wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function scrollToBottom() {
		logDiv.scrollTop = logDiv.scrollHeight;
	}

	async function run() {
		isRunning = true;
		const compiledCode = await getCompiledCode();
		world.setCode('human', compiledCode);
		await world.run(async () => {
			if (delayMs > 0) {
				world.pieces = world.pieces;
				world.logs = world.logs;
				await wait(delayMs);
				scrollToBottom();
			}
		});
		world.pieces = world.pieces;
		world.logs = world.logs;
		await wait(delayMs);
		scrollToBottom();
		isRunning = false;
	}

	function reset() {
		world = world.reset();
	}

	let activeTab = 'code';
</script>

<section>
	<nav>
		<button on:click={() => (activeTab = 'code')} class:active-tab={activeTab === 'code'}>
			Code
		</button>
		<button on:click={() => (activeTab = 'logs')} class:active-tab={activeTab === 'logs'}>
			Logs
		</button>
	</nav>
	<div class:hidden={activeTab !== 'code'} bind:this={editorElement} class="code-editor" />
	<div class:hidden={activeTab !== 'logs'} class="logs" bind:this={logDiv}>
		{#each world.logs as log}
			<div class="log" class:error-log={log.level === 'error'}>
				{#if log.message.startsWith('step ')}
					<br />
				{/if}
				{#if log.level === 'error'}
					❗
				{/if}
				{#if log.piece}
					<img
						src={`pieces/${log.piece.type.toLowerCase()}.svg`}
						alt="piece"
						width="16"
						height="16"
					/>
					({log.piece.x}, {log.piece.y})
				{/if}
				{#if log.move}
					{` -> (${log.move.action}, ${log.move.dx === 1 ? '+1' : log.move.dx}, ${log.move.dy})`}
				{/if}
				{log.message}
			</div>
		{/each}
	</div>
	<footer>
		<button on:click={runStep} disabled={isRunning}>Step</button>
		<button on:click={run} disabled={isRunning}>Run</button>
		<label
			>Delay (ms):
			<input type="number" bind:value={delayMs} min="0" max="2000" />
		</label>
		<button on:click={reset} disabled={isRunning}>Reset</button>
	</footer>
</section>

<style>
	section {
		height: 100%;
		flex: 1;
		display: grid;
		grid-template-rows: 36px 1fr 2em;
		padding: 8px;
	}

	.code-editor {
		border: 1px dotted #ccc;
	}

	.hidden {
		display: none;
	}

	nav {
		display: flex;
	}

	nav button {
		background: none;
		border: none;
		cursor: pointer;
		flex: 1;
		border: 1px solid #eee;
		border-radius: 8px;
		border-bottom: none;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.active-tab {
		font-weight: bold;
		background-color: #eee;
		border-color: #ccc;
	}
	footer {
		margin-top: 8px;
	}

	.logs {
		overflow: auto;
		font-family: monospace;
	}

	.logs .log {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.logs .log img {
		width: 16px;
		height: 16px;
	}

	.error-log {
		color: rgb(64, 0, 0);
		background-color: rgb(255, 200, 200);
	}
</style>
