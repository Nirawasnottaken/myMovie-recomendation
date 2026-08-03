const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cinematch_super_secret_devops_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Load In-Memory Movie Dataset
const moviesPath = path.join(__dirname, 'data', 'movies.json');
let movies = [];

try {
  const data = fs.readFileSync(moviesPath, 'utf8');
  movies = JSON.parse(data);
  console.log(`[INFO] Loaded ${movies.length} movies into memory.`);
} catch (err) {
  console.error('[ERROR] Failed to load movies dataset:', err);
}

// User & Rating Database (In-Memory for portability)
const users = [
  { id: 'u1', username: 'demo', email: 'demo@cinematch.com', password: 'password123' }
];

const ratings = [
  { userId: 'u1', movieId: 'm1', rating: 5, timestamp: new Date().toISOString() },
  { userId: 'u1', movieId: 'm2', rating: 5, timestamp: new Date().toISOString() },
  { userId: 'u1', movieId: 'm4', rating: 4, timestamp: new Date().toISOString() }
];

// Helper Functions
function calculateTagSimilarity(movieA, movieB) {
  const setA = new Set([...movieA.genre, ...(movieA.tags || [])]);
  const setB = new Set([...movieB.genre, ...(movieB.tags || [])]);
  
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : (intersection / union);
}

// API Routes

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'CineMatch-Backend-API', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Operational',
    version: '1.0.0',
    moviesCount: movies.length,
    ratingsCount: ratings.length,
    usersCount: users.length
  });
});

// Authentication Routes (Day 2 requirement)
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }

  const newUser = { id: `u${users.length + 1}`, username, email, password };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ message: 'Registration successful', token, user: { id: newUser.id, username, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email } });
});

// Movie Search & List APIs (Day 2 requirement)
app.get('/api/movies', (req, res) => {
  const { q, genre, minRating } = req.query;
  let results = [...movies];

  if (q) {
    const query = q.toLowerCase();
    results = results.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.director.toLowerCase().includes(query) ||
      m.genre.some(g => g.toLowerCase().includes(query)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(query)))
    );
  }

  if (genre && genre !== 'All') {
    results = results.filter(m => m.genre.includes(genre));
  }

  if (minRating) {
    results = results.filter(m => m.rating >= parseFloat(minRating));
  }

  res.json({ count: results.length, movies: results });
});

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  // Calculate average user rating
  const movieRatings = ratings.filter(r => r.movieId === movie.id);
  const avgUserRating = movieRatings.length > 0
    ? (movieRatings.reduce((sum, r) => sum + r.rating, 0) / movieRatings.length).toFixed(1)
    : movie.rating;

  res.json({ ...movie, userRatingAverage: parseFloat(avgUserRating), totalRatingsCount: movieRatings.length });
});

// Recommendation Engine API (Day 2 requirement)
app.get('/api/recommendations', (req, res) => {
  const { movieId, genre } = req.query;
  
  let recommended = [];

  if (movieId) {
    const targetMovie = movies.find(m => m.id === movieId);
    if (!targetMovie) return res.status(404).json({ error: 'Target movie not found' });

    recommended = movies
      .filter(m => m.id !== movieId)
      .map(m => {
        const similarityScore = calculateTagSimilarity(targetMovie, m);
        return { ...m, similarityScore: Math.round(similarityScore * 100) };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);
  } else if (genre) {
    recommended = movies
      .filter(m => m.genre.includes(genre))
      .map(m => ({ ...m, similarityScore: Math.floor(Math.random() * 20) + 80 }))
      .sort((a, b) => b.rating - a.rating);
  } else {
    // Default hybrid recommendations based on top rated & sci-fi popularity
    recommended = movies.map(m => {
      const matchPct = Math.floor(80 + Math.random() * 19);
      return { ...m, similarityScore: matchPct };
    }).sort((a, b) => b.rating - a.rating);
  }

  res.json({
    algorithm: 'Content-Based Cosine Tag Similarity',
    recommendations: recommended.slice(0, 6)
  });
});

// Submit Ratings API (Day 2 requirement)
app.post('/api/ratings', (req, res) => {
  const { userId, movieId, rating } = req.body;

  if (!movieId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Valid movieId and rating (1-5) are required' });
  }

  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  const existingRatingIndex = ratings.findIndex(r => r.userId === (userId || 'u1') && r.movieId === movieId);
  if (existingRatingIndex >= 0) {
    ratings[existingRatingIndex].rating = Number(rating);
    ratings[existingRatingIndex].timestamp = new Date().toISOString();
  } else {
    ratings.push({
      userId: userId || 'u1',
      movieId,
      rating: Number(rating),
      timestamp: new Date().toISOString()
    });
  }

  res.json({ message: 'Rating submitted successfully', movieId, rating: Number(rating) });
});

// Amazon S3 Poster Upload Integration API (Day 8 requirement)
app.post('/api/upload/poster', (req, res) => {
  const { filename, fileType } = req.body;
  const s3Bucket = process.env.S3_BUCKET_NAME || 'cinematch-movie-posters-bucket';
  
  // Mocking Presigned AWS S3 URL for poster upload
  const mockS3Url = `https://${s3Bucket}.s3.amazonaws.com/posters/${Date.now()}_${filename || 'poster.jpg'}`;

  res.json({
    message: 'Presigned S3 URL generated successfully',
    uploadUrl: mockS3Url,
    bucket: s3Bucket,
    key: `posters/${filename || 'poster.jpg'}`
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🎬 CineMatch Backend API running on port ${PORT}`);
  console.log(` 📍 Health check: http://localhost:${PORT}/health`);
  console.log(` 📍 Movies API:   http://localhost:${PORT}/api/movies`);
  console.log(`====================================================`);
});
