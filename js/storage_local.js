// Esporta la griglia completa con sfondo bianco e linee in PNG
function exportPNG() {
  const canvas = document.getElementById('crossStitchCanvas');
  if (!canvas) return;

  // Crea un canvas temporaneo in memoria per garantire uno sfondo bianco coprente
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  // 1. Riempie lo sfondo di BIANCO (evita l'effetto negativo/trasparente)
  exportCtx.fillStyle = '#FFFFFF';
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // 2. Copia la griglia e i crocette dal canvas principale
  exportCtx.drawImage(canvas, 0, 0);

  // 3. Scarica l'immagine
  const link = document.createElement('a');
  link.download = 'schema-punto-croce.png';
  link.href = exportCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Salva lo stato del progetto in un file .cross (JSON)
function exportProjectToLocal() {
  const projectData = {
    title: 'Schema Punto Croce',
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cellSize: cellSize,
    gridData: gridData
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema.cross';
  
  // Necessario per compatibilità con mobile/SPCK/Firefox
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => URL.revokeObjectURL(url), 100);
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
        alert('Progetto caricato con successo!');
      } else {
        alert('Formato file non valido.');
      }
    } catch (err) {
      alert('Errore nella lettura del file.');
    }
  };
  reader.readAsText(file);
}
