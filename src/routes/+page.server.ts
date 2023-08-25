import type { RetrievalType } from '$lib/types';
import type { ToastSettings } from '@skeletonlabs/skeleton';

async function fetchPullPush(retrievalType: RetrievalType, value: string) {
	let returnData = [];

	const response = await fetch(
		`https://api.pullpush.io/reddit/search/${retrievalType}/?${value}`
	);
	if (response.status != 200) {
		return {
			toast: {
				message: 'An error occurred while searching. Please try again later.',
				background: 'variant-filled-error',
				hoverable: true
			}
		};
	}
	const json = await response.json();
	returnData = json.data;

	if (returnData.length === 0) {
		const t: ToastSettings = {
			message: 'No results found for your search. Please try again with different parameters.',
			background: 'variant-filled-error',
			autohide: false
		};
		return { returnData, toast: t };
	}
	return { returnData };
}

async function fetchReddit(author: string) {
	let authorData = [];

	const response = await fetch(
		`https://www.reddit.com/user/${author.toLowerCase()}/about.json?utm_source=reddit&utm_medium=usertext&utm_name=redditdev&utm_content=t3_1p9s0w`
	);
	if (response.status != 200) {
		return {
			toast: {
				message: 'An error occurred while searching. Please try again later.',
				background: 'variant-filled-error',
				hoverable: true
			}
		};
	}
	authorData = await response.json();
	return { authorData };
}

// @ts-expect-error
export async function load({ url }): QueryResponse {
	let response = {};

	let authorName = url.searchParams.get('author');
	let query = url.searchParams.get('q');
	let type = url.searchParams.get('type') || 'submission';

	if (authorName) {
		response = await fetchPullPush(type, url.searchParams.toString());
		let authorResponse = await fetchReddit(authorName);
		if (authorResponse.toast) return response;
		// @ts-expect-error
		response.authorData = authorResponse.authorData;
	} else if (query) {
		response = await fetchPullPush(type, url.searchParams.toString());
	}

	return response;
}
