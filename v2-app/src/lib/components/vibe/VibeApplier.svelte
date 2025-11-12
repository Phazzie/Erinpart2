<script lang="ts">
	import { onMount } from 'svelte';
	import { getRepository } from '$lib/config';
	import type { Vibe } from '$lib/contracts/vibe.contracts';

	interface Props {
		sessionId: string;
	}

	let { sessionId }: Props = $props();

	const vibeRepo = getRepository('vibe');
	let currentVibe = $state<Vibe | null>(null);

	onMount(async () => {
		try {
			const response = await vibeRepo.getAvailableVibes();

			// For now, default to first vibe since getSessionVibe is not in contracts yet
			if ('vibes' in response && response.vibes.length > 0) {
				currentVibe = response.vibes[0];
			}
		} catch (e) {
			console.error('Failed to load vibe for session:', e);
		}
	});

	$effect(() => {
		if (currentVibe) {
			// Apply CSS variables to document root
			const root = document.documentElement;
			root.style.setProperty('--vibe-primary', currentVibe.colorScheme.primary);
			root.style.setProperty('--vibe-secondary', currentVibe.colorScheme.secondary);
			root.style.setProperty('--vibe-accent', currentVibe.colorScheme.accent);
			root.style.setProperty('--vibe-background', currentVibe.colorScheme.background);
		}
	});
</script>

<!-- This component has no visible output, just applies CSS variables -->
