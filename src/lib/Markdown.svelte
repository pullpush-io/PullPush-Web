<script lang="ts">
	import { decodeHTML } from 'entities';
	import MarkdownIt from 'markdown-it';
	import { highlights } from './stores';
	import { higlight } from './utils';
	const md = new MarkdownIt();
	const alphanumericRegex = /[a-zA-Z0-9]/;
	md.renderer.rules.image = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		let src = token.attrGet('src');
		if (src?.match(alphanumericRegex)) {
			let text = '';

			for (let _token of md.parse(token.attrGet('title') || '', {})) {
				if (_token.type == 'inline') text = _token.content;
			}

			return `<p>${text}</p>`;
		}

		return slf.renderToken(tokens, idx, options);
	};
	export let source: string;
	source = decodeHTML(source);
	source = md.render(source);
	source = decodeHTML(source);
</script>

{@html higlight(source, $highlights)}
