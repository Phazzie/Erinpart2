<script lang="ts">
	import { createCheckbox, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';

	interface Props {
		checked?: boolean;
		onChange?: (checked: boolean) => void;
		label: string;
		disabled?: boolean;
		id?: string;
	}

	let {
		checked = $bindable(false),
		onChange,
		label,
		disabled = false,
		id = `checkbox-${Math.random().toString(36).substr(2, 9)}`
	}: Props = $props();

	const checkedStore = writable(checked);

	const {
		elements: { root, input },
		states: { checked: isChecked }
	} = createCheckbox({
		disabled,
		checked: checkedStore,
		onCheckedChange: ({ next }) => {
			const value = next === true;
			checked = value;
			if (onChange) {
				onChange(value);
			}
			return next;
		}
	});

	$effect(() => {
		isChecked.set(checked);
		checkedStore.set(checked);
	});
</script>

<div class="flex items-center gap-2">
	<button
		use:melt={$root}
		class="w-5 h-5 rounded border-2 border-gray-700 bg-dark-secondary flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-dark-primary disabled:opacity-50 disabled:cursor-not-allowed {$isChecked
			? 'bg-purple-600 border-purple-600'
			: ''}"
		{id}
	>
		<input use:melt={$input} />
		{#if $isChecked}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-white"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		{/if}
	</button>
	<label for={id} class="text-sm text-gray-300 cursor-pointer select-none">
		{label}
	</label>
</div>
