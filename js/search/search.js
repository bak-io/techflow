import {
    state,
    searchFocus
} from "../state/state.js";


import {
    selectNote
} from "../notes/notes.js";


import {
    saveState
} from "../storage/storage.js";


import {
    renderWorkspace
} from "../workspace/workspace.js";


const BLOCK_LABELS = {
    command: "Komut",
    code: "Kod",
    text: "Açıklama",
    error: "Hata",
    solution: "Çözüm",
    result: "Sonuç"
};


/* ================================ */
/* CREATE SNIPPET */
/* ================================ */

function createSnippet(
    text,
    query,
    maxLength = 140
) {

    if (!text) {
        return "";
    }


    const cleanText =
        text
            .replace(/\s+/g, " ")
            .trim();


    if (!cleanText) {
        return "";
    }


    const lowerText =
        cleanText.toLowerCase();


    const lowerQuery =
        query.toLowerCase();


    const matchIndex =
        lowerText.indexOf(
            lowerQuery
        );


    /*
     * Aranan ifade bulunamıyorsa
     * metnin başından göster.
     */

    if (matchIndex === -1) {

        return (
            cleanText.length > maxLength
                ? `${cleanText.slice(0, maxLength)}...`
                : cleanText
        );
    }


    /*
     * Aranan ifadenin öncesinden ve
     * sonrasından kısa bir bağlam al.
     */

    const contextBefore = 45;

    const contextAfter = 80;


    const start =
        Math.max(
            0,
            matchIndex - contextBefore
        );


    const end =
        Math.min(
            cleanText.length,
            matchIndex +
            lowerQuery.length +
            contextAfter
        );


    let snippet =
        cleanText.slice(
            start,
            end
        );


    if (start > 0) {
        snippet =
            `...${snippet}`;
    }


    if (end < cleanText.length) {
        snippet =
            `${snippet}...`;
    }


    return snippet;
}


/* ================================ */
/* FIND MATCH */
/* ================================ */

function findMatch(
    note,
    query
) {

    const lowerQuery =
        query.toLowerCase();


    /*
     * Önce sayfa başlığına bak.
     */

    if (
        note.title
            .toLowerCase()
            .includes(
                lowerQuery
            )
    ) {

        const firstBlock =
            note.blocks.find(
                block =>
                    block.content?.trim()
            );


        return {

            type:
                firstBlock
                    ? BLOCK_LABELS[
                        firstBlock.type
                    ]
                    : "Sayfa",


            snippet:
                firstBlock
                    ? createSnippet(
                        firstBlock.content,
                        query
                    )
                    : "Bu sayfanın başlığı eşleşti.",


            blockId:
                firstBlock?.id || null
        };
    }


    /*
     * Sonra blok içeriklerine bak.
     */

    for (
        const block
        of note.blocks
    ) {

        if (
            !block.content
        ) {
            continue;
        }


        if (
            block.content
                .toLowerCase()
                .includes(
                    lowerQuery
                )
        ) {

            return {

                type:
                    BLOCK_LABELS[
                        block.type
                    ] || "İçerik",


                snippet:
                    createSnippet(
                        block.content,
                        query
                    ),


                blockId:
                    block.id
            };
        }
    }


    return {

        type: "İçerik",

        snippet:
            "Eşleşen içerik bulundu.",

        blockId: null
    };
}


/* ================================ */
/* RENDER RESULTS */
/* ================================ */

function renderResults(
    query,
    results
) {

    results.innerHTML = "";


    if (!query) {
        return;
    }


    const matches =
        state.notes.filter(
            note => {

                const titleMatch =
                    note.title
                        .toLowerCase()
                        .includes(
                            query
                        );


                const contentMatch =
                    note.blocks.some(
                        block =>
                            block.content
                                ?.toLowerCase()
                                .includes(
                                    query
                                )
                    );


                return (
                    titleMatch ||
                    contentMatch
                );
            }
        );


    if (
        matches.length === 0
    ) {

        results.innerHTML = `
            <div class="search-empty">
                <i data-lucide="search-x"></i>

                <span>
                    Sonuç bulunamadı.
                </span>
            </div>
        `;


        if (window.lucide) {
            window.lucide.createIcons();
        }


        return;
    }


    matches.forEach(
        note => {

            const match =
                findMatch(
                    note,
                    query
                );


            const result =
                document.createElement(
                    "button"
                );


            result.className =
                "search-result";


            result.type =
                "button";


            result.innerHTML = `

                <div class="search-result-header">

                    <div class="search-result-title">

                        <i
                            data-lucide="file-text"
                        ></i>

                        <span>
                            ${note.title}
                        </span>

                    </div>


                    <span class="search-result-type">
                        ${match.type}
                    </span>

                </div>


                <div class="search-result-snippet">
                    ${match.snippet}
                </div>
            `;


            result.addEventListener(
                "click",
                () => {

                    selectNote(
                        note.id
                    );


                    searchFocus.noteId =
                        note.id;


                    searchFocus.blockId =
                        match.blockId;


                    searchFocus.query =
                        query;


                    saveState(
                        state
                    );


                    dialogClose();


                    renderWorkspace(
                        {
                            focusSearchResult: true
                        }
                    );
                }
            );


            results.appendChild(
                result
            );
        }
    );


    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ================================ */
/* DIALOG CLOSE */
/* ================================ */

function dialogClose() {

    const dialog =
        document.getElementById(
            "search-modal"
        );


    if (
        dialog?.open
    ) {
        dialog.close();
    }
}


/* ================================ */
/* OPEN SEARCH */
/* ================================ */

function openSearch() {

    const dialog =
        document.getElementById(
            "search-modal"
        );


    const input =
        document.getElementById(
            "search-input"
        );


    const results =
        document.getElementById(
            "search-results"
        );


    dialog.showModal();


    input.value = "";


    results.innerHTML = "";


    input.focus();


    /*
     * Önceki input listener'ını temizlemek için
     * yeni input elementine event bağlamak yerine
     * clone kullanıyoruz.
     */

    const freshInput =
        input.cloneNode(true);


    input.replaceWith(
        freshInput
    );


    freshInput.focus();


    freshInput.addEventListener(
        "input",
        () => {

            const query =
                freshInput.value
                    .trim()
                    .toLowerCase();


            renderResults(
                query,
                results
            );
        }
    );


    freshInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                event.preventDefault();

                dialogClose();
            }
        }
    );
}


/* ================================ */
/* INIT SEARCH */
/* ================================ */

export function initSearch() {

    const searchButton =
        document.getElementById(
            "search-button"
        );


    if (!searchButton) {
        return;
    }


    searchButton.addEventListener(
        "click",
        openSearch
    );
}