export const state = {
    folders: [],
    notes: [],
    activeFolderId: null,
    activeNoteId: null
};

export function hydrateState(data) {
    state.folders = data.folders || [];
    state.notes = data.notes || [];

    state.activeFolderId =
        data.activeFolderId ||
        state.folders[0]?.id ||
        null;

    state.activeNoteId =
        data.activeNoteId ||
        state.notes.find(
            note => note.folderId === state.activeFolderId
        )?.id ||
        null;
}

export function getActiveFolder() {
    return state.folders.find(
        folder => folder.id === state.activeFolderId
    );
}

export function getActiveNote() {
    return state.notes.find(
        note => note.id === state.activeNoteId
    );
}

export function getNotesByFolder(folderId) {
    return state.notes.filter(
        note => note.folderId === folderId
    );
}

export const searchFocus = {
    noteId: null,
    blockId: null,
    query: null
};

export function clearSearchFocus() {

    searchFocus.noteId = null;
    searchFocus.blockId = null;
    searchFocus.query = null;
}