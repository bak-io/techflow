import {
    state,
    getNotesByFolder,
    hydrateState
} from "../state/state.js";

import {
    createFolder,
    deleteFolder
} from "../folders/folders.js";


import {
    createNote,
    selectNote,
    deleteNote
} from "../notes/notes.js";


import {
    saveState,
    importState,
    exportState,
    createBackup
} from "../storage/storage.js";

import {
    renderWorkspace
} from "../workspace/workspace.js";


let initialized = false;
let contextMenuInitialized = false;


/* ================================ */
/* INPUT DIALOG */
/* ================================ */

function openInputDialog(
    title,
    placeholder
) {

    return new Promise(
        resolve => {

            const dialog =
                document.getElementById(
                    "input-modal"
                );


            const titleElement =
                document.getElementById(
                    "input-modal-title"
                );


            const input =
                document.getElementById(
                    "input-modal-input"
                );


            const cancelButton =
                document.getElementById(
                    "input-modal-cancel"
                );


            const confirmButton =
                document.getElementById(
                    "input-modal-confirm"
                );


            titleElement.textContent =
                title;


            input.placeholder =
                placeholder;


            input.value = "";


            const cleanup = () => {

                cancelButton.onclick =
                    null;

                confirmButton.onclick =
                    null;

                dialog.oncancel =
                    null;
            };


            const finish = value => {

                cleanup();

                dialog.close();

                resolve(value);
            };


            cancelButton.onclick = () => {
                finish(null);
            };


            confirmButton.onclick = () => {

                finish(
                    input.value
                );
            };


            dialog.oncancel =
                event => {

                    event.preventDefault();

                    finish(null);
                };


            dialog.showModal();

            input.focus();
        }
    );
}


/* ================================ */
/* DELETE DIALOG */
/* ================================ */

function openDeleteDialog(
    title,
    message
) {

    return new Promise(
        resolve => {

            const dialog =
                document.getElementById(
                    "delete-modal"
                );


            const titleElement =
                dialog.querySelector(
                    "h2"
                );


            const messageElement =
                document.getElementById(
                    "delete-modal-message"
                );


            const cancelButton =
                document.getElementById(
                    "delete-modal-cancel"
                );


            const confirmButton =
                document.getElementById(
                    "delete-modal-confirm"
                );


            titleElement.textContent =
                title;


            messageElement.textContent =
                message;


            const cleanup = () => {

                cancelButton.onclick =
                    null;

                confirmButton.onclick =
                    null;

                dialog.oncancel =
                    null;
            };


            const finish = value => {

                cleanup();

                dialog.close();

                resolve(value);
            };


            cancelButton.onclick = () => {
                finish(false);
            };


            confirmButton.onclick = () => {
                finish(true);
            };


            dialog.oncancel =
                event => {

                    event.preventDefault();

                    finish(false);
                };


            dialog.showModal();

            cancelButton.focus();
        }
    );
}


/* ================================ */
/* CONTEXT MENU */
/* ================================ */

function createContextMenu() {

    if (
        document.getElementById(
            "folder-context-menu"
        )
    ) {
        return document.getElementById(
            "folder-context-menu"
        );
    }


    const menu =
        document.createElement("div");


    menu.id =
        "folder-context-menu";

    menu.className =
        "context-menu";


    menu.innerHTML = `
        <button
            type="button"
            class="context-menu-danger"
            data-action="delete-folder"
        >
            <i data-lucide="trash-2"></i>
            <span>Klasörü sil</span>
        </button>
    `;


    document.body.appendChild(menu);


    if (window.lucide) {
        window.lucide.createIcons();
    }


    return menu;
}


function closeContextMenu() {

    const menu =
        document.getElementById(
            "folder-context-menu"
        );


    if (!menu) {
        return;
    }


    menu.classList.remove("visible");

    menu.removeAttribute(
        "data-folder-id"
    );
}


function showFolderContextMenu(
    event,
    folder
) {

    event.preventDefault();

    event.stopPropagation();


    const menu =
        createContextMenu();


    menu.dataset.folderId =
        folder.id;


    menu.classList.add(
        "visible"
    );


    /*
     * Önce görünür hale getiriyoruz.
     * Sonra ekran dışına taşmasını engelliyoruz.
     */

    const menuWidth =
        menu.offsetWidth;

    const menuHeight =
        menu.offsetHeight;


    let left =
        event.clientX;

    let top =
        event.clientY;


    if (
        left + menuWidth >
        window.innerWidth - 8
    ) {

        left =
            window.innerWidth -
            menuWidth -
            8;
    }


    if (
        top + menuHeight >
        window.innerHeight - 8
    ) {

        top =
            window.innerHeight -
            menuHeight -
            8;
    }


    menu.style.left =
        `${left}px`;


    menu.style.top =
        `${top}px`;
}


/* ================================ */
/* CONTEXT MENU INIT */
/* ================================ */

function initContextMenu() {

    if (contextMenuInitialized) {
        return;
    }


    contextMenuInitialized = true;


    const menu =
        createContextMenu();


    const deleteButton =
        menu.querySelector(
            '[data-action="delete-folder"]'
        );


    /* ================================ */
    /* MENU ITEM */
    /* ================================ */

    deleteButton.addEventListener(
        "click",
        async event => {

            event.stopPropagation();


            const folderId =
                menu.dataset.folderId;


            if (!folderId) {
                closeContextMenu();

                return;
            }


            const folder =
                state.folders.find(
                    item =>
                        item.id === folderId
                );


            if (!folder) {
                closeContextMenu();

                return;
            }


            const noteCount =
                getNotesByFolder(
                    folder.id
                ).length;


            const pageText =
                noteCount === 1
                    ? "1 sayfa"
                    : `${noteCount} sayfa`;


            closeContextMenu();


            const confirmed =
                await openDeleteDialog(
                    "Klasörü sil",
                    `"${folder.name}" klasörü ve içindeki ${pageText} kalıcı olarak silinecek. Bu işlemi yapmak istediğine emin misin?`
                );


            if (!confirmed) {
                return;
            }


            deleteFolder(
                folder.id
            );


            render();

            renderWorkspace();
        }
    );


    /* ================================ */
    /* OUTSIDE CLICK */
    /* ================================ */

    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(
                    event.target
                )
            ) {
                closeContextMenu();
            }
        }
    );


    /* ================================ */
    /* CONTEXT MENU OUTSIDE */
    /* ================================ */

    document.addEventListener(
        "contextmenu",
        event => {

            const folderRow =
                event.target.closest(
                    ".folder-row"
                );


            if (!folderRow) {
                closeContextMenu();
            }
        }
    );
}

/* ================================ */
/* RENDER SIDEBAR */
/* ================================ */

function render() {

    const folderList =
        document.getElementById(
            "folder-list"
        );


    folderList.innerHTML = "";


    state.folders.forEach(
        folder => {

            /* ================================ */
            /* FOLDER */
            /* ================================ */

            const folderContainer =
                document.createElement("div");


            folderContainer.className =
                "folder-container";


            const folderButton =
                document.createElement("button");


            folderButton.className =
                "folder-row";


            folderButton.type =
                "button";


            if (
                state.activeFolderId ===
                folder.id
            ) {
                folderButton.classList.add(
                    "active"
                );
            }


            folderButton.innerHTML = `
                <i data-lucide="folder"></i>
                <span>${folder.name}</span>
            `;


            folderButton.addEventListener(
                "click",
                () => {

                    state.activeFolderId =
                        folder.id;


                    const notes =
                        getNotesByFolder(
                            folder.id
                        );


                    state.activeNoteId =
                        notes[0]?.id ||
                        null;


                    saveState(state);

                    render();

                    renderWorkspace();
                }
            );


            folderButton.addEventListener(
                "contextmenu",
                event => {

                    showFolderContextMenu(
                        event,
                        folder
                    );
                }
            );


            folderContainer.appendChild(
                folderButton
            );


            /* ================================ */
            /* NOTES */
            /* ================================ */

            const notes =
                getNotesByFolder(
                    folder.id
                );


            const noteList =
                document.createElement("div");


            noteList.className =
                "note-list";


            notes.forEach(
                note => {

                    const noteItem =
                        document.createElement("div");


                    noteItem.className =
                        "note-item";


                    const noteButton =
                        document.createElement("button");


                    noteButton.className =
                        "note-row";


                    noteButton.type =
                        "button";


                    if (
                        state.activeNoteId ===
                        note.id
                    ) {
                        noteButton.classList.add(
                            "active"
                        );
                    }


                    noteButton.innerHTML = `
                        <i data-lucide="file-text"></i>
                        <span>${note.title}</span>
                    `;


                    noteButton.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            selectNote(
                                note.id
                            );


                            render();

                            renderWorkspace();
                        }
                    );


                    const deleteButton =
                        document.createElement(
                            "button"
                        );


                    deleteButton.className =
                        "note-delete";


                    deleteButton.type =
                        "button";


                    deleteButton.title =
                        "Sayfayı sil";


                    deleteButton.innerHTML = `
                        <i data-lucide="trash-2"></i>
                    `;


                    deleteButton.addEventListener(
                        "click",
                        async event => {

                            event.stopPropagation();


                            const confirmed =
                                await openDeleteDialog(
                                    "Sayfayı sil",
                                    `"${note.title}" sayfası kalıcı olarak silinecek. Bu işlemi yapmak istediğine emin misin?`
                                );


                            if (!confirmed) {
                                return;
                            }


                            deleteNote(
                                note.id
                            );


                            render();

                            renderWorkspace();
                        }
                    );


                    noteItem.append(
                        noteButton,
                        deleteButton
                    );


                    noteList.appendChild(
                        noteItem
                    );
                }
            );


            folderContainer.appendChild(
                noteList
            );


            folderList.appendChild(
                folderContainer
            );
        }
    );


    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ================================ */
/* INIT SIDEBAR */
/* ================================ */

export function initSidebar() {

    /* ================================ */
    /* RE-INIT KONTROLÜ */
    /* ================================ */

    if (initialized) {

        render();

        return;
    }


    initialized = true;


    /* ================================ */
    /* CONTEXT MENU */
    /* ================================ */

    initContextMenu();


    /* ================================ */
    /* SETTINGS */
    /* ================================ */

    const settingsButton =
        document.getElementById(
            "settings-button"
        );


    const settingsModal =
        document.getElementById(
            "settings-modal"
        );


    const settingsCloseButton =
        document.getElementById(
            "settings-close-button"
        );


    const settingsStatus =
        document.getElementById(
            "settings-status"
        );


    const importJsonButton =
        document.getElementById(
            "import-json-button"
        );


    const exportJsonButton =
        document.getElementById(
            "export-json-button"
        );


    const backupJsonButton =
        document.getElementById(
            "backup-json-button"
        );


    /* ================================ */
    /* OPEN SETTINGS */
    /* ================================ */

    settingsButton.addEventListener(
        "click",
        () => {

            settingsStatus.textContent =
                "";

            settingsModal.showModal();


            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    );


    /* ================================ */
    /* CLOSE SETTINGS */
    /* ================================ */

    settingsCloseButton.addEventListener(
        "click",
        () => {

            settingsModal.close();
        }
    );


    /* ================================ */
    /* IMPORT JSON */
    /* ================================ */

    importJsonButton.addEventListener(
        "click",
        async () => {

            const result =
                await importState();


            if (
                result?.canceled
            ) {
                return;
            }


            if (
                !result?.success
            ) {

                settingsStatus.textContent =
                    "İçe aktarma başarısız.";

                return;
            }


            hydrateState(
                result.data
            );


            saveState(
                state
            );


            render();

            renderWorkspace();


            settingsStatus.textContent =
                "JSON başarıyla içe aktarıldı.";
        }
    );


    /* ================================ */
    /* EXPORT JSON */
    /* ================================ */

    exportJsonButton.addEventListener(
        "click",
        async () => {

            const result =
                await exportState(
                    state
                );


            if (
                result?.canceled
            ) {
                return;
            }


            if (
                !result?.success
            ) {

                settingsStatus.textContent =
                    "Dışa aktarma başarısız.";

                return;
            }


            settingsStatus.textContent =
                "JSON başarıyla dışa aktarıldı.";
        }
    );


    /* ================================ */
    /* MANUAL BACKUP */
    /* ================================ */

    backupJsonButton.addEventListener(
        "click",
        async () => {

            const result =
                await createBackup();


            if (
                !result?.success
            ) {

                settingsStatus.textContent =
                    "Yedek oluşturulamadı.";

                return;
            }


            settingsStatus.textContent =
                "Yedek başarıyla oluşturuldu.";
        }
    );


    /* ================================ */
    /* NEW FOLDER */
    /* ================================ */

    document
        .getElementById(
            "new-folder-button"
        )
        .addEventListener(
            "click",
            async () => {

                const name =
                    await openInputDialog(
                        "Yeni Klasör",
                        "Klasör adı..."
                    );


                if (
                    !name?.trim()
                ) {
                    return;
                }


                createFolder(
                    name
                );


                render();

                renderWorkspace();
            }
        );


    /* ================================ */
    /* NEW NOTE */
    /* ================================ */

    document
        .getElementById(
            "new-note-button"
        )
        .addEventListener(
            "click",
            async () => {

                if (
                    !state.activeFolderId
                ) {
                    return;
                }


                const title =
                    await openInputDialog(
                        "Yeni Sayfa",
                        "Sayfa adı..."
                    );


                if (
                    !title?.trim()
                ) {
                    return;
                }


                createNote(
                    state.activeFolderId,
                    title
                );


                render();

                renderWorkspace();
            }
        );


    /* ================================ */
    /* INITIAL RENDER */
    /* ================================ */

    render();
}