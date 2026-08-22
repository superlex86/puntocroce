# 🪡 Editor Punto Croce Web

Un'applicazione web completa, leggera e responsive per creare, convertire e gestire schemi a punto croce con filati DMC. Il sistema supporta l'autenticazione utenti, il salvataggio remoto su database MySQL, l'import/export locale e l'integrazione con Google Drive.

Progettato per essere ospitato su hosting condivisi (es. Netsons) basati sullo stack **LAMP** (Linux, Apache, MySQL, PHP) con architettura frontend-first.

---

## 📁 Struttura del Repository

```text
/
├── index.html              # Interfaccia principale (Editor Canvas + UI)
├── css/
│   └── style.css           # Stili dell'applicazione e dei modali
├── js/
│   ├── editor.js           # Gestione Canvas, griglia e strumenti di disegno
│   ├── image_converter.js  # Algoritmo di conversione foto -> schema DMC
│   ├── auth.js             # Modali e chiamate AJAX per Login/Registrazione
│   ├── storage_local.js    # Importazione ed esportazione file .cross locali
│   └── storage_gdrive.js   # Integrazione Google Drive API v3 (OAuth 2.0)
├── api/
│   ├── config.php          # Credenziali e connessione al Database (PDO)
│   ├── register.php        # Endpoint per la registrazione utenti
│   ├── login.php           # Endpoint per l'autenticazione e sessioni
│   ├── logout.php          # Chiusura sessione
│   ├── save_project.php    # Salvataggio/aggiornamento progetti su DB
│   ├── get_projects.php    # Recupero lista progetti dell'utente
│   └── delete_project.php  # Eliminazione progetto
├── database.sql            # Script di inizializzazione Database MySQL
└── README.md               # Documentazione di progetto
# puntocroce