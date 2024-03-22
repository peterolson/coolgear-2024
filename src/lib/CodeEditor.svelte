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

	async function runCode() {
		const worker = await monaco.languages.typescript.getTypeScriptWorker();
		const client = await worker(model.uri);
		const response = await client.getEmitOutput(model.uri.toString());
		const compiledCode = response.outputFiles[0].text;
		world.setCode('human', compiledCode);
		await world.step();
		world.pieces = world.pieces;
	}
</script>

<section>
	<div bind:this={editorElement} />
	<nav>
		<button on:click={runCode}>Step</button>
	</nav>
</section>

<style>
	section {
		height: 100%;
		flex: 1;
		display: grid;
		grid-template-rows: 1fr 2em;
		gap: 8px;
		padding: 8px;
	}

	div {
		border: 1px dotted #ccc;
	}
</style>
