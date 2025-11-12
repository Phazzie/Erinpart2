<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';

	interface SelectOption {
		value: string;
		label: string;
	}

	interface Props {
		options: SelectOption[];
		value?: string;
		onChange?: (value: string) => void;
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		options,
		value = $bindable(''),
		onChange,
		placeholder = 'Select an option',
		disabled = false
	}: Props = $props();

	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open }
	} = createSelect({
		disabled,
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange: ({ next }) => {
			if (next) {
				value = next.value as string;
				if (onChange) {
					onChange(next.value as string);
				}
			}
			return next;
		}
	});
</script>

<div class="relative">
	<button
		use:melt={$trigger}
		class="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		aria-label="Select option"
	>
		<span class={$selectedLabel ? 'text-white' : 'text-gray-300/50'}>
			{$selectedLabel || placeholder}
		</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="transition-transform {$open ? 'rotate-180' : ''}"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if $open}
		<div
			use:melt={$menu}
			class="absolute z-10 w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
		>
			{#each options as item (item.value)}
				<div
					use:melt={$option({ value: item.value, label: item.label })}
					class="px-3 py-2 cursor-pointer hover:bg-gray-700 text-gray-300 transition-colors first:rounded-t-lg last:rounded-b-lg {value ===
					item.value
						? 'bg-purple-600/20 text-purple-600'
						: ''}"
				>
					{item.label}
				</div>
			{/each}
		</div>
	{/if}
</div>
