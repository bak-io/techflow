import {
    state
} from "../state/state.js";

import {
    saveState
} from "../storage/storage.js";


function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}


/* ================================ */
/* CREATE NOTE */
/* ================================ */

export function createNote(
    folderId,
    title = "Yeni Sayfa"
) {

    if (!folderId) {
        return null;
    }


    const cleanTitle =
        title.trim();


    if (!cleanTitle) {
        return null;
    }


    const note = {
        id: createId("note"),

        title: cleanTitle,

        folderId,

        blocks: [
            {
                id: createId("block"),
                type: "text",
                content: ""
            }
        ]
    };


    state.notes.push(note);


    state.activeFolderId =
        folderId;

    state.activeNoteId =
        note.id;


    saveState(state);

    return note;
}


/* ================================ */
/* SELECT NOTE */
/* ================================ */

export function selectNote(noteId) {

    const note =
        state.notes.find(
            item =>
                item.id === noteId
        );


    if (!note) {
        return;
    }


    state.activeNoteId =
        note.id;

    state.activeFolderId =
        note.folderId;


    saveState(state);
}


/* ================================ */
/* DELETE NOTE */
/* ================================ */

export function deleteNote(noteId) {

    const noteIndex =
        state.notes.findIndex(
            note =>
                note.id === noteId
        );


    if (noteIndex === -1) {
        return;
    }


    const deletedNote =
        state.notes[noteIndex];


    const folderId =
        deletedNote.folderId;


    state.notes.splice(
        noteIndex,
        1
    );


    if (
        state.activeNoteId === noteId
    ) {

        state.activeFolderId =
            folderId;


        const remainingNotes =
            state.notes.filter(
                note =>
                    note.folderId ===
                    folderId
            );


        state.activeNoteId =
            remainingNotes[0]?.id ||
            null;
    }


    saveState(state);
}