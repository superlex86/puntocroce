let gridWidth = 30;
let gridHeight = 30;
let cellSize = 15;
let currentZoom = 1;
let selectedColor = '#000000';
let canvasBackgroundColor = '#FFFFFF';
let renderStyle = 'square';
let gridData = {};

const AUTOSAVE_KEY = 'punto_croce_autosave';
const PROJECT_NAME = 'Schema';
const DEFAULT_SCHEMA_PREFIX = `${PROJECT_NAME} `;
let schemaName = `${DEFAULT_SCHEMA_PREFIX}1`;
let schemaNameWasRenamed = false;
let isDirty = false;
const RULER_SIZE = 25; // Spazio in pixel per i righelli in alto e a sinistra

function updateProjectStatus(status) {
  const statusElement = document.getElementById('projectStatus');
  if (statusElement) statusElement.textContent = status;
}

function getSafeFileName(extension) {
  const safeName = schemaName.trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/[. ]+$/, '')
    .trim() || `${DEFAULT_SCHEMA_PREFIX}1`;
  return `${safeName}.${extension}`;
}

function updateSchemaName(value) {
  const nextName = value.trim() || `${DEFAULT_SCHEMA_PREFIX}1`;
  schemaNameWasRenamed = nextName !== schemaName;
  schemaName = nextName;
  autoSaveToLocalStorage();
  updateProjectStatus('Nome modificato - autosalvataggio pagina aggiornato');
}

function markAutosaveAsExported() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return;
    const state = JSON.parse(saved);
    state.hasUnexportedChanges = false;
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Errore nell\'aggiornamento dello stato di esportazione', e);
  }
}

function getNextSchemaName() {
  if (schemaNameWasRenamed) return `${DEFAULT_SCHEMA_PREFIX}1`;
  const match = schemaName.match(/^Schema (\d+)$/);
  const nextNumber = match ? Number(match[1]) + 1 : 1;
  return `${DEFAULT_SCHEMA_PREFIX}${nextNumber}`;
}

function createNewSchema() {
  if (isDirty) {
    const warningText = document.getElementById('newSchemaWarningText');
    if (warningText) warningText.textContent = `${schemaName} contiene modifiche non ancora salvate in un file JSON.`;
    const modal = document.getElementById('newSchemaModal');
    if (modal) modal.style.display = 'flex';
    return;
  }
  proceedWithNewSchema();
}

function closeNewSchemaModal() {
  const modal = document.getElementById('newSchemaModal');
  if (modal) modal.style.display = 'none';
}

async function exportBeforeNewSchema() {
  closeNewSchemaModal();
  const exported = await exportProjectToLocal();
  if (exported) proceedWithNewSchema();
}

function proceedWithNewSchema() {
  closeNewSchemaModal();
  gridWidth = 30;
  gridHeight = 30;
  cellSize = 15;
  canvasBackgroundColor = '#FFFFFF';
  renderStyle = 'square';
  gridData = {};
  schemaName = getNextSchemaName();
  schemaNameWasRenamed = false;
  isDirty = false;

  const inputW = document.getElementById('gridWidthInput');
  const inputH = document.getElementById('gridHeightInput');
  const schemaNameInput = document.getElementById('schemaNameInput');
  const bgSelect = document.getElementById('backgroundColorSelect');
  const styleSelect = document.getElementById('renderStyleSelect');
  if (inputW) inputW.value = gridWidth;
  if (inputH) inputH.value = gridHeight;
  if (schemaNameInput) schemaNameInput.value = schemaName;
  if (bgSelect) bgSelect.value = canvasBackgroundColor;
  if (styleSelect) styleSelect.value = renderStyle;
  const bgSwatch = document.getElementById('backgroundSwatch');
  if (bgSwatch) bgSwatch.style.backgroundColor = canvasBackgroundColor;

  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (e) {
    console.error('Errore nella rimozione del salvataggio automatico', e);
  }
  initCanvas();
  updateProjectStatus('Nuovo schema - nessun autosalvataggio pagina');
}

// Funzione helper per convertire HEX a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

const dmcPalette = [
  { code: '310', name: 'Nero', hex: '#000000', rgb: hexToRgb('#000000') },
  { code: 'BLANC', name: 'Bianco Neve', hex: '#FFFFFF', rgb: hexToRgb('#FFFFFF') },
  { code: '666', name: 'Rosso Brillante', hex: '#E31D2B', rgb: hexToRgb('#E31D2B') },
  { code: '321', name: 'Rosso', hex: '#C71123', rgb: hexToRgb('#C71123') },
  { code: '498', name: 'Rosso Scuro', hex: '#A70C1B', rgb: hexToRgb('#A70C1B') },
  { code: '815', name: 'Garnet / Borgogna', hex: '#770712', rgb: hexToRgb('#770712') },
  { code: '602', name: 'Rosa Cranberry', hex: '#E3337A', rgb: hexToRgb('#E3337A') },
  { code: '605', name: 'Rosa Chiaro', hex: '#FA92BA', rgb: hexToRgb('#FA92BA') },
  { code: '743', name: 'Giallo Medio', hex: '#F3C010', rgb: hexToRgb('#F3C010') },
  { code: '745', name: 'Giallo Chiaro', hex: '#FFE79A', rgb: hexToRgb('#FFE79A') },
  { code: '972', name: 'Giallo Canarino', hex: '#FFBC00', rgb: hexToRgb('#FFBC00') },
  { code: '740', name: 'Arancione', hex: '#FF6F00', rgb: hexToRgb('#FF6F00') },
  { code: '900', name: 'Arancione Scuro', hex: '#D73B00', rgb: hexToRgb('#D73B00') },
  { code: '702', name: 'Verde Erba', hex: '#11A843', rgb: hexToRgb('#11A843') },
  { code: '700', name: 'Verde Brillante', hex: '#008733', rgb: hexToRgb('#008733') },
  { code: '699', name: 'Verde Intenso', hex: '#006B27', rgb: hexToRgb('#006B27') },
  { code: '986', name: 'Verde Foresta', hex: '#17401B', rgb: hexToRgb('#17401B') },
  { code: '826', name: 'Blu Medio', hex: '#4B88B3', rgb: hexToRgb('#4B88B3') },
  { code: '796', name: 'Blu Scuro Royal', hex: '#112C6E', rgb: hexToRgb('#112C6E') },
  { code: '820', name: 'Blu Notte Intenso', hex: '#0A1845', rgb: hexToRgb('#0A1845') },
  { code: '208', name: 'Lilla Scuro', hex: '#83418A', rgb: hexToRgb('#83418A') },
  { code: '209', name: 'Lilla', hex: '#A568A9', rgb: hexToRgb('#A568A9') },
  { code: '211', name: 'Lilla Chiarissimo', hex: '#D9B1DA', rgb: hexToRgb('#D9B1DA') },
  { code: '434', name: 'Marrone Cammello', hex: '#955427', rgb: hexToRgb('#955427') },
  { code: '801', name: 'Marrone Scuro', hex: '#532D11', rgb: hexToRgb('#532D11') },
  { code: '3371', name: 'Marrone Nero', hex: '#1E0E04', rgb: hexToRgb('#1E0E04') },
  { code: '415', name: 'Grigio Perla', hex: '#D3D3D5', rgb: hexToRgb('#D3D3D5') },
  { code: '318', name: 'Grigio Medio', hex: '#9B9B9D', rgb: hexToRgb('#9B9B9D') },
  { code: '413', name: 'Grigio Antracite', hex: '#545456', rgb: hexToRgb('#545456') }
];

const canvas = document.getElementById('crossStitchCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');
const sidebar = document.getElementById('sidebar');

function autoSaveToLocalStorage() {
  const state = {
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cellSize: cellSize,
    schemaName: schemaName,
    schemaNameWasRenamed: schemaNameWasRenamed,
    hasUnexportedChanges: true,
    canvasBackgroundColor: canvasBackgroundColor,
    renderStyle: renderStyle,
    gridData: gridData,
    updatedAt: new Date().toISOString()
  };
  isDirty = true;

  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    updateProjectStatus('Autosalvataggio pagina aggiornato - scarica lo schema per conservarlo sul dispositivo');
  } catch (e) {
    console.error('Errore nel salvataggio automatico locale', e);
    updateProjectStatus('Autosalvataggio pagina non disponibile');
  }
}

function restoreFromLocalStorage() {
  let saved;
  try {
    saved = localStorage.getItem(AUTOSAVE_KEY);
  } catch (e) {
    console.error('Errore nella lettura del salvataggio automatico', e);
    updateProjectStatus('Autosalvataggio pagina non disponibile');
    return false;
  }

  if (!saved) {
    updateProjectStatus('Nessun autosalvataggio pagina');
    return false;
  }

  try {
    const state = JSON.parse(saved);
    const validDimensions = Number.isInteger(state.gridWidth) &&
      Number.isInteger(state.gridHeight) &&
      state.gridWidth >= 10 && state.gridWidth <= 200 &&
      state.gridHeight >= 10 && state.gridHeight <= 200;
    const validGridData = state.gridData &&
      typeof state.gridData === 'object' &&
      !Array.isArray(state.gridData);

    if (!validDimensions || !validGridData) {
      updateProjectStatus('Autosalvataggio pagina non valido');
      return false;
    }

    gridWidth = state.gridWidth;
    gridHeight = state.gridHeight;
    gridData = state.gridData;
    if (typeof state.schemaName === 'string' && state.schemaName.trim()) schemaName = state.schemaName.trim();
    schemaNameWasRenamed = state.schemaNameWasRenamed === true;
    isDirty = state.hasUnexportedChanges !== false;
    if (Number.isFinite(state.cellSize) && state.cellSize > 0) cellSize = state.cellSize;
    if (state.canvasBackgroundColor) canvasBackgroundColor = state.canvasBackgroundColor;
    if (state.renderStyle) renderStyle = state.renderStyle;

    const inputW = document.getElementById('gridWidthInput');
    const inputH = document.getElementById('gridHeightInput');
    if (inputW) inputW.value = gridWidth;
    if (inputH) inputH.value = gridHeight;

    const bgSelect = document.getElementById('backgroundColorSelect');
    if (bgSelect) bgSelect.value = canvasBackgroundColor;

    const styleSelect = document.getElementById('renderStyleSelect');
    if (styleSelect) styleSelect.value = renderStyle;

    const schemaNameInput = document.getElementById('schemaNameInput');
    if (schemaNameInput) schemaNameInput.value = schemaName;

    updateProjectStatus('Autosalvataggio pagina ripristinato - verifica o scarica lo schema');
    return true;
  } catch (e) {
    console.error('Errore nel caricamento del salvataggio automatico', e);
    updateProjectStatus('Autosalvataggio pagina non valido');
  }
  return false;
}

function renderPaletteSelect() {
  const select = document.getElementById('dmcSelect');
  if (!select) return;
  select.innerHTML = '';
  
  dmcPalette.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.hex;
    opt.textContent = `DMC ${item.code} - ${item.name}`;
    select.appendChild(opt);
  });

  if (dmcPalette.length > 0) {
    onColorSelectChange(dmcPalette[0].hex);
  }
}

function onColorSelectChange(hexValue) {
  selectedColor = hexValue;
  const swatch = document.getElementById('selectedSwatch');
  if (swatch) swatch.style.backgroundColor = hexValue;
}

function onCanvasBackgroundChange(hexValue) {
  canvasBackgroundColor = hexValue;
  const bgSwatch = document.getElementById('backgroundSwatch');
  if (bgSwatch) bgSwatch.style.backgroundColor = hexValue;
  drawGrid();
  autoSaveToLocalStorage();
}

function onRenderStyleChange(style) {
  renderStyle = style;
  drawGrid();
  autoSaveToLocalStorage();
}

function initCanvas() {
  canvas.width = (gridWidth * cellSize) + (RULER_SIZE * 2);
  canvas.height = (gridHeight * cellSize) + (RULER_SIZE * 2);
  drawGrid();
  resetZoomFit();
}

function drawGrid() {
  const gridPixelWidth = gridWidth * cellSize;
  const gridPixelHeight = gridHeight * cellSize;

  // 1. Sfondo completo canvas e area lavoro
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = canvasBackgroundColor;
  ctx.fillRect(RULER_SIZE, RULER_SIZE, gridPixelWidth, gridPixelHeight);

  // 2. Disegno Crocette / Quadrati (con offset RULER_SIZE)
  if (renderStyle === 'cross') {
    ctx.lineWidth = Math.max(1.5, cellSize * 0.1);
    ctx.lineCap = 'butt';
    for (let key in gridData) {
      const [x, y] = key.split(',').map(Number);
      const cellX = RULER_SIZE + (x * cellSize);
      const cellY = RULER_SIZE + (y * cellSize);
      ctx.strokeStyle = gridData[key];
      ctx.beginPath();
      ctx.moveTo(cellX, cellY);
      ctx.lineTo(cellX + cellSize, cellY + cellSize);
      ctx.moveTo(cellX + cellSize, cellY);
      ctx.lineTo(cellX, cellY + cellSize);
      ctx.stroke();
    }
  } else {
    for (let key in gridData) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = gridData[key];
      ctx.fillRect(RULER_SIZE + (x * cellSize), RULER_SIZE + (y * cellSize), cellSize, cellSize);
    }
  }

  // 3. Linee Griglia
  ctx.lineWidth = 1;
  ctx.lineCap = 'butt';
  for (let x = 0; x <= gridWidth; x++) {
    const posX = RULER_SIZE + (x * cellSize);
    ctx.strokeStyle = (x % 10 === 0) ? '#000000' : '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(posX, RULER_SIZE);
    ctx.lineTo(posX, RULER_SIZE + gridPixelHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= gridHeight; y++) {
    const posY = RULER_SIZE + (y * cellSize);
    ctx.strokeStyle = (y % 10 === 0) ? '#000000' : '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(RULER_SIZE, posY);
    ctx.lineTo(RULER_SIZE + gridPixelWidth, posY);
    ctx.stroke();
  }

  // 4. Disegno fascia dei 4 righelli (Alto, Basso, Sinistra, Destra)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, canvas.width, RULER_SIZE); // Alto
  ctx.fillRect(0, canvas.height - RULER_SIZE, canvas.width, RULER_SIZE); // Basso
  ctx.fillRect(0, 0, RULER_SIZE, canvas.height); // Sinistra
  ctx.fillRect(canvas.width - RULER_SIZE, 0, RULER_SIZE, canvas.height); // Destra

  // Bordi interni di separazione tra righelli e griglia
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(RULER_SIZE, RULER_SIZE, gridPixelWidth, gridPixelHeight);

  // Stile Testo e Tacche
  ctx.fillStyle = '#334155';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // RIGHELLI ORIZZONTALI (Alto & Basso)
  // Saltiamo x == 0 e x == gridWidth per non stampare valori negli angoli
  for (let x = 1; x < gridWidth; x++) {
    const posX = RULER_SIZE + (x * cellSize);
    if (x % 10 === 0) {
      // Testo alto e basso
      ctx.fillText(x.toString(), posX, RULER_SIZE / 2);
      ctx.fillText(x.toString(), posX, canvas.height - (RULER_SIZE / 2));
      
      // Tacche
      ctx.beginPath();
      ctx.moveTo(posX, RULER_SIZE - 4); ctx.lineTo(posX, RULER_SIZE);
      ctx.moveTo(posX, canvas.height - RULER_SIZE); ctx.lineTo(posX, canvas.height - RULER_SIZE + 4);
      ctx.stroke();
    } else if (x % 5 === 0) {
      ctx.beginPath();
      ctx.moveTo(posX, RULER_SIZE - 2); ctx.lineTo(posX, RULER_SIZE);
      ctx.moveTo(posX, canvas.height - RULER_SIZE); ctx.lineTo(posX, canvas.height - RULER_SIZE + 2);
      ctx.stroke();
    }
  }

  // RIGHELLI VERTICALI (Sinistra & Destra)
  // Saltiamo y == 0 e y == gridHeight per non stampare valori negli angoli
  for (let y = 1; y < gridHeight; y++) {
    const posY = RULER_SIZE + (y * cellSize);
    if (y % 10 === 0) {
      // Testo sinistra e destra
      ctx.fillText(y.toString(), RULER_SIZE / 2, posY);
      ctx.fillText(y.toString(), canvas.width - (RULER_SIZE / 2), posY);
      
      // Tacche
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE - 4, posY); ctx.lineTo(RULER_SIZE, posY);
      ctx.moveTo(canvas.width - RULER_SIZE, posY); ctx.lineTo(canvas.width - RULER_SIZE + 4, posY);
      ctx.stroke();
    } else if (y % 5 === 0) {
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE - 2, posY); ctx.lineTo(RULER_SIZE, posY);
      ctx.moveTo(canvas.width - RULER_SIZE, posY); ctx.lineTo(canvas.width - RULER_SIZE + 2, posY);
      ctx.stroke();
    }
  }

  // 5. Copertura neutrale dei 4 Angoli (Senza label)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE); // Top-Left
  ctx.fillRect(canvas.width - RULER_SIZE, 0, RULER_SIZE, RULER_SIZE); // Top-Right
  ctx.fillRect(0, canvas.height - RULER_SIZE, RULER_SIZE, RULER_SIZE); // Bottom-Left
  ctx.fillRect(canvas.width - RULER_SIZE, canvas.height - RULER_SIZE, RULER_SIZE, RULER_SIZE); // Bottom-Right

  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(0, 0, RULER_SIZE, RULER_SIZE);
  ctx.strokeRect(canvas.width - RULER_SIZE, 0, RULER_SIZE, RULER_SIZE);
  ctx.strokeRect(0, canvas.height - RULER_SIZE, RULER_SIZE, RULER_SIZE);
  ctx.strokeRect(canvas.width - RULER_SIZE, canvas.height - RULER_SIZE, RULER_SIZE, RULER_SIZE);
}

function changeZoom(delta) {
  currentZoom = Math.min(Math.max(0.2, currentZoom + delta), 3.0);
  applyZoom();
}

function resetZoomFit() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  
  const padding = 40;
  const availableWidth = workspace.clientWidth - padding;
  const availableHeight = workspace.clientHeight - padding;

  const scaleX = availableWidth / canvas.width;
  const scaleY = availableHeight / canvas.height;

  currentZoom = Math.min(scaleX, scaleY);
  currentZoom = Math.min(Math.max(currentZoom, 0.2), 1.5);

  applyZoom();
}

function applyZoom() {
  const scaledWidth = canvas.width * currentZoom;
  const scaledHeight = canvas.height * currentZoom;

  container.style.width = `${scaledWidth}px`;
  container.style.height = `${scaledHeight}px`;

  canvas.style.width = `${scaledWidth}px`;
  canvas.style.height = `${scaledHeight}px`;
}

function resizeGridFromInput() {
  const w = parseInt(document.getElementById('gridWidthInput').value);
  const h = parseInt(document.getElementById('gridHeightInput').value);
  if (w >= 10 && h >= 10 && w <= 200 && h <= 200 && (w * h) <= 10000) {
    gridWidth = w;
    gridHeight = h;
    initCanvas();
    autoSaveToLocalStorage();
  } else {
    alert('Dimensioni griglia non valide. Usa valori di larghezza e altezza tra 10 e 200, ma al massimo i punti gestibili sono 10000 (es: 100x100, 50x200, 200x50)');
  }
}

function clearGrid() {
  if (confirm('Sei sicuro di voler svuotare l\'intera griglia?')) {
    gridData = {};
    localStorage.removeItem(AUTOSAVE_KEY);
    isDirty = false;
    drawGrid();
    updateProjectStatus('Griglia vuota - nessun autosalvataggio pagina');
  }
}

document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

document.getElementById('closeSidebarBtn').addEventListener('click', () => {
  sidebar.classList.remove('open');
});

document.getElementById('schemaNameForm').addEventListener('submit', (e) => {
  e.preventDefault();
  updateSchemaName(document.getElementById('schemaNameInput').value);
});

document.getElementById('schemaNameInput').addEventListener('change', (e) => {
  updateSchemaName(e.target.value);
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Sottraiamo il margine del righello scalato con lo zoom
  const x = Math.floor((clickX - (RULER_SIZE * currentZoom)) / (cellSize * currentZoom));
  const y = Math.floor((clickY - (RULER_SIZE * currentZoom)) / (cellSize * currentZoom));

  if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
    gridData[`${x},${y}`] = selectedColor;
    drawGrid();
    autoSaveToLocalStorage();
  }
});

window.addEventListener('beforeunload', (e) => {
  if (isDirty && Object.keys(gridData).length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

window.addEventListener('resize', resetZoomFit);

window.addEventListener('DOMContentLoaded', () => {
  renderPaletteSelect();

  if (restoreFromLocalStorage()) {
    const bgSwatch = document.getElementById('backgroundSwatch');
    if (bgSwatch) bgSwatch.style.backgroundColor = canvasBackgroundColor;
    canvas.width = (gridWidth * cellSize) + (RULER_SIZE * 2);
    canvas.height = (gridHeight * cellSize) + (RULER_SIZE * 2);
    drawGrid();
    resetZoomFit();
  } else {
    // Inizializza il preview del colore di sfondo
    const bgSwatch = document.getElementById('backgroundSwatch');
    if (bgSwatch) bgSwatch.style.backgroundColor = canvasBackgroundColor;
    initCanvas();
    updateProjectStatus('Nessun autosalvataggio pagina');
  }
});

// Funzioni per la modal di conversione foto
function openImageConverterModal() {
  const modal = document.getElementById('imageConverterModal');
  if (modal) modal.style.display = 'flex';
}

function closeImageConverterModal() {
  const modal = document.getElementById('imageConverterModal');
  if (modal) modal.style.display = 'none';
}

function proceedWithImageConversion() {
  closeImageConverterModal();
  const fileInput = document.getElementById('imageLoader');
  if (fileInput) fileInput.click();
}
