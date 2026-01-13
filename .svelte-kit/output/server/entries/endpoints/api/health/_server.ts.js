import { json } from "@sveltejs/kit";
import { D as DEFAULT_API_ID, A as API_CONFIGS } from "../../../../chunks/apis.config.js";
const GET = async ({ platform }) => {
  try {
    let activeApiId = DEFAULT_API_ID;
    let kvStatus = "Not Connected";
    let kvError = null;
    if (platform?.env?.API_CONFIG) {
      try {
        const config = await platform.env.API_CONFIG.get("config", "json");
        if (config && config.activeApiId) {
          activeApiId = config.activeApiId;
        }
        kvStatus = "Connected";
      } catch (e) {
        kvStatus = "Error";
        kvError = e.message;
      }
    } else {
      kvStatus = "Missing Platform Env";
    }
    const activeConfig = API_CONFIGS.find((api) => api.id === activeApiId);
    return json({
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      kvStatus,
      kvError,
      activeApi: {
        id: activeApiId,
        name: activeConfig?.name || "Unknown",
        baseUrl: activeConfig?.baseUrl || "Unknown",
        queryFormat: activeConfig?.queryFormat
      },
      availableApis: API_CONFIGS.map((a) => a.id)
    });
  } catch (error) {
    return json({
      success: false,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, { status: 500 });
  }
};
export {
  GET
};
