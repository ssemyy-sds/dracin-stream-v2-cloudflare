import { s as sanitize_props, a as spread_props, b as slot, c as attr_class, e as ensure_array_like, d as attr, f as stringify, g as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { f as favoritesCount } from "../../chunks/favorites.js";
import { I as Icon } from "../../chunks/Icon.js";
import { S as Search } from "../../chunks/search.js";
import { H as Heart } from "../../chunks/heart.js";
import { T as Trending_up, C as Crown } from "../../chunks/trending-up.js";
import { V as escape_html } from "../../chunks/context.js";
import "clsx";
import { w as writable } from "../../chunks/index.js";
function Circle_play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["polygon", { "points": "10 8 16 12 10 16 10 8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-play" },
    $$sanitized_props,
    {
      /**
       * @component @name CirclePlay
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cG9seWdvbiBwb2ludHM9IjEwIDggMTYgMTIgMTAgMTYgMTAgOCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/circle-play
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Coffee($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M10 2v2" }],
    ["path", { "d": "M14 2v2" }],
    [
      "path",
      {
        "d": "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"
      }
    ],
    ["path", { "d": "M6 2v2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "coffee" },
    $$sanitized_props,
    {
      /**
       * @component @name Coffee
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMnYyIiAvPgogIDxwYXRoIGQ9Ik0xNCAydjIiIC8+CiAgPHBhdGggZD0iTTE2IDhhMSAxIDAgMCAxIDEgMXY4YTQgNCAwIDAgMS00IDRIN2E0IDQgMCAwIDEtNC00VjlhMSAxIDAgMCAxIDEtMWgxNGE0IDQgMCAxIDEgMCA4aC0xIiAvPgogIDxwYXRoIGQ9Ik02IDJ2MiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/coffee
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function House($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      { "d": "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }
    ],
    [
      "path",
      {
        "d": "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "house" },
    $$sanitized_props,
    {
      /**
       * @component @name House
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMjF2LThhMSAxIDAgMCAwLTEtMWgtNGExIDEgMCAwIDAtMSAxdjgiIC8+CiAgPHBhdGggZD0iTTMgMTBhMiAyIDAgMCAxIC43MDktMS41MjhsNy01Ljk5OWEyIDIgMCAwIDEgMi41ODIgMGw3IDUuOTk5QTIgMiAwIDAgMSAyMSAxMHY5YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/house
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Menu($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["line", { "x1": "4", "x2": "20", "y1": "12", "y2": "12" }],
    ["line", { "x1": "4", "x2": "20", "y1": "6", "y2": "6" }],
    ["line", { "x1": "4", "x2": "20", "y1": "18", "y2": "18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "menu" },
    $$sanitized_props,
    {
      /**
       * @component @name Menu
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iMTIiIHkyPSIxMiIgLz4KICA8bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iNiIgeTI9IjYiIC8+CiAgPGxpbmUgeDE9IjQiIHgyPSIyMCIgeTE9IjE4IiB5Mj0iMTgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/menu
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const navLinks = [
      { href: "/", label: "Home", icon: House },
      {
        href: "/category/trending",
        label: "Trending",
        icon: Trending_up
      },
      { href: "/category/vip", label: "VIP", icon: Crown }
    ];
    $$renderer2.push(`<nav${attr_class(`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${stringify("bg-gradient-to-b from-black/80 to-transparent")}`)}><div class="max-w-7xl mx-auto px-4 sm:px-6"><div class="flex items-center justify-between h-16"><a href="/" class="flex items-center gap-2 group">`);
    Circle_play($$renderer2, {
      class: "w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform"
    });
    $$renderer2.push(`<!----> <span class="text-xl font-bold tracking-tight">DRACIN</span></a> <div class="hidden md:flex items-center gap-6"><!--[-->`);
    const each_array = ensure_array_like(navLinks);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let link = each_array[$$index];
      $$renderer2.push(`<a${attr("href", link.href)}${attr_class(`text-sm font-medium transition-colors hover:text-brand-orange ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === link.href ? "text-brand-orange" : "text-gray-300")}`)}>${escape_html(link.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-3"><div class="hidden md:block relative">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button class="p-2 text-gray-300 hover:text-white transition-colors" aria-label="Search">`);
      Search($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="relative"><a href="/favorites" class="relative p-2 text-gray-300 hover:text-brand-orange transition-colors" aria-label="Watchlist">`);
    Heart($$renderer2, {
      class: `w-5 h-5 ${stringify(store_get($$store_subs ??= {}, "$favoritesCount", favoritesCount) > 0 ? "fill-brand-orange text-brand-orange" : "")}`
    });
    $$renderer2.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$favoritesCount", favoritesCount) > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">${escape_html(store_get($$store_subs ??= {}, "$favoritesCount", favoritesCount) > 99 ? "99+" : store_get($$store_subs ??= {}, "$favoritesCount", favoritesCount))}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></a> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="md:hidden p-2 text-gray-300 hover:text-white" aria-label="Menu">`);
    {
      $$renderer2.push("<!--[!-->");
      Menu($$renderer2, { class: "w-6 h-6" });
    }
    $$renderer2.push(`<!--]--></button></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DonationModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
const activeProvider = writable("Unknown");
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let isWatchPage = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/watch");
    $$renderer2.push(`<div class="min-h-screen bg-brand-black flex flex-col">`);
    Navbar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex-1 pt-16">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <footer class="bg-brand-dark border-t border-white/5 py-8 mt-12"><div class="max-w-7xl mx-auto px-4 sm:px-6"><div class="flex flex-col md:flex-row items-center justify-between gap-4"><div class="text-center md:text-left"><p class="text-sm text-gray-400">© 2026 DRACIN. Streaming drama China dengan subtitle Indonesia.</p> <p class="text-xs text-gray-500 mt-1">V2.0 - Built with SvelteKit ❤️</p></div> <div class="flex items-center gap-4"><a href="/favorites" class="text-sm text-gray-400 hover:text-white transition-colors">Watchlist</a> <a href="/category/trending" class="text-sm text-gray-400 hover:text-white transition-colors">Trending</a> <button class="text-sm text-gray-400 hover:text-brand-orange transition-colors">Donasi</button></div></div></div></footer> `);
    if (!isWatchPage) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 rounded-full shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 hover:scale-105 transition-all z-40" aria-label="Donasi">`);
      Coffee($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----> <span class="text-sm font-semibold hidden sm:inline">Traktir Kopi</span></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!isWatchPage) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed bottom-20 right-6 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg text-xs font-mono text-gray-400 z-40 pointer-events-none">API: ${escape_html(store_get($$store_subs ??= {}, "$activeProvider", activeProvider))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    DonationModal($$renderer2);
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
