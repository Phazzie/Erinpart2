/**
 * This file contains mock data for the application.
 * In a production environment, this data would be fetched from a database.
 */

// Mock data for user profiles
export const mockUsers = [
  {
    id: 'user-1',
    email: 'erin@example.com',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'friend@example.com',
    created_at: '2024-01-02T00:00:00Z'
  }
]

// Mock data for collaborative sessions
export const mockSessions = [
  {
    id: 'session-1',
    name: "Erin's Escapades",
    owner_id: 'user-1',
    current_vibe: 'chaos-gremlin',
    current_day: 'today',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Mock data for tasks within a session
import type { Task, Vibe } from './types'

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    session_id: 'session-1',
    text: 'Come Over',
    is_complete: false,
    choice: '',
    day: 'today',
    order_index: 0,
    comments: '',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_secret: false,
    votes: [],
  },
  {
    id: 'task-2',
    session_id: 'session-1',
    text: 'Get Offensively High',
    is_complete: false,
    choice: 'maybe',
    day: 'today',
    order_index: 1,
    comments: 'Depends on the vibe check',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_secret: false,
    votes: [],
  },
  {
    id: 'task-3',
    session_id: 'session-1',
    text: 'Solidify Permanent Spot on the Cereal List',
    is_complete: false,
    choice: 'yes',
    day: 'today',
    order_index: 2,
    comments: 'This is non-negotiable',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_secret: false,
    votes: [],
  },
  {
    id: 'task-5-secret',
    session_id: 'session-1',
    text: 'Steal the Declaration of Independence',
    is_complete: false,
    choice: '',
    day: 'today',
    order_index: 3,
    comments: '',
    created_by: 'user-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_secret: true,
    votes: ['user-2'], // The creator automatically votes
  },
  {
    id: 'task-4',
    session_id: 'session-1',
    text: 'Plan world domination (but make it cute)',
    is_complete: false,
    choice: '',
    day: 'tomorrow',
    order_index: 0,
    comments: '',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_secret: false,
    votes: [],
  }
]

// Mock data for Vibes (task templates)
export const mockVibes: Vibe[] = [
  {
    id: 'vibe-1',
    name: 'default',
    display_name: 'Default Chaos',
    description: 'The classic Erin experience',
    tasks: ['Come Over', 'Get Offensively High', 'Solidify Permanent Spot on the Cereal List'],
    category: 'general',
    is_default: true
  },
  {
    id: 'vibe-2',
    name: 'chaos-gremlin',
    display_name: 'Chaos Gremlin',
    description: 'Maximum chaos energy activated',
    tasks: [
      'Start a group chat just to send cryptic memes',
      'Rearrange someone\'s furniture by exactly 2 inches',
      'Learn a completely useless skill for 30 minutes',
      'Send a friend a package with just bubble wrap inside',
      'Wear mismatched socks and see if anyone notices'
    ],
    category: 'chaos',
    is_default: false
  },
  {
    id: 'vibe-3',
    name: 'villain-era',
    display_name: 'Villain Era',
    description: 'Embrace your inner antagonist',
    tasks: [
      'Dramatically monologue your morning routine',
      'Wear sunglasses indoors and refuse to explain why',
      'End every text with "...for now"',
      'Practice your most intimidating stare',
      'Create a playlist titled "Songs to Plot World Domination To"'
    ],
    category: 'dark',
    is_default: false
  },
  {
    id: 'vibe-4',
    name: 'feral-academic',
    display_name: 'Feral Academic',
    description: 'Chaotic intellectual energy',
    tasks: [
      'Research something completely random for 2 hours straight',
      'Correct someone\'s grammar in the most pretentious way possible',
      'Start three different Wikipedia rabbit holes simultaneously',
      'Use unnecessarily big words in casual conversation',
      'Fact-check a conspiracy theory just for fun'
    ],
    category: 'academic',
    is_default: false
  },
  {
    id: 'vibe-5',
    name: 'main-character-energy',
    display_name: 'Main Character Energy',
    description: 'You are the protagonist of your own story',
    tasks: [
      'Walk into every room like you own it',
      'Make intense eye contact with your reflection and wink',
      'Wear something that makes you feel like a whole ass meal',
      'Practice your "I know what I want" voice',
      'Send a text that\'s just a little too confident'
    ],
    category: 'romantic',
    is_default: false
  }
]
