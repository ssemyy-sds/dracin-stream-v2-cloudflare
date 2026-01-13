import { g as store_get, h as head, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { p as page } from "../../../chunks/stores.js";
import { D as DramaCard } from "../../../chunks/DramaCard.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import { S as Search } from "../../../chunks/search.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let query = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("q") || "";
    let results = [];
    head("e12qt1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Cari: ${escape_html(query || "Search")} - DRACIN</title>`);
      });
    });
    $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div class="mb-8"><h1 class="text-2xl md:text-3xl font-bold mb-2">Hasil Pencarian</h1> `);
    if (query) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-400">`);
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(results.length)} hasil untuk "${escape_html(query)}"`);
      }
      $$renderer2.push(`<!--]--></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
      if (results.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"><!--[-->`);
        const each_array = ensure_array_like(results);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let drama = each_array[$$index];
          DramaCard($$renderer2, { drama });
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="text-center py-20"><div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gray mb-4">`);
          Search($$renderer2, { class: "w-8 h-8 text-gray-400" });
          $$renderer2.push(`<!----></div> <h2 class="text-xl font-semibold mb-2">Cari Drama</h2> <p class="text-gray-400">Masukkan kata kunci untuk mencari drama favorit</p></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
