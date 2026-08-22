function findClosestDmcColor(r, g, b, alpha) {
  if (alpha < 128) return null;
  let minDistance = Infinity;
  let closest = dmcPalette[0];

  for (const item of dmcPalette) {
    const [dr, dg, db] = item.rgb;
    const distance = Math.sqrt(
      Math.pow(r - dr, 2) + Math.pow(g - dg, 2) + Math.pow(b - db, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = item;
    }
  }
  return closest;
}

document.getElementById('imageLoader').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = COLS;
      tempCanvas.height = ROWS;

      tempCtx.drawImage(img, 0, 0, COLS, ROWS);
      const imgData = tempCtx.getImageData(0, 0, COLS, ROWS).data;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = (r * COLS + c) * 4;
          gridData[r][c] = findClosestDmcColor(imgData[idx], imgData[idx+1], imgData[idx+2], imgData[idx+3]);
        }
      }
      draw();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});
