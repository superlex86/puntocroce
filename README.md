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
