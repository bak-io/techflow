import { state } from "../state/state.js";
import { saveState } from "../storage/storage.js";


function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}


/* ================================ */
/* CREATE FOLDER */
/* ================================ */

export function createFolder(name) {

    const cleanName =
        name.trim();

    if (!cleanName) {
        return null;
    }


    const folder = {
        id: createId("folder"),
        name: cleanName
    };


    state.folders.push(folder);

    state.activeFolderId =
        folder.id;

    state.activeNoteId =
        null;


    saveState(state);

    return folder;
}


/* ================================ */
/* DELETE FOLDER */
/* ================================ */

export function deleteFolder(folderId) {

    const folderIndex =
        state.folders.findIndex(
            folder =>
                folder.id === folderId
        );


    if (folderIndex === -1) {
        return;
    }


    /*
     * Klasörü sil
     */

    state.folders.splice(
        folderIndex,
        1
    );


    /*
     * Klasöre ait bütün sayfaları sil
     */

    state.notes =
        state.notes.filter(
            note =>
                note.folderId !== folderId
        );


    /*
     * Silinen klasör aktif klasörse
     * başka klasöre geç
     */

    if (
        state.activeFolderId === folderId
    ) {

        const nextFolder =
            state.folders[0] || null;


        state.activeFolderId =
            nextFolder?.id || null;


        if (nextFolder) {

            const nextNote =
                state.notes.find(
                    note =>
                        note.folderId ===
                        nextFolder.id
                );


            state.activeNoteId =
                nextNote?.id || null;

        } else {

            state.activeNoteId =
                null;
        }
    }


    saveState(state);
}