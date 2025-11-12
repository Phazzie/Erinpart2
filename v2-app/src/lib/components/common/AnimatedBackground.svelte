<script lang="ts">
  // Pure visual component - no props needed
</script>

<div class="animated-background"></div>

<style>
  .animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: linear-gradient(
      135deg,
      #1e1e2e 0%,
      #2a2a3c 25%,
      #1e1e2e 50%,
      #2a2a3c 75%,
      #1e1e2e 100%
    );
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Add subtle purple/blue tint overlay */
  .animated-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 20% 50%,
      rgba(139, 92, 246, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 50%,
      rgba(59, 130, 246, 0.1) 0%,
      transparent 50%
    );
    animation: pulse 10s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
</style>
