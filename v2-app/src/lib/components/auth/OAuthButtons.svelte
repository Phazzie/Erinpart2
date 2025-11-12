<script lang="ts">
  import { getRepository } from '$lib/config';
  import { userStore } from '$lib/stores';
  import { Button } from '$lib/components/ui';
  import { Loading, Error as ErrorDisplay } from '$lib/components/common';
  import { extractErrorMessage } from '$lib/utils/error-handling';
  import type { OAuthProvider } from '$lib/contracts/auth.contracts';

  const authRepo = getRepository('auth');
  let loadingProvider = $state<OAuthProvider | null>(null);
  let error = $state<string | null>(null);

  async function handleOAuthSignIn(provider: OAuthProvider) {
    loadingProvider = provider;
    error = null;

    const response = await authRepo.oauthSignIn({ provider });

    if ('error' in response) {
      error = extractErrorMessage(response.error);
      loadingProvider = null;
      return;
    }

    // For OAuth, response contains redirectUrl in real implementation
    // For mock, it contains user and session directly
    if ('redirectUrl' in response) {
      window.location.href = (response as any).redirectUrl;
    } else if ('user' in response && 'session' in response) {
      // Mock implementation path
      userStore.setUser(response.user, response.session);
      loadingProvider = null;
    }
  }
</script>

<div class="flex flex-col gap-3">
  <Button
    variant="secondary"
    onClick={() => handleOAuthSignIn('google')}
    disabled={loadingProvider !== null}
  >
    {#if loadingProvider === 'google'}
      <Loading size="sm" />
      <span class="ml-2">Redirecting...</span>
    {:else}
      <span>Sign in with Google</span>
    {/if}
  </Button>

  <Button
    variant="secondary"
    onClick={() => handleOAuthSignIn('github')}
    disabled={loadingProvider !== null}
  >
    {#if loadingProvider === 'github'}
      <Loading size="sm" />
      <span class="ml-2">Redirecting...</span>
    {:else}
      <span>Sign in with GitHub</span>
    {/if}
  </Button>

  {#if error}
    <ErrorDisplay {error} onRetry={() => (error = null)} />
  {/if}
</div>
