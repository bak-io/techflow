import {
    defaultData
} from "../data/default-data.js";


import {
    state,
    hydrateState
} from "./state/state.js";


import {
    loadState,
    saveState
} from "./storage/storage.js";


import {
    initSidebar
} from "./sidebar/sidebar.js";


import {
    renderWorkspace
} from "./workspace/workspace.js";


import {
    initSearch
} from "./search/search.js";


console.log(
    "TechFlow başlatılıyor."
);


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const savedState =
                await loadState();


            if (savedState) {

                hydrateState(
                    savedState
                );

            } else {

                hydrateState(
                    defaultData
                );


                /*
                 * İlk JSON dosyasını oluştur.
                 */

                saveState(
                    state
                );
            }


            initSidebar();

            renderWorkspace();

            initSearch();


            if (window.lucide) {
                window.lucide.createIcons();
            }


            console.log(
                "TechFlow hazır."
            );

        } catch (error) {

            console.error(
                "TechFlow başlatılamadı:",
                error
            );
        }
    }
);