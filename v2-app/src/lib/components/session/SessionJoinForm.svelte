<script lang="ts">
	import { getRepository } from '$lib/config';
	import { sessionStore, userStore } from '$lib/stores';
	import { JoinSessionRequestSchema } from '$lib/contracts/session.contracts';
	import { Input, Button } from '$lib/components/ui';
	import { Loading, Error as ErrorDisplay } from '$lib/components/common';
	import { extractErrorMessage } from '$lib/utils/error-handling';

	const sessionRepo = getRepository('session');
	let sessionCode = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	const canSubmit = $derived(sessionCode.trim().length > 0 && !loading);

	async function handleJoin(e: Event) {
		e.preventDefault();
		if (!userStore.currentUser) return;

		loading = true;
		error = null;

		const request = {
			sessionCode: sessionCode.trim().toUpperCase(),
			userId: userStore.currentUser.id,
			userName: userStore.displayName
		};

		const validation = JoinSessionRequestSchema.safeParse(request);
		if (!validation.success) {
			error = validation.error.issues[0].message;
			loading = false;
			return;
		}

		const response = await sessionRepo.joinSession(request);

		if ('error' in response) {
			error = extractErrorMessage(response.error.message);
			loading = false;
			return;
		}

		// Fetch full session details with participants
		const detailsResponse = await sessionRepo.getSessionDetails({
			sessionId: response.session.id
		});

		if ('error' in detailsResponse) {
			error = extractErrorMessage(detailsResponse.error.message);
			loading = false;
			return;
		}

		// Set session with participants from the session details
		sessionStore.setSession(detailsResponse.session, detailsResponse.session.participants);
		loading = false;
		sessionCode = '';
	}

	function handleRetry() {
		error = null;
	}
</script>

<form onsubmit={handleJoin} class="flex flex-col gap-4">
	<Input
		label="Session Code"
		value={sessionCode}
		onInput={(value) => (sessionCode = value.toUpperCase())}
		placeholder="Enter session code"
		disabled={loading}
		error={error || undefined}
	/>

	{#if error}
		<ErrorDisplay {error} onRetry={handleRetry} />
	{/if}

	<Button type="submit" variant="primary" disabled={!canSubmit}>
		{#if loading}
			<div class="flex items-center gap-2">
				<Loading size="sm" />
				<span>Joining...</span>
			</div>
		{:else}
			Join Session
		{/if}
	</Button>
</form>
