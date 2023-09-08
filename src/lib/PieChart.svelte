<script lang="ts">
	import * as d3 from 'd3';
	import type { NumberRepresentation, PieData, TransformedPieData } from './types';
	export let data: PieData;
	export let numberType: NumberRepresentation;
	let _data: TransformedPieData = [];
	data = data.sort(([n1, v1], [n2, v2]) => v2 - v1);

	function getPercentage(val: number) {
		let degrees = val * (180 / Math.PI);
		return Math.floor((degrees / 360) * 100);
	}

	const sliceCount = data.length < 9 ? data.length : 9;

	for (let i = 0; i < sliceCount; i++) {
		if (i == 4) {
			let value = data.slice(9).reduce((acc, [_, v]) => {
				if (v <= 0) return acc;
				return acc + v;
			}, 0);
			_data[i] = { name: 'other', value };
			continue;
		}

		let [name, value] = data[i];
		_data[i] = { name, value };
	}

	const width = 224;
	const height = 224;

	// Create the color scale.
	const colourScale = d3
		.scaleOrdinal()
		.domain(_data.map((d) => d.name))
		.range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), _data.length).reverse());

	// Create the pie layout and arc generator.
	const pie = d3
		.pie()
		.sort((a, b) => b.value - a.value)
		.value((d) => d.value);

	const arcPath = d3
		.arc()
		// control the style of the pie slices;
		// try changing the inner radius to 100 to see what happens
		.innerRadius(0)
		.outerRadius(Math.min(width, height) / 2 - 1);

	const labelRadius = arcPath.outerRadius()() * 0.8;

	// A separate arc generator for labels.
	const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

	const arcs = pie(_data);
</script>

<svg
	class="w-64 lg:w-56 md:w-48 sm:w-40"
	viewBox="-112 -112 224 224"
	style:max-width="100%"
	style:height="auto"
>
	<g class="data">
		{#each arcs as slice}
			<path d={arcPath(slice)} fill={colourScale(slice.data.name)} stroke="white" />

			{#if slice.endAngle - slice.startAngle > 0.25}
				<text
					class="text-2xl font-bold"
					text-anchor="middle"
					transform="translate({[arcLabel.centroid(slice)[0], arcLabel.centroid(slice)[1] + 10]})"
				>
					{numberType == 'percentage'
						? getPercentage(Math.abs(slice.startAngle - slice.endAngle)) + '%'
						: slice.data.value}
				</text>
			{/if}
		{/each}
	</g>
</svg>
<div class="flex flex-col gap-4">
	<slot><!-- optional fallback --></slot>
	<div class="flex flex-col justify-center gap-1">
		{#each arcs.sort((a, b) => b.value - a.value) as slice}
			<div class="flex flex-row items-center gap-1">
				<div class="w-3 h-3 rounded-full" style:background-color={colourScale(slice.data.name)} />
				<p class="pb-1">
					{slice.data.name}
					<span class="font-bold"
						>{numberType == 'percentage'
							? getPercentage(Math.abs(slice.startAngle - slice.endAngle)) + '%'
							: slice.data.value}</span
					>
				</p>
			</div>
		{/each}
	</div>
</div>
