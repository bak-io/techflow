\# TechFlow



\*\*Türkçe | English\*\*



\*\*TechFlow\*\*, teknik notları, terminal komutlarını ve dokümantasyonu düzenli bir çalışma alanında yönetmek için geliştirilmiş açık kaynaklı bir masaüstü uygulamasıdır.



\*\*TechFlow\*\* is an open-source desktop application for organizing technical notes, terminal commands, and documentation in a structured workspace.



\---



\# Türkçe



\## TechFlow Nedir?



TechFlow, teknik notları, terminal komutlarını ve dokümantasyonu düzenli bir çalışma alanında yönetmek amacıyla geliştirilmiş açık kaynaklı bir masaüstü uygulamasıdır.



Electron, Node.js ve Vanilla JavaScript kullanılarak geliştirilmiştir.



Klasör tabanlı organizasyon ve farklı içerik blokları sayesinde bilgilerin düzenli, erişilebilir ve merkezi bir ortamda yönetilmesini sağlar.



Uygulama, verileri yerel olarak saklayarak internet bağlantısına ihtiyaç duymadan kullanılabilir.



\## Özellikler



\- \*\*Klasör Tabanlı Organizasyon:\*\* Notları kategorilere ve klasörlere ayırma.

\- \*\*Blok Tabanlı Editör:\*\* İçerikleri bağımsız bloklar halinde oluşturma ve düzenleme.

\- \*\*Komut Blokları:\*\* Terminal komutlarını ayrı bloklarda saklama.

\- \*\*Metin Blokları:\*\* Açıklamaları ve teknik bilgileri düzenleme.

\- \*\*Arama Sistemi:\*\* Kayıtlı notlar arasında arama yapma.

\- \*\*Panoya Kopyalama:\*\* Komutları ve içerikleri hızlıca kopyalama.

\- \*\*Yerel Veri Depolama:\*\* Verileri kullanıcının bilgisayarında saklama.

\- \*\*Otomatik Yedekleme:\*\* Uygulama verilerinin belirli aralıklarla yedeklenmesi.

\- \*\*Masaüstü Arayüzü:\*\* Teknik bilgi yönetimine yönelik çalışma alanı.

\- \*\*Windows Desteği:\*\* Kurulum ve taşınabilir (portable) uygulama sürümleri.



\## Kullanılan Teknolojiler



| Teknoloji | Kullanım Amacı |

|---|---|

| Electron | Masaüstü uygulama altyapısı |

| Node.js | Dosya sistemi ve uygulama işlemleri |

| JavaScript | Uygulama mantığı ve kullanıcı etkileşimleri |

| HTML5 | Arayüz yapısı |

| CSS3 | Arayüz tasarımı |

| Lucide Icons | Arayüz simgeleri |

| Electron Builder | Windows uygulama paketleme |



\## Proje Yapısı



```text

TechFlow/

├── assets/

├── css/

│   ├── blocks.css

│   ├── layout.css

│   ├── modal.css

│   ├── sidebar.css

│   ├── variables.css

│   └── workspace.css

├── data/

│   └── default-data.js

├── js/

│   ├── blocks/

│   ├── folders/

│   ├── notes/

│   ├── search/

│   ├── sidebar/

│   ├── state/

│   ├── storage/

│   └── workspace/

├── index.html

├── main.js

├── preload.js

├── package.json

├── package-lock.json

├── README.md

├── LICENSE

└── .gitignore

```



Kullanıcı verileri, yedekler ve derlenmiş uygulama dosyaları kaynak kod deposundan ayrı tutulur.



\## Kurulum



\### Gereksinimler



\- Node.js

\- npm

\- Git



\### 1. Projeyi klonlayın



```bash

git clone https://github.com/USERNAME/TechFlow.git

cd TechFlow

```



\### 2. Bağımlılıkları yükleyin



```bash

npm install

```



\### 3. Uygulamayı başlatın



```bash

npm start

```



\## Windows Uygulamasını Oluşturma



Windows için kurulum ve portable sürümleri oluşturmak amacıyla:



```bash

npm run build

```



Oluşturulan dosyalar `release` klasöründe bulunur.



\## Veri Depolama



TechFlow, kullanıcı verilerini yerel olarak saklar.



\*\*Geliştirme ortamında:\*\*



Uygulama verileri projenin `data` klasöründe tutulur.



\*\*Paketlenmiş uygulamada:\*\*



Kullanıcı verileri Electron tarafından belirlenen kullanıcıya özel uygulama veri dizininde saklanır.



Bu yaklaşım sayesinde uygulama dosyaları ile kullanıcı verileri birbirinden ayrılır.



Kullanıcı notları ve yedekleri GitHub kaynak kod deposuna dahil edilmez.



\## Güvenlik ve Gizlilik



\- Uygulama verileri yerel olarak saklanır.

\- Kullanıcı notları ve yedekleri Git deposundan hariç tutulur.

\- Electron arayüzünde `contextIsolation` etkinleştirilmiştir.

\- Renderer tarafında doğrudan Node.js entegrasyonu devre dışıdır.

\- Uygulama dosya işlemleri Electron ana işlemi üzerinden gerçekleştirilir.



\## Lisans



Bu proje \*\*MIT Lisansı\*\* kapsamında açık kaynak olarak yayımlanmıştır.



Ayrıntılar için \[LICENSE](LICENSE) dosyasını inceleyebilirsiniz.



\---



\# English



\## What is TechFlow?



TechFlow is an open-source desktop application designed to organize technical notes, terminal commands, and documentation in a structured workspace.



Built with Electron, Node.js, and vanilla JavaScript.



With folder-based organization and different content blocks, it provides a centralized environment for managing information in a structured and accessible way.



The application stores data locally and can be used without an internet connection.



\## Features



\- \*\*Folder-Based Organization:\*\* Organize notes into folders and categories.

\- \*\*Block-Based Editor:\*\* Create and manage content using independent blocks.

\- \*\*Command Blocks:\*\* Store terminal commands in dedicated blocks.

\- \*\*Text Blocks:\*\* Organize explanations and technical information.

\- \*\*Search Functionality:\*\* Search through stored notes.

\- \*\*Clipboard Integration:\*\* Quickly copy commands and content.

\- \*\*Local Data Storage:\*\* Store application data on the user's computer.

\- \*\*Automatic Backups:\*\* Automatically create backups of application data.

\- \*\*Desktop Workspace:\*\* A structured workspace for technical knowledge management.

\- \*\*Windows Support:\*\* Installer and portable application builds.



\## Technologies



| Technology | Purpose |

|---|---|

| Electron | Desktop application framework |

| Node.js | File system and application operations |

| JavaScript | Application logic and interactions |

| HTML5 | User interface structure |

| CSS3 | User interface styling |

| Lucide Icons | Interface icons |

| Electron Builder | Windows application packaging |



\## Project Structure



```text

TechFlow/

├── assets/

├── css/

│   ├── blocks.css

│   ├── layout.css

│   ├── modal.css

│   ├── sidebar.css

│   ├── variables.css

│   └── workspace.css

├── data/

│   └── default-data.js

├── js/

│   ├── blocks/

│   ├── folders/

│   ├── notes/

│   ├── search/

│   ├── sidebar/

│   ├── state/

│   ├── storage/

│   └── workspace/

├── index.html

├── main.js

├── preload.js

├── package.json

├── package-lock.json

├── README.md

├── LICENSE

└── .gitignore

```



User data, backups, and generated application packages are kept separate from the public source repository.



\## Installation



\### Requirements



\- Node.js

\- npm

\- Git



\### 1. Clone the repository



```bash

git clone https://github.com/USERNAME/TechFlow.git

cd TechFlow

```



\### 2. Install dependencies



```bash

npm install

```



\### 3. Start the application



```bash

npm start

```



\## Windows Build



Create Windows installer and portable packages:



```bash

npm run build

```



Generated files will be available in the `release` directory.



\## Data Storage



TechFlow stores application data locally.



\*\*Development environment:\*\*



Application data is stored in the project's `data` directory.



\*\*Packaged application:\*\*



Application data is stored in Electron's user-specific application data directory.



This approach separates application files from user-generated data.



User notes and backup files are excluded from the public Git repository.



\## Security and Privacy



\- Application data is stored locally.

\- User notes and backups are excluded from version control.

\- Electron context isolation is enabled.

\- Direct Node.js integration is disabled in the renderer process.

\- File operations are handled through Electron's main process.



\## License



This project is released under the \*\*MIT License\*\*.



See the \[LICENSE](LICENSE) file for more information.

