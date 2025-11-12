<script lang="ts">
	interface Props {
		accurateCount: number;
		inaccurateCount: number;
		totalCount: number;
	}

	let { accurateCount, inaccurateCount, totalCount }: Props = $props();

	const accuratePercent = $derived(
		totalCount > 0 ? Math.round((accurateCount / totalCount) * 100) : 0
	);
	const inaccuratePercent = $derived(
		totalCount > 0 ? Math.round((inaccurateCount / totalCount) * 100) : 0
	);
</script>

<div class="flex flex-col gap-1">
	<div class="flex items-center gap-2 text-xs">
		<span class="text-gray-400">Consensus:</span>
		<span class="text-green-400 font-medium">{accurateCount} ✓</span>
		<span class="text-red-400 font-medium">{inaccurateCount} ✗</span>
	</div>

	<div class="h-2 bg-gray-700 rounded-full overflow-hidden flex">
		<div class="bg-green-600 transition-all" style="width: {accuratePercent}%"></div>
		<div class="bg-red-600 transition-all" style="width: {inaccuratePercent}%"></div>
	</div>
</div>
