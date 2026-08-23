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
      tempCanvas.width = gridWidth;
      tempCanvas.height = gridHeight;

      tempCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
      const imgData = tempCtx.getImageData(0, 0, gridWidth, gridHeight).data;

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const idx = (y * gridWidth + x) * 4;
          const color = findClosestDmcColor(imgData[idx], imgData[idx+1], imgData[idx+2], imgData[idx+3]);
          if (color) {
            gridData[`${x},${y}`] = color.hex;
          }
        }
      }
      drawGrid();
      alert('Immagine convertita in schema punto croce!');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
  // Reset file input per permettere la selezione dello stesso file
  e.target.value = '';
});
