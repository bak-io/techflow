import {
    state,
    getActiveNote,
    getActiveFolder,
    searchFocus
} from "../state/state.js";


import {
    saveState
} from "../storage/storage.js";


import {
    renderBlocks
} from "../blocks/blocks.js";


export function renderWorkspace(
    options = {}
) {

    const editor =
        document.getElementById(
            "editor"
        );


    const pageTitle =
        document.getElementById(
            "page-title"
        );


    const activeNote =
        getActiveNote();


    const activeFolder =
        getActiveFolder();


    /* ================================ */
    /* NO ACTIVE NOTE */
    /* ================================ */

    if (!activeNote) {

        pageTitle.textContent =
            activeFolder?.name ||
            "TechFlow";


        editor.innerHTML = `

            <div id="empty-workspace">

                <i
                    data-lucide="folder-open"
                    class="empty-icon"
                ></i>

                <h2>
                    ${activeFolder?.name || "TechFlow"}
                </h2>

                <p>
                    Bu klasörde henüz bir sayfa yok.
                </p>

            </div>

        `;


        if (window.lucide) {

            window.lucide.createIcons();
        }


        return;
    }


    /* ================================ */
    /* PAGE TITLE */
    /* ================================ */

    pageTitle.textContent =
        activeNote.title;


    editor.innerHTML = "";


    /* ================================ */
    /* TITLE INPUT */
    /* ================================ */

    const titleInput =
        document.createElement(
            "input"
        );


    titleInput.className =
        "page-title-input";


    titleInput.value =
        activeNote.title;


    titleInput.placeholder =
        "Sayfa başlığı";


    titleInput.addEventListener(
        "input",
        () => {

            activeNote.title =
                titleInput.value;


            pageTitle.textContent =
                activeNote.title ||
                "Yeni Sayfa";


            saveState(
                state
            );


            updateSaveStatus();
        }
    );


    editor.appendChild(
        titleInput
    );


    /* ================================ */
    /* BLOCK CONTAINER */
    /* ================================ */

    const blocksContainer =
        document.createElement(
            "div"
        );


    blocksContainer.className =
        "blocks-container";


    editor.appendChild(
        blocksContainer
    );


    /* ================================ */
    /* RERENDER */
    /* ================================ */

    const rerender =
        () =>
            renderWorkspace();


    /* ================================ */
    /* RENDER BLOCKS */
    /* ================================ */

    renderBlocks(
        activeNote,
        blocksContainer,
        rerender
    );


    /* ================================ */
    /* SEARCH FOCUS */
    /* ================================ */

    if (
        options.focusSearchResult &&
        searchFocus.noteId ===
            activeNote.id
    ) {

        focusSearchResult(
            activeNote,
            titleInput
        );
    }
}


/* ================================ */
/* SEARCH FOCUS */
/* ================================ */

function focusSearchResult(
    note,
    titleInput
) {

    requestAnimationFrame(
        () => {

            /*
             * Sayfa başlığı eşleştiyse
             * doğrudan başlığa git.
             */

            if (
                !searchFocus.blockId
            ) {

                titleInput.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );


                titleInput.focus();


                return;
            }


            /*
             * İlgili bloğu bul.
             */

            const targetBlock =
                document.querySelector(
                    `[data-block-id="${searchFocus.blockId}"]`
                );


            if (!targetBlock) {

                console.warn(
                    "Arama hedef bloğu bulunamadı:",
                    searchFocus.blockId
                );


                return;
            }


            /*
             * Bloğu ekranın ortasına getir.
             */

            targetBlock.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "center"
                }
            );


            /*
             * Fokus görünümü.
             */

            targetBlock.classList.add(
                "search-focus"
            );


            const textarea =
                targetBlock.querySelector(
                    "textarea"
                );


            /*
             * Aranan cümleyi textarea içinde
             * seçili hale getir.
             */

            if (
                textarea &&
                searchFocus.query
            ) {

                const text =
                    textarea.value;


                const query =
                    searchFocus.query;


                const index =
                    text
                        .toLowerCase()
                        .indexOf(
                            query.toLowerCase()
                        );


                /*
                 * Bir sonraki frame'de focus.
                 *
                 * Böylece smooth scroll ile
                 * textarea focus birbirine girmez.
                 */

                requestAnimationFrame(
                    () => {

                        textarea.focus();


                        if (
                            index !== -1
                        ) {

                            textarea.setSelectionRange(
                                index,
                                index +
                                query.length
                            );
                        }
                    }
                );
            }
        }
    );
}


/* ================================ */
/* SAVE STATUS */
/* ================================ */

function updateSaveStatus() {

    const status =
        document.getElementById(
            "save-status"
        );


    status.innerHTML = `
        <i data-lucide="check"></i>
        <span>Kaydedildi</span>
    `;


    if (window.lucide) {

        window.lucide.createIcons();
    }


    clearTimeout(
        updateSaveStatus.timeout
    );


    updateSaveStatus.timeout =
        setTimeout(
            () => {

                status.innerHTML = `
                    <i data-lucide="cloud-check"></i>
                    <span>Otomatik kayıt</span>
                `;


                if (window.lucide) {

                    window.lucide.createIcons();
                }

            },
            1500
        );
}