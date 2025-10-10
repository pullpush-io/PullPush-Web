import xss from 'xss'

export function higlight(source: string, highlights: Array<string>) {
	if (highlights.length == 0) return source;
	if (!source) return;

	for (let word of highlights) {
		const regex = new RegExp(` ${word}`, 'gi');
		const matchResult = source.match(regex);
		if (matchResult) {
			source = source.replaceAll(regex, `&nbsp;<span class="bg-red-600">${matchResult[0]}</span>`);
		}
	}

	return source;
}

const zeroWidthSpaceHtmlEntity = '&amp;#x200B;'
export function sanitizeHtml(html: string) {
	const sanitizedHtml = xss(html, {
		whiteList: {
			pre: [],
			code: [],
			table: [],
			blockquote: [],
			br: [],
			p: [],
			li: [],
			ol: [],
			ul: [],
			h1: [],
			h2: [],
			h3: [],
			h4: [],
			h5: [],
			h6: [],
			b: [],
			strong: [],
			i: [],
			em: [],
			s: [],
			strike: [],
			img: ['src', 'alt', 'title'],
			a: ['href', 'title'],
			sup: [],
			hr: [],
			span: ['class'],
			thead: [],
			tr: [],
			th: [],
			tbody: [],
			td: [],
		},
	}).replaceAll(zeroWidthSpaceHtmlEntity, '')

	const domParser = new DOMParser()
	const dom = domParser.parseFromString(sanitizedHtml, 'text/html')

	dom.body.querySelectorAll('a').forEach(a => {
		try {
			const href = new URL(a.href)
			if (href.hostname === 'i.redd.it' || href.hostname === 'i.imgur.com' || href.hostname === 'preview.redd.it') {
				const fig = document.createElement('figure')
				const img = document.createElement('img')
				const caption = document.createElement('figcaption')
				img.src = a.href
				if (a.textContent !== null) {
					img.alt = a.textContent
				}
				caption.textContent = a.textContent
				fig.appendChild(img)
				fig.appendChild(caption)
				a.replaceWith(fig)
			}
		} catch {
			// ignore
		}
	})

	dom.body.querySelectorAll('span[class]').forEach(span => {
		try {
			if(span.className !== 'spoiler') {
				span.className = ''
			}
		} catch {
			// ignore
		}
	})

	return dom.body.innerHTML
}