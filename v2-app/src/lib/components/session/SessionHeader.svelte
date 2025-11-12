<script lang="ts">
	import { getRepository } from '$lib/config';
	import { sessionStore, userStore } from '$lib/stores';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/common';
	import { extractErrorMessage } from '$lib/utils/error-handling';

	const sessionRepo = getRepository('session');
	let leaving = $state(false);
	let error = $state<string | null>(null);

	async function handleLeave() {
		if (!sessionStore.currentSession || !userStore.currentUser) return;

		leaving = true;
		error = null;

		const response = await sessionRepo.leaveSession({
			sessionId: sessionStore.currentSession.id,
			userId: userStore.currentUser.id
		});

		if ('error' in response) {
			error = extractErrorMessage(response.error.message);
			leaving = false;
			return;
		}

		sessionStore.clearSession();
		leaving = false;
	}
</script>

{#if sessionStore.isInSession && sessionStore.currentSession}
	<div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
		<div class="flex items-center gap-4">
			<div>
				<p class="text-sm text-gray-400">Session Code</p>
				<p class="text-xl font-mono font-bold text-purple-400">
					{sessionStore.currentSession.code}
				</p>
			</div>
			<Badge
				text="{sessionStore.participantCount}/{sessionStore.currentSession.participantCount} participants"
				variant="info"
			/>
		</div>
		<div class="flex flex-col items-end gap-1">
			<Button variant="secondary" onClick={handleLeave} disabled={leaving}>
				{leaving ? 'Leaving...' : 'Leave Session'}
			</Button>
			{#if error}
				<span class="text-xs text-red-400">{error}</span>
			{/if}
		</div>
	</div>
{/if}
