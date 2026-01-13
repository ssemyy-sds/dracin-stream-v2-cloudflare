import { g as store_get, h as head, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import { V as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/favorites.js";
import { L as Loader_circle } from "../../../../chunks/loader-circle.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.id;
    store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("ep");
    head("1oiicp0", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Loading...")} - DRACIN</title>`);
      });
    });
    $$renderer2.push(`<div class="fixed inset-0 bg-black flex items-center justify-center">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center">`);
      Loader_circle($$renderer2, { class: "w-12 h-12 text-brand-orange animate-spin" });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
