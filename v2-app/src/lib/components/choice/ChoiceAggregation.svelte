<script lang="ts">
	import { Badge } from '$lib/components/common';
	import type { ChoiceAggregation } from '$lib/contracts/choice.contracts';

	interface Props {
		choices: ChoiceAggregation;
	}

	let { choices }: Props = $props();

	const total = $derived(choices.yes + choices.no + choices.maybe);
	const yesPercent = $derived(total > 0 ? Math.round((choices.yes / total) * 100) : 0);
	const noPercent = $derived(total > 0 ? Math.round((choices.no / total) * 100) : 0);
	const maybePercent = $derived(total > 0 ? Math.round((choices.maybe / total) * 100) : 0);
</script>

<div class="flex flex-col gap-4">
	<!-- Yes -->
	<div class="flex items-center gap-3">
		<span class="text-sm font-medium text-gray-300 w-14">Yes</span>
		<div class="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
			<div
				class="h-full bg-green-600 transition-all duration-300"
				style="width: {yesPercent}%"
			></div>
		</div>
		<div class="w-12 text-right">
			<Badge text={String(choices.yes)} variant="success" />
		</div>
	</div>

	<!-- Maybe -->
	<div class="flex items-center gap-3">
		<span class="text-sm font-medium text-gray-300 w-14">Maybe</span>
		<div class="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
			<div
				class="h-full bg-yellow-600 transition-all duration-300"
				style="width: {maybePercent}%"
			></div>
		</div>
		<div class="w-12 text-right">
			<Badge text={String(choices.maybe)} variant="warning" />
		</div>
	</div>

	<!-- No -->
	<div class="flex items-center gap-3">
		<span class="text-sm font-medium text-gray-300 w-14">No</span>
		<div class="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
			<div class="h-full bg-red-600 transition-all duration-300" style="width: {noPercent}%"></div>
		</div>
		<div class="w-12 text-right">
			<Badge text={String(choices.no)} variant="error" />
		</div>
	</div>

	<!-- Total -->
	<div class="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
		<span>Total votes</span>
		<span class="font-semibold text-gray-400">{total}</span>
	</div>
</div>
