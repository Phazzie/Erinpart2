/**
 * Mock implementation of IVibeRepository
 */

import type {
	IVibeRepository,
	GetAvailableVibesSuccessResponse,
	SetSessionVibeRequest,
	SetSessionVibeSuccessResponse,
	SetSessionVibeErrorResponse
} from '../contracts/vibe.contracts';

export class VibeMockRepository implements IVibeRepository {
	getAvailableVibes(): GetAvailableVibesSuccessResponse {
		return {
			vibes: [
				{
					id: 'chaos-gremlin',
					name: 'Chaos Gremlin',
					description: 'Neon pink/purple with high energy vibes',
					colorScheme: {
						primary: '#ff00ff',
						secondary: '#ff00aa',
						accent: '#ffff00',
						background: '#1a001a'
					}
				},
				{
					id: 'zen-master',
					name: 'Zen Master',
					description: 'Calm blues and greens for focused productivity',
					colorScheme: {
						primary: '#00aaff',
						secondary: '#00ffaa',
						accent: '#aaffff',
						background: '#001a1a'
					}
				},
				{
					id: 'productivity-beast',
					name: 'Productivity Beast',
					description: 'Energizing oranges and reds',
					colorScheme: {
						primary: '#ff5500',
						secondary: '#ff0000',
						accent: '#ffaa00',
						background: '#1a0a00'
					}
				},
				{
					id: 'default-dark',
					name: 'Default Dark',
					description: 'Classic dark theme',
					colorScheme: {
						primary: '#6366f1',
						secondary: '#8b5cf6',
						accent: '#ec4899',
						background: '#0f172a'
					}
				}
			]
		};
	}

	async setSessionVibe(
		request: SetSessionVibeRequest
	): Promise<SetSessionVibeSuccessResponse | SetSessionVibeErrorResponse> {
		return {
			success: true,
			updatedVibe: request.vibeConfig
		};
	}
}
