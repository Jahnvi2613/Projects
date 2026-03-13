import requests
import streamlit as st

# =============================
# CONFIG
# =============================
API_BASE = "http://127.0.0.1:8000"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

st.set_page_config(
    page_title="🎬 Movie Recommender",
    page_icon="🎬",
    layout="wide"
)

# =============================
# STYLES
# =============================
st.markdown("""
<style>
body {
    background: linear-gradient(135deg,#0f0c29,#302b63,#24243e);
}
.movie-card {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 10px;
    transition: 0.3s;
    text-align: center;
}
.movie-card:hover {
    transform: scale(1.05);
}
.movie-title {
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
}
</style>
""", unsafe_allow_html=True)

# =============================
# HELPERS
# =============================
def api_get(path, params=None):
    try:
        r = requests.get(f"{API_BASE}{path}", params=params, timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"API error: {e}")
        return None


def movie_card(movie, clickable=False):
    poster = movie.get("poster_url")
    title = movie.get("title", "")
    rating = movie.get("vote_average")

    st.markdown('<div class="movie-card">', unsafe_allow_html=True)

    if poster:
        st.image(poster, use_container_width=True)

    st.markdown(f'<div class="movie-title">{title}</div>', unsafe_allow_html=True)

    if rating:
        st.caption(f"⭐ {rating}")

    if clickable:
        if st.button("View", key=f"view-{movie['tmdb_id']}"):
            st.session_state["selected_tmdb_id"] = movie["tmdb_id"]
            st.session_state["selected_title"] = title
            st.rerun()   # ✅ UPDATED (no experimental)

    st.markdown('</div>', unsafe_allow_html=True)

# =============================
# SIDEBAR
# =============================
st.sidebar.title("🎥 Movie Recommender")

mode = st.sidebar.radio(
    "Choose mode",
    ["🏠 Home", "🔍 Search Movie"]
)

category = st.sidebar.selectbox(
    "Home category",
    ["popular", "trending", "top_rated", "upcoming", "now_playing"]
)

# =============================
# MOVIE DETAILS (TOP SECTION)
# =============================
if "selected_tmdb_id" in st.session_state:
    tmdb_id = st.session_state["selected_tmdb_id"]
    title = st.session_state["selected_title"]

    details = api_get(f"/movie/id/{tmdb_id}")

    if details:
        st.markdown("## 🎬 Selected Movie")

        col1, col2 = st.columns([1, 2])

        with col1:
            if details.get("poster_url"):
                st.image(details["poster_url"], use_container_width=True)

        with col2:
            st.header(details["title"])
            st.caption(details.get("release_date", ""))
            st.write(details.get("overview", "No overview available"))

            if details.get("genres"):
                genres = ", ".join(g["name"] for g in details["genres"])
                st.markdown(f"**Genres:** {genres}")

        st.divider()

        bundle = api_get(
            "/movie/search",
            {
                "query": title,
                "tfidf_top_n": 12,
                "genre_limit": 12
            }
        )

        if bundle:
            # TF-IDF recommendations
            st.subheader("🤖 Similar Movies")
            cols = st.columns(6)
            for i, rec in enumerate(bundle["tfidf_recommendations"]):
                if rec.get("tmdb"):
                    with cols[i % 6]:
                        movie_card(rec["tmdb"])

            # Genre recommendations
            st.subheader("🎭 Same Genre")
            cols = st.columns(6)
            for i, g in enumerate(bundle["genre_recommendations"]):
                with cols[i % 6]:
                    movie_card(g)

        st.divider()

# =============================
# HOME PAGE
# =============================
if mode == "🏠 Home":
    st.title("🔥 Discover Movies")

    movies = api_get("/home", {"category": category, "limit": 24})

    if movies:
        cols = st.columns(6)
        for i, m in enumerate(movies):
            with cols[i % 6]:
                movie_card(m, clickable=True)

# =============================
# SEARCH PAGE
# =============================
if mode == "🔍 Search Movie":
    st.title("🔍 Search Movies")

    query = st.text_input("Enter movie name")

    if query:
        data = api_get("/tmdb/search", {"query": query})

        if data and data.get("results"):
            st.subheader("Search Results")

            cols = st.columns(6)
            for i, m in enumerate(data["results"][:18]):
                card = {
                    "tmdb_id": m["id"],
                    "title": m.get("title"),
                    "poster_url": TMDB_IMG + m["poster_path"] if m.get("poster_path") else None,
                    "vote_average": m.get("vote_average")
                }
                with cols[i % 6]:
                    movie_card(card, clickable=True)
