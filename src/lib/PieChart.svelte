<script lang="ts">
	import * as d3 from 'd3';
	import type { NumberRepresentation, PieData, TransformedPieData } from './types';
	export let data: PieData;
	export let numberType: NumberRepresentation;
	export let avatarWidth: number;
	export let avatarHeight: number;
	let _data: TransformedPieData = [];
	data = data.sort(([n1, v1], [n2, v2]) => v1 - v2);
	data = data.reverse();

	function getPercentage(val: number) {
		let degrees = val * (180 / Math.PI);
		return Math.floor((degrees / 360) * 100);
	}

	for (let i = 0; i < 5; i++) {
		if (i == 4) {
			let value = data.slice(5).reduce((acc, [_, v]) => {
				if (v <= 0) return acc;
				return acc + v;
			}, 0);
			_data[i] = { name: 'other', value };
			continue;
		}

		let [name, value] = data[i];
		_data[i] = { name, value };
	}

	const width = avatarWidth + 50;
	const height = avatarHeight + 50;

	// Create the color scale.
	const colourScale = d3
		.scaleOrdinal()
		.domain(_data.map((d) => d.name))
		.range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), _data.length).reverse());

	// Create the pie layout and arc generator.
	const pie = d3
		.pie()
		.sort(null)
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

	export const arcs = pie(_data);
</script>

<!-- TODO: add percentage / literal value choice -->

<div class="flex flex-row items-center justify-end gap-8">
	<svg
		{width}
		{height}
		viewBox="{-width / 2}, {-height / 2}, {width}, {height}"
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
			{#each arcs as slice}
				<div class="flex flex-row items-center gap-1">
					<div class="w-3 h-3 rounded-full" style:background-color={colourScale(slice.data.name)} />
					<span class="pb-1">{slice.data.name}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
