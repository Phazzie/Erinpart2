<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores';
	import { Button, Input, Card, RadioGroup } from '$lib/components/ui';
	import type { ListType } from '$lib/contracts/list.contracts';

	interface Props {
		sessionId: string;
		onSuccess?: () => void;
		onError?: (error: string) => void;
	}

	let { sessionId, onSuccess, onError }: Props = $props();

	const listRepo = getRepository('list');

	let title = $state('');
	let listType = $state<ListType>('bullet');
	let isSubmitting = $state(false);
	let error = $state<string>('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!title.trim()) {
			error = 'List title is required';
			return;
		}

		if (!userStore.currentUser) {
			error = 'You must be logged in to create a list';
			return;
		}

		isSubmitting = true;
		error = '';

		const response = await listRepo.createList({
			sessionId,
			title: title.trim(),
			listType,
			creatorId: userStore.currentUser.id,
			creatorName: userStore.displayName
		});

		isSubmitting = false;

		if ('error' in response) {
			error = response.error.message;
			onError?.(response.error.message);
		} else {
			title = '';
			listType = 'bullet';
			onSuccess?.();
		}
	}
</script>

<Card title="Create New List">
	<form onsubmit={handleSubmit} class="space-y-4">
		<!-- Title Input -->
		<div>
			<Input
				label="List Title"
				placeholder="e.g., Packing list, Grocery items, Meeting notes..."
				bind:value={title}
				disabled={isSubmitting}
				error={error && error.includes('title') ? error : ''}
			/>
		</div>

		<!-- List Type Selection -->
		<div>
			<fieldset>
				<legend class="block text-sm font-medium text-gray-300 mb-2">
					List Type
				</legend>
				<div class="flex gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="listType"
							value="bullet"
							bind:group={listType}
							disabled={isSubmitting}
							class="w-4 h-4"
						/>
						<span class="text-sm text-gray-300">Bullet Points (•)</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="listType"
							value="numbered"
							bind:group={listType}
							disabled={isSubmitting}
							class="w-4 h-4"
						/>
						<span class="text-sm text-gray-300">Numbered (1, 2, 3...)</span>
					</label>
				</div>
			</fieldset>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
				{error}
			</div>
		{/if}

		<!-- Submit Button -->
		<Button
			type="submit"
			variant="primary"
			disabled={isSubmitting || !title.trim()}
		>
			{isSubmitting ? 'Creating...' : 'Create List'}
		</Button>
	</form>
</Card>
