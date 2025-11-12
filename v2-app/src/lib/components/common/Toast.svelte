<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose?: () => void;
  }

  let { message, type = 'info', duration = 3000, onClose }: Props = $props();
  let visible = $state(true);

  onMount(() => {
    const timer = setTimeout(() => {
      visible = false;
      setTimeout(() => onClose?.(), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  });

  const typeClasses = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-blue-600 border-blue-500',
    warning: 'bg-yellow-600 border-yellow-500',
  };

  const role = type === 'error' ? 'alert' : 'status';

  function handleClose() {
    visible = false;
    setTimeout(() => onClose?.(), 300);
  }
</script>

{#if visible}
  <div
    class="fixed top-4 right-4 px-4 py-3 rounded-lg border-l-4 shadow-lg transition-all duration-300 ease-in-out z-50 {typeClasses[type]}"
    class:translate-x-0={visible}
    class:-translate-x-full={!visible}
    class:opacity-100={visible}
    class:opacity-0={!visible}
    {role}
  >
    <div class="flex items-center gap-3">
      <p class="text-white text-sm font-medium">{message}</p>
      <button
        onclick={handleClose}
        class="text-white hover:text-gray-200 transition-colors duration-200 ml-2"
        aria-label="Close notification"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}
