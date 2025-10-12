import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "./toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handle Supabase errors with consistent toast messages
 * @param error - The error object from Supabase
 * @param context - Context for logging (e.g., 'useTasks.addTask')
 * @param userMessage - Optional custom message for users
 */
export function handleSupabaseError(
  error: any,
  context: string,
  userMessage?: string
) {
  const message = userMessage || error?.message || 'An error occurred'
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  }
  
  toast.error(message)
  return { success: false, error: message }
}

/**
 * Validate text input with common rules
 */
export function validateTextInput(
  text: string,
  minLength = 1,
  maxLength = 500,
  fieldName = 'Input'
): { valid: boolean; error?: string } {
  const trimmed = text.trim()
  
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`
    }
  }
  
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    }
  }
  
  return { valid: true }
}
