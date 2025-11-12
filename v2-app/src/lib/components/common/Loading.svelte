<script lang="ts">
  interface Props {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { text, size = 'md' }: Props = $props();

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };
</script>

<div class="flex flex-col items-center justify-center gap-2" aria-live="polite">
  <div
    class="rounded-full border-purple-600 border-t-transparent animate-spin {sizeClasses[size]}"
    role="status"
    aria-label="Loading"
  ></div>
  {#if text}
    <p class="text-sm text-gray-400">{text}</p>
  {/if}
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
