import { d as derived, w as writable } from "./index.js";
const STORAGE_KEY = "dracin_favorites";
const MAX_FAVORITES = 100;
function getFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const favorites2 = JSON.parse(stored);
    return favorites2.sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}
function addFavorite(drama) {
  if (typeof window === "undefined") return [];
  const favorites2 = getFavorites();
  if (favorites2.some((f) => f.bookId === drama.bookId)) {
    return favorites2;
  }
  const newFavorite = {
    ...drama,
    addedAt: Date.now()
  };
  const updated = [newFavorite, ...favorites2].slice(0, MAX_FAVORITES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save favorites:", e);
  }
  return updated;
}
function removeFavorite(bookId) {
  if (typeof window === "undefined") return [];
  const favorites2 = getFavorites();
  const updated = favorites2.filter((f) => f.bookId !== bookId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save favorites:", e);
  }
  return updated;
}
function clearFavorites() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear favorites:", e);
  }
}
function createFavoritesStore() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    // Initialize from localStorage (call on mount)
    init: () => {
      const favorites2 = getFavorites();
      set(favorites2);
    },
    // Add a drama to favorites
    add: (drama) => {
      update((current) => {
        if (current.some((f) => f.bookId === drama.bookId)) {
          return current;
        }
        const newFavorite = {
          ...drama,
          addedAt: Date.now()
        };
        const updated = [newFavorite, ...current].slice(0, 100);
        addFavorite(drama);
        return updated;
      });
    },
    // Remove a drama from favorites
    remove: (bookId) => {
      update((current) => {
        const updated = current.filter((f) => f.bookId !== bookId);
        removeFavorite(bookId);
        return updated;
      });
    },
    // Toggle favorite status
    toggle: (drama) => {
      update((current) => {
        const exists = current.some((f) => f.bookId === drama.bookId);
        if (exists) {
          removeFavorite(drama.bookId);
          return current.filter((f) => f.bookId !== drama.bookId);
        } else {
          const newFavorite = {
            ...drama,
            addedAt: Date.now()
          };
          addFavorite(drama);
          return [newFavorite, ...current].slice(0, 100);
        }
      });
    },
    // Check if a drama is favorited
    isFavorite: (bookId, favorites2) => {
      return favorites2.some((f) => f.bookId === bookId);
    },
    // Clear all favorites
    clear: () => {
      clearFavorites();
      set([]);
    }
  };
}
const favorites = createFavoritesStore();
const favoritesCount = derived(favorites, ($favorites) => $favorites.length);
derived(favorites, ($favorites) => $favorites.slice(0, 10));
export {
  favorites as a,
  favoritesCount as f
};
