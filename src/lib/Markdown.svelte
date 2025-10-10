<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { highlights } from './stores';
	import { higlight, sanitizeHtml } from './utils';
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
		let text = friendlyAttrValue(token.content.replaceAll(/\n/g, '<br />'));
		return `<code>${text}</code>`;
	};
	md.renderer.rules.code_block = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		let text = friendlyAttrValue(token.content.replaceAll(/\n/g, '<br />'));
		return `<pre>${text}</pre>`;
	};
	
	md.inline.ruler.before('text', 'spoiler', (state, silent) => {
		const start = state.pos
		if (state.src.slice(start, start + 2) !== '!!') return false

		const end = state.src.indexOf('!!', start + 2)
		if (end === -1) return false

		if (!silent) {
			const token = state.push('spoiler', '', 0)
			token.content = state.src.slice(start + 2, end)
		}

		state.pos = end + 2
		return true
	})
	md.renderer.rules.spoiler = (tokens, idx) => {
		return `<span class="spoiler">${tokens[idx].content}</span>`
	}
	const replaceSpoilerTags = (source: string) => {
		return source.replaceAll(/&gt;!([^\n]*?)!&lt;/g, '!!$1!!')
	}

	md.inline.ruler.before('text', 'superscript', (state, silent) => {
		const start = state.pos
		if (state.src.slice(start, start + 2) !== '^(') return false

		const end = state.src.indexOf(')', start + 1)
		if (end === -1) return false

		if (!silent) {
			const token = state.push('superscript', '', 0)
			token.content = state.src.slice(start + 2, end)
		}

		state.pos = end + 2
		return true
	})
	md.renderer.rules.superscript = (tokens, idx) => {
		return `<sup>${tokens[idx].content}</sup>`
	}

	md.inline.ruler.before('text', 'superscriptshort', (state, silent) => {
		const start = state.pos
		if (state.src.slice(start, start + 1) !== '^') return false

		let end = state.src.indexOf(' ', start + 1)
		if (end === -1) {
			end = state.src.length - 1
		}

		const forbiddenCharacters = ['(', ')', '^', '[', ']']
		if(forbiddenCharacters.some(char => state.src.slice(start + 1, end).includes(char))) {
			return false
		}
		
		if (!silent) {
			const token = state.push('superscriptshort', '', 0)
			token.content = state.src.slice(start + 1, end + 1)
		}

		state.pos = end + 1
		return true
	})
	md.renderer.rules.superscriptshort = (tokens, idx) => {
		return `<sup>${tokens[idx].content}</sup>`
	}

	export let source: string;
	$: renderedMarkdown = md.render(replaceSpoilerTags(source))
	$: console.log(renderedMarkdown)
	$: content = sanitizeHtml(renderedMarkdown)

	const handleClick = (e: MouseEvent) => {
		const target = e.target;
		if(target instanceof HTMLElement) {
			if (target.classList.contains('spoiler')) {
				target.classList.add('revealed');
			}
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container" on:click={handleClick}>
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

	:global(.container ul, .container ol) {
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

	:global(.container pre, .container code) {
		font-family: Noto Mono, Menlo, Monaco, Consolas, monospace;
		font-size: 12.6px;
		border-radius: 4px;
	}
	
	:global(.container pre) {
		background: #1E1E1E;
		border: 1px solid #303030;
		padding: 16px 22.4px;
		max-width: 100%;
		overflow: auto;
		white-space: pre-wrap;
	}

	:global(.container code) {
		border: 1px solid #1b1e20;
		padding: 2px 4px;
	}

	:global(.container span.spoiler) {
		background-color: #f1f2f2;
		color: transparent;
		transition: background-color 1s ease-out, color 1s ease-out;
		border-radius: 2px;
		cursor: pointer;
		user-select: none;
	}

	:global(.container span.spoiler.revealed) {
		background-color: transparent;
		color: inherit;
		cursor: auto;
		user-select: auto;
	}

	:global(.container td, .container th) {
		padding: 8px;
		text-align: left;
		font-size: 14px;
	}

	:global(.container sup) {
		display: inline;
		vertical-align: super;
		position: static;
	}
</style>