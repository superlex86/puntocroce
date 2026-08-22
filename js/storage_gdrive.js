const GOOGLE_CLIENT_ID = 'IL_TUO_CLIENT_ID.apps.googleusercontent.com';
let tokenClient;

function initGoogleDrive() {
  if (typeof google === 'undefined') return;
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
  const fileContent = JSON.stringify({ grid: gridData, cols: COLS, rows: ROWS });
  const file = new Blob([fileContent], { type: 'application/json' });
  
  const metadata = {
    name: 'schema_punto_croce.cross',
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
