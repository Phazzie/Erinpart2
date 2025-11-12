<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores';
	import type { ListItem } from '$lib/contracts/list.contracts';
	import VerificationButtons from './VerificationButtons.svelte';
	import ConsensusMeter from './ConsensusMeter.svelte';
	import { Badge } from '$lib/components/common';

	interface Props {
		item: ListItem;
		listId: string;
		onUpdate?: () => void;
		onDelete?: (itemId: string) => void;
	}

	let { item, listId, onUpdate, onDelete }: Props = $props();

	const listRepo = getRepository('list');
	let editing = $state(false);
	let editText = $state(item.text);
	let showCorrectionsList = $state(false);
	let editInput: HTMLInputElement;

	const bgColor = $derived(
		item.verificationStatus === 'accurate'
			? 'bg-green-900/20 border-green-700'
			: item.verificationStatus === 'inaccurate'
				? 'bg-red-900/20 border-red-700'
				: 'bg-gray-800 border-gray-700'
	);

	const statusBadgeVariant = $derived(
		item.verificationStatus === 'accurate'
			? 'success'
			: item.verificationStatus === 'inaccurate'
				? 'error'
				: 'neutral'
	) as 'success' | 'error' | 'neutral';

	function startEditing() {
		editing = true;
		setTimeout(() => editInput?.focus(), 0);
	}

	async function handleEdit() {
		if (editText.trim() === item.text) {
			editing = false;
			return;
		}

		const response = await listRepo.updateListItem({
			itemId: item.id,
			text: editText.trim()
		});

		if ('item' in response) {
			editing = false;
			onUpdate?.();
		}
	}

	async function handleVerify(isAccurate: boolean, correctionText?: string) {
		if (!userStore.currentUser) return;

		const response = await listRepo.verifyListItem({
			itemId: item.id,
			userId: userStore.currentUser.id,
			userName: userStore.displayName,
			isAccurate,
			correctionText
		});

		if ('verification' in response) {
			onUpdate?.();
		}
	}

	async function handleDelete() {
		if (!confirm('Delete this item?')) return;

		const response = await listRepo.deleteListItem({
			itemId: item.id
		});

		if ('success' in response && response.success) {
			onDelete?.(item.id);
		}
	}
</script>

<div class="p-4 rounded-lg border-2 transition-colors {bgColor}">
	<div class="flex items-start justify-between gap-3">
		<!-- Content -->
		<div class="flex-1">
			<div class="flex items-center gap-2 mb-2">
				{#if editing}
					<input
						type="text"
						bind:this={editInput}
						bind:value={editText}
						onblur={handleEdit}
						onkeydown={(e) => e.key === 'Enter' && handleEdit()}
						class="flex-1 px-3 py-1 bg-gray-900 border border-purple-600 rounded text-white text-sm"
					/>
				{:else}
					<button
						type="button"
						onclick={startEditing}
						class="text-white flex-1 text-left cursor-pointer hover:opacity-80 transition-opacity py-1"
						title="Double-click to edit"
					>
						{item.text}
					</button>
				{/if}

				{#if item.verificationStatus !== 'neutral'}
					<Badge text={item.verificationStatus} variant={statusBadgeVariant} />
				{/if}
			</div>

			<!-- Consensus Meter -->
			{#if item.verificationCount.total > 0}
				<div class="mt-3 mb-3">
					<ConsensusMeter
						accurateCount={item.verificationCount.accurate}
						inaccurateCount={item.verificationCount.inaccurate}
						totalCount={item.verificationCount.total}
					/>
				</div>
			{/if}

			<!-- Corrections List -->
			{#if item.corrections.length > 0}
				<div class="mt-3">
					<button
						onclick={() => (showCorrectionsList = !showCorrectionsList)}
						class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
					>
						{showCorrectionsList ? '▼' : '▶'} {item.corrections.length} correction
						{item.corrections.length === 1 ? 'suggestion' : 'suggestions'}
					</button>

					{#if showCorrectionsList}
						<div class="mt-2 pl-3 border-l-2 border-gray-600 space-y-2">
							{#each item.corrections as correction (correction.userId)}
								<div class="bg-gray-900/50 p-2 rounded text-xs">
									<p class="text-gray-300 font-medium">{correction.userName}:</p>
									<p class="text-gray-400 italic">{correction.correctionText}</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-2">
			<VerificationButtons onVerify={handleVerify} />
			<button
				onclick={handleDelete}
				class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
			>
				Delete
			</button>
		</div>
	</div>
</div>
