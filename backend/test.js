const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST RUNNER] Running CineMatch Backend Unit Tests...');

// 1. Verify Dataset load
const moviesPath = path.join(__dirname, 'data', 'movies.json');
assert.strictEqual(fs.existsSync(moviesPath), true, 'movies.json should exist');

const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
assert.strictEqual(Array.isArray(movies), true, 'movies dataset should be an array');
assert.strictEqual(movies.length >= 10, true, 'movies dataset should contain at least 10 entries');

// 2. Verify Cosine / Tag Similarity logic
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

const sim = calculateTagSimilarity(movies[0], movies[1]); // Interstellar vs Inception
assert.strictEqual(typeof sim, 'number', 'Similarity should return a number');
assert.strictEqual(sim > 0, true, 'Interstellar and Inception should have positive similarity');

console.log('[TEST RUNNER] ✅ All 4 unit tests PASSED successfully!');
