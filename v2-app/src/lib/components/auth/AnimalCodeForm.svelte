<script lang="ts">
  import { getRepository } from '$lib/config';
  import { userStore } from '$lib/stores';
  import { ANIMAL_CODES } from '$lib/utils/constants';
  import { AnonymousSignInRequestSchema } from '$lib/contracts/auth.contracts';
  import { Button } from '$lib/components/ui';
  import { Loading, Error as ErrorDisplay } from '$lib/components/common';
  import { extractErrorMessage } from '$lib/utils/error-handling';

  let animalOne = $state('');
  let animalTwo = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  const authRepo = getRepository('auth');
  const canSubmit = $derived(animalOne !== '' && animalTwo !== '' && !loading);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;

    // Validate
    const validation = AnonymousSignInRequestSchema.safeParse({ animalOne, animalTwo });
    if (!validation.success) {
      error = validation.error.issues[0].message;
      loading = false;
      return;
    }

    // Sign in
    const response = await authRepo.anonymousSignIn({ animalOne, animalTwo });

    if ('error' in response) {
      error = extractErrorMessage(response.error);
      loading = false;
      return;
    }

    // Success
    userStore.setUser(response.user, response.session);
    loading = false;
  }

  function handleRetry() {
    error = null;
    animalOne = '';
    animalTwo = '';
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
  <div>
    <label for="animal-one" class="block text-sm font-medium text-gray-300 mb-2">
      First Animal
    </label>
    <select
      id="animal-one"
      bind:value={animalOne}
      disabled={loading}
      class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
    >
      <option value="">Select an animal...</option>
      {#each ANIMAL_CODES as animal}
        <option value={animal}>{animal}</option>
      {/each}
    </select>
  </div>

  <div>
    <label for="animal-two" class="block text-sm font-medium text-gray-300 mb-2">
      Second Animal
    </label>
    <select
      id="animal-two"
      bind:value={animalTwo}
      disabled={loading}
      class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
    >
      <option value="">Select an animal...</option>
      {#each ANIMAL_CODES as animal}
        <option value={animal}>{animal}</option>
      {/each}
    </select>
  </div>

  {#if error}
    <ErrorDisplay {error} onRetry={handleRetry} />
  {/if}

  <Button type="submit" variant="primary" disabled={!canSubmit}>
    {#if loading}
      <Loading size="sm" />
      <span class="ml-2">Signing in...</span>
    {:else}
      Sign In Anonymously
    {/if}
  </Button>
</form>
