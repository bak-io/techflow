const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    "techflow",
    {

        /* ================================ */
        /* CLIPBOARD */
        /* ================================ */

        copyText: text =>
            ipcRenderer.invoke(
                "copy-text",
                text
            ),


        /* ================================ */
        /* COMPLETE STATE */
        /* ================================ */

        loadData: () =>
            ipcRenderer.invoke(
                "storage:load"
            ),

        saveData: data =>
            ipcRenderer.invoke(
                "storage:save",
                data
            ),


        /* ================================ */
        /* APP */
        /* ================================ */

        loadApp: () =>
            ipcRenderer.invoke(
                "storage:load-app"
            ),

        saveApp: data =>
            ipcRenderer.invoke(
                "storage:save-app",
                data
            ),


        /* ================================ */
        /* FOLDERS */
        /* ================================ */

        loadFolders: () =>
            ipcRenderer.invoke(
                "storage:load-folders"
            ),

        saveFolder: folder =>
            ipcRenderer.invoke(
                "storage:save-folder",
                folder
            ),

        deleteFolder: folderId =>
            ipcRenderer.invoke(
                "storage:delete-folder",
                folderId
            ),


        /* ================================ */
        /* NOTES */
        /* ================================ */

        loadNotes: folderId =>
            ipcRenderer.invoke(
                "storage:load-notes",
                folderId
            ),

        saveNote: note =>
            ipcRenderer.invoke(
                "storage:save-note",
                note
            ),

        deleteNote: (
            folderId,
            noteId
        ) =>
            ipcRenderer.invoke(
                "storage:delete-note",
                folderId,
                noteId
            ),


        /* ================================ */
        /* IMPORT / EXPORT */
        /* ================================ */

        importData: () =>
            ipcRenderer.invoke(
                "storage:import"
            ),

        exportData: data =>
            ipcRenderer.invoke(
                "storage:export",
                data
            ),


        /* ================================ */
        /* BACKUP */
        /* ================================ */

        createBackup: () =>
            ipcRenderer.invoke(
                "storage:backup"
            )
    }
);