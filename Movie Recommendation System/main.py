from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle
import numpy as np
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer
import os
 
app = FastAPI(title="Movie Recommendation API", version="2.0")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# ── Load data ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
 
with open(os.path.join(BASE, "movies.pkl"), "rb") as f:
    movies: pd.DataFrame = pickle.load(f)
 
with open(os.path.join(BASE, "embeddings.pkl"), "rb") as f:
    embeddings: np.ndarray = pickle.load(f)
 
faiss_index = faiss.read_index(os.path.join(BASE, "faiss_index.bin"))
 
# Sentence transformer for semantic search queries
model = SentenceTransformer("all-MiniLM-L6-v2")
 
# Genre ID → Name mapping (TMDB standard)
GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
}
 
def parse_genre_ids(raw) -> List[int]:
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        return [int(x.strip()) for x in raw.split(",") if x.strip().isdigit()]
    return []
 
def movie_to_dict(row: pd.Series, idx: int) -> dict:
    genre_ids = parse_genre_ids(row.get("genre_ids", []))
    genres = [GENRE_MAP.get(g, str(g)) for g in genre_ids]
    year = str(row.get("release_date", ""))[:4]
    return {
        "id": idx,
        "tmdb_id": int(row.get("id", 0)),
        "title": row.get("title", "Unknown"),
        "overview": row.get("overview", ""),
        "genres": genres,
        "genre_ids": genre_ids,
        "year": year,
        "popularity": round(float(row.get("popularity", 0)), 2),
        "vote_average": round(float(row.get("vote_average", 0)), 1),
        "vote_count": int(row.get("vote_count", 0)),
        "language": row.get("original_language", "en"),
        "poster_url": f"https://image.tmdb.org/t/p/w500",  # needs tmdb key for real posters
    }
 
# ── Endpoints ─────────────────────────────────────────────────────────────────
 
@app.get("/")
def root():
    return {"message": "Movie Recommendation API v2.0 is running 🎬"}
 
 
@app.get("/home")
def home(
    category: str = Query("popular", enum=["popular", "top_rated", "recent"]),
    limit: int = Query(24, ge=1, le=100),
    page: int = Query(1, ge=1),
):
    """Browse movies by category with pagination."""
    df = movies.copy()
 
    if category == "popular":
        df = df.sort_values("popularity", ascending=False)
    elif category == "top_rated":
        df = df[df["vote_count"] >= 500].sort_values("vote_average", ascending=False)
    elif category == "recent":
        df = df.sort_values("release_date", ascending=False)
 
    total = len(df)
    start = (page - 1) * limit
    end = start + limit
    page_df = df.iloc[start:end]
 
    results = [movie_to_dict(row, int(idx)) for idx, row in page_df.iterrows()]
    return {
        "category": category,
        "page": page,
        "total": total,
        "total_pages": (total + limit - 1) // limit,
        "results": results,
    }
 
 
@app.get("/movie/{movie_id}")
def get_movie(movie_id: int):
    """Get details of a single movie by its DataFrame index."""
    if movie_id < 0 or movie_id >= len(movies):
        raise HTTPException(status_code=404, detail="Movie not found")
    row = movies.iloc[movie_id]
    return movie_to_dict(row, movie_id)
 
 
@app.get("/recommend/{movie_id}")
def recommend(
    movie_id: int,
    top_k: int = Query(10, ge=1, le=50),
):
    """FAISS-based semantic recommendations for a given movie."""
    if movie_id < 0 or movie_id >= len(movies):
        raise HTTPException(status_code=404, detail="Movie not found")
 
    query_vec = embeddings[movie_id].reshape(1, -1).astype("float32")
    distances, indices = faiss_index.search(query_vec, top_k + 1)
 
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == movie_id or idx < 0:
            continue
        row = movies.iloc[idx]
        movie = movie_to_dict(row, int(idx))
        movie["similarity_score"] = round(float(1 / (1 + dist)), 4)
        results.append(movie)
        if len(results) >= top_k:
            break
 
    return {
        "source_movie": movie_to_dict(movies.iloc[movie_id], movie_id),
        "recommendations": results,
    }
 
 
@app.get("/search")
def search(
    q: str = Query(..., min_length=2),
    top_k: int = Query(12, ge=1, le=50),
    genre: Optional[str] = None,
    min_rating: float = Query(0.0, ge=0.0, le=10.0),
    language: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
):
    """Semantic search across movie titles and overviews with filters."""
    query_vec = model.encode([q]).astype("float32")
    distances, indices = faiss_index.search(query_vec, top_k * 5)
 
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < 0:
            continue
        row = movies.iloc[idx]
 
        # Filters
        if float(row.get("vote_average", 0)) < min_rating:
            continue
        if language and row.get("original_language", "") != language:
            continue
        if year_from or year_to:
            year_str = str(row.get("release_date", ""))[:4]
            year = int(year_str) if year_str.isdigit() else 0
            if year_from and year < year_from:
                continue
            if year_to and year > year_to:
                continue
        if genre:
            genre_ids = parse_genre_ids(row.get("genre_ids", []))
            genre_names = [GENRE_MAP.get(g, "").lower() for g in genre_ids]
            if genre.lower() not in genre_names:
                continue
 
        movie = movie_to_dict(row, int(idx))
        movie["similarity_score"] = round(float(1 / (1 + dist)), 4)
        results.append(movie)
        if len(results) >= top_k:
            break
 
    return {"query": q, "total": len(results), "results": results}
 
 
@app.get("/genres")
def list_genres():
    """Return all available genres with movie counts."""
    counts = {}
    for _, row in movies.iterrows():
        for gid in parse_genre_ids(row.get("genre_ids", [])):
            name = GENRE_MAP.get(gid)
            if name:
                counts[name] = counts.get(name, 0) + 1
    genres = sorted([{"name": k, "count": v} for k, v in counts.items()], key=lambda x: -x["count"])
    return {"genres": genres}
 
 
@app.get("/genre/{genre_name}")
def movies_by_genre(
    genre_name: str,
    limit: int = Query(24, ge=1, le=100),
    sort_by: str = Query("popularity", enum=["popularity", "vote_average", "release_date"]),
):
    """Get movies filtered by a specific genre."""
    target_id = next((k for k, v in GENRE_MAP.items() if v.lower() == genre_name.lower()), None)
    if target_id is None:
        raise HTTPException(status_code=404, detail=f"Genre '{genre_name}' not found")
 
    mask = movies["genre_ids"].apply(lambda x: target_id in parse_genre_ids(x))
    filtered = movies[mask].sort_values(sort_by, ascending=False).head(limit)
 
    return {
        "genre": genre_name,
        "total": int(mask.sum()),
        "results": [movie_to_dict(row, int(idx)) for idx, row in filtered.iterrows()],
    }
 
 
@app.get("/stats")
def stats():
    """Dataset statistics."""
    return {
        "total_movies": len(movies),
        "avg_rating": round(float(movies["vote_average"].mean()), 2),
        "languages": movies["original_language"].value_counts().head(10).to_dict(),
        "year_range": {
            "min": str(movies["release_date"].min())[:4],
            "max": str(movies["release_date"].max())[:4],
        },
        "top_genres": {GENRE_MAP.get(int(k), str(k)): v for k, v in {}. items()},
    }
 
 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)