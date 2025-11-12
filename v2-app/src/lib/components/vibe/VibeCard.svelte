<script lang="ts">
	import { Badge } from '$lib/components/common';
	import type { Vibe } from '$lib/contracts/vibe.contracts';

	interface Props {
		vibe: Vibe;
		isSelected?: boolean;
		onSelect?: () => void;
	}

	let { vibe, isSelected = false, onSelect }: Props = $props();
</script>

<button
	onclick={onSelect}
	class="w-full text-left p-4 rounded-lg border-2 transition-all {isSelected
		? 'border-purple-600 bg-purple-900/20'
		: 'border-gray-700 bg-gray-800 hover:border-purple-600'}"
>
	<div class="flex items-start justify-between mb-2">
		<h3 class="text-lg font-semibold text-white">{vibe.name}</h3>
		{#if isSelected}
			<Badge text="Active" variant="success" />
		{/if}
	</div>

	<p class="text-sm text-gray-400 mb-3">{vibe.description}</p>

	<!-- Color Swatches -->
	<div class="flex gap-1">
		<div
			class="w-8 h-8 rounded"
			style="background-color: {vibe.colorScheme.primary}"
			title="Primary"
		></div>
		<div
			class="w-8 h-8 rounded"
			style="background-color: {vibe.colorScheme.secondary}"
			title="Secondary"
		></div>
		<div
			class="w-8 h-8 rounded"
			style="background-color: {vibe.colorScheme.accent}"
			title="Accent"
		></div>
		<div
			class="w-8 h-8 rounded"
			style="background-color: {vibe.colorScheme.background}"
			title="Background"
		></div>
	</div>
</button>
