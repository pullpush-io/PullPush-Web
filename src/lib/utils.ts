export function higlight(source: string, highlights: Array<string>) {
	if (highlights.length == 0) return source;

	for (let word of highlights) {
		if (source.includes(` ${word}`)) {
			source = source.replaceAll(
				` ${word}`,
				`<span class="badge variant-filled-warning mx-1 p-1">${word}</span>`
			);
		}
	}

	return source;
}
