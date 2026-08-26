# 🪡 Punto Croce Web

Un'applicazione web leggera, moderna e totalmente client-side per creare, modificare e convertire immagini in schemi per punto croce con tavolozza colori DMC.

Il progetto è ottimizzato per essere ospitato gratuitamente su **GitHub Pages**. Nel nostro caso è possibile trovarlo su:
[https://superlex86.github.io/puntocroce/](https://superlex86.github.io/puntocroce/)

## 🚀 Caratteristiche

* **Editor Griglia Grafico con Righelli**:
  * Disegno su Canvas con griglia guidata ed evidenziazione visiva ogni 10 punti.
  * Righelli graduati su tutti e 4 i lati dell'area di lavoro per un conteggio rapido dei punti.
  * Controlli di zoom integrati (`+`, `-`, reset/fit automatico allo schermo).
  * Gestione personalizzata delle dimensioni della griglia (fino a 10.000 punti totali).
* **Modalità di Visualizzazione Punti**:
  * **Quadratini pieni**: Anteprima a blocchi di colore pulita e uniforme.
  * **Croci colorate**: Visualizzazione realistica a crocette (spessore di linea a 3px e tratti arrotondati).
* **Personalizzazione Tela di Sfondo**: Possibilità di impostare il colore della tela (Bianco, Giallo Chiaro, Grigio, Nero).
* **Tavolozza Filati DMC**: Selezione di colori reali DMC (29 tonalità) con codici identificativi, denominazione e anteprima (swatch).
* **Convertitore Foto-Schema**: Carica un'immagine (posterizzazione automatica sul colore DMC più vicino) e convertila direttamente in uno schema sulla griglia.
* **Autosalvataggio & Gestione Stato**:
  * Autosalvataggio automatico dello stato di lavoro nel `localStorage` del browser.
  * Gestione dei cambi nome dello schema e rilevamento delle modifiche non ancora esportate.
  * Avviso di conferma in caso di creazione di un nuovo schema o chiusura pagina con modifiche non salvate.
* **Importazione ed Esportazione Avanzata**:
  * **Formato `.json`**: Salvataggio e caricamento nativo dello schema (con supporto alla Web Share API su dispositivi mobile iOS/Android).
  * **Immagine `.png`**: Esportazione dell'anteprima grafica ad alta fedeltà.
  * **Documento `.pdf`**: Generazione di un documento A4 professionale contenente l'immagine dello schema in alta risoluzione e una legenda compattata a 2 colonne dei filati DMC usati (con codici, nomi e conteggio punti totali).
* **100% Client-Side**: Nessun server backend o database richiesto. Funziona interamente nel browser.

## 📁 Struttura del Progetto

```text
index.html            # Interfaccia utente principale e finestre modali
css/
  style.css           # Stili UI, layout responsive, righelli e modali
js/
  editor.js           # Gestione Canvas, righelli, zoom, stili di resa e autosave
  image_converter.js  # Algoritmo di conversione da immagine a schema DMC
  storage_local.js    # Import/Export file .json, esportazione PNG e PDF con legenda
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

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Libero di utilizzarlo, modificarlo e distribuirlo.