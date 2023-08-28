<script lang="ts">
	// @ts-nocheck
	export let author;
	export let pieData;
	import Sugar from 'sugar';
	import PieChart from './PieChart.svelte';
	import type { NumberRepresentation } from './types';

	const pieNames = {
		topicsCount: 'Topics - Count',
		topicsKarma: 'Topics - Karma',
		commentsCount: 'Comments - Count',
		commentsKarma: 'Comments - Karma'
	};

	let currentPie = 'topicsCount';
	let numberType: NumberRepresentation = 'literal';

	let arcs,
		contentRect,
		avatarWidth = 0,
		avatarHeight = 0;

	$: {
		avatarWidth = contentRect?.width;
		avatarHeight = contentRect?.height;
	}
</script>

<div class="max-w-5xl w-full">
	<div
		class="flex flex-col items-center bg-surface-100-800-token rounded-3xl max-w-5xl w-full p-4 variant-ghost-surface my-3"
	>
		<div class="flex flex-row items-center justify-center p-8">
			<a
				class="w-1/4"
				href={`https://reddit.com/user/${author.data.name}`}
				target="_blank"
				rel="noreferrer"
			>
				<div class="flex flex-col justify-center">
					<img
						src={author.data.snoovatar_img}
						alt="avatar"
						class="rounded-3xl"
						on:error={(e) => {
							e.target.src = '/nan.png';
						}}
						bind:contentRect
					/>
					<h1 class="text-2xl text-center">/u/{author.data.name}</h1>
				</div>
			</a>
			<div class="w-3/4">
				{#key (currentPie, numberType, contentRect)}
					<PieChart bind:arcs data={pieData[currentPie]} {numberType} {avatarWidth} {avatarHeight}>
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
		</div>
		<div class="flex justify-between w-full px-8">
			<p class="text-xs font-semibold">
				{Sugar.Number.abbr(author.data.total_karma)} total karma
			</p>
			<p class="text-xs font-semibold">{Sugar.Number.abbr(author.data.link_karma)} link karma</p>
			<p class="text-xs font-semibold">
				{Sugar.Number.abbr(author.data.comment_karma)} comment karma
			</p>
			<p class="text-xs font-semibold">
				Created {Sugar.Date.relative(new Date(author.data.created_utc * 1000))}
			</p>
		</div>
	</div>
</div>
