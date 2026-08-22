function exportProjectToLocal() {
  const projectData = {
    title: 'Schema Punto Croce',
    cols: COLS,
    rows: ROWS,
    grid: gridData
  };
  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema.cross';
  a.click();
  URL.revokeObjectURL(url);
}

function importProjectFromLocal(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const projectData = JSON.parse(e.target.result);
      if (projectData.grid) {
        gridData = projectData.grid;
        draw();
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
