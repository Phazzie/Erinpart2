<script lang="ts">
	import { createRadioGroup, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';

	interface RadioOption {
		value: string;
		label: string;
	}

	interface Props {
		options: RadioOption[];
		value?: string;
		onChange?: (value: string) => void;
		name: string;
		disabled?: boolean;
	}

	let {
		options,
		value = $bindable(''),
		onChange,
		name,
		disabled = false
	}: Props = $props();

	const valueStore = writable(value);

	const {
		elements: { root, item, hiddenInput },
		helpers: { isChecked }
	} = createRadioGroup({
		disabled,
		value: valueStore,
		onValueChange: ({ next }) => {
			value = next;
			if (onChange) {
				onChange(next);
			}
			return next;
		}
	});

	$effect(() => {
		valueStore.set(value);
	});
</script>

<div use:melt={$root} class="flex flex-col gap-2">
	{#each options as option (option.value)}
		<div class="flex items-center gap-2">
			<button
				use:melt={$item(option.value)}
				class="w-5 h-5 rounded-full border-2 border-gray-700 bg-dark-secondary flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-dark-primary disabled:opacity-50 disabled:cursor-not-allowed"
				id="{name}-{option.value}"
			>
				{#if $isChecked(option.value)}
					<div class="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
				{/if}
			</button>
			<label
				for="{name}-{option.value}"
				class="text-sm text-gray-300 cursor-pointer select-none"
			>
				{option.label}
			</label>
		</div>
	{/each}
	<input use:melt={$hiddenInput} {name} />
</div>
