import { s as sanitize_props, a as spread_props, b as slot, d as attr, f as stringify } from "./index2.js";
import { I as Icon } from "./Icon.js";
import { S as Star } from "./star.js";
import { V as escape_html } from "./context.js";
function Eye($$renderer, $$props) {
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
      {
        "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eye" },
    $$sanitized_props,
    {
      /**
       * @component @name Eye
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
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
function Play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["polygon", { "points": "6 3 20 12 6 21 6 3" }]];
  Icon($$renderer, spread_props([
    { name: "play" },
    $$sanitized_props,
    {
      /**
       * @component @name Play
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWdvbiBwb2ludHM9IjYgMyAyMCAxMiA2IDIxIDYgMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/play
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
function fixUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}
function formatViewCount(count) {
  if (!count) return "0";
  if (count >= 1e6) {
    return `${(count / 1e6).toFixed(1)}M`;
  }
  if (count >= 1e3) {
    return `${(count / 1e3).toFixed(1)}K`;
  }
  return count.toString();
}
function DramaCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { drama, compact = false } = $$props;
    $$renderer2.push(`<a${attr("href", `/detail/${stringify(drama.bookId)}`)} class="group relative block overflow-hidden rounded-xl bg-brand-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-orange/10"><div class="relative aspect-[2/3] overflow-hidden"><img${attr("src", fixUrl(drama.cover))}${attr("alt", drama.bookName)} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div> `);
    if (drama.cornerLabel) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute top-2 left-2"><span class="px-2 py-1 text-xs font-semibold rounded-md bg-brand-orange/90 backdrop-blur-sm">${escape_html(drama.cornerLabel)}</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (drama.latestEpisode) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute top-2 right-2 px-2 py-1 rounded-md glass text-xs font-medium">Ep ${escape_html(drama.latestEpisode)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div class="w-14 h-14 rounded-full bg-brand-orange/90 flex items-center justify-center backdrop-blur-sm shadow-lg transform scale-75 group-hover:scale-100 transition-transform">`);
    Play($$renderer2, { class: "w-6 h-6 text-white fill-white ml-1" });
    $$renderer2.push(`<!----></div></div> `);
    if (drama.viewCount) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-blue-600/90 backdrop-blur-sm text-xs font-medium flex items-center gap-1">`);
      Eye($$renderer2, { class: "w-3 h-3" });
      $$renderer2.push(`<!----> ${escape_html(formatViewCount(drama.viewCount))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="p-3 space-y-1"><h3 class="font-semibold text-sm line-clamp-2 group-hover:text-brand-orange transition-colors">${escape_html(drama.bookName)}</h3> `);
    if (!compact) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-2 text-xs text-gray-400">`);
      if (drama.rating) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="flex items-center gap-1">`);
        Star($$renderer2, { class: "w-3 h-3 text-yellow-500 fill-yellow-500" });
        $$renderer2.push(`<!----> ${escape_html(drama.rating.toFixed(1))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (drama.year) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span>• ${escape_html(drama.year)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex items-center gap-1 text-xs text-gray-400">`);
      if (drama.rating) {
        $$renderer2.push("<!--[-->");
        Star($$renderer2, { class: "w-3 h-3 text-yellow-500 fill-yellow-500" });
        $$renderer2.push(`<!----> <span>${escape_html(drama.rating.toFixed(1))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></a>`);
  });
}
export {
  DramaCard as D
};
