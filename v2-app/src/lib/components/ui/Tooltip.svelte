<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		content: string;
		children: Snippet;
		placement?: 'top' | 'right' | 'bottom' | 'left';
	}

	let { content, children, placement = 'top' }: Props = $props();

	const {
		elements: { trigger, content: tooltipContent, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement
		},
		openDelay: 300,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true
	});
</script>

<div class="inline-block">
	<div use:melt={$trigger}>
		{@render children()}
	</div>

	{#if $open}
		<div
			use:melt={$tooltipContent}
			class="z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg max-w-xs"
		>
			<div use:melt={$arrow} class="text-gray-800"></div>
			{content}
		</div>
	{/if}
</div>
