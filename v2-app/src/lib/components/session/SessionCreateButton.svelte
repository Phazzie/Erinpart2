<script lang="ts">
	import { getRepository } from '$lib/config';
	import { sessionStore, userStore } from '$lib/stores';
	import { CreateSessionRequestSchema } from '$lib/contracts/session.contracts';
	import { Button, Dialog } from '$lib/components/ui';
	import { Loading, Error as ErrorDisplay } from '$lib/components/common';
	import { extractErrorMessage } from '$lib/utils/error-handling';

	const sessionRepo = getRepository('session');
	let dialogOpen = $state(false);
	let creating = $state(false);
	let error = $state<string | null>(null);

	function openDialog() {
		dialogOpen = true;
		error = null;
	}

	function closeDialog() {
		dialogOpen = false;
		error = null;
	}

	async function handleCreate() {
		if (!userStore.currentUser) return;

		creating = true;
		error = null;

		const request = {
			userId: userStore.currentUser.id,
			userName: userStore.displayName
		};

		const validation = CreateSessionRequestSchema.safeParse(request);
		if (!validation.success) {
			error = validation.error.issues[0].message;
			creating = false;
			return;
		}

		const response = await sessionRepo.createSession(request);

		if ('error' in response) {
			error = extractErrorMessage(response.error.message);
			creating = false;
			return;
		}

		// Fetch session details to get participants
		const detailsResponse = await sessionRepo.getSessionDetails({
			sessionId: response.session.id
		});

		if ('error' in detailsResponse) {
			error = extractErrorMessage(detailsResponse.error.message);
			creating = false;
			return;
		}

		sessionStore.setSession(detailsResponse.session, detailsResponse.session.participants);
		creating = false;
		closeDialog();
	}

	function handleRetry() {
		error = null;
	}
</script>

<Button variant="primary" onClick={openDialog}>
	Create New Session
</Button>

<Dialog open={dialogOpen} onClose={closeDialog} title="Create New Session">
	<div class="flex flex-col gap-4">
		<p class="text-gray-300">
			Create a new collaborative session. You'll be the host and can invite others to join.
		</p>

		{#if error}
			<ErrorDisplay {error} onRetry={handleRetry} />
		{/if}

		<div class="flex gap-2 justify-end">
			<Button variant="ghost" onClick={closeDialog} disabled={creating}>
				Cancel
			</Button>
			<Button variant="primary" onClick={handleCreate} disabled={creating}>
				{#if creating}
					<div class="flex items-center gap-2">
						<Loading size="sm" />
						<span>Creating...</span>
					</div>
				{:else}
					Create Session
				{/if}
			</Button>
		</div>
	</div>
</Dialog>
