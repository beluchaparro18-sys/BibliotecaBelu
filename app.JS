const STORAGE_KEY = 'biblioteca-belu-books';

const initialBooks = [
  {
    id: crypto.randomUUID(),
    title: 'El jardín de las palabras',
    author: 'Mara Solís',
    genre: 'Ficción',
    status: 'Leído',
    synopsis: 'Una novela íntima sobre recuerdos, raíces y la forma en que la memoria se vuelve hogar.',
    cover: '',
    pdf: '',
  },
  {
    id: crypto.randomUUID(),
    title: 'Luz de montaña',
    author: 'Tomás Varela',
    genre: 'Aventura',
    status: 'En proceso',
    synopsis: 'Una historia de ascenso, desafío y esperanza en las cumbres más altas del sur.',
    cover: '',
    pdf: '',
  },
  {
    id: crypto.randomUUID(),
    title: 'La casa del viento',
    author: 'Elena Torres',
    genre: 'Misterio',
    status: 'Sin leer',
    synopsis: 'Una casa antigua guarda secretos que apenas empiezan a abrirse cuando llega una nueva inquilina.',
    cover: '',
    pdf: '',
  },
];

const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const bookCount = document.getElementById('bookCount');
const adminModal = document.getElementById('adminModal');
const detailModal = document.getElementById('detailModal');
const bookForm = document.getElementById('bookForm');
const formMessage = document.getElementById('formMessage');
const detailContent = document.getElementById('detailContent');

let books = loadBooks();
let selectedBook = null;

function loadBooks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBooks));
    return initialBooks;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return initialBooks;
  }
}

function persistBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function renderBooks(filter = '') {
  const query = filter.toLowerCase().trim();
  const filtered = books.filter((book) => {
    return [book.title, book.author, book.genre].some((value) => value.toLowerCase().includes(query));
  });

  bookCount.textContent = `${filtered.length} libro${filtered.length === 1 ? '' : 's'}`;

  if (!filtered.length) {
    booksGrid.innerHTML = '<p class="empty-state">No se encontraron libros con esa búsqueda.</p>';
    return;
  }

  booksGrid.innerHTML = filtered
    .map(
      (book) => `
        <article class="book-card" data-id="${book.id}">
          <img class="book-card__cover" src="${book.cover || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'}" alt="Portada de ${book.title}" />
          <div class="book-card__content">
            <h3 class="book-card__title">${book.title}</h3>
            <p class="book-card__meta">${book.author}</p>
            <p class="book-card__meta">${book.genre}</p>
            <span class="status">${book.status}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function openAdminModal() {
  adminModal.classList.remove('hidden');
  formMessage.textContent = '';
  bookForm.reset();
}

function closeAdminModal() {
  adminModal.classList.add('hidden');
}

function openDetailModal(book) {
  selectedBook = book;
  detailContent.innerHTML = `
    <img src="${book.cover || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'}" alt="Portada de ${book.title}" />
    <div class="detail__info">
      <h2>${book.title}</h2>
      <p><strong>Autor:</strong> ${book.author}</p>
      <p><strong>Género:</strong> ${book.genre}</p>
      <p><strong>Estado:</strong> ${book.status}</p>
      <p><strong>Sinopsis:</strong> ${book.synopsis}</p>
      <div class="detail__actions">
        ${book.pdf ? `<a href="${book.pdf}" target="_blank" rel="noopener">Abrir PDF</a>` : '<span class="pill">Sin PDF aún</span>'}
      </div>
    </div>
  `;
  detailModal.classList.remove('hidden');
}

function closeDetailModal() {
  detailModal.classList.add('hidden');
  selectedBook = null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(bookForm);

  const payload = {
    id: crypto.randomUUID(),
    title: formData.get('title').toString().trim(),
    author: formData.get('author').toString().trim(),
    genre: formData.get('genre').toString().trim(),
    status: formData.get('status').toString().trim(),
    synopsis: formData.get('synopsis').toString().trim(),
    cover: '',
    pdf: '',
  };

  if (!payload.title || !payload.author || !payload.genre || !payload.synopsis) {
    formMessage.textContent = 'Completa todos los campos obligatorios.';
    return;
  }

  const coverFile = document.getElementById('cover').files[0];
  const pdfFile = document.getElementById('pdf').files[0];

  if (coverFile) payload.cover = await readFileAsDataUrl(coverFile);
  if (pdfFile) payload.pdf = await readFileAsDataUrl(pdfFile);

  books.unshift(payload);
  persistBooks();
  renderBooks(searchInput.value);
  closeAdminModal();
  formMessage.textContent = 'Libro agregado correctamente.';
}

searchInput.addEventListener('input', (event) => renderBooks(event.target.value));

document.getElementById('openAdminBtn').addEventListener('click', openAdminModal);
document.getElementById('openFormBtn').addEventListener('click', openAdminModal);
document.getElementById('closeAdminModal').addEventListener('click', closeAdminModal);
document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
bookForm.addEventListener('submit', handleFormSubmit);

adminModal.addEventListener('click', (event) => {
  if (event.target === adminModal) closeAdminModal();
});

detailModal.addEventListener('click', (event) => {
  if (event.target === detailModal) closeDetailModal();
});

booksGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.book-card');
  if (!card) return;
  const book = books.find((item) => item.id === card.dataset.id);
  if (book) openDetailModal(book);
});

renderBooks();