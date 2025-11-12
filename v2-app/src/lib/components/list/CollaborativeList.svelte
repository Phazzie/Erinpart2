<script lang="ts">
	import { getRepository } from '$lib/config';
	import { userStore } from '$lib/stores';
	import { Button, Input, Card } from '$lib/components/ui';
	import { Badge } from '$lib/components/common';
	import ListItem from './ListItem.svelte';
	import type { CollaborativeList as CollaborativeListType, ListItem as ListItemType } from '$lib/contracts/list.contracts';

	interface Props {
		list: CollaborativeListType;
		items: ListItemType[];
		onItemsUpdate?: () => void;
		onListDelete?: (listId: string) => void;
	}

	let { list, items, onItemsUpdate, onListDelete }: Props = $props();

	const listRepo = getRepository('list');

	let newItemText = $state('');
	let isAddingItem = $state(false);
	let error = $state<string>('');

	const canDelete = $derived(
		userStore.currentUser?.id === list.creatorId || list.canDelete
	);

	const displayPrefix = $derived(list.listType === 'numbered' ? '1.' : '•');

	async function handleAddItem(e: Event) {
		e.preventDefault();

		if (!newItemText.trim()) {
			error = 'Item text cannot be empty';
			return;
		}

		isAddingItem = true;
		error = '';

		const response = await listRepo.addListItem({
			listId: list.id,
			text: newItemText.trim()
		});

		isAddingItem = false;

		if ('error' in response) {
			error = response.error.message;
		} else {
			newItemText = '';
			onItemsUpdate?.();
		}
	}

	async function handleDeleteList() {
		if (!confirm(`Delete "${list.title}" and all its items? This cannot be undone.`)) {
			return;
		}

		const response = await listRepo.deleteList({
			listId: list.id
		});

		if ('success' in response && response.success) {
			onListDelete?.(list.id);
		}
	}

	function handleItemRemoved(itemId: string) {
		onItemsUpdate?.();
	}
</script>

<Card title={list.title}>
	<div class="space-y-4">
		<!-- List Header -->
		<div class="flex items-center justify-between pb-4 border-b border-gray-700">
			<div class="flex items-center gap-3">
				<Badge
					text={list.listType === 'numbered' ? '1, 2, 3...' : 'Bullet'}
					variant="info"
				/>
				<span class="text-xs text-gray-400">
					Created by {list.creatorName} • {list.itemCount} item{list.itemCount !== 1 ? 's' : ''}
				</span>
			</div>

			{#if canDelete}
				<button
					onclick={handleDeleteList}
					class="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
				>
					Delete List
				</button>
			{/if}
		</div>

		<!-- Items List -->
		<div class="space-y-3">
			{#if items.length === 0}
				<div class="p-4 text-center text-gray-400 bg-gray-800/50 rounded">
					<p>No items yet. Add one below to get started.</p>
				</div>
			{:else}
				{#each items as item (item.id)}
					<ListItem
						{item}
						listId={list.id}
						onUpdate={onItemsUpdate}
						onDelete={handleItemRemoved}
					/>
				{/each}
			{/if}
		</div>

		<!-- Add New Item Form -->
		<form onsubmit={handleAddItem} class="pt-4 border-t border-gray-700">
			<div class="space-y-3">
				<div class="flex gap-2">
					<div class="text-gray-400 font-medium pt-2">{displayPrefix}</div>
					<Input
						placeholder="Add new item..."
						bind:value={newItemText}
						disabled={isAddingItem}
					/>
					<Button
						type="submit"
						variant="primary"
						disabled={isAddingItem || !newItemText.trim()}
					>
						{isAddingItem ? 'Adding...' : 'Add'}
					</Button>
				</div>

				{#if error}
					<div class="text-sm text-red-400">
						{error}
					</div>
				{/if}
			</div>
		</form>
	</div>
</Card>
