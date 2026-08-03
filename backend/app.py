from tracemalloc import start

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import jwt
import datetime
from functools import wraps

# =====================================================
# Configuration
# =====================================================

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("PORT", 3000))
JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "cinematch_super_secret_devops_key_2026"
)

# =====================================================
# Load Movie Dataset
# =====================================================

movies = []

movies_path = os.path.join(
    os.path.dirname(__file__),
    "data",
    "movies.json"
)

try:
    with open(movies_path, "r", encoding="utf-8") as file:
        movies = json.load(file)

    print(f"[INFO] Loaded {len(movies)} movies into memory.")

except Exception as e:
    print("[ERROR] Failed to load movie dataset")
    print(e)

# =====================================================
# In-Memory Database
# =====================================================

users = [
    {
        "id": "u1",
        "username": "demo",
        "email": "demo@cinematch.com",
        "password": "password123"
    }
]

ratings = [
    {
        "userId": "u1",
        "movieId": "m1",
        "rating": 5,
        "timestamp": datetime.datetime.utcnow().isoformat()
    },
    {
        "userId": "u1",
        "movieId": "m2",
        "rating": 5,
        "timestamp": datetime.datetime.utcnow().isoformat()
    },
    {
        "userId": "u1",
        "movieId": "m4",
        "rating": 4,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
]

# =====================================================
# Helper Functions
# =====================================================

def calculate_tag_similarity(movie_a, movie_b):
    """
    Calculate Jaccard similarity
    between genres + tags.
    """

    set_a = set(movie_a.get("genre", []))
    set_b = set(movie_b.get("genre", []))

    set_a.update(movie_a.get("tags", []))
    set_b.update(movie_b.get("tags", []))

    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))

    if union == 0:
        return 0

    return intersection / union


# =====================================================
# JWT Authentication
# =====================================================

def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        token = None

        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "error": "Token missing"
            }), 401

        try:

            data = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )

            current_user = next(
                (
                    user for user in users
                    if user["id"] == data["id"]
                ),
                None
            )

            if current_user is None:
                raise Exception()

        except Exception:

            return jsonify({
                "error": "Invalid token"
            }), 401

        return func(current_user, *args, **kwargs)

    return wrapper

# =====================================================
# Health API
# =====================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "UP",
        "service": "CineMatch-Backend-API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

# =====================================================
# Status API
# =====================================================

@app.route("/api/status", methods=["GET"])
def status():

    return jsonify({

        "status": "Operational",
        "version": "1.0.0",

        "moviesCount": len(movies),
        "ratingsCount": len(ratings),
        "usersCount": len(users)

    })

# =====================================================
# Register API
# =====================================================

@app.route("/api/auth/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:

        return jsonify({
            "error": "Username, email, and password are required"
        }), 400

    existing = next(
        (
            user for user in users
            if user["email"] == email
        ),
        None
    )

    if existing:

        return jsonify({
            "error": "User already exists with this email"
        }), 400

    new_user = {

        "id": f"u{len(users)+1}",
        "username": username,
        "email": email,
        "password": password

    }

    users.append(new_user)

    token = jwt.encode(

        {

            "id": new_user["id"],
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)

        },

        JWT_SECRET,
        algorithm="HS256"

    )

    return jsonify({

        "message": "Registration successful",

        "token": token,

        "user": {

            "id": new_user["id"],
            "username": username,
            "email": email

        }

    }), 201

# =====================================================
# Login API
# =====================================================

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = next(

        (

            u for u in users

            if u["email"] == email
            and u["password"] == password

        ),

        None

    )

    if user is None:

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    token = jwt.encode(

        {

            "id": user["id"],
            "username": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)

        },

        JWT_SECRET,
        algorithm="HS256"

    )

    return jsonify({

        "message": "Login successful",

        "token": token,

        "user": {

            "id": user["id"],
            "username": user["username"],
            "email": user["email"]

        }

    })




# =====================================================
# Movies API
# =====================================================

@app.route("/api/movies", methods=["GET"])
def get_movies():

    query = request.args.get("q")
    genre = request.args.get("genre")
    min_rating = request.args.get("minRating")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=20, type=int)

    results = movies.copy()

    # Search
    if query:

        query = query.lower()

        results = [

            movie for movie in results

            if (
                query in movie.get("title", "").lower()
                or query in movie.get("director", "").lower()
                or any(query in g.lower() for g in movie.get("genre", []))
                or any(query in t.lower() for t in movie.get("tags", []))
            )

        ]

    # Genre Filter
    if genre and genre != "All":

        results = [

            movie for movie in results

            if genre in movie.get("genre", [])

        ]

    # Minimum Rating
    if min_rating:

        try:

            rating_limit = float(min_rating)

            results = [

                movie for movie in results

                if float(movie.get("rating", 0)) >= rating_limit

            ]

        except ValueError:
            pass

    total_movies = len(results)
    total_pages = (total_movies + limit - 1) // limit

    start = (page - 1) * limit
    end = start + limit

    paginated_results = results[start:end]

    return jsonify({
      "page": page,
      "limit": limit,
      "count": len(paginated_results),
      "totalMovies": total_movies,
      "totalPages": total_pages,
      "movies": paginated_results
})


# =====================================================
# Movie Details API
# =====================================================

@app.route("/api/movies/<movie_id>", methods=["GET"])
def get_movie(movie_id):

    movie = next(

        (

            m for m in movies

            if m["id"] == movie_id

        ),

        None

    )

    if movie is None:

        return jsonify({

            "error": "Movie not found"

        }), 404

    movie_ratings = [

        r for r in ratings

        if r["movieId"] == movie_id

    ]

    if len(movie_ratings):

        avg_rating = round(

            sum(r["rating"] for r in movie_ratings)
            / len(movie_ratings),

            1

        )

    else:

        avg_rating = movie.get("rating", 0)

    response = movie.copy()

    response["userRatingAverage"] = avg_rating
    response["totalRatingsCount"] = len(movie_ratings)

    return jsonify(response)


# =====================================================
# Recommendation Engine
# =====================================================

@app.route("/api/recommendations", methods=["GET"])
def recommendations():

    import random

    movie_id = request.args.get("movieId")
    genre = request.args.get("genre")

    recommended = []

    # ------------------------------------------
    # Similar Movie Recommendation
    # ------------------------------------------

    if movie_id:

        target = next(

            (

                movie for movie in movies

                if movie["id"] == movie_id

            ),

            None

        )

        if target is None:

            return jsonify({

                "error": "Target movie not found"

            }), 404

        for movie in movies:

            if movie["id"] == movie_id:
                continue

            score = calculate_tag_similarity(target, movie)

            item = movie.copy()

            item["similarityScore"] = round(score * 100)

            recommended.append(item)

        recommended.sort(

            key=lambda x: x["similarityScore"],
            reverse=True

        )

    # ------------------------------------------
    # Genre Recommendation
    # ------------------------------------------

    elif genre:

        recommended = [

            movie.copy()

            for movie in movies

            if genre in movie.get("genre", [])

        ]

        for movie in recommended:

            movie["similarityScore"] = random.randint(80, 99)

        recommended.sort(

            key=lambda x: x.get("rating", 0),
            reverse=True

        )

    # ------------------------------------------
    # Default Hybrid Recommendation
    # ------------------------------------------

    else:

        recommended = [

            movie.copy()

            for movie in movies

        ]

        for movie in recommended:

            movie["similarityScore"] = random.randint(80, 99)

        recommended.sort(

            key=lambda x: x.get("rating", 0),
            reverse=True

        )

    return jsonify({

        "algorithm": "Content-Based Cosine Tag Similarity",

        "recommendations": recommended[:6]

    })

# =====================================================
# Ratings API
# =====================================================

@app.route("/api/ratings", methods=["POST"])
def submit_rating():

    data = request.get_json()

    user_id = data.get("userId", "u1")
    movie_id = data.get("movieId")
    rating = data.get("rating")

    if movie_id is None or rating is None:

        return jsonify({
            "error": "Valid movieId and rating (1-5) are required"
        }), 400

    try:
        rating = int(rating)
    except Exception:
        return jsonify({
            "error": "Rating must be a number"
        }), 400

    if rating < 1 or rating > 5:

        return jsonify({
            "error": "Rating must be between 1 and 5"
        }), 400

    movie = next(

        (

            m for m in movies

            if m["id"] == movie_id

        ),

        None

    )

    if movie is None:

        return jsonify({
            "error": "Movie not found"
        }), 404

    existing = next(

        (

            r for r in ratings

            if r["userId"] == user_id
            and r["movieId"] == movie_id

        ),

        None

    )

    if existing:

        existing["rating"] = rating
        existing["timestamp"] = datetime.datetime.utcnow().isoformat()

    else:

        ratings.append({

            "userId": user_id,
            "movieId": movie_id,
            "rating": rating,
            "timestamp": datetime.datetime.utcnow().isoformat()

        })

    return jsonify({

        "message": "Rating submitted successfully",
        "movieId": movie_id,
        "rating": rating

    })


# =====================================================
# Mock Amazon S3 Poster Upload API
# =====================================================

@app.route("/api/upload/poster", methods=["POST"])
def upload_poster():

    data = request.get_json()

    filename = data.get("filename", "poster.jpg")
    file_type = data.get("fileType", "")

    bucket = os.environ.get(
        "S3_BUCKET_NAME",
        "cinematch-movie-posters-bucket"
    )

    upload_url = (
        f"https://{bucket}.s3.amazonaws.com/"
        f"posters/{int(datetime.datetime.utcnow().timestamp())}_{filename}"
    )

    return jsonify({

        "message": "Presigned S3 URL generated successfully",

        "uploadUrl": upload_url,

        "bucket": bucket,

        "key": f"posters/{filename}",

        "fileType": file_type

    })


# =====================================================
# Protected Test Route (Optional)
# =====================================================

@app.route("/api/profile", methods=["GET"])
@token_required
def profile(current_user):

    return jsonify({

        "message": "Authenticated",

        "user": {

            "id": current_user["id"],
            "username": current_user["username"],
            "email": current_user["email"]

        }

    })


# =====================================================
# 404 Handler
# =====================================================

@app.errorhandler(404)
def not_found(e):

    return jsonify({

        "error": "Endpoint not found"

    }), 404


# =====================================================
# Global Error Handler
# =====================================================

@app.errorhandler(Exception)
def internal_error(e):

    print(e)

    return jsonify({

        "error": "Internal Server Error"

    }), 500


# =====================================================
# Start Server
# =====================================================


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)


    