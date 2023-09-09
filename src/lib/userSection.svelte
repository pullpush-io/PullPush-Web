<script lang="ts">
	// @ts-nocheck
	export let author;
	export let pieData;
	import Sugar from 'sugar';
	import PieChart from './PieChart.svelte';
	import type { NumberRepresentation } from './types';
	import { page } from '$app/stores';

	const authorName = author?.data?.name || $page.url.searchParams.get('author');
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
			<a href={`https://reddit.com/user/${authorName}`} target="_blank" rel="noreferrer">
				<div class="flex flex-col justify-center">
					{#if author?.data?.snoovatar_img || author?.data?.icon_img}
						{@const icon_img = author.data.icon_img}
						{@const questionMarkIndex = icon_img.includes('?')
							? icon_img.indexOf('?')
							: icon_img.length}
						<img
							src={author?.data?.snoovatar_img || icon_img.slice(0, questionMarkIndex)}
							alt="avatar"
							class="rounded-3xl w-64 sm:w-32 lg:w-52 md:w-44"
							on:error={(e) => {
								e.target.src = '/nan.png';
							}}
						/>
					{:else}
						<svg
							class="w-64 sm:w-32 lg:w-52 md:w-44"
							xmlns:dc="http://purl.org/dc/elements/1.1/"
							xmlns:cc="http://creativecommons.org/ns#"
							xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
							xmlns:svg="http://www.w3.org/2000/svg"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
							xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
							width="120mm"
							height="120.00001mm"
							viewBox="0 0 120 120.00001"
							version="1.1"
							id="svg8"
						>
							<g id="layer1" transform="translate(-43.204007,-85.320039)">
								<g id="g4574" transform="translate(126.12414,-0.65106087)">
									<path
										d="m 37.047129,145.97115 a 59.967239,59.967209 0 0 1 -59.715003,59.96667 59.967239,59.967209 0 0 1 -60.217354,-59.46221 59.967239,59.967209 0 0 1 59.208425,-60.466899 59.967239,59.967209 0 0 1 60.715444,58.953529"
										id="path4498"
										style="opacity:0.98999999;fill:#999999;fill-opacity:0.77064221;stroke:#000000;stroke-width:0.06547602;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
									/>
									<path
										id="path4500"
										transform="scale(0.26458333)"
										d="m -87.9375,395.13477 a 103.80704,103.80699 0 0 0 -102.49219,104.67187 103.80704,103.80699 0 0 0 41.75391,82.23828 141.61518,141.6151 0 0 0 -79.5625,128.29688 141.61518,141.6151 0 0 0 1.6582,19.33789 226.64785,226.64772 0 0 0 11.15235,8.40234 132.17416,132.17408 0 0 1 -3.36915,-27.82031 132.17416,132.17408 0 0 1 79.32032,-122.10352 103.80704,103.80699 0 0 0 53.285154,14.58008 103.80704,103.80699 0 0 0 52.429687,-14.5957 132.17416,132.17408 0 0 1 79.289063,118.78515 l 0.01953,2.22266 a 132.17416,132.17408 0 0 1 -3.242187,28.64063 226.64785,226.64772 0 0 0 11.042968,-7.89649 141.61518,141.6151 0 0 0 1.640625,-20.74414 l -0.01953,-2.38281 a 141.61518,141.6151 0 0 0 -79.412109,-124.84375 103.80704,103.80699 0 0 1 -0.259766,0.17578 103.80704,103.80699 0 0 0 41.882813,-83.16602 l -0.01367,-1.74804 A 103.80704,103.80699 0 0 0 -87.9375,395.13477 Z m 0.119141,9.43554 A 94.370033,94.36999 0 0 1 7.7285156,497.3457 l 0.013672,1.58789 a 94.370033,94.36999 0 0 1 -93.9726566,94.36914 94.370033,94.36999 0 0 1 -94.763671,-93.57617 94.370033,94.36999 0 0 1 93.175781,-95.15625 z"
										style="opacity:0.98999999;fill:#e6e6e6;fill-opacity:1;stroke:#000000;stroke-width:0.25984651;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"
									/>
								</g>
							</g>
						</svg>
					{/if}
					<h1 class="text-2xl text-center">/u/{authorName}</h1>
				</div>
			</a>
			{#key [currentPie, numberType]}
				<PieChart data={pieData[currentPie]} {numberType}>
					{#if pieData[currentPie].length > 0}
						<select class="select rounded-3xl" bind:value={currentPie}>
							{#each Object.keys(pieData) as value}
								<option {value}>{pieNames[value]}</option>
							{/each}
						</select>
						<select class="select rounded-3xl" bind:value={numberType}>
							<option value="percentage">Percentage</option>
							<option value="literal">Literal</option>
						</select>
					{:else}
						<div>No visualizations available.</div>
					{/if}
				</PieChart>
			{/key}
		</div>
		<div class="flex justify-between w-full sm:px-8 px-0">
			<p class="text-xs font-semibold">
				{author?.data?.total_karma ? Sugar.Number.abbr(author.data.total_karma) : 'unknown'} total karma
			</p>
			<p class="text-xs font-semibold">
				{author?.data?.link_karma ? Sugar.Number.abbr(author.data.link_karma) : 'unknown'} link karma
			</p>
			<p class="text-xs font-semibold">
				{author?.data?.comment_karma ? Sugar.Number.abbr(author.data.comment_karma) : 'unknown'} comment
				karma
			</p>
			<p class="text-xs font-semibold">
				Created {author?.data?.created_utc
					? new Date(author?.data?.created_utc * 1000).toString().replace(/\((.*?)\)/, '') +
					  '(' +
					  Sugar.Date.relative(new Date(author.data.created_utc * 1000)) +
					  ')'
					: 'unknown'}
			</p>
		</div>
	</div>
</div>
