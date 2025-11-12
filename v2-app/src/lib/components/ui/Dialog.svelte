<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { Snippet } from 'svelte';
	import { writable } from 'svelte/store';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		title: string;
		children: Snippet;
	}

	let { open = $bindable(false), onClose, title, children }: Props = $props();

	const openStore = writable(open);

	const {
		elements: { trigger, overlay, content, title: titleEl, description, close, portalled },
		states: { open: dialogOpen }
	} = createDialog({
		forceVisible: true,
		open: openStore,
		onOpenChange: ({ next }) => {
			open = next;
			if (!next && onClose) {
				onClose();
			}
			return next;
		}
	});

	$effect(() => {
		dialogOpen.set(open);
		openStore.set(open);
	});
</script>

{#if $dialogOpen}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		></div>
		<div
			use:melt={$content}
			class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-dark-secondary border border-gray-700 p-6 shadow-xl"
		>
			<div class="flex items-center justify-between mb-4">
				<h2
					use:melt={$titleEl}
					class="text-xl font-semibold text-white"
				>
					{title}
				</h2>
				<button
					use:melt={$close}
					class="rounded-lg p-1 hover:bg-gray-700 transition-colors text-gray-300"
					aria-label="Close dialog"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div use:melt={$description}>
				{@render children()}
			</div>
		</div>
	</div>
{/if}
