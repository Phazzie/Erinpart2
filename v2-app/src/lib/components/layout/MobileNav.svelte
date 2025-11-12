<script lang="ts">
	interface NavItem {
		path: string;
		label: string;
		icon: string;
		ariaLabel: string;
	}

	interface Props {
		currentPath: string;
	}

	let { currentPath }: Props = $props();

	const navItems: NavItem[] = [
		{
			path: '/sessions',
			label: 'Sessions',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			ariaLabel: 'Go to Sessions'
		},
		{
			path: '/tasks',
			label: 'Tasks',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
			ariaLabel: 'Go to Tasks'
		},
		{
			path: '/lists',
			label: 'Lists',
			icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
			ariaLabel: 'Go to Lists'
		},
		{
			path: '/settings',
			label: 'Settings',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
			ariaLabel: 'Go to Settings'
		}
	];

	function isActive(path: string): boolean {
		return currentPath.startsWith(path);
	}
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-40 h-16 bg-gray-900 border-t border-gray-800 md:hidden"
	aria-label="Mobile navigation"
>
	<div class="flex items-center justify-around h-full px-2">
		{#each navItems as item}
			<a
				href={item.path}
				class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors {isActive(
					item.path
				)
					? 'text-purple-500'
					: 'text-gray-400 hover:text-white'}"
				aria-label={item.ariaLabel}
				aria-current={isActive(item.path) ? 'page' : undefined}
			>
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
				</svg>
				<span class="text-xs font-medium">{item.label}</span>
				{#if isActive(item.path)}
					<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
					></div>
				{/if}
			</a>
		{/each}
	</div>
</nav>
