import { g as store_get, h as head, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
import { V as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "../../../../chunks/favorites.js";
import { L as Loader_circle } from "../../../../chunks/loader-circle.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.id;
    head("9y3fua", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Loading...")} - DRACIN</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center min-h-[60vh]">`);
      Loader_circle($$renderer2, { class: "w-10 h-10 text-brand-orange animate-spin" });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
