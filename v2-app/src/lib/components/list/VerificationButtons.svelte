<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onVerify: (accurate: boolean, correction?: string) => void;
		disabled?: boolean;
	}

	let { onVerify, disabled = false }: Props = $props();

	let showCorrectionInput = $state(false);
	let correctionText = $state('');
	let correctionInput: HTMLInputElement;

	function handleAccurate() {
		onVerify(true);
		resetUI();
	}

	function handleInaccurateClick() {
		showCorrectionInput = true;
		// Focus the input in the next tick
		setTimeout(() => correctionInput?.focus(), 0);
	}

	function handleSubmitCorrection() {
		if (correctionText.trim()) {
			onVerify(false, correctionText.trim());
			resetUI();
		}
	}

	function resetUI() {
		showCorrectionInput = false;
		correctionText = '';
	}

	function handleCancel() {
		resetUI();
	}
</script>

<div class="flex flex-col gap-2">
	{#if !showCorrectionInput}
		<div class="flex gap-2">
			<Button
				variant="secondary"
				disabled={disabled}
				onClick={handleAccurate}
			>
				✓ Accurate
			</Button>
			<Button
				variant="danger"
				disabled={disabled}
				onClick={handleInaccurateClick}
			>
				✗ Inaccurate
			</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			<input
				type="text"
				bind:this={correctionInput}
				bind:value={correctionText}
				placeholder="What should it say instead?"
				class="px-3 py-2 bg-gray-900 border border-red-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
			/>
			<div class="flex gap-2">
				<Button variant="danger" onClick={handleSubmitCorrection} disabled={!correctionText.trim()}>
					Submit Correction
				</Button>
				<Button variant="ghost" onClick={handleCancel}>
					Cancel
				</Button>
			</div>
		</div>
	{/if}
</div>
