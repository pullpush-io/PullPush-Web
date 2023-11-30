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
