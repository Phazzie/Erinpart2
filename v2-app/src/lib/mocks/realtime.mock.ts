/**
 * Mock implementation of IRealtimeRepository
 */

import type {
	IRealtimeRepository,
	SubscribeToSessionRequest,
	SubscribeToSessionSuccessResponse,
	SubscribeToSessionErrorResponse,
	UnsubscribeFromChannelRequest,
	UnsubscribeFromChannelSuccessResponse,
	UnsubscribeFromChannelErrorResponse,
	ConnectionState,
	Subscription,
	RealtimeEvent
} from '../contracts/realtime.contracts';

export class RealtimeMockRepository implements IRealtimeRepository {
	private subscriptions: Map<string, ConnectionState> = new Map();

	async subscribeToSession(
		request: SubscribeToSessionRequest
	): Promise<SubscribeToSessionSuccessResponse | SubscribeToSessionErrorResponse> {
		const channelId = `session:${request.sessionId}`;
		const connectionState: ConnectionState = {
			status: 'connected',
			lastConnected: new Date().toISOString(),
			reconnectAttempts: 0,
			timestamp: new Date().toISOString()
		};

		this.subscriptions.set(channelId, connectionState);

		const subscription: Subscription = {
			channelId,
			sessionId: request.sessionId,
			connectionState,
			onEvent: (callback: (event: RealtimeEvent) => void) => {
				return () => {};
			},
			onConnectionStateChange: (callback: (state: ConnectionState) => void) => {
				return () => {};
			}
		};

		return { subscription };
	}

	async unsubscribeFromChannel(
		request: UnsubscribeFromChannelRequest
	): Promise<UnsubscribeFromChannelSuccessResponse | UnsubscribeFromChannelErrorResponse> {
		this.subscriptions.delete(request.channelId);
		return {
			success: true,
			channelId: request.channelId
		};
	}

	getConnectionState(channelId: string): ConnectionState | null {
		return this.subscriptions.get(channelId) || null;
	}

	getActiveSubscriptions(): string[] {
		return Array.from(this.subscriptions.keys());
	}
}
