<script lang="ts">
	// @ts-nocheck
	export let item;
	import Sugar from 'sugar';
	import Markdown from './Markdown.svelte';
	import type { RetrievalType } from './types';
	import { higlight } from './utils';
	import { highlights } from './stores';
	export let retrievalType: RetrievalType;

	function createPermalink() {
		const { subreddit, link_id, id } = item;
		if (retrievalType == 'submission') {
			return `/r/${subreddit}/comments/${link_id.slice(3)}`;
		} else {
			return `/r/${subreddit}/comments/${link_id.slice(3)}/comment/${id}`;
		}
	}
</script>

<div class="rounded-3xl bg-surface-100-800-token max-w-5xl w-full p-4 variant-ghost-surface my-3">
	{#if retrievalType === 'submission'}
		<h1 class="text-xl font-bold mr-2 flex items-center break-all">
			{#if item.thumbnail !== 'self' && item.thumbnail !== 'default' && item.thumbnail !== 'image' && item.thumbnail !== 'spoiler' && item.thumbnail !== 'nsfw'}
				<img
					src={item.thumbnail}
					alt="thumbnail"
					class="rounded-3xl mr-3 w-24"
					on:error={(e) => {
						e.target.src = '/nan.png';
					}}
				/>
			{/if}
			{@html higlight(item.title, $highlights)}
		</h1>
		{#if item.selftext}
			<div class="mt-2 overflow-hidden">
				<Markdown source={item.selftext} />
			</div>
		{/if}
		<div class="mt-3 flex justify-between flex-wrap">
			<a
				href="https://www.reddit.com/user/{item.author}"
				target="_blank"
				rel="noreferrer"
				class="text-xs font-semibold">/u/{item.author}</a
			>
			<p class="text-xs font-semibold">
				{Number.isInteger(item.num_comments) ? Sugar.Number.abbr(item.num_comments) : 'unknown'} comments
			</p>
			<p class="text-xs font-semibold">r/{item.subreddit}</p>
			<p class="text-xs font-semibold">
				{Number.isInteger(item.score) ? Sugar.Number.abbr(item.score) : 'unknown'} points
			</p>
			<p class="text-xs font-semibold">
				{new Date(item.created_utc * 1000).toString().replace(/\((.*?)\)/, '')}
				({Sugar.Date.relative(new Date(item.created_utc * 1000))})
			</p>
			<a
				class="text-xs font-semibold text-error-50"
				target="_blank"
				rel="noreferrer"
				href={`https://reddit.com${item.permalink || createPermalink()}`}>[See on reddit]</a
			>
		</div>
	{:else}
		<h1 class="text-xl font-bold mr-2 flex items-center break-all pb-2">
			{@html higlight(item._topic, $highlights)}
		</h1>
		<Markdown source={item.body} />
		<div class="mt-3 flex justify-between flex-wrap">
			<a
				href="https://www.reddit.com/user/{item.author}"
				target="_blank"
				rel="noreferrer"
				class="text-xs font-semibold">/u/{item.author}</a
			>
			<p class="text-xs font-semibold">r/{item.subreddit}</p>
			<p class="text-xs font-semibold">
				{Number.isInteger(item.score) ? Sugar.Number.abbr(item.score) : 'unknown'} points
			</p>
			<p class="text-xs font-semibold">
				{new Date(item.created_utc * 1000).toString().replace(/\((.*?)\)/, '')}
				({Sugar.Date.relative(new Date(item.created_utc * 1000))})
			</p>
			<a
				class="text-xs font-semibold text-error-50"
				target="_blank"
				rel="noreferrer"
				href={`https://reddit.com${item.permalink || createPermalink()}`}>[See on reddit]</a
			>
		</div>
	{/if}
</div>
