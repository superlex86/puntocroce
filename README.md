# 🪡 Punto Croce Web

Un'applicazione web leggera, moderna e totalmente client-side per creare, modificare e convertire immagini in schemi per punto croce con tavolozza colori DMC. 

Il progetto è ottimizzato per essere ospitato gratuitamente su **GitHub Pages**.

---

## 🚀 Caratteristiche

* **Editor Griglia Grafico**: Disegna schemi su Canvas con griglia guidata (evidenziazione ogni 10 punti).
* **Tavolozza Filati DMC**: Selezione colori reali DMC con identificativi, codici esadecimali e simboli per lo schema.
* **Convertitore Foto-Schema**: Carica un'immagine e convertila automaticamente in uno schema punto croce mappato sui colori DMC più vicini.
* **Salvataggio & Import Locale**: Esporta e importa i tuoi schemi in formato aperto `.cross` (JSON) o esportali come immagini `.png`.
* **Integrazione Google Drive**: Salva i tuoi schemi direttamente sul tuo cloud tramite Google Drive API v3.
* **100% Client-Side**: Nessun server PHP o database richiesto. Funziona direttamente nel browser.

---

## 🛠️ Struttura del Progetto

```text
.
├── index.html            # Interfaccia utente principale
├── css/
│   └── style.css         # Stili UI, layout e finestre modali
└── js/
    ├── editor.js         # Logica della griglia Canvas e disegno
    ├── image_converter.js # Conversione da foto a schema DMC
    ├── storage_local.js  # Import/Export file .cross e PNG
    └── storage_gdrive.js # Integrazione API Google Drive
```

---

## 🌐 Pubblicazione su GitHub Pages

1. Fai il push di questo repository su **GitHub**.
2. Vai nelle **Settings** del repository su GitHub.
3. Seleziona la voce **Pages** dal menu laterale sinistro.
4. Sotto **Build and deployment**:
   * **Source**: `Deploy from a branch`
   * **Branch**: `main` (o `master`) / cartella `/ (root)`
5. Clicca su **Save**.

Il sito sarà raggiungibile in un paio di minuti all'indirizzo:  
`https://tuo-username.github.io/nome-repository/`

Nel nostro caso:
[https://superlex86.github.io/puntocroce/](https://superlex86.github.io/puntocroce/)

---

## ⚙️ Configurazione Google Drive (Opzionale)

Se desideri abilitare il pulsante "Salva su Google Drive":

1. Vai su [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuovo progetto e abilita le **Google Drive API**.
3. Configura la schermata consenso OAuth e crea un **ID Client OAuth 2.0** per applicazioni web.
4. Aggiungi l'URL del tuo sito GitHub Pages (`https://tuo-username.github.io`) nelle **Origini JavaScript autorizzate**.
5. Apri il file `js/storage_gdrive.js` e sostituisci il valore della costante `GOOGLE_CLIENT_ID` con il tuo Client ID.

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Libero di utilizzarlo, modificarlo e distribuirlo.