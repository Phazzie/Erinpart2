<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { getRepository } from '$lib/config';
	import { extractErrorMessage } from '$lib/utils/error-handling';
	import type { Task, Day } from '$lib/contracts/task.contracts';
	import { Error as ErrorDisplay } from '$lib/components/common';

	interface Props {
		tasks: Task[];
		sessionId: string;
		day: Day;
		onUpdate?: () => void;
	}

	let { tasks, sessionId, day, onUpdate }: Props = $props();

	const taskRepo = getRepository('task');
	let items = $state<Task[]>([...tasks]);
	let error = $state<string | null>(null);
	let isDragging = $state(false);

	// Sync items with tasks prop when not dragging
	$effect(() => {
		if (!isDragging) {
			items = [...tasks];
		}
	});

	function handleSort(e: CustomEvent) {
		items = e.detail.items;
		isDragging = true;
	}

	async function handleFinalize(e: CustomEvent) {
		items = e.detail.items;
		isDragging = false;

		// Check if order actually changed
		const orderChanged = items.some((item, idx) => {
			const originalIndex = tasks.findIndex((t) => t.id === item.id);
			return originalIndex !== idx;
		});

		if (!orderChanged) {
			return;
		}

		// Store original for rollback
		const originalItems = [...tasks];

		// Build reorder request
		const taskOrdering = items.map((item, idx) => ({
			taskId: item.id,
			newOrderIndex: idx
		}));

		// Persist order
		const response = await taskRepo.reorderTasks({
			sessionId,
			day,
			taskOrdering
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error.message);
			// Rollback on error
			items = [...originalItems];
		} else {
			// Clear error and call onUpdate
			error = null;
			onUpdate?.();
		}
	}

	const dndOptions = $derived({
		items,
		flipDurationMs: 200,
		dropTargetStyle: {},
		dragDisabled: false
	});
</script>

<div class="flex flex-col gap-3">
	{#if error}
		<ErrorDisplay {error} onRetry={() => (error = null)} />
	{/if}

	<div
		use:dndzone={dndOptions}
		onconsider={handleSort}
		onfinalize={handleFinalize}
		class="flex flex-col gap-2"
	>
		{#each items as task (task.id)}
			<div animate:flip={{ duration: 200 }} class="transition-opacity duration-200">
				<div
					class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 cursor-grab active:cursor-grabbing transition-colors duration-200"
				>
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing">
							<svg
								class="w-5 h-5 text-gray-500 hover:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								aria-hidden="true"
							>
								<path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zM10 12a2 2 0 11-4 0 2 2 0 014 0zM10 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-gray-100 text-sm font-medium break-words">{task.text}</p>
							<p class="text-xs text-gray-500 mt-1">
								by {task.createdByName}
								{#if task.isSecret}
									<span class="ml-2 inline-block">🤫</span>
								{/if}
								{#if task.isComplete}
									<span class="ml-2 inline-block line-through">Done</span>
								{/if}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if items.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="text-gray-400 text-sm">No tasks yet</p>
		</div>
	{/if}
</div>

<style>
	/* Smooth drag and drop animation */
	:global([data-index]) {
		transition: background-color 0.2s ease-in-out;
	}
</style>
