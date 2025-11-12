<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores';
	import { Button } from '$lib/components/ui';
	import type { ChoiceValue } from '$lib/contracts/choice.contracts';
	import { isSetTaskChoiceSuccess } from '$lib/contracts/choice.contracts';

	interface Props {
		taskId: string;
		sessionId: string;
		currentChoice?: ChoiceValue | null;
		onChoiceSet?: () => void;
	}

	let { taskId, sessionId, currentChoice = null, onChoiceSet }: Props = $props();

	const choiceRepo = getRepository('choice');
	let loading = $state(false);
	let selectedChoice = $state(currentChoice);

	async function handleSetChoice(choice: ChoiceValue) {
		if (!userStore.currentUser) return;

		// Optimistic update
		const previousChoice = selectedChoice;
		selectedChoice = choice;
		loading = true;

		try {
			const response = await choiceRepo.setTaskChoice({
				taskId,
				userId: userStore.currentUser.id,
				userName: userStore.displayName,
				choice
			});

			if (isSetTaskChoiceSuccess(response)) {
				// Success - keep the optimistic update
				onChoiceSet?.();
			} else {
				// Revert on error
				selectedChoice = previousChoice;
				console.error('Failed to set choice:', response.error?.message);
			}
		} catch (error) {
			// Revert on exception
			selectedChoice = previousChoice;
			console.error('Error setting choice:', error);
		} finally {
			loading = false;
		}
	}

	const choiceOptions: { value: ChoiceValue; label: string; bgColor: string; hoverColor: string }[] = [
		{ value: 'yes', label: 'Yes', bgColor: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
		{ value: 'maybe', label: 'Maybe', bgColor: 'bg-yellow-600', hoverColor: 'hover:bg-yellow-700' },
		{ value: 'no', label: 'No', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700' }
	];
</script>

<div class="flex gap-2">
	{#each choiceOptions as { value, label, bgColor, hoverColor }}
		<button
			onclick={() => handleSetChoice(value)}
			disabled={loading}
			class="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed {selectedChoice ===
			value
				? `${bgColor} ${hoverColor} ring-2 ring-offset-2 ring-offset-gray-900 ring-white shadow-lg`
				: `bg-gray-700 hover:bg-gray-600 ${hoverColor ? '' : 'hover:bg-gray-600'}`}"
		>
			{label}
		</button>
	{/each}
</div>
