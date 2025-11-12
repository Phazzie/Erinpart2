<script lang="ts">
	import type { Task, Day } from '$lib/contracts/task.contracts';
	import { Loading, Error as ErrorDisplay } from '$lib/components/common';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		tasks: Task[];
		day: Day;
		sessionId: string;
		onTaskUpdate?: () => void;
		loading?: boolean;
		error?: string | null;
	}

	let { tasks, day, sessionId, onTaskUpdate, loading = false, error = null }: Props = $props();

	const isEmpty = $derived(tasks.length === 0);
</script>

<div class="flex flex-col h-full">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loading text="Loading tasks..." />
		</div>
	{:else if error}
		<div class="p-4">
			<ErrorDisplay {error} onRetry={onTaskUpdate} />
		</div>
	{:else if isEmpty}
		<div
			class="flex flex-col items-center justify-center py-12 text-center text-gray-400 border-2 border-dashed border-gray-700 rounded-lg"
		>
			<svg
				class="w-16 h-16 mb-4 text-gray-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			<p class="text-lg font-medium mb-1">No tasks yet</p>
			<p class="text-sm">Add your first task to get started</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2">
			{#each tasks as task (task.id)}
				<TaskItem {task} {sessionId} {day} onUpdate={onTaskUpdate} />
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar styling */
	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #4b5563;
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}
</style>
