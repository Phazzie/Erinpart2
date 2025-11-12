<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
		actions?: Snippet;
	}

	let { title, children, actions }: Props = $props();
</script>

<div class="bg-dark-secondary border border-gray-700 rounded-lg overflow-hidden">
	{#if title}
		<div class="px-6 py-4 border-b border-gray-700">
			<h3 class="text-lg font-semibold text-white">{title}</h3>
		</div>
	{/if}

	<div class="px-6 py-4">
		{@render children()}
	</div>

	{#if actions}
		<div class="px-6 py-4 border-t border-gray-700 bg-dark-primary/50">
			{@render actions()}
		</div>
	{/if}
</div>
