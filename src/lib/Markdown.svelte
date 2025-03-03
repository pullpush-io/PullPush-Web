<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { highlights } from './stores';
	import { higlight, replaceRedditLinksWithImages, sanitizeHtml } from './utils';
	import { friendlyAttrValue } from 'xss';
	const md = new MarkdownIt({
		html: true,
	});
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
	md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		let text = friendlyAttrValue(token.content);
		return `<code>${text}</code>`;
	};
	export let source: string;
	$: renderedMarkdown = md.render(source);
	$: content = replaceRedditLinksWithImages(sanitizeHtml(renderedMarkdown))
</script>

<div class="container">
	{@html higlight(content, $highlights)}
</div>

<style>
	.container {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
	}

	:global(.container h1) {
		font-size: 20px;
		line-height: 20px;
		margin-bottom: 10px;
		font-weight: 400 !important;
	}

	:global(.container p) {
		font-size: 14px;
		line-height: 20px;
  	line-height: 1.25rem;
		margin-top: 14px;
		margin-bottom: 16px;
	}

	:global(.container code) {
		border-radius: 4px;
		border: 1px solid #1b1e20;
		padding: 2px 4px;
		font-size: 12.6px;
		font-family: Noto Mono, Menlo, Monaco, Consolas, monospace;
	}

	:global(.container ul, .container.ol) {
		margin: 16px 0;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		margin-block-start: 14px;
		margin-block-end: 16px;
		padding-inline-start: 32px;
		padding-left: 32px;
		font-size: 14px;
	}

	:global(.container ul) {
		list-style: disc !important;
	}

	:global(.container ol) {
		list-style: decimal !important;
	}

	:global(.container a) {
		color: #ad8bfe;
		text-decoration: underline;
	}

	:global(.container a:hover) {
		color: #d0c0fe;
	}

	:global(.container img) {
		width: fit-content;
		max-width: 100%;
		margin-left: auto;
		margin-right: auto;
	}

	:global(.container figure) {
		margin-bottom: 16px;
	}

	:global(.container figcaption) {
		font-size: 11.2px;
		color: rgb(187, 195, 203);
		text-align: center;
		margin-top: 4.48px;
	}
</style>