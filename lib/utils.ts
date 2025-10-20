import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a random session ID in the format "word-word-word"
 */
export function generateSessionId(): string {
  const animals = [
    'cat', 'dog', 'bird', 'fish', 'fox', 'bear', 'wolf', 'owl', 'bee', 'ant',
    'cow', 'pig', 'duck', 'goat', 'sheep', 'deer', 'frog', 'crab', 'seal', 'whale'
  ]
  
  const colors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray',
    'gold', 'silver', 'teal', 'navy', 'coral', 'lime', 'cyan', 'plum', 'jade', 'ruby'
  ]
  
  const actions = [
    'jump', 'run', 'fly', 'swim', 'dance', 'sing', 'play', 'read', 'write', 'draw',
    'laugh', 'smile', 'think', 'dream', 'walk', 'climb', 'surf', 'dive', 'race', 'win'
  ]
  
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomAction = actions[Math.floor(Math.random() * actions.length)]
  
  return `${randomAnimal}-${randomColor}-${randomAction}`
}
