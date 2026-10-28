let saveTimer = null;


/* ================================ */
/* LOAD */
/* ================================ */

export async function loadState() {

    if (
        !window.techflow ||
        !window.techflow.loadData
    ) {

        console.error(
            "TechFlow storage API bulunamadı."
        );

        return null;
    }


    try {

        return await window.techflow.loadData();

    } catch (error) {

        console.error(
            "JSON yüklenemedi:",
            error
        );

        return null;
    }
}


/* ================================ */
/* SAVE */
/* ================================ */

export function saveState(state) {

    /*
     * Her karakter girişinde doğrudan
     * disk yazmak yerine küçük bir debounce
     * kullanıyoruz.
     */

    const snapshot =
        JSON.parse(
            JSON.stringify(state)
        );


    clearTimeout(
        saveTimer
    );


    saveTimer =
        setTimeout(
            async () => {

                try {

                    const result =
                        await window.techflow
                            .saveData(
                                snapshot
                            );


                    if (
                        !result?.success
                    ) {

                        console.error(
                            "JSON kaydedilemedi:",
                            result?.error
                        );

                        return;
                    }


                    console.log(
                        "TechFlow JSON kaydedildi."
                    );

                } catch (error) {

                    console.error(
                        "JSON kayıt hatası:",
                        error
                    );
                }

            },
            300
        );
}


/* ================================ */
/* IMPORT */
/* ================================ */

export async function importState() {

    return await window.techflow
        .importData();
}


/* ================================ */
/* EXPORT */
/* ================================ */

export async function exportState(
    state
) {

    const snapshot =
        JSON.parse(
            JSON.stringify(state)
        );


    return await window.techflow
        .exportData(
            snapshot
        );
}


/* ================================ */
/* MANUAL BACKUP */
/* ================================ */

export async function createBackup() {

    return await window.techflow
        .createBackup();
}