<script lang="ts">
  interface Props {
    error: Error | string;
    onRetry?: () => void;
  }

  let { error, onRetry }: Props = $props();

  const errorMessage = $derived(
    typeof error === 'string' ? error : error.message || 'An unknown error occurred'
  );
</script>

<div
  class="flex flex-col items-center justify-center gap-4 p-6 bg-red-900/20 border border-red-500/30 rounded-lg"
  role="alert"
>
  <div class="flex items-center gap-3">
    <svg
      class="w-6 h-6 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <p class="text-red-400 font-medium">{errorMessage}</p>
  </div>

  {#if onRetry}
    <button
      onclick={onRetry}
      class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      Try Again
    </button>
  {/if}
</div>
