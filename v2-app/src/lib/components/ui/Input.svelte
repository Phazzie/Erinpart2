<script lang="ts">
	interface Props {
		type?: 'text' | 'email' | 'password';
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		label?: string;
		id?: string;
		name?: string;
		onInput?: (value: string) => void;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		error = '',
		label = '',
		id = `input-${Math.random().toString(36).substr(2, 9)}`,
		name = '',
		onInput
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		if (onInput) {
			onInput(target.value);
		}
	}
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<label for={id} class="text-sm font-medium text-gray-300">
			{label}
		</label>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{disabled}
		{value}
		oninput={handleInput}
		class="px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={error ? `${id}-error` : undefined}
	/>
	{#if error}
		<span id="{id}-error" class="text-sm text-red-500" role="alert">
			{error}
		</span>
	{/if}
</div>
