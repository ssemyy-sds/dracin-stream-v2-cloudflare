<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import { favorites } from "$lib/stores/favorites";
  import { activeProvider } from "$lib/stores/apiState";

  let { children, data } = $props();

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
        </div>
      </div>
    </div>
  </footer>

  <!-- Modals moved to Navbar -->
</div>
