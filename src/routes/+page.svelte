<script lang="ts">
	import formVerification from '$lib/formVerification';
	import IntersectionObserver from 'svelte-intersection-observer';
	// import { PUBLIC_API_URL } from '$env/static/public';
	import { ProgressRadial, toastStore } from '@skeletonlabs/skeleton';
	import ResultItem from '$lib/returnItem.svelte';
	import UserSection from '$lib/userSection.svelte';
	import type { Datum, RetrievalType, VizRetrievalType } from '$lib/types';
	import { goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { highlights } from '$lib/stores';

	let itemCountDiv: HTMLDivElement;

	let commentTopics = new Map<string, string>();
	let returnData = [];
	let authorData = [];
	let pieData = {};

	let noParametersWarning = false;
	let requestCompleted = false;
	let highlightEnabled = false;
	let loading = false;
	let paginating = false;
	let paginationCompleted = false;

	// @ts-expect-error
	let type: RetrievalType = $page.url.searchParams.get('type') || 'submission';
	// @ts-expect-error
	let submittedRetrievalType: RetrievalType = $page.url.searchParams.get('type') || 'submission';

	$: {
		const query = $page.url.searchParams.get('q');
		if (query && highlightEnabled) {
			$highlights = query.split(' ').filter((q) => q) || [];
		} else {
			$highlights = [];
		}
	}

	function clearInputFields() {
		const inputs = document.getElementsByTagName('input');
		const selects = document.getElementsByTagName('select');

		for (let input of [...inputs, ...selects]) {
			if (input.name == 'type') {
				input.value = 'submission';
			} else {
				input.value = null;
			}
		}
	}

	function clearResults() {
		goto('/');
		returnData = [];
		authorData = [];
		pieData = {};
		loading = false;
		requestCompleted = false;
		noParametersWarning = false;
		clearInputFields();
	}

	function formatDate(date: number) {
		let d = new Date(date * 1000),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) {
			month = '0' + month;
		}

		if (day.length < 2) {
			day = '0' + day;
		}

		let _date = [year, month, day].join('-');

		return _date;
	}

	function populateForm() {
		let params = new Map([...$page.url.searchParams]);

		if (params.has('score') && ['<', '>'].includes(params.get('score')[0])) {
			params.set('score_comparator', params.get('score')[0]);
			params.set('score', +params.get('score').slice(1));
		} else if (params.has('score')) {
			params.set('score', +params.get('score'));
		}

		if (params.has('num_comments') && ['<', '>'].includes(params.get('num_comments')[0])) {
			params.set('num_comments_comparator', params.get('num_comments')[0]);
			params.set('num_comments', +params.get('num_comments').slice(1));
		} else if (params.has('num_comments')) {
			params.set('num_comments', +params.get('num_comments'));
		}

		const inputs = document.getElementsByTagName('input');
		const selects = document.getElementsByTagName('select');

		for (let input of [...inputs, ...selects]) {
			if (params.has(input.name)) {
				if (['before', 'after'].includes(input.name)) {
					// @ts-expect-error
					input.value = formatDate(+params.get(input.name));
				} else {
					// @ts-expect-error
					input.value = params.get(input.name);
				}
			} else {
				input.value = null;
			}
		}
	}

	async function fetchAll() {
		const url = $page.url;
		if (url.searchParams.size == 0 || loading) {
			return;
		} else if (url.searchParams.size == 1 && url.searchParams.has('type')) {
			noParametersWarning = true;
			return;
		}

		populateForm();
		loading = true;
		requestCompleted = false;

		let authorName = url.searchParams.get('author');
		let type: RetrievalType = (url.searchParams.get('type') as RetrievalType) || 'submission';

		if (authorName) {
			[returnData, authorData, pieData] = await Promise.all([
				fetchPullPush(type, url.searchParams.toString()),
				fetchAuthorData(authorName),
				fetchPieData(authorName)
			]);
		} else {
			returnData = await fetchPullPush(type, url.searchParams.toString());
			authorData = [];
			pieData = [];
		}

		loading = false;
		requestCompleted = true;
	}

	async function getCommentTopics(data: any) {
		let ids = Array.from(new Set(data.map(({ link_id }) => link_id))).join(',');
		const response = await fetch(`https://api.pullpush.io/reddit/submission/search?ids=${ids}`);
		const comments = await response.json();

		for (let { id, title } of comments.data) {
			if (!title) continue;
			commentTopics.set('t3_' + id, title);
		}

		for (let comment of data) {
			comment._topic = commentTopics.get(comment.link_id);
		}

		return data;
	}

	async function fetchPullPush(retrievalType: RetrievalType, value: string) {
		let _returnData = [];

		try {
			const response = await fetch(
				`https://api.pullpush.io/reddit/search/${retrievalType}/?${value}`
			);
			const json = await response.json();
			_returnData = json.data;

			if (retrievalType == 'comment') {
				_returnData = await getCommentTopics(_returnData);
			}

			return _returnData;
		} catch {
			toastStore.trigger({
				message: 'An error occurred while searching. Please try again later.',
				background: 'variant-filled-error',
				hoverable: true
			});
			return [];
		}
	}

	async function paginate() {
		if (paginationCompleted) return;
		paginating = true;
		const url = $page.url;
		let type: RetrievalType = (url.searchParams.get('type') as RetrievalType) || 'submission';
		let query = '';

		for (let [key, val] of url.searchParams) {
			if (['type', 'before'].includes(key)) continue;
			query = query + (query == '' ? '' : '&') + `${key}=${val}`;
		}

		const sortType = url.searchParams.get('sort_type');
		const sort = url.searchParams.get('sort');

		if (sortType == 'created_utc') {
			if (sort == 'desc') {
				query += `&before=${returnData.at(-1).created_utc}`;
			} else if (sort == 'asc') {
				query += `&after=${returnData.at(-1).created_utc}`;
			}
		} else if (sortType == 'score') {
			const score = url.searchParams.get('score');
			const comparator = sort == 'desc' ? '<' : '>';
			const scoreQuery = 'score=' + comparator + returnData.at(-1).score;

			if (query.includes(`score=${score}`)) {
				query = query.replace(`score=${score}`, scoreQuery);
			} else {
				query += '&' + scoreQuery;
			}
		} else if (sortType == 'num_comments') {
			const num_comments = url.searchParams.get('num_comments');
			const comparator = sort == 'desc' ? '<' : '>';
			const commentsQuery = 'num_comments=' + comparator + returnData.at(-1).num_comments;

			if (query.includes(`num_comments=${num_comments}`)) {
				query = query.replace(`num_comments=${num_comments}`, commentsQuery);
			} else {
				query += '&' + commentsQuery;
			}
		}

		try {
			const response = await fetch(`https://api.pullpush.io/reddit/search/${type}/?${query}`);
			const json = await response.json();
			let newData = json.data;

			if (newData.length == 0) {
				paginationCompleted = true;
				paginating = false;
				return;
			}

			if (type == 'comment') {
				newData = await getCommentTopics(newData);
			}

			returnData.push(...newData);
			returnData = returnData; // NECESSARY FOR REACTIVITY
			paginating = false;
		} catch {
			toastStore.trigger({
				message: 'An error occurred while getting data. Please try again later.',
				background: 'variant-filled-error',
				hoverable: true
			});
			paginating = false;
		}
	}

	async function fetchViz(author: string, type: VizRetrievalType, datum: Datum) {
		try {
			const response = await fetch(
				`https://api.pullpush.io/analyze_user?user=${author}&type=${type}&datum=${datum}`
			);
			const data = await response.json();
			return data;
		} catch {
			toastStore.trigger({
				message: 'An error occurred while getting data. Please try again later.',
				background: 'variant-filled-error',
				hoverable: true
			});
			return [];
		}
	}

	async function fetchPieData(author: string) {
		const [topicsCount, topicsKarma, commentsCount, commentsKarma] = await Promise.all([
			fetchViz(author, 'topics', 'count'),
			fetchViz(author, 'topics', 'karma'),
			fetchViz(author, 'comments', 'count'),
			fetchViz(author, 'comments', 'karma')
		]);
		return { topicsCount, topicsKarma, commentsCount, commentsKarma };
	}

	async function fetchAuthorData(author: string) {
		try {
			const response = await fetch(
				`https://www.reddit.com/user/${author.toLowerCase()}/about.json?utm_source=reddit&utm_medium=usertext&utm_name=redditdev&utm_content=t3_1p9s0w`
			);
			authorData = await response.json();
			return authorData;
		} catch {
			return {
				toast: {
					message: 'An error occurred while searching. Please try again later.',
					background: 'variant-filled-error',
					hoverable: true
				}
			};
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		toastStore.clear();
		noParametersWarning = false;
		submittedRetrievalType = type;
		const form = e.target as HTMLFormElement;
		const data = new FormData(form);
		const value = formVerification(data);
		const queryString = new URLSearchParams(value).toString();
		goto(`/?${queryString}`);
	}

	afterNavigate(fetchAll);
</script>

<div class="search flex justify-center my-5 mx-5">
	<div class="bg-surface-100-800-token rounded-3xl max-w-5xl w-full p-4 variant-ghost-surface">
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid grid-cols-1 sm:grid-cols-3">
				<div class="max-w-xs p-3">
					<label class="label">
						<span
							>Username<span class="text-[10px] ml-2 text-green-400">yields analytics</span></span
						>
						<input name="author" class="input rounded-3xl" type="text" placeholder="maxwellhill" />
					</label>
				</div>
				<div class="max-w-xs p-3">
					<label class="label">
						<span>Subreddit</span>
						<input name="subreddit" class="input rounded-3xl" type="text" placeholder="funny" />
					</label>
				</div>
				<div class="max-w-xs p-3">
					<label class="label">
						<span>Search for</span>
						<select required name="type" class="select rounded-3xl" bind:value={type}>
							<option value="submission">Posts</option>
							<option value="comment">Comments</option>
						</select>
					</label>
				</div>
			</div>
			<div class="pb-3 px-3">
				<label class="label w-full">
					<span>Query</span>
					<input name="q" class="input rounded-3xl" type="text" placeholder="Search Term" />
				</label>
			</div>
			<div class="pb-3 px-3">
				<label>
					<input class="checkbox mr-1" type="checkbox" bind:checked={highlightEnabled} />
					Highlight
				</label>
			</div>
			<div class="flex flex-row w-full">
				<div class="pb-3 px-3 w-full">
					<label class="label w-full">
						<span>Sort By</span>
						<select class="select rounded-3xl" name="sort_type">
							<option value="created_utc">Created date</option>
							<option value="score">Score</option>
							{#if type == 'submission'}
								<option value="num_comments">Number of comments</option>
							{/if}
						</select>
					</label>
				</div>
				<div class="pb-3 px-3 w-full">
					<label class="label w-full">
						<span>Sorting Order</span>
						<select class="select rounded-3xl" name="sort">
							<option value="desc">Descending</option>
							<option value="asc">Ascending</option>
						</select>
					</label>
				</div>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2">
				<div class="max-w-lg p-3">
					<label class="label">
						<span>Before Date</span>
						<input type="date" class="input rounded-3xl" name="before" />
					</label>
				</div>
				<div class="max-w-lg p-3">
					<label class="label">
						<span>After Date</span>
						<input type="date" class="input rounded-3xl" name="after" />
					</label>
				</div>
			</div>
			<div class="h-1 w-full variant-ghost-surface rounded-3xl" />
			<div class="grid grid-cols-1 sm:grid-cols-2">
				<div class="max-w-lg p-3">
					<label class="label">
						<span>Score</span>
						<div class="flex">
							<input
								name="score"
								class="input rounded-l-3xl"
								type="number"
								placeholder="0"
								step="50"
							/>
							<select name="score_comparator" class="select rounded-r-3xl">
								<option value=">">Greater Than</option>
								<option value="<">Less Than</option>
							</select>
						</div>
					</label>
				</div>
				<div class="max-w-lg p-3">
					<label class="label">
						<span>IDs</span>
						<input name="ids" class="input rounded-3xl" type="text" placeholder="ju82rny,ju80bov" />
					</label>
				</div>
				<div class="max-w-lg p-3">
					{#if type == 'submission'}
						<label class="label">
							<span>Comments</span>
							<div class="flex">
								<input
									name="num_comments"
									class="input rounded-l-3xl"
									type="number"
									placeholder="0"
									step="50"
								/>
								<select name="num_comments_comparator" class="select rounded-r-3xl">
									<option value=">">Greater Than</option>
									<option value="<">Less Than</option>
								</select>
							</div>
						</label>
					{:else if type == 'comment'}
						<label class="label">
							<span>Submission ID</span>
							<input
								name="link_id"
								class="input rounded-3xl"
								type="text"
								placeholder="r45a5n,bdl3o"
							/>
						</label>
					{/if}
				</div>

				<!-- <div class="p-3 grid grid-cols-1 sm:grid-cols-2">
						<label class="label">
							<input name="over_18" class="checkbox rounded-lg" type="checkbox">
							<span>NSFW</span>
						</label>
						<label class="label">
							<input name="is_video" class="checkbox rounded-lg" type="checkbox">
							<span>Is Video</span>
						</label>
						<label class="label">
							<input name="locked" class="checkbox rounded-lg" type="checkbox">
							<span>Locked</span>
						</label>
						<label class="label">
							<input name="stickied" class="checkbox rounded-lg" type="checkbox">
							<span>Stickied</span>
						</label>
						<label class="label">
							<input name="spoiler" class="checkbox rounded-lg" type="checkbox">
							<span>Spoiler</span>
						</label>
						<label class="label">
							<input name="contest_mode" class="checkbox rounded-lg" type="checkbox">
							<span>Contest Mode</span>
						</label>
					</div> -->
			</div>

			<div>
				{#if loading}
					<button class="btn variant-filled rounded-3xl m-3" type="button" disabled>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"
							><path
								fill="currentColor"
								d="m29 27.586l-7.552-7.552a11.018 11.018 0 1 0-1.414 1.414L27.586 29ZM4 13a9 9 0 1 1 9 9a9.01 9.01 0 0 1-9-9Z"
							/></svg
						>
						<span
							><ProgressRadial
								width="w-[24px]"
								meter="stroke-primary-500"
								track="stroke-primary-500/30"
							/></span
						>
					</button>
				{:else}
					<button class="btn variant-filled rounded-3xl m-3" type="submit">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"
							><path
								fill="currentColor"
								d="m29 27.586l-7.552-7.552a11.018 11.018 0 1 0-1.414 1.414L27.586 29ZM4 13a9 9 0 1 1 9 9a9.01 9.01 0 0 1-9-9Z"
							/></svg
						>
						<span>Search</span>
					</button>
				{/if}
				<button class="btn variant-filled rounded-3xl m-3" type="button" on:click={clearResults}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"
						><path
							fill="currentColor"
							d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z"
						/></svg
					>
					<span>Reset</span>
				</button>
			</div>
		</form>
	</div>
</div>
{#if !loading}
	{#if authorData && Object.keys(authorData).length > 0}
		<div class="user flex justify-center mt-1 mx-5">
			<UserSection author={authorData} {pieData} />
		</div>
	{/if}
	{#if Array.isArray(returnData)}
		<div class="results flex flex-col items-center justify-center my-1 mx-5">
			{#key returnData}
				{#each returnData as item}
					<ResultItem retrievalType={submittedRetrievalType} {item} />
				{/each}
			{/key}
		</div>
	{/if}
	{#if returnData?.length}
		<div
			class:hidden={paginating}
			class="resultscount flex justify-center m-4"
			bind:this={itemCountDiv}
		>
			<p>{returnData.length} Items</p>
		</div>
		{#if paginating}
			<div class="w-full flex items-center justify-center h-24 m-4">
				<ProgressRadial width="w-24" />
			</div>
		{/if}
		<IntersectionObserver element={itemCountDiv} on:intersect={paginate} />
	{:else if requestCompleted}
		<div class="w-full flex justify-center">
			<div
				class="flex justify-center self-center alert card variant-ghost-warning max-w-5xl w-full rounded-3xl"
			>
				No results found for your search.
			</div>
		</div>
	{/if}
{/if}
{#if noParametersWarning}
	<div class="w-full flex justify-center">
		<div
			class="flex justify-center self-center alert card variant-ghost-warning max-w-5xl w-full rounded-3xl"
		>
			Empty search parameters.
		</div>
	</div>
{/if}
