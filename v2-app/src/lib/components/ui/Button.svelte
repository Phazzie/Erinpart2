<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		disabled?: boolean;
		onClick?: () => void;
		children: Snippet;
		type?: 'button' | 'submit' | 'reset';
	}

	let { variant = 'primary', disabled = false, onClick, children, type = 'button' }: Props = $props();

	const variantClasses = {
		primary: 'bg-purple-600 hover:bg-purple-700 text-white',
		secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
		ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
		danger: 'bg-red-600 hover:bg-red-700 text-white'
	};

	function handleClick(e: MouseEvent) {
		if (onClick) {
			onClick();
		}
	}
</script>

<button
	{type}
	{disabled}
	onclick={handleClick}
	class="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed {variantClasses[variant]}"
>
	{@render children()}
</button>
