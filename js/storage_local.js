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
  link.download = getSafeFileName('png');
  link.href = exportCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Esporta la griglia completa con sfondo scelto e legenda colori in PDF (priorità allo schema)
function exportPDF() {
  const canvas = document.getElementById('crossStitchCanvas');
  if (!canvas) return;

  if (typeof window.jspdf === 'undefined') {
    alert('Libreria PDF non caricata. Riprova.');
    return;
  }

  // 1. Calcola le frequenze dei colori usati nella griglia
  const colorCounts = {};
  for (const key in gridData) {
    const hex = gridData[key];
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }

  const usedColors = Object.keys(colorCounts).map(hex => {
    const dmcItem = dmcPalette.find(item => item.hex.toLowerCase() === hex.toLowerCase());
    return {
      code: dmcItem ? dmcItem.code : 'N/D',
      name: dmcItem ? dmcItem.name : 'Sconosciuto',
      hex: hex,
      count: colorCounts[hex]
    };
  });

  // 2. Prepara il canvas temporaneo per l'immagine dello schema
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  exportCtx.fillStyle = canvasBackgroundColor;
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(canvas, 0, 0);

  const imgData = exportCanvas.toDataURL('image/png');

  // 3. Inizializza il PDF (A4)
  const pdf = new window.jspdf.jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const padding = 8;
  const maxImgWidth = pdfWidth - (2 * padding);
  
  // Riserva l'80% dell'altezza dello schermo allo schema
  const maxImgHeight = (pdfHeight - (2 * padding)) * 0.80; 

  let imgWidth = maxImgWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > maxImgHeight) {
    imgHeight = maxImgHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }

  const xOffset = (pdfWidth - imgWidth) / 2;
  pdf.addImage(imgData, 'PNG', xOffset, padding, imgWidth, imgHeight);

  // 4. Disegno della Legenda Compatta a 2 Colonne
  let startY = padding + imgHeight + 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);
  pdf.text('Legenda Filati DMC', padding, startY);

  startY += 4;

  if (usedColors.length === 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Nessun punto presente nello schema.', padding, startY);
  } else {
    // Configurazione 2 Colonne
    const colWidth = (pdfWidth - (2 * padding) - 6) / 2;
    const colStartX = [padding, padding + colWidth + 6];

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');

    let currentColumn = 0;
    let currentY = startY;

    usedColors.forEach((color) => {
      // Cambio colonna / pagina se si raggiunge il margine inferiore
      if (currentY + 5 > pdfHeight - padding) {
        if (currentColumn === 0) {
          currentColumn = 1;
          currentY = startY;
        } else {
          pdf.addPage();
          currentColumn = 0;
          startY = padding + 4;
          currentY = startY;
        }
      }

      const baseX = colStartX[currentColumn];

      // Campione colore (Swatch)
      const rgb = hexToRgb(color.hex);
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(baseX, currentY, 4, 3.5, 'F');
      pdf.setDrawColor(148, 163, 184);
      pdf.rect(baseX, currentY, 4, 3.5, 'S');

      // Testi compatti: Codice - Nome (Punti)
      pdf.setTextColor(15, 23, 42);
      const labelText = `${color.code} - ${color.name}`;
      const countText = `(${color.count} pt)`;

      // Tronca il nome se troppo lungo per stare nella mezza colonna
      const maxTextWidth = colWidth - 22;
      const truncatedLabel = pdf.splitTextToSize(labelText, maxTextWidth)[0];

      pdf.text(truncatedLabel, baseX + 6, currentY + 2.7);
      pdf.text(countText, baseX + colWidth - 2, currentY + 2.7, { align: 'right' });

      // Linea sottile di separazione
      pdf.setDrawColor(241, 245, 249);
      pdf.line(baseX, currentY + 4.2, baseX + colWidth, currentY + 4.2);

      currentY += 4.8;
    });
  }

  pdf.save(getSafeFileName('pdf'));
}

// Salva lo stato del progetto con Web Share API (mobile) o Download diretto (desktop)
async function exportProjectToLocal() {
  const projectData = {
    title: schemaName,
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cellSize: cellSize,
    gridData: gridData
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const file = new File([jsonStr], getSafeFileName('json'), { type: 'application/json' });

  // Utilizza il menu di condivisione nativo del sistema operativo se disponibile (Android / iOS)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: schemaName,
        text: `Ecco il mio schema punto croce: ${schemaName}`
      });
      isDirty = false;
      markAutosaveAsExported();
      updateProjectStatus('Schema scaricato - autosalvataggio pagina sincronizzato');
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Errore nella condivisione:', err);
      } else {
        return false;
      }
    }
  }

  // Fallback per browser PC desktop o browser mobile senza supporto Web Share API
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = getSafeFileName('json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  isDirty = false;
  markAutosaveAsExported();
  updateProjectStatus('Schema scaricato - autosalvataggio pagina sincronizzato');
  return true;
}

// Carica un file .json salvato
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
        if (typeof projectData.title === 'string' && projectData.title.trim()) {
          schemaName = projectData.title.trim();
          schemaNameWasRenamed = !/^Schema \d+$/.test(schemaName);
        }

        const inputW = document.getElementById('gridWidthInput');
        const inputH = document.getElementById('gridHeightInput');
        if (inputW) inputW.value = gridWidth;
        if (inputH) inputH.value = gridHeight;
        const schemaNameInput = document.getElementById('schemaNameInput');
        if (schemaNameInput) schemaNameInput.value = schemaName;

        initCanvas();
        autoSaveToLocalStorage();
        isDirty = false;
        markAutosaveAsExported();
        updateProjectStatus('Schema caricato - autosalvataggio pagina sincronizzato');

        alert('Schema caricato con successo!');
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
