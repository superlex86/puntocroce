// Esporta la griglia completa con il colore di sfondo scelto e linee in PNG
function exportPNG() {
  const canvas = document.getElementById('crossStitchCanvas');
  if (!canvas) return;

  // Crea un canvas temporaneo in memoria per garantire uno sfondo coprente
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  // 1. Riempie lo sfondo con il colore scelto
  exportCtx.fillStyle = canvasBackgroundColor;
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Copia la visualizzazione corrente, inclusi stile e sfondo
  exportCtx.drawImage(canvas, 0, 0);

  // 3. Scarica l'immagine
  const link = document.createElement('a');
  link.download = 'schema-punto-croce.png';
  link.href = exportCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Esporta la griglia completa con sfondo scelto in PDF (singola pagina A4)
function exportPDF() {
  const canvas = document.getElementById('crossStitchCanvas');
  if (!canvas) return;

  // Crea un canvas temporaneo in memoria per garantire uno sfondo coprente
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  // 1. Riempie lo sfondo con il colore scelto
  exportCtx.fillStyle = canvasBackgroundColor;
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Copia la visualizzazione corrente, inclusi stile e sfondo
  exportCtx.drawImage(canvas, 0, 0);

  // 3. Crea PDF con jsPDF
  if (typeof window.jspdf === 'undefined') {
    alert('Libreria PDF non caricata. Riprova.');
    return;
  }

  const imgData = exportCanvas.toDataURL('image/png');
  const pdf = new window.jspdf.jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const padding = 10;
  const imgWidth = pdfWidth - 2 * padding;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Verifica se l'immagine entra in una pagina
  if (imgHeight <= pdfHeight - 2 * padding) {
    const yOffset = (pdfHeight - imgHeight) / 2;
    pdf.addImage(imgData, 'PNG', padding, yOffset, imgWidth, imgHeight);
  } else {
    // Se troppo grande, adatta l'altezza
    const maxImgHeight = pdfHeight - 2 * padding;
    const scaledWidth = (maxImgHeight * canvas.width) / canvas.height;
    const xOffset = (pdfWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, padding, scaledWidth, maxImgHeight);
  }

  pdf.save('schema-punto-croce.pdf');
}

// Salva lo stato del progetto con Web Share API (mobile) o Download diretto (desktop)
async function exportProjectToLocal() {
  const projectData = {
    title: 'Schema Punto Croce',
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cellSize: cellSize,
    gridData: gridData
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const file = new File([jsonStr], 'schema-punto-croce.json', { type: 'application/json' });

  // Utilizza il menu di condivisione nativo del sistema operativo se disponibile (Android / iOS)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Schema Punto Croce',
        text: 'Ecco il mio schema punto croce'
      });
      isDirty = false;
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Errore nella condivisione:', err);
      } else {
        return; // L'utente ha annullato il menu di condivisione
      }
    }
  }

  // Fallback per browser PC desktop o browser mobile senza supporto Web Share API
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema-punto-croce.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  isDirty = false;
}

// Carica un file .cross o .json salvato
function importProjectFromLocal(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const projectData = JSON.parse(e.target.result);
      
      const w = projectData.gridWidth || projectData.cols;
      const h = projectData.gridHeight || projectData.rows;
      const data = projectData.gridData || projectData.grid;

      if (w && h && data) {
        gridWidth = w;
        gridHeight = h;
        gridData = data;

        const inputW = document.getElementById('gridWidthInput');
        const inputH = document.getElementById('gridHeightInput');
        if (inputW) inputW.value = gridWidth;
        if (inputH) inputH.value = gridHeight;

        initCanvas();
        autoSaveToLocalStorage();
        isDirty = false;

        alert('Progetto caricato con successo!');
      } else {
        alert('Formato file non valido.');
      }
    } catch (err) {
      alert('Errore nella lettura del file.');
    }
  };
  reader.readAsText(file);
  // Reset file input per permettere la selezione dello stesso file
  event.target.value = '';
}
