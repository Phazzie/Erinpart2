<script lang="ts">
  interface Props {
    text: string;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  }

  let { text, variant = 'neutral' }: Props = $props();

  const variantClasses = {
    success: 'bg-green-600/20 text-green-400 border-green-500/30',
    error: 'bg-red-600/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
  };
</script>

<span
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200 ease-in-out {variantClasses[variant]}"
>
  {text}
</span>
