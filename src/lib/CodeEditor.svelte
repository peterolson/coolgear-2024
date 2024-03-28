<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import type * as m from 'monaco-editor';
	import type { World, WorldGenerator, WorldScoring } from './world';
	import type { CodeVersion } from './db/db';
	import { shortcut } from './ui/shortcut';
	import SubmitSolution from './SubmitSolution.svelte';

	export let defaultCode: string;
	export let lib: Record<string, string>;
	export let world: World;
	export let user: string;
	export let level: number;
	export let codeVersions: CodeVersion[];
	export let generator: WorldGenerator;
	export let scoring: WorldScoring;

	let selectedCodeVersion = codeVersions[0]?._id ?? 'default';

	let monaco: typeof m;
	let editorElement: HTMLDivElement;
	let editor: m.editor.IStandaloneCodeEditor;
	let model: m.editor.ITextModel;

	let codeText = '';
	let codeHasChanged = false;

	let selectVersionChanged = false;

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
		const code = codeVersions[0]?.code ?? defaultCode;
		model = monaco.editor.createModel(code, 'typescript');
		editor.setModel(model);

		editor.onDidChangeModelContent(() => {
			codeText = editor.getValue();
			if (selectVersionChanged) {
				selectVersionChanged = false;
				return;
			}
			codeHasChanged = true;
			if (codeVersions[0]?._id !== 'unsaved') {
				codeVersions = [
					{
						_id: 'unsaved',
						createdAt: new Date(),
						levelId: '',
						userId: '',
						code: codeText
					},
					...codeVersions
				];
				selectedCodeVersion = 'unsaved';
			} else {
				codeVersions = codeVersions.map((v) =>
					v._id === 'unsaved'
						? {
								...v,
								code: codeText
							}
						: v
				);
			}
		});
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

	export let isRunning = false;

	async function runStep() {
		isRunning = true;
		const compiledCode = await getCompiledCode();
		world.setCode(user, compiledCode);
		await world.step();
		world.pieces = world.pieces;
		world.logs = world.logs;
		scrollToBottom();
		isRunning = false;
	}

	let delayMs = 100;
	let logDiv: HTMLDivElement;
	let isStopped = false;

	async function wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function scrollToBottom() {
		logDiv.scrollTop = logDiv.scrollHeight;
	}

	async function run() {
		isRunning = true;
		const compiledCode = await getCompiledCode();
		world.setCode(user, compiledCode);
		await world.run(async () => {
			if (delayMs > 0) {
				world.pieces = world.pieces;
				world.logs = world.logs;
				await wait(delayMs);
				scrollToBottom();
			}
			return isStopped;
		});
		world.pieces = world.pieces;
		world.logs = world.logs;
		await wait(delayMs);
		scrollToBottom();
		isRunning = false;
		isStopped = false;
	}

	let activeTab = 'code';

	async function save() {
		codeHasChanged = false;
		const response = await fetch(`/levels/${level}/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code: codeText })
		});
		if (!response.ok) {
			alert('Failed to save code');
			return;
		}
		const _id = crypto.randomUUID();
		codeVersions = [
			{
				_id,
				createdAt: new Date(),
				levelId: '',
				userId: '',
				code: codeText
			},
			...codeVersions.filter((x) => x._id !== 'unsaved')
		];
		selectedCodeVersion = _id;
	}

	function changeVersion() {
		selectVersionChanged = true;
		const version = codeVersions.find((v) => v._id === selectedCodeVersion);
		if (version) {
			editor.setValue(version.code);
		} else {
			editor.setValue(defaultCode);
		}
	}

	let isSubmitting = false;
	function submitSolution() {
		isSubmitting = true;
	}
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
						src={`/pieces/${log.piece.type}${log.piece.gender || ''}.svg`}
						alt="piece"
						width="16"
						height="16"
					/>
					({log.piece.x}, {log.piece.y})
				{/if}
				{#if log.move}
					{` -> (${log.move.action}, ${log.move.dx === 1 ? '+1' : log.move.dx}, ${log.move.dy}): `}
				{/if}
				{log.message}
				{#if log.recipient}
					<img
						src={`/pieces/${log.recipient.type}${log.recipient.gender || ''}.svg`}
						alt="piece"
						width="16"
						height="16"
					/>
					({log.recipient.x}, {log.recipient.y})
				{/if}
			</div>
		{/each}
	</div>
	<footer>
		<button
			on:click={runStep}
			disabled={isRunning}
			use:shortcut={{ code: 'F6' }}
			title="Hotkey: F6"
		>
			Step
		</button>
		<label
			>Delay (ms):
			<input type="number" bind:value={delayMs} min="0" max="2000" />
		</label>
		<button on:click={run} disabled={isRunning} use:shortcut={{ code: 'F5' }} title="Hotkey: F5">
			Run
		</button>
		<button
			disabled={!isRunning}
			on:click={() => {
				isStopped = true;
			}}
			use:shortcut={{ code: 'Escape' }}
			title="Hotkey: Esc"
		>
			Stop
		</button>
		<button
			disabled={!codeHasChanged}
			on:click={save}
			use:shortcut={{ control: true, code: 'KeyS' }}
			title="Hotkey: Ctrl + S"
		>
			Save
		</button>

		<label>
			Version:
			<select bind:value={selectedCodeVersion} on:change={changeVersion}>
				{#each codeVersions as version, i}
					<option value={version._id}
						>{version._id === 'unsaved'
							? 'Unsaved changes'
							: version.createdAt.toLocaleString()}</option
					>
				{/each}
				<option value="default">Default</option>
			</select>
		</label>

		{#if world.isSolved()}
			<span>
				<button on:click={submitSolution}>Submit solution</button>
			</span>
		{/if}
	</footer>
</section>

{#if isSubmitting}
	<SubmitSolution bind:world {generator} {run} {user} {scoring} bind:delayMs />
{/if}

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
