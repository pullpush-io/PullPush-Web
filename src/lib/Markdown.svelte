<script lang="ts">
	import { decodeHTML } from 'entities';
	import MarkdownIt from 'markdown-it';
	const md = new MarkdownIt();
	const alphanumericRegex = /[a-zA-Z0-9]/;
	md.renderer.rules.image = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		let src = token.attrGet('src');
		if (src?.match(alphanumericRegex)) {
			token.tag = 'p';
			token.type = 'paragraph_open';
			token.nesting = 1;
			token.children = [
				// @ts-expect-error
				{
					attrs: null,
					block: true,
					children: null,
					content: 'text',
					hidden: false,
					map: null,
					markup: 'specific-stuff',
					meta: null,
					nesting: 0,
					tag: '',
					type: 'text'
				}
			];
		}

		return slf.renderToken(tokens, idx, options);
	};
	export let source: string;
	source = decodeHTML(source);
	source = md.render(source);
	source = decodeHTML(source);
</script>

{@html source}
