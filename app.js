const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const loginNameInput = document.getElementById('userName');

const savedUser = JSON.parse(localStorage.getItem('bioFieldCurrentUser'));

if (savedUser) {
  loginScreen.classList.add('hidden');
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = loginNameInput.value.trim();

  if (!name) return;

  const userData = { name };
  localStorage.setItem('bioFieldCurrentUser', JSON.stringify(userData));

  loginScreen.classList.add('hidden');
  showToast(`Welcome, ${name}!`);
});


const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bioFieldCurrentUser');
    location.reload();
  });
}

const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const notesList = document.getElementById('notesList');
const searchInput = document.getElementById('searchInput');

const tabActive = document.getElementById('tabActive');
const tabTrash = document.getElementById('tabTrash');
const activeCount = document.getElementById('activeCount');
const trashCount = document.getElementById('trashCount');

const photoInput = document.getElementById('photoInput');
const photoPreviewBox = document.getElementById('photoPreviewBox');
const photoPreview = document.getElementById('photoPreview');
const removePhotoBtn = document.getElementById('removePhotoBtn');

const noteTitle = document.getElementById('noteTitle');
const categorySelect = document.getElementById('categorySelect');
const habitatInput = document.getElementById('habitatInput');
const noteBody = document.getElementById('noteBody');
const noteDate = document.getElementById('noteDate');
const saveBtn = document.getElementById('saveBtn');
const newNoteBtn = document.getElementById('newNoteBtn');

const trashBanner = document.getElementById('trashBanner');
const restoreBtn = document.getElementById('restoreBtn');
const permDeleteBtn = document.getElementById('permDeleteBtn');
const moveToTrashBtn = document.getElementById('moveToTrashBtn');

const confirmModal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmModalBtn = document.getElementById('confirmModalBtn');
const toast = document.getElementById('toast');

let notes = JSON.parse(localStorage.getItem('bioFieldAppNotes')) || [];
let activeNoteId = null;
let currentView = 'active';
let currentPhotoData = '';
let pendingAction = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2200);
}

function toggleSidebar(open) {
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
}

menuBtn.addEventListener('click', () => toggleSidebar(true));
closeMenuBtn.addEventListener('click', () => toggleSidebar(false));
overlay.addEventListener('click', () => toggleSidebar(false));

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      currentPhotoData = canvas.toDataURL('image/jpeg', 0.75);
      photoPreview.src = currentPhotoData;
      photoPreviewBox.classList.remove('hidden');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener('click', () => {
  currentPhotoData = '';
  photoInput.value = '';
  photoPreview.src = '';
  photoPreviewBox.classList.add('hidden');
});

tabActive.addEventListener('click', () => {
  currentView = 'active';
  tabActive.classList.add('active');
  tabTrash.classList.remove('active');
  renderNotes(searchInput.value);
});

tabTrash.addEventListener('click', () => {
  currentView = 'trash';
  tabTrash.classList.add('active');
  tabActive.classList.remove('active');
  renderNotes(searchInput.value);
});

function updateCounts() {
  activeCount.textContent = notes.filter(n => !n.isDeleted).length;
  trashCount.textContent = notes.filter(n => n.isDeleted).length;
}

function renderNotes(filter = '') {
  updateCounts();
  notesList.innerHTML = '';
  const query = filter.toLowerCase();

  const filtered = notes.filter(n => {
    const matchesFolder = currentView === 'trash' ? n.isDeleted : !n.isDeleted;
    const matchesSearch =
      n.title.toLowerCase().includes(query) ||
      n.habitat.toLowerCase().includes(query) ||
      n.category.toLowerCase().includes(query);
    return matchesFolder && matchesSearch;
  });

  filtered.forEach(note => {
    const li = document.createElement('li');
    if (note.id === activeNoteId) li.classList.add('active');

    if (note.photo) {
      const thumb = document.createElement('img');
      thumb.src = note.photo;
      thumb.className = 'list-thumb';
      li.appendChild(thumb);
    }

    const label = document.createElement('span');
    label.textContent = `${note.title} (${note.category})`;
    li.appendChild(label);

    li.addEventListener('click', () => {
      loadNote(note.id);
      toggleSidebar(false);
    });
    notesList.appendChild(li);
  });
}

function loadNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  activeNoteId = note.id;
  noteTitle.value = note.title;
  categorySelect.value = note.category;
  habitatInput.value = note.habitat;
  noteBody.value = note.body;
  noteDate.textContent = note.updatedAt;

  if (note.photo) {
    currentPhotoData = note.photo;
    photoPreview.src = note.photo;
    photoPreviewBox.classList.remove('hidden');
  } else {
    currentPhotoData = '';
    photoPreviewBox.classList.add('hidden');
  }

  if (note.isDeleted) {
    trashBanner.classList.remove('hidden');
    moveToTrashBtn.classList.add('hidden');
    saveBtn.classList.add('hidden');
  } else {
    trashBanner.classList.add('hidden');
    moveToTrashBtn.classList.remove('hidden');
    saveBtn.classList.remove('hidden');
  }

  renderNotes(searchInput.value);
}

function createNewNote() {
  activeNoteId = null;
  currentView = 'active';
  tabActive.classList.add('active');
  tabTrash.classList.remove('active');

  noteTitle.value = '';
  categorySelect.selectedIndex = 0;
  habitatInput.value = '';
  noteBody.value = '';
  noteDate.textContent = 'New Observation';
  currentPhotoData = '';
  photoInput.value = '';
  photoPreviewBox.classList.add('hidden');

  trashBanner.classList.add('hidden');
  moveToTrashBtn.classList.add('hidden');
  saveBtn.classList.remove('hidden');
  renderNotes(searchInput.value);
}

saveBtn.addEventListener('click', () => {
  const title = noteTitle.value.trim() || 'Unnamed Specimen';
  const category = categorySelect.value;
  const habitat = habitatInput.value.trim() || 'Unspecified Habitat';
  const body = noteBody.value.trim();
  const timestamp = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  if (activeNoteId) {
    const existing = notes.find(n => n.id === activeNoteId);
    if (existing) {
      existing.title = title;
      existing.category = category;
      existing.habitat = habitat;
      existing.body = body;
      existing.photo = currentPhotoData;
      existing.updatedAt = timestamp;
    }
  } else {
    const newEntry = {
      id: Date.now(),
      title,
      category,
      habitat,
      body,
      photo: currentPhotoData,
      updatedAt: timestamp,
      isDeleted: false
    };
    notes.unshift(newEntry);
    activeNoteId = newEntry.id;
  }

  localStorage.setItem('bioFieldAppNotes', JSON.stringify(notes));
  noteDate.textContent = `Saved • ${timestamp}`;
  moveToTrashBtn.classList.remove('hidden');
  renderNotes(searchInput.value);
  showToast('Observation Saved!');
});

moveToTrashBtn.addEventListener('click', () => {
  if (!activeNoteId) return;
  pendingAction = 'trash';
  modalTitle.textContent = 'Move to Trash?';
  modalMessage.textContent = 'You can retrieve this observation anytime from the Trash tab.';
  confirmModal.classList.remove('hidden');
});

restoreBtn.addEventListener('click', () => {
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;
  note.isDeleted = false;
  localStorage.setItem('bioFieldAppNotes', JSON.stringify(notes));
  loadNote(note.id);
  showToast('Observation Retrieved!');
});

permDeleteBtn.addEventListener('click', () => {
  pendingAction = 'permanent';
  modalTitle.textContent = 'Delete Forever?';
  modalMessage.textContent = 'This cannot be undone.';
  confirmModal.classList.remove('hidden');
});

cancelModalBtn.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
  pendingAction = null;
});

confirmModalBtn.addEventListener('click', () => {
  if (pendingAction === 'trash') {
    const note = notes.find(n => n.id === activeNoteId);
    if (note) note.isDeleted = true;
    localStorage.setItem('bioFieldAppNotes', JSON.stringify(notes));
    confirmModal.classList.add('hidden');
    createNewNote();
    showToast('Moved to Trash');
  } else if (pendingAction === 'permanent') {
    notes = notes.filter(n => n.id !== activeNoteId);
    localStorage.setItem('bioFieldAppNotes', JSON.stringify(notes));
    confirmModal.classList.add('hidden');
    createNewNote();
    showToast('Permanently Deleted');
  }
});

newNoteBtn.addEventListener('click', createNewNote);
searchInput.addEventListener('input', (e) => renderNotes(e.target.value));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

renderNotes();