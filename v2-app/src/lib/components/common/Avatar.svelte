<script lang="ts">
  interface Props {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    fallback?: string;
  }

  let { src, alt, size = 'md', fallback }: Props = $props();
  let imageError = $state(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const showFallback = $derived(!src || imageError);

  function handleImageError() {
    imageError = true;
  }

  // Generate initials from alt text if no fallback provided
  const initials = $derived.by(() => {
    if (fallback) return fallback;

    const words = alt.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  });
</script>

<div
  class="rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white font-semibold {sizeClasses[size]}"
>
  {#if showFallback}
    <span>{initials}</span>
  {:else}
    <img
      {src}
      {alt}
      class="w-full h-full object-cover"
      onerror={handleImageError}
    />
  {/if}
</div>
