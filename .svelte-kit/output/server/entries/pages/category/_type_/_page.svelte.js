import { s as sanitize_props, a as spread_props, b as slot, g as store_get, h as head, e as ensure_array_like, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
import { V as escape_html } from "../../../../chunks/context.js";
import "clsx";
import { S as Star } from "../../../../chunks/star.js";
import { I as Icon } from "../../../../chunks/Icon.js";
import { C as Crown, T as Trending_up } from "../../../../chunks/trending-up.js";
function Clock($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["polyline", { "points": "12 6 12 12 16 14" }]
  ];
  Icon($$renderer, spread_props([
    { name: "clock" },
    $$sanitized_props,
    {
      /**
       * @component @name Clock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxMiA2IDEyIDEyIDE2IDE0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/clock
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
function Languages($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "m5 8 6 6" }],
    ["path", { "d": "m4 14 6-6 2-3" }],
    ["path", { "d": "M2 5h12" }],
    ["path", { "d": "M7 2h1" }],
    ["path", { "d": "m22 22-5-10-5 10" }],
    ["path", { "d": "M14 18h6" }]
  ];
  Icon($$renderer, spread_props([
    { name: "languages" },
    $$sanitized_props,
    {
      /**
       * @component @name Languages
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNSA4IDYgNiIgLz4KICA8cGF0aCBkPSJtNCAxNCA2LTYgMi0zIiAvPgogIDxwYXRoIGQ9Ik0yIDVoMTIiIC8+CiAgPHBhdGggZD0iTTcgMmgxIiAvPgogIDxwYXRoIGQ9Im0yMiAyMi01LTEwLTUgMTAiIC8+CiAgPHBhdGggZD0iTTE0IDE4aDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/languages
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
    let categoryType = store_get($$store_subs ??= {}, "$page", page).params.type;
    const categoryInfo = {
      trending: {
        title: "Trending",
        description: "Drama yang sedang populer minggu ini",
        icon: Trending_up
      },
      foryou: {
        title: "Untuk Kamu",
        description: "Rekomendasi drama berdasarkan preferensi",
        icon: Star
      },
      latest: {
        title: "Terbaru",
        description: "Drama yang baru ditambahkan",
        icon: Clock
      },
      vip: {
        title: "VIP Premium",
        description: "Konten eksklusif kualitas tinggi",
        icon: Crown
      },
      dubindo: {
        title: "Dubbing Indonesia",
        description: "Drama dengan dubbing Bahasa Indonesia",
        icon: Languages
      },
      populersearch: {
        title: "Paling Dicari",
        description: "Drama yang paling banyak dicari",
        icon: Star
      }
    };
    let info = categoryInfo[categoryType] || categoryInfo.trending;
    head("1yqwt2u", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(info.title)} - DRACIN</title>`);
      });
    });
    $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div class="flex items-center gap-4 mb-8"><div class="p-3 rounded-xl bg-brand-orange/20"><!---->`);
    info.icon($$renderer2, { class: "w-6 h-6 text-brand-orange" });
    $$renderer2.push(`<!----></div> <div><h1 class="text-2xl md:text-3xl font-bold">${escape_html(info.title)}</h1> <p class="text-gray-400 text-sm">${escape_html(info.description)}</p></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"><!--[-->`);
      const each_array = ensure_array_like(Array(12));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        $$renderer2.push(`<div class="aspect-[2/3] shimmer rounded-xl"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
