import {
    state
} from "../state/state.js";

import {
    saveState
} from "../storage/storage.js";


const BLOCK_TYPES = {
    command: "Komut",
    code: "Kod",
    text: "Açıklama",
    error: "Hata",
    solution: "Çözüm",
    result: "Sonuç"
};


/* ================================ */
/* CREATE ID */
/* ================================ */

function createId() {

    return `block-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}


/* ================================ */
/* COPY */
/* ================================ */

async function copyToClipboard(text) {

    if (!text) {
        return false;
    }


    try {

        if (
            window.techflow &&
            window.techflow.copyText
        ) {

            await window.techflow.copyText(
                text
            );

            return true;
        }


        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;
        }


        const temporaryTextarea =
            document.createElement(
                "textarea"
            );


        temporaryTextarea.value =
            text;


        temporaryTextarea.style.position =
            "fixed";

        temporaryTextarea.style.opacity =
            "0";


        document.body.appendChild(
            temporaryTextarea
        );


        temporaryTextarea.focus();

        temporaryTextarea.select();


        const successful =
            document.execCommand(
                "copy"
            );


        temporaryTextarea.remove();


        return successful;

    } catch (error) {

        console.error(
            "Kopyalama başarısız:",
            error
        );


        return false;
    }
}


/* ================================ */
/* ADD BLOCK */
/* ================================ */

export function addBlock(
    note,
    type
) {

    note.blocks.push({

        id:
            createId(),

        type,

        content:
            ""
    });


    saveState(
        state
    );
}


/* ================================ */
/* REMOVE BLOCK */
/* ================================ */

export function removeBlock(
    note,
    blockId
) {

    note.blocks =
        note.blocks.filter(
            block =>
                block.id !== blockId
        );


    saveState(
        state
    );
}


/* ================================ */
/* RENDER BLOCKS */
/* ================================ */

export function renderBlocks(
    note,
    container,
    rerender
) {

    container.innerHTML = "";


    note.blocks.forEach(
        block => {

            /* ================================ */
            /* BLOCK */
            /* ================================ */

            const blockElement =
                document.createElement(
                    "div"
                );


            blockElement.className =
                `block ${block.type}`;


            /*
             * Arama focusunun hedefi.
             */

            blockElement.dataset.blockId =
                block.id;


            /* ================================ */
            /* HEADER */
            /* ================================ */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "block-header";


            const typeInfo =
                document.createElement(
                    "div"
                );


            typeInfo.className =
                "block-type";


            let iconName =
                "file-text";


            if (
                block.type === "command"
            ) {

                iconName =
                    "terminal";
            }


            if (
                block.type === "code"
            ) {

                iconName =
                    "code-2";
            }


            if (
                block.type === "error"
            ) {

                iconName =
                    "circle-alert";
            }


            if (
                block.type === "solution"
            ) {

                iconName =
                    "lightbulb";
            }


            if (
                block.type === "result"
            ) {

                iconName =
                    "circle-check";
            }


            typeInfo.innerHTML = `
                <i data-lucide="${iconName}"></i>
                <span>
                    ${BLOCK_TYPES[block.type] || "Blok"}
                </span>
            `;


            /* ================================ */
            /* ACTIONS */
            /* ================================ */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "block-actions";


            /* ================================ */
            /* COPY BUTTON */
            /* ================================ */

            if (
                block.type === "command" ||
                block.type === "code"
            ) {

                const copyButton =
                    document.createElement(
                        "button"
                    );


                copyButton.className =
                    "block-action copy-button";


                copyButton.type =
                    "button";


                copyButton.title =
                    "Kopyala";


                copyButton.innerHTML = `
                    <i data-lucide="copy"></i>
                `;


                copyButton.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();


                        const copied =
                            await copyToClipboard(
                                block.content
                            );


                        if (!copied) {
                            return;
                        }


                        copyButton.title =
                            "Kopyalandı";


                        copyButton.innerHTML = `
                            <i data-lucide="check"></i>
                        `;


                        if (window.lucide) {

                            window.lucide
                                .createIcons();
                        }


                        setTimeout(
                            () => {

                                copyButton.title =
                                    "Kopyala";


                                copyButton.innerHTML = `
                                    <i data-lucide="copy"></i>
                                `;


                                if (
                                    window.lucide
                                ) {

                                    window.lucide
                                        .createIcons();
                                }

                            },
                            1200
                        );
                    }
                );


                actions.appendChild(
                    copyButton
                );
            }


            /* ================================ */
            /* DELETE BUTTON */
            /* ================================ */

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "block-action block-delete";


            deleteButton.type =
                "button";


            deleteButton.title =
                "Bloğu sil";


            deleteButton.innerHTML = `
                <i data-lucide="trash-2"></i>
            `;


            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    removeBlock(
                        note,
                        block.id
                    );


                    rerender();
                }
            );


            actions.appendChild(
                deleteButton
            );


            header.append(
                typeInfo,
                actions
            );


            /* ================================ */
            /* BODY */
            /* ================================ */

            const body =
                document.createElement(
                    "div"
                );


            body.className =
                `block-body ${block.type}`;


            /* ================================ */
            /* TEXTAREA */
            /* ================================ */

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.placeholder =
                BLOCK_TYPES[
                    block.type
                ] || "İçerik";


            textarea.value =
                block.content;


            textarea.addEventListener(
                "input",
                () => {

                    block.content =
                        textarea.value;


                    saveState(
                        state
                    );
                }
            );


            /* ================================ */
            /* COMMAND PROMPT */
            /* ================================ */

            if (
                block.type === "command"
            ) {

                const prompt =
                    document.createElement(
                        "span"
                    );


                prompt.className =
                    "terminal-prompt";


                prompt.textContent =
                    "$";


                body.append(
                    prompt,
                    textarea
                );

            } else {

                body.appendChild(
                    textarea
                );
            }


            /* ================================ */
            /* APPEND BLOCK */
            /* ================================ */

            blockElement.append(
                header,
                body
            );


            container.appendChild(
                blockElement
            );
        }
    );


    /* ================================ */
    /* BLOCK TOOLBAR */
    /* ================================ */

    const toolbar =
        document.createElement(
            "div"
        );


    toolbar.className =
        "block-toolbar";


    Object.entries(
        BLOCK_TYPES
    ).forEach(
        ([type, label]) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                `+ ${label}`;


            button.addEventListener(
                "click",
                () => {

                    addBlock(
                        note,
                        type
                    );


                    rerender();
                }
            );


            toolbar.appendChild(
                button
            );
        }
    );


    container.appendChild(
        toolbar
    );


    /* ================================ */
    /* LUCIDE */
    /* ================================ */

    if (window.lucide) {

        window.lucide.createIcons();
    }
}