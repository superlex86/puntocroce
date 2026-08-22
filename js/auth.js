let currentUser = null;

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (data.success) {
    currentUser = data.user;
    updateUIState();
    closeModal('loginModal');
  } else {
    alert(data.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('api/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();

  if (data.success) {
    alert('Registrazione completata! Ora puoi accedere.');
    closeModal('registerModal');
    openModal('loginModal');
  } else {
    alert(data.message);
  }
}

async function logout() {
  await fetch('api/logout.php');
  currentUser = null;
  updateUIState();
}

function updateUIState() {
  if (currentUser) {
    document.getElementById('loggedOutUI').style.display = 'none';
    document.getElementById('loggedInUI').style.display = 'flex';
    document.getElementById('userGreeting').innerText = `Ciao, ${currentUser.username}!`;
  } else {
    document.getElementById('loggedOutUI').style.display = 'flex';
    document.getElementById('loggedInUI').style.display = 'none';
  }
}

async function openProjectsModal() {
  openModal('projectsModal');
  const listEl = document.getElementById('projectsList');
  listEl.innerHTML = 'Caricamento...';

  const res = await fetch('api/get_projects.php');
  const data = await res.json();

  if (data.success && data.projects.length > 0) {
    listEl.innerHTML = '';
    data.projects.forEach(p => {
      const item = document.createElement('div');
      item.className = 'project-item';
      item.innerHTML = `
        <span><strong>${p.title}</strong> (${p.updated_at})</span>
        <div>
          <button class="action-btn" onclick='loadServerProject(${JSON.stringify(p.grid_data)})'>Apri</button>
          <button class="action-btn danger" onclick="deleteServerProject(${p.id})">Elimina</button>
        </div>
      `;
      listEl.appendChild(item);
    });
  } else {
    listEl.innerHTML = '<p>Nessun progetto salvato.</p>';
  }
}

function loadServerProject(jsonStr) {
  gridData = JSON.parse(jsonStr);
  draw();
  closeModal('projectsModal');
}

async function deleteServerProject(id) {
  if (!confirm('Vuoi eliminare questo progetto?')) return;
  const res = await fetch('api/delete_project.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const data = await res.json();
  if (data.success) openProjectsModal();
}
