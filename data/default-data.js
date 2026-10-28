export const defaultData = {
    folders: [
        {
            id: "linux",
            name: "Linux"
        },
        {
            id: "zabbix",
            name: "Zabbix"
        },
        {
            id: "docker",
            name: "Docker"
        }
    ],

    notes: [
        {
            id: "wsl",
            title: "WSL",
            folderId: "linux",
            blocks: [
                {
                    id: "wsl-1",
                    type: "command",
                    content: "wsl --list --verbose"
                },
                {
                    id: "wsl-2",
                    type: "text",
                    content: "Windows üzerindeki WSL dağıtımlarını ve çalışma durumlarını listeler."
                },
                {
                    id: "wsl-3",
                    type: "command",
                    content: "wsl"
                },
                {
                    id: "wsl-4",
                    type: "text",
                    content: "Varsayılan WSL dağıtımına bağlanır."
                }
            ]
        },

        {
            id: "systemd",
            title: "Systemd",
            folderId: "linux",
            blocks: [
                {
                    id: "systemd-1",
                    type: "command",
                    content: "sudo systemctl status zabbix-server"
                },
                {
                    id: "systemd-2",
                    type: "text",
                    content: "Zabbix Server servisinin mevcut durumunu gösterir."
                },
                {
                    id: "systemd-3",
                    type: "command",
                    content: "sudo systemctl restart zabbix-server"
                },
                {
                    id: "systemd-4",
                    type: "result",
                    content: "Servis yeniden başlatıldı."
                }
            ]
        },

        {
            id: "zabbix-server",
            title: "Zabbix Server",
            folderId: "zabbix",
            blocks: [
                {
                    id: "zabbix-1",
                    type: "command",
                    content: "sudo systemctl restart zabbix-server"
                },
                {
                    id: "zabbix-2",
                    type: "text",
                    content: "Zabbix Server servisini yeniden başlatır."
                },
                {
                    id: "zabbix-3",
                    type: "error",
                    content: "Incorrect user name or password or account is temporarily blocked."
                },
                {
                    id: "zabbix-4",
                    type: "solution",
                    content: "Veritabanı kullanıcı adı ve şifresi kontrol edildi."
                }
            ]
        },

        {
            id: "postgresql",
            title: "PostgreSQL",
            folderId: "zabbix",
            blocks: [
                {
                    id: "postgresql-1",
                    type: "command",
                    content: "sudo -u zabbix psql zabbix"
                },
                {
                    id: "postgresql-2",
                    type: "text",
                    content: "Zabbix kullanıcısı ile PostgreSQL üzerindeki zabbix veritabanına bağlanmayı dener."
                }
            ]
        },

        {
            id: "docker",
            title: "Docker",
            folderId: "docker",
            blocks: [
                {
                    id: "docker-1",
                    type: "command",
                    content: "docker ps"
                },
                {
                    id: "docker-2",
                    type: "text",
                    content: "Çalışan Docker container'larını listeler."
                }
            ]
        }
    ],

    activeFolderId: "linux",
    activeNoteId: "wsl"
};