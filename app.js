const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api'
  : '/api'; // Express backend routing via Nginx proxy in production

let currentMovies = [];
let currentGenre = "All";

let selectedMovieForRating = null;
let currentRatingValue = 0;
let userToken = localStorage.getItem('cinematch_token') || null;
let currentUser = JSON.parse(localStorage.getItem('cinematch_user')) || null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  updateUserUI();
  fetchRecommendations();
  fetchCatalog();
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      fetchCatalog(query);
    });
  }
}

// UI State & Auth
function updateUserUI() {
  const authBtn = document.getElementById('authBtn');
  if (currentUser && userToken) {
    authBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${currentUser.username}`;
    authBtn.classList.remove('btn-primary');
    authBtn.classList.add('btn-glass');
    authBtn.onclick = logoutUser;
  } else {
    authBtn.innerHTML = `<i class="fa-solid fa-user"></i> Login`;
    authBtn.classList.remove('btn-glass');
    authBtn.classList.add('btn-primary');
    authBtn.onclick = openLoginModal;
  }
}

function logoutUser() {
  localStorage.removeItem('cinematch_token');
  localStorage.removeItem('cinematch_user');
  userToken = null;
  currentUser = null;
  updateUserUI();
  alert('Logged out successfully');
}

// Fetch Recommendations (Day 3 & Day 2 API integration)
async function fetchRecommendations(movieId = '') {
  const grid = document.getElementById('recommendationGrid');
  grid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Calculating similarity scores...</div>`;

  try {
    const url = movieId ? `${API_BASE_URL}/recommendations?movieId=${movieId}` : `${API_BASE_URL}/recommendations`;
    const res = await fetch(url);
    const data = await res.json();
    
    renderMovieGrid(data.recommendations, 'recommendationGrid', true);
  } catch (err) {
    console.error('Failed to fetch recommendations:', err);
    grid.innerHTML = `<div class="loading-spinner">Unable to connect to Recommendation API. Please start backend server.</div>`;
  }
}

// Fetch Full Catalog
async function fetchCatalog(searchQuery = '', genre = 'All', page = 1) {

    const grid = document.getElementById('movieCatalogGrid');
    const catalogCount = document.getElementById('catalogCount');

    try {

        const params = new URLSearchParams();

        if (searchQuery)
            params.append('q', searchQuery);

        if (genre !== 'All')
            params.append('genre', genre);

        params.append('page', page);
        params.append('limit', 20);

        const url = `${API_BASE_URL}/movies?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        currentMovies = data.movies;

        catalogCount.innerText =
            `Page ${data.page} of ${data.totalPages}`;

        renderMovieGrid(data.movies, 'movieCatalogGrid', false);

        renderPagination(data.page, data.totalPages);

        document.getElementById("startMovie").textContent =
            ((data.page - 1) * data.limit) + 1;

        document.getElementById("endMovie").textContent =
            Math.min(data.page * data.limit, data.totalMovies);

        document.getElementById("totalMovies").textContent =
            data.totalMovies;

    } catch (err) {

        console.error(err);

        grid.innerHTML =
            `<div class="loading-spinner">Unable to load movie catalog.</div>`;

    }

}

// Render Movie Cards
function renderMovieGrid(movies, containerId, isRecommendation = false) {
  const container = document.getElementById(containerId);
  if (!movies || movies.length === 0) {
    container.innerHTML = `<div class="loading-spinner">No movies found.</div>`;
    return;
  }

  container.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <div class="poster-wrapper">
        <img src="${movie.poster}" alt="${movie.title}" class="poster-img" loading="lazy">
        <div class="rating-badge"><i class="fa-solid fa-star"></i> ${movie.rating}</div>
        ${isRecommendation ? `<div class="match-badge">${movie.similarityScore || 90}% Match</div>` : ''}
      </div>
      <div class="movie-info">
        <div>
          <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
          <div class="movie-meta">${movie.year} • ${movie.director}</div>
          <div class="movie-genres">
            ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-glow" onclick="getRecommendationsForHero('${movie.id}')">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Similar
          </button>
          <button class="btn btn-glass" onclick="openRatingModal('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-star"></i> Rate
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Genre Filtering
function filterGenre(genre, button) {

    currentGenre = genre;

    document.querySelectorAll(".pill").forEach(p =>
        p.classList.remove("active")
    );

    button.classList.add("active");

    fetchCatalog(
        document.getElementById("searchInput").value,
        genre,
        1
    );
}

function getRecommendationsForHero(movieId) {
  const target = currentMovies.find(m => m.id === movieId);
  if (target) {
    document.getElementById('heroTitle').innerText = `${target.title} (${target.year})`;
    document.getElementById('heroDesc').innerText = target.description;
  }
  fetchRecommendations(movieId);
  document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
}

// Rating Modal Logic
function openRatingModal(movieId, title) {
  selectedMovieForRating = movieId;
  currentRatingValue = 0;
  document.getElementById('ratingMovieTitle').innerText = title;
  resetStars();
  document.getElementById('ratingModal').style.display = 'flex';
}

function closeRatingModal() {
  document.getElementById('ratingModal').style.display = 'none';
}

function setRating(val) {
  currentRatingValue = val;
  const stars = document.querySelectorAll('#starContainer .star');
  stars.forEach((star, index) => {
    if (index < val) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function resetStars() {
  const stars = document.querySelectorAll('#starContainer .star');
  stars.forEach(star => star.classList.remove('active'));
}

async function submitRating() {
  if (!currentRatingValue) {
    alert('Please select a star rating (1-5)');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser ? currentUser.id : 'u1',
        movieId: selectedMovieForRating,
        rating: currentRatingValue
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Rating submitted! Thank you.`);
      closeRatingModal();
      fetchRecommendations();
    } else {
      alert(data.error || 'Failed to submit rating');
    }
  } catch (err) {
    console.error(err);
    alert('Error submitting rating');
  }
}

// Authentication Modal Logic
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      userToken = data.token;
      currentUser = data.user;
      localStorage.setItem('cinematch_token', data.token);
      localStorage.setItem('cinematch_user', JSON.stringify(data.user));
      updateUserUI();
      closeLoginModal();
      alert(`Welcome back, ${currentUser.username}!`);
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    alert('Login request failed');
  }
}
function renderPagination(currentPage, totalPages) {

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    function createButton(label, page, active = false, disabled = false) {

        const btn = document.createElement("button");

        btn.textContent = label;
        btn.className = "page-number";

        if (active) btn.classList.add("active");
        if (disabled) btn.disabled = true;

        btn.onclick = () => {

            if (!disabled && page !== currentPage) {
                fetchCatalog(
                    document.getElementById("searchInput").value,
                    currentGenre,
                    page
                );
            }

        };

        pagination.appendChild(btn);

    }

    createButton("«", 1, false, currentPage === 1);
    createButton("‹", currentPage - 1, false, currentPage === 1);

    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    createButton(1, 1, currentPage === 1);

    if (start > 2) {
        const dots = document.createElement("span");
        dots.className = "page-dots";
        dots.textContent = "...";
        pagination.appendChild(dots);
    }

    for (let i = start; i <= end; i++) {
        createButton(i, i, currentPage === i);
    }

    if (end < totalPages - 1) {
        const dots = document.createElement("span");
        dots.className = "page-dots";
        dots.textContent = "...";
        pagination.appendChild(dots);
    }

    if (totalPages > 1) {
        createButton(totalPages, totalPages, currentPage === totalPages);
    }

    createButton("›", currentPage + 1, false, currentPage === totalPages);
    createButton("»", totalPages, false, currentPage === totalPages);

}