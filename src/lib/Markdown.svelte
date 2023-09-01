<script lang="ts">
	import { decodeHTML } from 'entities';
	import MarkdownIt from 'markdown-it';
	const md = new MarkdownIt();
	export let source: string;
	source = decodeHTML(source);
	source = md.render(source);
	source = decodeHTML(source);
</script>

{@html source}
