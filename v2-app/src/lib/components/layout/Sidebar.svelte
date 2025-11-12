<script lang="ts">
	interface NavItem {
		path: string;
		label: string;
		icon: string;
		ariaLabel: string;
	}

	interface Props {
		currentPath: string;
		isCollapsed: boolean;
		onToggle?: () => void;
	}

	let { currentPath, isCollapsed, onToggle }: Props = $props();

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

<aside
	class="hidden md:flex flex-col fixed left-0 top-16 bottom-0 bg-gray-900 border-r border-gray-800 transition-all duration-300 z-30 {isCollapsed
		? 'w-16'
		: 'w-60'}"
	aria-label="Main navigation"
>
	<!-- Logo -->
	<div class="flex items-center {isCollapsed ? 'justify-center' : 'justify-between'} h-16 px-4">
		{#if !isCollapsed}
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-xl">E</span>
				</div>
				<span class="text-white font-semibold">Erin's Escapades</span>
			</div>
		{:else}
			<div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
				<span class="text-white font-bold text-xl">E</span>
			</div>
		{/if}
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 px-3 py-4 space-y-1" aria-label="Sidebar navigation">
		{#each navItems as item}
			<a
				href={item.path}
				class="flex items-center gap-3 px-3 py-3 rounded-lg transition-all {isActive(item.path)
					? 'bg-purple-600 text-white'
					: 'text-gray-400 hover:bg-gray-800 hover:text-white'} {isCollapsed
					? 'justify-center'
					: ''}"
				aria-label={item.ariaLabel}
				aria-current={isActive(item.path) ? 'page' : undefined}
				title={isCollapsed ? item.label : ''}
			>
				<svg
					class="w-5 h-5 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
				</svg>
				{#if !isCollapsed}
					<span class="font-medium">{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Toggle Button -->
	<div class="p-3 border-t border-gray-800">
		<button
			onclick={onToggle}
			class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors {isCollapsed
				? 'justify-center'
				: ''}"
			aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			aria-expanded={!isCollapsed}
		>
			<svg
				class="w-5 h-5 flex-shrink-0 transition-transform {isCollapsed ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
				/>
			</svg>
			{#if !isCollapsed}
				<span class="font-medium">Collapse</span>
			{/if}
		</button>
	</div>
</aside>

<!-- Spacer div to prevent content overlap -->
<div
	class="hidden md:block {isCollapsed ? 'w-16' : 'w-60'} flex-shrink-0 transition-all duration-300"
	aria-hidden="true"
></div>
