let gridWidth = 50;
let gridHeight = 50;
let cellSize = 15;
let currentZoom = 1;
let selectedColor = '#000000';
let canvasBackgroundColor = '#FFFFFF';
let gridData = {};

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
}

function initCanvas() {
  canvas.width = gridWidth * cellSize;
  canvas.height = gridHeight * cellSize;
  drawGrid();
  resetZoomFit();
}

function drawGrid() {
  // Riempi lo sfondo con il colore selezionato
  ctx.fillStyle = canvasBackgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Disegna i punti colorati
  for (let key in gridData) {
    const [x, y] = key.split(',').map(Number);
    ctx.fillStyle = gridData[key];
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  // Disegna le linee della griglia
  ctx.lineWidth = 1;
  for (let x = 0; x <= gridWidth; x++) {
    ctx.strokeStyle = (x % 10 === 0) ? '#000000' : '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= gridHeight; y++) {
    ctx.strokeStyle = (y % 10 === 0) ? '#000000' : '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvas.width, y * cellSize);
    ctx.stroke();
  }
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
  if (w > 0 && h > 0 && w <= 200 && h <= 200) {
    gridWidth = w;
    gridHeight = h;
    initCanvas();
  } else {
    alert('Dimensioni griglia non valide. Usa valori tra 10 e 200.');
  }
}

function clearGrid() {
  gridData = {};
  drawGrid();
}

document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

document.getElementById('closeSidebarBtn').addEventListener('click', () => {
  sidebar.classList.remove('open');
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (cellSize * currentZoom));
  const y = Math.floor((e.clientY - rect.top) / (cellSize * currentZoom));
  if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
    gridData[`${x},${y}`] = selectedColor;
    drawGrid();
  }
});

window.addEventListener('resize', resetZoomFit);
window.addEventListener('DOMContentLoaded', () => {
  renderPaletteSelect();
  // Inizializza il preview del colore di sfondo
  const bgSwatch = document.getElementById('backgroundSwatch');
  if (bgSwatch) bgSwatch.style.backgroundColor = canvasBackgroundColor;
  initCanvas();
});
