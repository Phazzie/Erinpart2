<script lang="ts">
	import { Dialog, Button } from '$lib/components/ui';
	import { Badge, Loading, Error as ErrorDisplay } from '$lib/components/common';
	import { sessionStore } from '$lib/stores';
	import { getRepository } from '$lib/config';
	import { extractErrorMessage } from '$lib/utils/error-handling';
	import type { GenerateShareDataSuccessResponse } from '$lib/contracts/session.contracts';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = $bindable(false), onClose }: Props = $props();

	const sessionRepo = getRepository('session');
	let copied = $state(false);
	let shareData = $state<GenerateShareDataSuccessResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const shareUrl = $derived(shareData?.shareUrl ?? '');
	const qrCode = $derived(shareData?.qrCodeDataUrl ?? null);

	// Generate share data when modal opens
	$effect(() => {
		if (open && sessionStore.currentSession && !shareData && !loading) {
			generateShareData();
		}
	});

	async function generateShareData() {
		if (!sessionStore.currentSession) return;

		loading = true;
		error = null;

		const response = await sessionRepo.generateShareData({
			sessionId: sessionStore.currentSession.id,
			includeQR: true
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error.message);
			loading = false;
			return;
		}

		shareData = response;
		loading = false;
	}

	async function handleCopy() {
		if (!shareUrl) return;

		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			error = 'Failed to copy to clipboard';
		}
	}

	function handleRetry() {
		error = null;
		shareData = null;
		generateShareData();
	}

	function handleClose() {
		// Reset state when closing
		shareData = null;
		error = null;
		copied = false;
		if (onClose) {
			onClose();
		}
	}
</script>

<Dialog open={open} onClose={handleClose} title="Share Session">
	<div class="flex flex-col gap-4">
		{#if loading}
			<div class="flex justify-center py-8">
				<Loading text="Generating share data..." />
			</div>
		{:else if error}
			<ErrorDisplay {error} onRetry={handleRetry} />
		{:else if sessionStore.currentSession && shareData}
			<!-- Session Code -->
			<div>
				<p class="text-sm text-gray-400 mb-2">Session Code</p>
				<div class="flex items-center justify-center gap-2 p-4 bg-gray-800 rounded-lg">
					<p class="text-2xl font-mono font-bold text-purple-400">
						{sessionStore.currentSession.code}
					</p>
					<Badge text="Active" variant="success" />
				</div>
			</div>

			<!-- Share URL -->
			<div>
				<p class="text-sm text-gray-400 mb-2">Share URL</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={shareUrl}
						readonly
						class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono"
						onclick={(e) => e.currentTarget.select()}
					/>
					<Button onClick={handleCopy} variant="secondary">
						{copied ? 'Copied!' : 'Copy'}
					</Button>
				</div>
			</div>

			<!-- QR Code -->
			{#if qrCode}
				<div>
					<p class="text-sm text-gray-400 mb-2">QR Code</p>
					<div class="flex justify-center">
						<img
							src={qrCode}
							alt="Session QR Code"
							class="w-48 h-48 bg-white p-2 rounded-lg"
						/>
					</div>
					<p class="text-xs text-gray-400 text-center mt-2">
						Scan this code to join the session instantly
					</p>
				</div>
			{/if}

			<!-- Instructions -->
			<div class="border-t border-gray-700 pt-4">
				<p class="text-sm text-gray-300">
					Share the session code or URL with others to invite them to this collaborative session.
				</p>
			</div>
		{:else}
			<p class="text-sm text-gray-400 text-center py-4">No session data available</p>
		{/if}
	</div>
</Dialog>
