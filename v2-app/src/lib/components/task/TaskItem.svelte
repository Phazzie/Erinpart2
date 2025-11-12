<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores/user.store';
	import { Button, Checkbox, Dialog } from '$lib/components/ui';
	import { Badge } from '$lib/components/common';
	import { extractErrorMessage } from '$lib/utils/error-handling';
	import { TASK_VOTE_THRESHOLD } from '$lib/utils/constants';
	import type { Task, Day } from '$lib/contracts/task.contracts';
	import SecretTaskOverlay from './SecretTaskOverlay.svelte';

	interface Props {
		task: Task;
		sessionId: string;
		day: Day;
		onUpdate?: () => void;
	}

	let { task, sessionId, day, onUpdate }: Props = $props();

	const taskRepo = getRepository('task');
	let editing = $state(false);
	let editText = $state(task.text);
	let showDeleteConfirm = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const isRevealed = $derived(!task.isSecret || task.votes.length >= TASK_VOTE_THRESHOLD);
	const canEdit = $derived(userStore.currentUser?.id === task.createdBy);

	async function handleToggleComplete() {
		loading = true;
		error = null;
		const response = await taskRepo.updateTask({
			taskId: task.id,
			updates: { isComplete: !task.isComplete }
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error);
		} else {
			onUpdate?.();
		}
		loading = false;
	}

	async function handleEdit() {
		if (editText.trim() === task.text) {
			editing = false;
			return;
		}

		loading = true;
		error = null;
		const response = await taskRepo.updateTask({
			taskId: task.id,
			updates: { text: editText.trim() }
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error);
			editText = task.text; // Rollback
		} else {
			editing = false;
			onUpdate?.();
		}
		loading = false;
	}

	async function handleDelete() {
		loading = true;
		error = null;
		const response = await taskRepo.deleteTask({
			taskId: task.id
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error);
		} else {
			showDeleteConfirm = false;
			onUpdate?.();
		}
		loading = false;
	}

	async function handleVote() {
		if (!userStore.currentUser) return;

		loading = true;
		error = null;
		const response = await taskRepo.voteToReveal({
			taskId: task.id,
			userId: userStore.currentUser.id
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error);
		} else {
			onUpdate?.();
		}
		loading = false;
	}

	// Sync editText when task changes
	$effect(() => {
		editText = task.text;
	});
</script>

<div
	class="relative p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-600 transition-colors"
>
	<div class="flex items-start gap-3">
		<!-- Checkbox -->
		<Checkbox
			checked={task.isComplete}
			onChange={handleToggleComplete}
			label=""
			disabled={loading || !isRevealed}
		/>

		<!-- Content -->
		<div class="flex-1">
			{#if isRevealed}
				{#if editing}
					<input
						type="text"
						bind:value={editText}
						onblur={handleEdit}
						onkeydown={(e) => e.key === 'Enter' && handleEdit()}
						class="w-full px-2 py-1 bg-gray-900 border border-purple-600 rounded text-white"
						autofocus
					/>
				{:else}
					<p
						class="text-white {task.isComplete ? 'line-through text-gray-500' : ''}"
						ondblclick={() => canEdit && (editing = true)}
						role="button"
						tabindex="0"
					>
						{task.text}
					</p>
				{/if}

				<!-- Badges -->
				<div class="flex gap-2 mt-2">
					{#if task.isSecret}
						<Badge text="Secret" variant="warning" />
					{/if}
					{#if task.isComplete}
						<Badge text="Complete" variant="success" />
					{/if}
				</div>
			{:else}
				<!-- Secret Overlay -->
				<SecretTaskOverlay {task} {sessionId} onVote={handleVote} />
			{/if}

			<!-- Error Display -->
			{#if error}
				<p class="text-xs text-red-400 mt-2">{error}</p>
			{/if}
		</div>

		<!-- Actions -->
		{#if canEdit && isRevealed}
			<Button variant="danger" onClick={() => (showDeleteConfirm = true)} disabled={loading}>
				Delete
			</Button>
		{/if}
	</div>

	<!-- Delete Confirmation Dialog -->
	<Dialog bind:open={showDeleteConfirm} onClose={() => (showDeleteConfirm = false)} title="Delete Task?">
		<p class="text-gray-300 mb-4">Are you sure you want to delete this task?</p>
		<div class="flex gap-2 justify-end">
			<Button variant="secondary" onClick={() => (showDeleteConfirm = false)}>Cancel</Button>
			<Button variant="danger" onClick={handleDelete} disabled={loading}>Delete</Button>
		</div>
	</Dialog>
</div>
