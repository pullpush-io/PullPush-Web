<script lang="ts">
	// @ts-nocheck
	export let author;
	export let pieData;
	import Sugar from 'sugar';
	import PieChart from './PieChart.svelte';
	import DefaultAvatar from './DefaultAvatar.svelte';
	import type { NumberRepresentation } from './types';

	const pieNames = {
		topicsCount: 'Topics - Count',
		topicsKarma: 'Topics - Karma',
		commentsCount: 'Comments - Count',
		commentsKarma: 'Comments - Karma'
	};

	let currentPie = 'topicsCount';
	let numberType: NumberRepresentation = 'literal';
</script>

<div class="max-w-5xl w-full">
	<div
		class="flex flex-col items-center bg-surface-100-800-token rounded-3xl max-w-5xl w-full p-4 variant-ghost-surface my-3"
	>
		<div class="flex flex-col sm:flex-row w-full items-center justify-between p-8 md:gap-8 gap-16">
			<a href={`https://reddit.com/user/${author.data.name}`} target="_blank" rel="noreferrer">
				<div class="flex flex-col justify-center">
					<img
						src={author.data.snoovatar_img ||
							'https://i.redd.it/snoovatar/avatars/74cfc2e6-f5ba-4f88-875e-084a455b2c84.png'}
						alt="avatar"
						class="rounded-3xl w-64 sm:w-32 lg:w-52 md:w-44"
						on:error={(e) => {
							e.target.src = '/nan.png';
						}}
					/>
					<h1 class="text-2xl text-center">/u/{author.data.name}</h1>
				</div>
			</a>
			{#key [currentPie, numberType]}
				<PieChart data={pieData[currentPie]} {numberType}>
					<select class="select rounded-3xl" bind:value={currentPie}>
						{#each Object.keys(pieData) as value}
							<option {value}>{pieNames[value]}</option>
						{/each}
					</select>
					<select class="select rounded-3xl" bind:value={numberType}>
						<option value="percentage">Percentage</option>
						<option value="literal">Literal</option>
					</select>
				</PieChart>
			{/key}
		</div>
		<div class="flex justify-between w-full sm:px-8 px-0">
			<p class="text-xs font-semibold">
				{author.data.total_karma ? Sugar.Number.abbr(author.data.total_karma) : 'unknown'} total karma
			</p>
			<p class="text-xs font-semibold">
				{author.data.link_karma ? Sugar.Number.abbr(author.data.link_karma) : 'unknown'} link karma
			</p>
			<p class="text-xs font-semibold">
				{author.data.comment_karma ? Sugar.Number.abbr(author.data.comment_karma) : 'unknown'} comment
				karma
			</p>
			<p class="text-xs font-semibold">
				Created {author.data.created_utc
					? Sugar.Date.relative(new Date(author.data.created_utc * 1000))
					: 'unknown'}
			</p>
		</div>
	</div>
</div>
