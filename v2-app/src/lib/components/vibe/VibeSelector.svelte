<script lang="ts">
	import { onMount } from 'svelte';
	import { getRepository } from '$lib/config';
	import type { Vibe, VibeConfig } from '$lib/contracts/vibe.contracts';
	import { VibeCard } from './';
	import { Loading, Error as ErrorDisplay } from '$lib/components/common';
	import { Button } from '$lib/components/ui';

	interface Props {
		sessionId: string;
		currentVibeId?: string;
		onVibeSet?: () => void;
	}

	let { sessionId, currentVibeId, onVibeSet }: Props = $props();

	const vibeRepo = getRepository('vibe');
	let vibes = $state<Vibe[]>([]);
	let selectedVibeId = $state(currentVibeId);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let applying = $state(false);

	async function loadVibes() {
		try {
			const response = await vibeRepo.getAvailableVibes();

			if ('vibes' in response) {
				vibes = response.vibes;
				// Default to first vibe if no current vibe provided
				if (!selectedVibeId && vibes.length > 0) {
					selectedVibeId = vibes[0].id;
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load vibes';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadVibes();
	});

	async function handleSetVibe(vibeId: string) {
		const vibe = vibes.find((v) => v.id === vibeId);
		if (!vibe) return;

		selectedVibeId = vibeId;
		applying = true;

		try {
			const vibeConfig: VibeConfig = {
				id: vibe.id,
				colorScheme: vibe.colorScheme
			};

			const response = await vibeRepo.setSessionVibe({
				sessionId,
				vibeConfig
			});

			if ('success' in response && response.success) {
				onVibeSet?.();
			} else if ('error' in response) {
				error = response.error.message;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to apply vibe';
		} finally {
			applying = false;
		}
	}

	async function handleRetry() {
		error = null;
		loading = true;
		await loadVibes();
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-2xl font-bold text-white mb-4">Choose Your Vibe</h2>
		<p class="text-gray-400 text-sm">Select a theme to customize your session's appearance</p>
	</div>

	{#if loading}
		<Loading text="Loading vibes..." />
	{:else if error}
		<ErrorDisplay error={error} onRetry={handleRetry} />
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each vibes as vibe (vibe.id)}
				<VibeCard
					{vibe}
					isSelected={selectedVibeId === vibe.id}
					onSelect={() => handleSetVibe(vibe.id)}
				/>
			{/each}
		</div>

		{#if selectedVibeId}
			<div class="pt-4 border-t border-gray-700">
				<Button variant="primary" disabled={applying} onClick={() => {}} type="button">
					{#if applying}
						<span class="flex items-center gap-2">
							<svg
								class="w-4 h-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Applying vibe...
						</span>
					{:else}
						Apply Selected Vibe
					{/if}
				</Button>
			</div>
		{/if}
	{/if}
</div>
