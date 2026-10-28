const {
    app,
    BrowserWindow,
    ipcMain,
    clipboard,
    dialog
} = require("electron");

const fs = require("fs");
const path = require("path");


/* ================================ */
/* PATHS */
/* ================================ */

const IS_PACKAGED =
    app.isPackaged;


const DATA_DIR =
    IS_PACKAGED

        ? path.join(
            app.getPath("userData"),
            "data"
        )

        : path.join(
            __dirname,
            "data"
        );


const FOLDERS_DIR =
    path.join(
        DATA_DIR,
        "folders"
    );


const BACKUPS_DIR =
    path.join(
        DATA_DIR,
        "backups"
    );


const APP_FILE =
    path.join(
        DATA_DIR,
        "app.json"
    );


const LEGACY_FILE =
    path.join(
        DATA_DIR,
        "techflow.json"
    );

/* ================================ */
/* BACKUP CONFIG */
/* ================================ */

const MAX_BACKUPS = 20;

const BACKUP_INTERVAL =
    5 * 60 * 1000;

let lastBackupAt = 0;


/* ================================ */
/* DIRECTORY */
/* ================================ */

function ensureStorageDirectories() {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

    fs.mkdirSync(
        FOLDERS_DIR,
        {
            recursive: true
        }
    );

    fs.mkdirSync(
        BACKUPS_DIR,
        {
            recursive: true
        }
    );
}


/* ================================ */
/* ID VALIDATION */
/* ================================ */

function assertSafeId(id) {

    if (
        typeof id !== "string" ||
        !/^[a-zA-Z0-9_-]+$/.test(id)
    ) {
        throw new Error(
            `Geçersiz ID: ${id}`
        );
    }
}


/* ================================ */
/* JSON */
/* ================================ */

function readJson(filePath) {

    return JSON.parse(
        fs.readFileSync(
            filePath,
            "utf-8"
        )
    );
}


function writeJson(
    filePath,
    data
) {

    const directory =
        path.dirname(filePath);

    fs.mkdirSync(
        directory,
        {
            recursive: true
        }
    );


    const tempFile =
        `${filePath}.tmp`;


    fs.writeFileSync(
        tempFile,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf-8"
    );


    fs.renameSync(
        tempFile,
        filePath
    );
}


/* ================================ */
/* VALIDATION */
/* ================================ */

function validateFolder(folder) {

    if (
        !folder ||
        typeof folder.id !== "string" ||
        typeof folder.name !== "string"
    ) {
        return false;
    }


    try {

        assertSafeId(folder.id);

    } catch {

        return false;
    }


    return true;
}


function validateNote(note) {

    if (
        !note ||
        typeof note.id !== "string" ||
        typeof note.title !== "string" ||
        typeof note.folderId !== "string" ||
        !Array.isArray(note.blocks)
    ) {
        return false;
    }


    try {

        assertSafeId(note.id);
        assertSafeId(note.folderId);

    } catch {

        return false;
    }


    return note.blocks.every(
        block =>
            block &&
            typeof block.id === "string" &&
            typeof block.type === "string" &&
            typeof block.content === "string"
    );
}


function validateState(data) {

    if (
        !data ||
        !Array.isArray(data.folders) ||
        !Array.isArray(data.notes)
    ) {
        return false;
    }


    if (
        !data.folders.every(
            validateFolder
        )
    ) {
        return false;
    }


    if (
        !data.notes.every(
            validateNote
        )
    ) {
        return false;
    }


    const folderIds =
        new Set(
            data.folders.map(
                folder =>
                    folder.id
            )
        );


    return data.notes.every(
        note =>
            folderIds.has(
                note.folderId
            )
    );
}


/* ================================ */
/* PATH HELPERS */
/* ================================ */

function getFolderPath(
    folderId
) {

    assertSafeId(
        folderId
    );


    return path.join(
        FOLDERS_DIR,
        folderId
    );
}


function getFolderJsonPath(
    folderId
) {

    return path.join(
        getFolderPath(
            folderId
        ),
        "folder.json"
    );
}


function getNoteJsonPath(
    folderId,
    noteId
) {

    assertSafeId(
        folderId
    );

    assertSafeId(
        noteId
    );


    return path.join(
        getFolderPath(
            folderId
        ),
        `${noteId}.json`
    );
}


/* ================================ */
/* LOAD MODULAR STATE */
/* ================================ */

function loadModularState() {

    ensureStorageDirectories();


    let appState = {

        version: 1,

        activeFolderId:
            null,

        activeNoteId:
            null
    };


    if (
        fs.existsSync(
            APP_FILE
        )
    ) {

        try {

            appState =
                readJson(
                    APP_FILE
                );

        } catch (error) {

            console.error(
                "app.json okunamadı:",
                error
            );
        }
    }


    const folders = [];
    const notes = [];


    const directories =
        fs.readdirSync(
            FOLDERS_DIR,
            {
                withFileTypes: true
            }
        )
        .filter(
            item =>
                item.isDirectory()
        );


    for (
        const directory
        of directories
    ) {

        const folderId =
            directory.name;


        const folderFile =
            getFolderJsonPath(
                folderId
            );


        if (
            !fs.existsSync(
                folderFile
            )
        ) {
            continue;
        }


        try {

            const folder =
                readJson(
                    folderFile
                );


            if (
                !validateFolder(
                    folder
                )
            ) {
                continue;
            }


            folders.push(
                folder
            );


            const folderPath =
                getFolderPath(
                    folder.id
                );


            const noteFiles =
                fs.readdirSync(
                    folderPath
                )
                .filter(
                    file =>
                        file.endsWith(".json") &&
                        file !== "folder.json"
                );


            for (
                const noteFile
                of noteFiles
            ) {

                try {

                    const note =
                        readJson(
                            path.join(
                                folderPath,
                                noteFile
                            )
                        );


                    if (
                        validateNote(
                            note
                        )
                    ) {

                        notes.push(
                            note
                        );
                    }

                } catch (error) {

                    console.error(
                        `Not okunamadı: ${noteFile}`,
                        error
                    );
                }
            }

        } catch (error) {

            console.error(
                `Klasör okunamadı: ${folderId}`,
                error
            );
        }
    }


    const activeFolderId =
        folders.some(
            folder =>
                folder.id ===
                appState.activeFolderId
        )
            ? appState.activeFolderId
            : folders[0]?.id || null;


    const activeNoteId =
        notes.some(
            note =>
                note.id ===
                appState.activeNoteId
        )
            ? appState.activeNoteId
            : notes.find(
                note =>
                    note.folderId ===
                    activeFolderId
            )?.id || null;


    return {

        folders,

        notes,

        activeFolderId,

        activeNoteId
    };
}


/* ================================ */
/* FULL STATE WRITE */
/* ================================ */

function writeFullState(
    data
) {

    if (
        !validateState(
            data
        )
    ) {
        throw new Error(
            "Geçersiz TechFlow veri yapısı."
        );
    }


    ensureStorageDirectories();


    /* ---------- APP ---------- */

    writeJson(
        APP_FILE,
        {
            version: 1,

            activeFolderId:
                data.activeFolderId ||
                null,

            activeNoteId:
                data.activeNoteId ||
                null
        }
    );


    /* ---------- FOLDER IDS ---------- */

    const currentFolderIds =
        new Set(
            data.folders.map(
                folder =>
                    folder.id
            )
        );


    const existingFolders =
        fs.readdirSync(
            FOLDERS_DIR,
            {
                withFileTypes: true
            }
        )
        .filter(
            item =>
                item.isDirectory()
        );


    /* ---------- REMOVE OLD FOLDERS ---------- */

    for (
        const directory
        of existingFolders
    ) {

        if (
            !currentFolderIds.has(
                directory.name
            )
        ) {

            fs.rmSync(
                getFolderPath(
                    directory.name
                ),
                {
                    recursive: true,
                    force: true
                }
            );
        }
    }


    /* ---------- WRITE FOLDERS ---------- */

    for (
        const folder
        of data.folders
    ) {

        const folderPath =
            getFolderPath(
                folder.id
            );


        fs.mkdirSync(
            folderPath,
            {
                recursive: true
            }
        );


        writeJson(
            getFolderJsonPath(
                folder.id
            ),
            {
                id: folder.id,
                name: folder.name
            }
        );
    }


    /* ---------- WRITE NOTES ---------- */

    for (
        const folder
        of data.folders
    ) {

        const folderPath =
            getFolderPath(
                folder.id
            );


        const folderNotes =
            data.notes.filter(
                note =>
                    note.folderId ===
                    folder.id
            );


        const currentNoteIds =
            new Set(
                folderNotes.map(
                    note =>
                        `${note.id}.json`
                )
            );


        const existingNotes =
            fs.readdirSync(
                folderPath
            )
            .filter(
                file =>
                    file.endsWith(".json") &&
                    file !== "folder.json"
            );


        for (
            const existingNote
            of existingNotes
        ) {

            if (
                !currentNoteIds.has(
                    existingNote
                )
            ) {

                fs.unlinkSync(
                    path.join(
                        folderPath,
                        existingNote
                    )
                );
            }
        }


        for (
            const note
            of folderNotes
        ) {

            writeJson(
                getNoteJsonPath(
                    folder.id,
                    note.id
                ),
                note
            );
        }
    }


    return true;
}


/* ================================ */
/* INDIVIDUAL FOLDER WRITE */
/* ================================ */

function saveFolderRecord(
    folder
) {

    if (
        !validateFolder(
            folder
        )
    ) {
        throw new Error(
            "Geçersiz klasör."
        );
    }


    ensureStorageDirectories();


    fs.mkdirSync(
        getFolderPath(
            folder.id
        ),
        {
            recursive: true
        }
    );


    writeJson(
        getFolderJsonPath(
            folder.id
        ),
        {
            id: folder.id,
            name: folder.name
        }
    );


    return true;
}


/* ================================ */
/* INDIVIDUAL NOTE WRITE */
/* ================================ */

function saveNoteRecord(
    note
) {

    if (
        !validateNote(
            note
        )
    ) {
        throw new Error(
            "Geçersiz sayfa."
        );
    }


    ensureStorageDirectories();


    fs.mkdirSync(
        getFolderPath(
            note.folderId
        ),
        {
            recursive: true
        }
    );


    writeJson(
        getNoteJsonPath(
            note.folderId,
            note.id
        ),
        note
    );


    return true;
}


/* ================================ */
/* BACKUP */
/* ================================ */

function getTimestamp() {

    return new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
}


function createBackup(
    force = false
) {

    ensureStorageDirectories();


    const now =
        Date.now();


    if (
        !force &&
        now - lastBackupAt <
        BACKUP_INTERVAL
    ) {

        return null;
    }


    const hasData =
        fs.existsSync(APP_FILE) ||
        fs.readdirSync(
            FOLDERS_DIR
        ).length > 0;


    if (!hasData) {
        return null;
    }


    const backupPath =
        path.join(
            BACKUPS_DIR,
            `snapshot-${getTimestamp()}`
        );


    fs.mkdirSync(
        backupPath,
        {
            recursive: true
        }
    );


    if (
        fs.existsSync(
            APP_FILE
        )
    ) {

        fs.copyFileSync(
            APP_FILE,
            path.join(
                backupPath,
                "app.json"
            )
        );
    }


    if (
        fs.existsSync(
            FOLDERS_DIR
        )
    ) {

        fs.cpSync(
            FOLDERS_DIR,
            path.join(
                backupPath,
                "folders"
            ),
            {
                recursive: true
            }
        );
    }


    lastBackupAt =
        now;


    pruneBackups();


    return backupPath;
}


function pruneBackups() {

    const backups =
        fs.readdirSync(
            BACKUPS_DIR,
            {
                withFileTypes: true
            }
        )
        .filter(
            item =>
                item.isDirectory() &&
                item.name.startsWith(
                    "snapshot-"
                )
        )
        .map(
            item => {

                const fullPath =
                    path.join(
                        BACKUPS_DIR,
                        item.name
                    );


                return {

                    path:
                        fullPath,

                    time:
                        fs.statSync(
                            fullPath
                        ).mtimeMs
                };
            }
        )
        .sort(
            (a, b) =>
                b.time - a.time
        );


    for (
        const backup
        of backups.slice(
            MAX_BACKUPS
        )
    ) {

        fs.rmSync(
            backup.path,
            {
                recursive: true,
                force: true
            }
        );
    }
}


/* ================================ */
/* LEGACY MIGRATION */
/* ================================ */

function migrateLegacyData() {

    if (
        fs.existsSync(
            APP_FILE
        )
    ) {

        return false;
    }


    if (
        !fs.existsSync(
            LEGACY_FILE
        )
    ) {

        return false;
    }


    let legacyData;


    try {

        legacyData =
            readJson(
                LEGACY_FILE
            );

    } catch (error) {

        console.error(
            "Legacy JSON okunamadı:",
            error
        );

        return false;
    }


    if (
        !validateState(
            legacyData
        )
    ) {

        console.error(
            "Legacy JSON geçersiz."
        );

        return false;
    }


    const migrationPath =
        path.join(
            BACKUPS_DIR,
            `migration-${getTimestamp()}`
        );


    fs.mkdirSync(
        migrationPath,
        {
            recursive: true
        }
    );


    fs.copyFileSync(
        LEGACY_FILE,
        path.join(
            migrationPath,
            "techflow.json"
        )
    );


    writeFullState(
        legacyData
    );


    const archivePath =
        path.join(
            DATA_DIR,
            "techflow.legacy.json"
        );


    if (
        !fs.existsSync(
            archivePath
        )
    ) {

        fs.renameSync(
            LEGACY_FILE,
            archivePath
        );
    }


    console.log(
        "Legacy veri modüler JSON yapısına taşındı."
    );


    return true;
}


/* ================================ */
/* WINDOW */
/* ================================ */

function createWindow() {

    const win =
        new BrowserWindow({

            width: 1400,
            height: 900,

            minWidth: 1000,
            minHeight: 700,

            backgroundColor:
                "#212121",

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation:
                    true,

                nodeIntegration:
                    false
            }
        });


    win.loadFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

    // win.webContents.openDevTools();
}


/* ================================ */
/* CLIPBOARD */
/* ================================ */

ipcMain.handle(
    "copy-text",
    async (
        event,
        text
    ) => {

        clipboard.writeText(
            String(
                text ?? ""
            )
        );


        return true;
    }
);


/* ================================ */
/* APP */
/* ================================ */

ipcMain.handle(
    "storage:load-app",
    async () => {

        ensureStorageDirectories();


        if (
            !fs.existsSync(
                APP_FILE
            )
        ) {

            return {

                version: 1,

                activeFolderId:
                    null,

                activeNoteId:
                    null
            };
        }


        return readJson(
            APP_FILE
        );
    }
);


ipcMain.handle(
    "storage:save-app",
    async (
        event,
        appState
    ) => {

        try {

            ensureStorageDirectories();

            createBackup();


            writeJson(
                APP_FILE,
                {

                    version:
                        appState?.version ||
                        1,

                    activeFolderId:
                        appState?.activeFolderId ||
                        null,

                    activeNoteId:
                        appState?.activeNoteId ||
                        null
                }
            );


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* FOLDERS */
/* ================================ */

ipcMain.handle(
    "storage:load-folders",
    async () => {

        const state =
            loadModularState();


        return state.folders;
    }
);


ipcMain.handle(
    "storage:save-folder",
    async (
        event,
        folder
    ) => {

        try {

            createBackup();

            saveFolderRecord(
                folder
            );


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


ipcMain.handle(
    "storage:delete-folder",
    async (
        event,
        folderId
    ) => {

        try {

            assertSafeId(
                folderId
            );


            createBackup();


            const folderPath =
                getFolderPath(
                    folderId
                );


            fs.rmSync(
                folderPath,
                {
                    recursive: true,
                    force: true
                }
            );


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* NOTES */
/* ================================ */

ipcMain.handle(
    "storage:load-notes",
    async (
        event,
        folderId
    ) => {

        assertSafeId(
            folderId
        );


        const folderPath =
            getFolderPath(
                folderId
            );


        if (
            !fs.existsSync(
                folderPath
            )
        ) {

            return [];
        }


        const notes = [];


        const files =
            fs.readdirSync(
                folderPath
            )
            .filter(
                file =>
                    file.endsWith(".json") &&
                    file !== "folder.json"
            );


        for (
            const file
            of files
        ) {

            try {

                const note =
                    readJson(
                        path.join(
                            folderPath,
                            file
                        )
                    );


                if (
                    validateNote(
                        note
                    )
                ) {

                    notes.push(
                        note
                    );
                }

            } catch (error) {

                console.error(
                    `Not okunamadı: ${file}`,
                    error
                );
            }
        }


        return notes;
    }
);


ipcMain.handle(
    "storage:save-note",
    async (
        event,
        note
    ) => {

        try {

            createBackup();


            saveNoteRecord(
                note
            );


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


ipcMain.handle(
    "storage:delete-note",
    async (
        event,
        folderId,
        noteId
    ) => {

        try {

            assertSafeId(
                folderId
            );

            assertSafeId(
                noteId
            );


            createBackup();


            const notePath =
                getNoteJsonPath(
                    folderId,
                    noteId
                );


            if (
                fs.existsSync(
                    notePath
                )
            ) {

                fs.unlinkSync(
                    notePath
                );
            }


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* COMPLETE STATE */
/* ================================ */

ipcMain.handle(
    "storage:load",
    async () => {

        try {

            migrateLegacyData();


            return loadModularState();

        } catch (error) {

            console.error(
                "TechFlow yüklenemedi:",
                error
            );


            return null;
        }
    }
);


/*
 * Eski saveState() uyumluluğu.
 *
 * Yeni storage API bunun yerine
 * diff tabanlı olarak kullanılacak.
 */

ipcMain.handle(
    "storage:save",
    async (
        event,
        data
    ) => {

        try {

            createBackup();


            writeFullState(
                data
            );


            return {
                success: true
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* IMPORT */
/* ================================ */

ipcMain.handle(
    "storage:import",
    async () => {

        const result =
            await dialog.showOpenDialog(
                {
                    title:
                        "TechFlow JSON İçe Aktar",

                    properties:
                        [
                            "openFile"
                        ],

                    filters:
                        [
                            {
                                name:
                                    "JSON",

                                extensions:
                                    ["json"]
                            }
                        ]
                }
            );


        if (
            result.canceled ||
            !result.filePaths.length
        ) {

            return {
                canceled: true
            };
        }


        try {

            const raw =
                fs.readFileSync(
                    result.filePaths[0],
                    "utf-8"
                );


            const data =
                JSON.parse(
                    raw
                );


            if (
                !validateState(
                    data
                )
            ) {

                throw new Error(
                    "Bu dosya geçerli bir TechFlow JSON dosyası değil."
                );
            }


            createBackup(
                true
            );


            writeFullState(
                data
            );


            return {

                success: true,

                data
            };

        } catch (error) {

            await dialog.showMessageBox(
                {
                    type:
                        "error",

                    title:
                        "İçe aktarma başarısız",

                    message:
                        error.message
                }
            );


            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* EXPORT */
/* ================================ */

ipcMain.handle(
    "storage:export",
    async (
        event,
        data
    ) => {

        try {

            const result =
                await dialog.showSaveDialog(
                    {
                        title:
                            "TechFlow JSON Dışa Aktar",

                        defaultPath:
                            "techflow-export.json",

                        filters:
                            [
                                {
                                    name:
                                        "JSON",

                                    extensions:
                                        ["json"]
                                }
                            ]
                    }
                );


            if (
                result.canceled ||
                !result.filePath
            ) {

                return {
                    canceled: true
                };
            }


            if (
                !validateState(
                    data
                )
            ) {

                throw new Error(
                    "Dışa aktarılacak veri geçersiz."
                );
            }


            fs.writeFileSync(
                result.filePath,
                JSON.stringify(
                    data,
                    null,
                    2
                ),
                "utf-8"
            );


            return {

                success: true,

                path:
                    result.filePath
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* MANUAL BACKUP */
/* ================================ */

ipcMain.handle(
    "storage:backup",
    async () => {

        try {

            const backupPath =
                createBackup(
                    true
                );


            return {

                success:
                    Boolean(
                        backupPath
                    ),

                path:
                    backupPath
            };

        } catch (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }
    }
);


/* ================================ */
/* APP START */
/* ================================ */

app.whenReady().then(() => {

    ensureStorageDirectories();


    createWindow();


    app.on(
        "activate",
        () => {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {

                createWindow();
            }
        }
    );
});


app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {

            app.quit();
        }
    }
);