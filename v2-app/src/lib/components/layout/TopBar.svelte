<script lang="ts">
	import type { CurrentUser } from '$lib/contracts/auth.contracts';

	interface Props {
		title: string;
		user: CurrentUser | null;
		onUserMenuClick?: () => void;
	}

	let { title, user, onUserMenuClick }: Props = $props();
	let menuOpen = $state(false);

	// Close menu when clicking outside
	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-user-menu]')) {
			menuOpen = false;
		}
	}

	// Get user display name or initials
	const displayName = $derived(user?.name || user?.animalCode || 'User');
	const initials = $derived(
		user?.name
			? user.name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2)
			: user?.animalCode?.[0]?.toUpperCase() || '?'
	);
</script>

<svelte:window onclick={handleClickOutside} />

<header class="sticky top-0 z-50 w-full h-16 bg-gray-900 border-b border-gray-800">
	<div class="flex items-center justify-between h-full px-4">
		<!-- Left: Logo + Title -->
		<div class="flex items-center gap-3">
			<div
				class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
			>
				<span class="text-white font-bold text-xl">E</span>
			</div>
			<h1 class="text-lg font-semibold text-white truncate">{title}</h1>
		</div>

		<!-- Right: User Menu -->
		{#if user}
			<div class="relative" data-user-menu>
				<button
					onclick={() => (menuOpen = !menuOpen)}
					class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
					aria-label="User menu"
					aria-expanded={menuOpen}
					aria-haspopup="true"
				>
					{#if user.avatarUrl}
						<img
							src={user.avatarUrl}
							alt={displayName}
							class="w-8 h-8 rounded-full object-cover"
						/>
					{:else}
						<div
							class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
						>
							<span class="text-white text-sm font-medium">
								{initials}
							</span>
						</div>
					{/if}
					<span class="text-white text-sm hidden md:block truncate max-w-[150px]"
						>{displayName}</span
					>
					<svg
						class="w-4 h-4 text-gray-400 transition-transform {menuOpen
							? 'rotate-180'
							: ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if menuOpen}
					<div
						class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
						role="menu"
						aria-orientation="vertical"
					>
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-sm text-white font-medium truncate">{displayName}</p>
							{#if user.email}
								<p class="text-xs text-gray-400 truncate">{user.email}</p>
							{/if}
						</div>
						<button
							onclick={() => {
								menuOpen = false;
								onUserMenuClick?.();
							}}
							class="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
							role="menuitem"
						>
							<svg
								class="w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Sign Out
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</header>
