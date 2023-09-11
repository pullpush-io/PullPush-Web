export function higlight(source: string, highlights: Array<string>) {
	if (highlights.length == 0) return source;

	for (let word of highlights) {
		const regex = new RegExp(` ${word}`, 'gi');
		const matchResult = source.match(regex);
		if (matchResult) {
			source = source.replaceAll(
				regex,
				`<span class="badge variant-filled-warning ml-1 p-1">${matchResult[0]}</span>`
			);
		}
	}

	return source;
}
