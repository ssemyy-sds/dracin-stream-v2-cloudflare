import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
    return {
        flags: {
            modePopupEnabled: platform?.env?.MODE_POPUP_ENABLED !== 'false'
        }
    };
};
