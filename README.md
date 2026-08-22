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

🗄️ Inizializzazione del Database MySQL
 * Accedi al pannello di controllo del tuo hosting (es. cPanel su Netsons).
 * Vai nella sezione Database MySQL e crea un nuovo database (es. nomeutente_puntocroce).
 * Crea un utente MySQL, assegnali una password robusta e assegna tutti i privilegi al database appena creato.
 * Apri phpMyAdmin, seleziona il database ed esegui la seguente query SQL (oppure importa il file database.sql incluso nel repo):
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `grid_data` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

⚙️ Configurazione del Backend PHP
Apri il file api/config.php e inserisci le credenziali di accesso al database MySQL create su Netsons:
<?php
// api/config.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'nomeutente_puntocroce'); // Sostituisci con il nome del tuo DB
define('DB_USER', 'nomeutente_dbuser');    // Sostituisci con l'utente DB
define('DB_PASS', 'LA_TUA_PASSWORD_DB');    // Sostituisci con la password

function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
        exit;
    }
}

🔑 Configurazione dell'Integrazione Google Drive (OAuth 2.0)
Per consentire agli utenti di accedere al proprio account Google Drive direttamente dal sito, è necessario registrare l'applicazione su Google Cloud Console (operazione una tantum gratuita):
 * Vai su Google Cloud Console.
 * Crea un nuovo progetto (es. Punto Croce Web App).
 * Dal menu laterale, vai su API e servizi > Libreria, cerca Google Drive API e clicca Abilita.
 * Vai su API e servizi > Schermata consenso OAuth:
   * Scegli tipo utente Esterno.
   * Inserisci il nome dell'app, l'email di supporto e aggiungi il tuo dominio (es. netsons.org o il tuo dominio personalizzato).
   * Aggiungi lo scope: .../auth/drive.file (questo garantisce che l'app possa leggere/scrivere solo i file che crea essa stessa).
 * Vai su API e servizi > Credenziali:
   * Clicca Crea credenziali > ID client OAuth.
   * Seleziona Applicazione Web.
   * In Origini JavaScript autorizzate, aggiungi l'URL del tuo sito (es. https://tuosito.netsons.org).
   * Copia l'ID Client generato.
 * Incolla l'ID Client nel file js/storage_gdrive.js:
const GOOGLE_CLIENT_ID = 'IL_TUO_CLIENT_ID.apps.googleusercontent.com';

🚀 Deploy e Pubblicazione su Netsons
Metodo 1: Caricamento via FTP / File Manager
 * Scarica lo ZIP dal repository GitHub o clona il progetto sul tuo computer.
 * Apri un client FTP (es. FileZilla) o usa il Gestore File di cPanel su Netsons.
 * Carica tutti i file all'interno della cartella public_html (o della sottocartella scelta).
 * Assicurati che dal pannello Netsons sia attivo il certificato SSL gratuito (Let's Encrypt) per consentire l'uso delle API Google e delle sessioni sicure via HTTPS.
Metodo 2: Deploy automatico tramite GitHub Actions (Opzionale)
È possibile configurare una Workflow Action su GitHub che esegue automaticamente il caricamento via FTP su Netsons ad ogni git push sul ramo main.
🧪 Verifiche di Funzionamento
Una volta completato il deploy, verifica i seguenti aspetti:
 * [ ] Editor Canvas: Verifica che la griglia risponda al click e che la tavolozza DMC funzioni.
 * [ ] Conversione Foto: Prova a caricare un'immagine per verificare che venga mappata correttamente sui colori DMC.
 * [ ] Registrazione / Login: Crea un account di prova per confermare la scrittura sulla tabella users di MySQL.
 * [ ] Salvataggio Locale: Prova a esportare uno schema .cross e a ricaricarlo da PC/Smartphone.
 * [ ] Salvataggio Cloud: Clicca su "Connetti Google Drive", autorizza l'app e verifica la creazione dello schema sul tuo Drive.
   """
file_path = "README.md"
with open(file_path, "w", encoding="utf-8") as f:
f.write(readme_content)
print(f"File {file_path} creato con successo.")

```text?code_stdout&code_event_index=1
File README.md creato con successo.


Il file Markdown README.md è stato generato ed è pronto per essere scaricato e inserito nella radice del tuo repository GitHub.
