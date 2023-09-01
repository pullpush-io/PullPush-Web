<script lang="ts">
	import { decodeHTML } from 'entities';
	import MarkdownIt from 'markdown-it';
	const md = new MarkdownIt();
	md.disable(['image']);
	export let source: string;
	if (source.includes('Empress Medusa')) {
		console.log(source);
	}
	source = decodeHTML(source);
	source = md.render(source);
	source = decodeHTML(source);
</script>

{@html source}
