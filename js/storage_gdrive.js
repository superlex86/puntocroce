const GOOGLE_CLIENT_ID = 'IL_TUO_CLIENT_ID.apps.googleusercontent.com';
let tokenClient;

function initGoogleDrive() {
  if (typeof google === 'undefined') return;
  if (GOOGLE_CLIENT_ID.includes('IL_TUO_CLIENT_ID')) {
    alert('⚠️ Errore: Google Client ID non configurato. Vai su https://console.cloud.google.com/ per ottenere un Client ID valido, poi aggiorna storage_gdrive.js');
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: async (response) => {
      if (response.access_token) {
        await uploadToGoogleDrive(response.access_token);
      }
    },
  });
}

function saveToDrive() {
  if (!tokenClient) initGoogleDrive();
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    alert('Google Identity Services SDK non caricato.');
  }
}

async function uploadToGoogleDrive(accessToken) {
  const projectData = {
    title: schemaName,
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cellSize: cellSize,
    gridData: gridData
  };
  const fileContent = JSON.stringify(projectData);
  const file = new Blob([fileContent], { type: 'application/json' });
  
  const metadata = {
    name: getSafeFileName('json'),
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form
  });

  if (res.ok) {
    alert('Schema salvato con successo su Google Drive!');
  } else {
    alert('Errore durante il salvataggio su Google Drive.');
  }
}
