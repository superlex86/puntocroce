const COLS = 30;
const ROWS = 30;
const CELL_SIZE = 22;

const dmcPalette = [
  { code: 'DMC 310', name: 'Nero', hex: '#000000', rgb: [0, 0, 0], symbol: '★', textColor: '#ffffff' },
  { code: 'DMC 666', name: 'Rosso', hex: '#E31C3D', rgb: [227, 28, 61], symbol: '♥', textColor: '#ffffff' },
  { code: 'DMC 796', name: 'Blu', hex: '#1034A6', rgb: [16, 52, 166], symbol: '▲', textColor: '#ffffff' },
  { code: 'DMC 702', name: 'Verde', hex: '#4B9B49', rgb: [75, 155, 73], symbol: '■', textColor: '#ffffff' },
  { code: 'DMC 743', name: 'Giallo', hex: '#FCD116', rgb: [252, 209, 22], symbol: '●', textColor: '#000000' },
  { code: 'DMC B5200', name: 'Bianco', hex: '#FFFFFF', rgb: [255, 255, 255], symbol: '◇', textColor: '#000000' },
  { code: 'DMC 3825', name: 'Arancione', hex: '#F7A266', rgb: [247, 162, 102], symbol: '✦', textColor: '#000000' },
  { code: 'DMC 550', name: 'Viola', hex: '#5C1D52', rgb: [92, 29, 82], symbol: '✿', textColor: '#ffffff' }
];

let selectedColor = dmcPalette[1];
let gridData = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
let isMouseDown = false;

const canvas = document.getElementById('crossStitchCanvas');
const ctx = canvas.getContext('2d');

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

function initPalette() {
  const paletteContainer = document.getElementById('palette');
  paletteContainer.innerHTML = '';
  dmcPalette.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.className = `color-btn ${item.code === selectedColor.code ? 'active' : ''}`;
    btn.onclick = () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = item;
    };
    btn.innerHTML = `
      <div class="swatch" style="background:${item.hex}; color:${item.textColor}">${item.symbol}</div>
      <div><div>${item.code}</div><small style="color:#666">${item.name}</small></div>
    `;
    paletteContainer.appendChild(btn);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const item = gridData[r][c];
      if (item) {
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        
        ctx.fillStyle = item.hex;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        ctx.strokeStyle = item.textColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + CELL_SIZE - 3, y + CELL_SIZE - 3);
        ctx.moveTo(x + CELL_SIZE - 3, y + 3);
        ctx.lineTo(x + 3, y + CELL_SIZE - 3);
        ctx.stroke();

        ctx.fillStyle = item.textColor;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    }
  }

  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.strokeStyle = (i % 10 === 0) ? '#000000' : '#cccccc';
    ctx.lineWidth = (i % 10 === 0) ? 1.5 : 0.5;
    
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }
}

function handleInteract(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    if (e.buttons === 1) gridData[row][col] = selectedColor;
    else if (e.buttons === 2) gridData[row][col] = null;
    draw();
  }
}

canvas.addEventListener('mousedown', (e) => { isMouseDown = true; handleInteract(e); });
canvas.addEventListener('mousemove', (e) => { if (isMouseDown) handleInteract(e); });
window.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function clearGrid() {
  gridData = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  draw();
}

function exportPNG() {
  const link = document.createElement('a');
  link.download = 'schema-punto-croce.png';
  link.href = canvas.toDataURL();
  link.click();
}

initPalette();
draw();
