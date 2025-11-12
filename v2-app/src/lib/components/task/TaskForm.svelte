<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores/user.store';
	import { CreateTaskRequestSchema, type Day } from '$lib/contracts/task.contracts';
	import { Input, Button, Checkbox } from '$lib/components/ui';
	import { Loading, Error as ErrorDisplay } from '$lib/components/common';
	import { extractErrorMessage } from '$lib/utils/error-handling';
	import { MAX_TASK_LENGTH, TASK_VOTE_THRESHOLD } from '$lib/utils/constants';

	interface Props {
		sessionId: string;
		day: Day;
		onSuccess?: () => void;
	}

	let { sessionId, day, onSuccess }: Props = $props();

	const taskRepo = getRepository('task');
	let text = $state('');
	let isSecret = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const charCount = $derived(text.length);
	const canSubmit = $derived(
		text.trim().length > 0 && charCount <= MAX_TASK_LENGTH && !loading
	);
	const charCountError = $derived(
		charCount > MAX_TASK_LENGTH ? `Task is too long (${charCount}/${MAX_TASK_LENGTH})` : undefined
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!userStore.currentUser) {
			error = 'You must be logged in to create tasks';
			return;
		}

		loading = true;
		error = null;

		const request = {
			sessionId,
			text: text.trim(),
			day,
			isSecret,
			createdBy: userStore.currentUser.id,
			createdByName: userStore.displayName
		};

		const validation = CreateTaskRequestSchema.safeParse(request);
		if (!validation.success) {
			error = validation.error.issues[0].message;
			loading = false;
			return;
		}

		const response = await taskRepo.createTask(request);

		if ('error' in response) {
			error = extractErrorMessage(response.error);
			loading = false;
			return;
		}

		// Success - reset form
		text = '';
		isSecret = false;
		loading = false;
		onSuccess?.();
	}
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<div>
		<Input
			label="New Task"
			bind:value={text}
			placeholder="What needs to be done?"
			disabled={loading}
			error={charCountError}
		/>
		<p class="text-xs text-gray-400 mt-1">{charCount}/{MAX_TASK_LENGTH} characters</p>
	</div>

	<Checkbox
		bind:checked={isSecret}
		label={`Make this task secret (requires ${TASK_VOTE_THRESHOLD}+ votes to reveal)`}
		disabled={loading}
	/>

	{#if error}
		<ErrorDisplay {error} onRetry={() => (error = null)} />
	{/if}

	<Button type="submit" variant="primary" disabled={!canSubmit}>
		{#if loading}
			<div class="flex items-center gap-2">
				<Loading size="sm" />
				<span>Creating...</span>
			</div>
		{:else}
			Create Task
		{/if}
	</Button>
</form>
