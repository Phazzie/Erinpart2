<script lang="ts">
	import { sessionStore } from '$lib/stores';
	import { Avatar, Badge } from '$lib/components/common';
	import { Card } from '$lib/components/ui';

	const maxParticipants = $derived(10);
	const participantLimit = $derived(
		`${sessionStore.participantCount}/${maxParticipants} participants`
	);
</script>

{#if sessionStore.isInSession && sessionStore.currentSession}
	<Card>
		<div class="flex flex-col gap-4">
			<!-- Session Info -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold text-white">Session Details</h3>
					<p class="text-sm text-gray-400">
						{#if sessionStore.isHost}
							You are the host
						{:else}
							Collaborative session
						{/if}
					</p>
				</div>
				<Badge
					text={participantLimit}
					variant={sessionStore.participantCount >= maxParticipants ? 'warning' : 'info'}
				/>
			</div>

			<!-- Participants List -->
			<div>
				<h4 class="text-sm font-medium text-gray-300 mb-3">Participants</h4>
				<div class="flex flex-col gap-2">
					{#each sessionStore.participants as participant (participant.id)}
						<div class="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
							<Avatar alt={participant.name} size="sm" />
							<div class="flex-1">
								<p class="text-sm font-medium text-white">{participant.name}</p>
								<p class="text-xs text-gray-400">
									Joined {new Date(participant.joinedAt).toLocaleTimeString()}
								</p>
							</div>
							<Badge
								text={participant.isOnline ? 'Online' : 'Offline'}
								variant={participant.isOnline ? 'success' : 'neutral'}
							/>
						</div>
					{/each}

					{#if sessionStore.participants.length === 0}
						<p class="text-sm text-gray-400 text-center py-4">
							No participants yet. Share the session code to invite others.
						</p>
					{/if}
				</div>
			</div>

			<!-- Host Settings -->
			{#if sessionStore.isHost}
				<div class="border-t border-gray-700 pt-4">
					<h4 class="text-sm font-medium text-gray-300 mb-2">Host Settings</h4>
					<div class="flex flex-col gap-2">
						<p class="text-sm text-gray-400">
							As the host, you can manage session settings and participants.
						</p>
						<!-- Future: Add more host controls here -->
					</div>
				</div>
			{/if}
		</div>
	</Card>
{/if}
