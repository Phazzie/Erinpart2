<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/common';
	import type { Task } from '$lib/contracts/task.contracts';
	import { TASK_VOTE_THRESHOLD } from '$lib/utils/constants';

	interface Props {
		task: Task;
		sessionId: string;
		onVote?: () => void;
	}

	let { task, sessionId, onVote }: Props = $props();

	const voteCount = $derived(task.votes.length);
	const votesNeeded = $derived(Math.max(0, TASK_VOTE_THRESHOLD - voteCount));
</script>

<div
	class="flex flex-col items-center justify-center py-8 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700"
>
	<p class="text-4xl mb-2">🤫</p>
	<p class="text-lg font-semibold text-purple-400 mb-2">Secret Task</p>
	<p class="text-sm text-gray-400 mb-4">
		{#if votesNeeded > 0}
			Needs {votesNeeded} more {votesNeeded === 1 ? 'vote' : 'votes'} to reveal
		{:else}
			Revealed! Refresh to see
		{/if}
	</p>

	<div class="flex gap-2 items-center">
		<Badge text="{voteCount} votes" variant="info" />
		<Button variant="secondary" onClick={onVote}>Vote to Reveal</Button>
	</div>
</div>
