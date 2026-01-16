<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Coffee, MessageSquare } from "lucide-svelte";
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import DonationModal from "$lib/components/DonationModal.svelte";
  import FeedbackModal from "$lib/components/FeedbackModal.svelte";
  import { favorites } from "$lib/stores/favorites";
  import { activeProvider } from "$lib/stores/apiState";

  let { children, data } = $props();

  let showDonation = $state(false);
  let showFeedback = $state(false);

  // Hide donation and feedback button on watch page
  let isWatchPage = $derived($page.url.pathname.startsWith("/watch"));

  onMount(() => {
    favorites.init();
  });
</script>

<div class="min-h-screen bg-brand-black flex flex-col">
  <Navbar />

  <main class="flex-1 pt-16">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-brand-dark border-t border-white/5 py-8 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-center md:text-left">
          <p class="text-sm text-gray-400">
            © {new Date().getFullYear()} DRACIN. Streaming drama China dengan subtitle
            Indonesia.
          </p>
          <p class="text-xs text-gray-500 mt-1">
            V2.0 - Built with SvelteKit ❤️
          </p>
        </div>
        <div class="flex items-center gap-4">
          <a
            href="/favorites"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Watchlist
          </a>
          <a
            href="/category/trending"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Trending
          </a>
          <button
            onclick={() => (showDonation = true)}
            class="text-sm text-gray-400 hover:text-brand-orange transition-colors"
          >
            Donasi
          </button>
          <button
            onclick={() => (showFeedback = true)}
            class="text-sm text-gray-400 hover:text-brand-orange transition-colors"
          >
            Feedback
          </button>
        </div>
      </div>
    </div>
  </footer>

  <!-- Floating Buttons (hidden on watch page) -->
  {#if !isWatchPage}
    <div class="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">
      <!-- Donation Button -->
      <button
        onclick={() => (showDonation = true)}
        class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 rounded-full shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 hover:scale-105 transition-all"
        aria-label="Donasi"
      >
        <Coffee class="w-5 h-5" />
        <span class="text-sm font-semibold hidden sm:inline">Traktir Kopi</span>
      </button>

      <!-- Feedback Button -->
      <button
        onclick={() => (showFeedback = true)}
        class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 rounded-full shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 hover:scale-105 transition-all"
        aria-label="Feedback"
      >
        <MessageSquare class="w-5 h-5" />
        <span class="text-sm font-semibold hidden sm:inline">Lapor Bug</span>
      </button>
    </div>
  {/if}

  <!-- Modals -->
  <DonationModal isOpen={showDonation} onClose={() => (showDonation = false)} />
  <FeedbackModal
    isOpen={showFeedback}
    onClose={() => (showFeedback = false)}
    apiId={$activeProvider}
    siteKey={data.turnstileSiteKey}
  />
</div>
