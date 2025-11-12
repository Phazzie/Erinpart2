/**
 * UI Store
 *
 * Manages UI state including modals, toasts, and layout using Svelte 5 runes.
 * Provides centralized UI state management for the application.
 *
 * @module ui.store
 */

import type { ModalState } from '$lib/contracts/ui-state.contracts';

/**
 * Toast notification interface
 */
export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
	duration?: number;
}

/**
 * UI store class using Svelte 5 runes
 */
class UIStore {
	// State properties
	modals = $state<Map<string, ModalState<any>>>(new Map());
	toasts = $state<Toast[]>([]);
	sidebarCollapsed = $state(false);

	// Derived values
	hasOpenModals = $derived(
		Array.from(this.modals.values()).some((modal) => modal.isOpen)
	);
	toastCount = $derived(this.toasts.length);

	/**
	 * Open a modal with content
	 * @param id - Unique modal identifier
	 * @param content - Modal content data
	 * @param options - Optional modal configuration
	 */
	openModal<T>(
		id: string,
		content: T,
		options?: {
			closeOnBackdrop?: boolean;
			closeOnEscape?: boolean;
		}
	) {
		const onClose = () => this.closeModal(id);

		this.modals.set(id, {
			isOpen: true,
			content,
			onClose,
			closeOnBackdrop: options?.closeOnBackdrop ?? true,
			closeOnEscape: options?.closeOnEscape ?? true
		});
	}

	/**
	 * Close a modal by ID
	 * @param id - Modal identifier
	 */
	closeModal(id: string) {
		this.modals.delete(id);
	}

	/**
	 * Close all modals
	 */
	closeAllModals() {
		this.modals.clear();
	}

	/**
	 * Get a modal state by ID
	 * @param id - Modal identifier
	 * @returns Modal state or undefined
	 */
	getModal<T>(id: string): ModalState<T> | undefined {
		return this.modals.get(id);
	}

	/**
	 * Add a toast notification
	 * @param toast - Toast configuration (without id)
	 */
	addToast(toast: Omit<Toast, 'id'>) {
		const id = crypto.randomUUID();
		this.toasts = [...this.toasts, { ...toast, id }];

		// Auto-remove after duration
		const duration = toast.duration ?? 3000;
		setTimeout(() => {
			this.removeToast(id);
		}, duration);
	}

	/**
	 * Remove a toast by ID
	 * @param id - Toast identifier
	 */
	removeToast(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	/**
	 * Clear all toasts
	 */
	clearToasts() {
		this.toasts = [];
	}

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}

	/**
	 * Set sidebar collapsed state
	 * @param collapsed - Collapsed state
	 */
	setSidebarCollapsed(collapsed: boolean) {
		this.sidebarCollapsed = collapsed;
	}

	/**
	 * Show a success toast
	 * @param message - Success message
	 * @param duration - Optional duration in ms
	 */
	showSuccess(message: string, duration?: number) {
		this.addToast({ message, type: 'success', duration });
	}

	/**
	 * Show an error toast
	 * @param message - Error message
	 * @param duration - Optional duration in ms
	 */
	showError(message: string, duration?: number) {
		this.addToast({ message, type: 'error', duration });
	}

	/**
	 * Show an info toast
	 * @param message - Info message
	 * @param duration - Optional duration in ms
	 */
	showInfo(message: string, duration?: number) {
		this.addToast({ message, type: 'info', duration });
	}

	/**
	 * Show a warning toast
	 * @param message - Warning message
	 * @param duration - Optional duration in ms
	 */
	showWarning(message: string, duration?: number) {
		this.addToast({ message, type: 'warning', duration });
	}
}

// Export singleton instance
export const uiStore = new UIStore();
