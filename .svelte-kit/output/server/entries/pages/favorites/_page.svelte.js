import { s as sanitize_props, a as spread_props, b as slot, h as head, g as store_get, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { D as DramaCard } from "../../../chunks/DramaCard.js";
import { a as favorites } from "../../../chunks/favorites.js";
import { H as Heart } from "../../../chunks/heart.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { V as escape_html } from "../../../chunks/context.js";
function Trash_2($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M3 6h18" }],
    ["path", { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
    ["path", { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
    ["line", { "x1": "10", "x2": "10", "y1": "11", "y2": "17" }],
    ["line", { "x1": "14", "x2": "14", "y1": "11", "y2": "17" }]
  ];
  Icon($$renderer, spread_props([
    { name: "trash-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Trash2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyA2aDE4IiAvPgogIDxwYXRoIGQ9Ik0xOSA2djE0YzAgMS0xIDItMiAySDdjLTEgMC0yLTEtMi0yVjYiIC8+CiAgPHBhdGggZD0iTTggNlY0YzAtMSAxLTIgMi0yaDRjMSAwIDIgMSAyIDJ2MiIgLz4KICA8bGluZSB4MT0iMTAiIHgyPSIxMCIgeTE9IjExIiB5Mj0iMTciIC8+CiAgPGxpbmUgeDE9IjE0IiB4Mj0iMTQiIHkxPSIxMSIgeTI9IjE3IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/trash-2
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    head("ud7knm", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Watchlist - DRACIN</title>`);
      });
    });
    $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div class="flex items-center justify-between mb-8"><div class="flex items-center gap-4"><div class="p-3 rounded-xl bg-brand-orange/20">`);
    Heart($$renderer2, { class: "w-6 h-6 text-brand-orange" });
    $$renderer2.push(`<!----></div> <div><h1 class="text-2xl md:text-3xl font-bold">Watchlist</h1> <p class="text-gray-400 text-sm">${escape_html(store_get($$store_subs ??= {}, "$favorites", favorites).length)} drama tersimpan</p></div></div> `);
    if (store_get($$store_subs ??= {}, "$favorites", favorites).length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">`);
      Trash_2($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----> <span class="hidden sm:inline">Hapus Semua</span></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (store_get($$store_subs ??= {}, "$favorites", favorites).length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$favorites", favorites));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let drama = each_array[$$index];
        DramaCard($$renderer2, { drama });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="text-center py-20"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gray mb-4">`);
      Heart($$renderer2, { class: "w-8 h-8 text-gray-400" });
      $$renderer2.push(`<!----></div> <h2 class="text-xl font-semibold mb-2">Watchlist Kosong</h2> <p class="text-gray-400 mb-6">Mulai tambahkan drama favorit ke watchlist</p> <a href="/" class="inline-flex items-center px-6 py-3 bg-brand-orange hover:bg-orange-600 rounded-full font-semibold transition-colors">Jelajahi Drama</a></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
