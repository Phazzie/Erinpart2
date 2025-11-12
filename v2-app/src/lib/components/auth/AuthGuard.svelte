<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores';
  import { Loading } from '$lib/components/common';
  import type { Snippet } from 'svelte';

  interface Props {
    redirectTo?: string;
    children: Snippet;
  }

  let { redirectTo = '/auth', children }: Props = $props();
  let checking = $state(true);

  onMount(() => {
    // Check authentication
    if (!userStore.isAuthenticated) {
      goto(redirectTo);
    } else {
      checking = false;
    }
  });
</script>

{#if checking}
  <div class="flex items-center justify-center min-h-screen">
    <Loading text="Checking authentication..." size="lg" />
  </div>
{:else if userStore.isAuthenticated}
  {@render children()}
{/if}
