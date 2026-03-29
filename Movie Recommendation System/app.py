import streamlit as st
import requests
from typing import Optional
import math
import os

API = os.getenv("API_URL", "http://localhost:8000")
# ── Config ────────────────────────────────────────────────────────────────────
API = "http://movie-api.railway.internal:8000"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

st.set_page_config(
    page_title="CineAI – Movie Recommender",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600&display=swap');

html, body, [class*="css"] { font-family: 'Inter', sans-serif; background: #0d0d0d; color: #eee; }

h1, h2, h3 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }

.hero {
    background: linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 3rem 2rem 2rem;
    border-radius: 16px;
    text-align: center;
    margin-bottom: 2rem;
}
.hero h1 { font-size: 4rem; color: #e94560; margin: 0; }
.hero p  { color: #aaa; font-size: 1.1rem; }

.movie-card {
    background: #1a1a2e;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #2a2a4a;
    transition: transform 0.2s, border-color 0.2s;
    height: 100%;
}
.movie-card:hover { border-color: #e94560; transform: translateY(-2px); }

.movie-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    color: #fff;
    margin: 0.5rem 0 0.3rem;
    letter-spacing: 1px;
}
.movie-meta { color: #888; font-size: 0.8rem; margin: 0.2rem 0; }

.badge {
    display: inline-block;
    background: #0f3460;
    color: #e94560;
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 0.72rem;
    margin: 2px 2px 2px 0;
    font-weight: 600;
}
.rating {
    color: #ffd700;
    font-size: 0.9rem;
    font-weight: 600;
}
.score-pill {
    background: #e94560;
    color: white;
    border-radius: 8px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 700;
}
.section-header {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    color: #e94560;
    border-bottom: 2px solid #e94560;
    padding-bottom: 0.3rem;
    margin: 1.5rem 0 1rem;
    letter-spacing: 2px;
}
.stTextInput > div > div > input {
    background: #1a1a2e !important;
    color: #fff !important;
    border: 1px solid #e94560 !important;
    border-radius: 8px !important;
}
.stSelectbox > div > div { background: #1a1a2e !important; }
.stButton > button {
    background: #e94560 !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 700 !important;
    letter-spacing: 1px;
}
.stButton > button:hover { background: #c73652 !important; }
</style>
""", unsafe_allow_html=True)

# ── Helpers ───────────────────────────────────────────────────────────────────
@st.cache_data(ttl=120)
def fetch(endpoint: str, params: dict = None):
    try:
        r = requests.get(f"{API}{endpoint}", params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"❌ API error: {e}")
        return None

def star_rating(score: float) -> str:
    filled = int(round(score / 2))
    return "★" * filled + "☆" * (5 - filled)

def genre_badges(genres: list) -> str:
    return " ".join(f'<span class="badge">{g}</span>' for g in genres[:3])

def render_movie_card(m: dict, show_score: bool = False):
    score_html = ""
    if show_score and "similarity_score" in m:
        pct = int(m["similarity_score"] * 100)
        score_html = f'<span class="score-pill">Match {pct}%</span>'

    overview = m.get("overview", "")
    overview_short = (overview[:110] + "…") if len(overview) > 110 else overview

    st.markdown(f"""
    <div class="movie-card">
        <div class="movie-title">{m['title']}</div>
        <div class="rating">{star_rating(m['vote_average'])} {m['vote_average']}/10</div>
        <div class="movie-meta">📅 {m.get('year', '—')} &nbsp;|&nbsp; 👁 {m['vote_count']:,} votes &nbsp;|&nbsp; 🌐 {m['language'].upper()}</div>
        <div style="margin:6px 0">{genre_badges(m['genres'])}</div>
        <div class="movie-meta" style="margin-top:6px;line-height:1.5">{overview_short}</div>
        {score_html}
    </div>
    """, unsafe_allow_html=True)

def render_grid(movies_list: list, cols: int = 4, show_score: bool = False):
    if not movies_list:
        st.info("No movies found.")
        return
    rows = math.ceil(len(movies_list) / cols)
    for r in range(rows):
        columns = st.columns(cols)
        for c in range(cols):
            idx = r * cols + c
            if idx < len(movies_list):
                with columns[c]:
                    render_movie_card(movies_list[idx], show_score)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🎬 CineAI")
    st.markdown("---")
    page_nav = st.radio(
        "Navigate",
        ["🏠 Home", "🔍 Search", "🎭 Browse by Genre", "🤖 Get Recommendations", "📊 Stats"],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.markdown("<small style='color:#555'>Powered by FAISS + Sentence Transformers</small>", unsafe_allow_html=True)

# ── Pages ─────────────────────────────────────────────────────────────────────

# ── HOME ──────────────────────────────────────────────────────────────────────
if page_nav == "🏠 Home":
    st.markdown("""
    <div class="hero">
        <h1>🎬 CineAI</h1>
        <p>Semantic movie recommendations powered by AI — 10,000 films at your fingertips</p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    category_map = {"🔥 Popular": "popular", "⭐ Top Rated": "top_rated", "🆕 Recent": "recent"}

    with col1:
        category_label = st.selectbox("Category", list(category_map.keys()))
    with col2:
        per_page = st.selectbox("Per page", [12, 24, 36], index=1)
    with col3:
        page_num = st.number_input("Page", min_value=1, value=1, step=1)

    category = category_map[category_label]
    data = fetch("/home", {"category": category, "limit": per_page, "page": page_num})

    if data:
        st.markdown(f"<div class='section-header'>{category_label} Movies &nbsp;<small style='font-size:1rem;color:#888'>Page {data['page']} / {data['total_pages']}</small></div>", unsafe_allow_html=True)
        render_grid(data["results"], cols=4)

# ── SEARCH ────────────────────────────────────────────────────────────────────
elif page_nav == "🔍 Search":
    st.markdown("<div class='section-header'>Semantic Search</div>", unsafe_allow_html=True)
    st.markdown("Search by mood, theme, plot, or keywords — not just title.")

    with st.form("search_form"):
        query = st.text_input("Describe what you want to watch…", placeholder="e.g. space opera with robots and hope")
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            min_rating = st.slider("Min rating", 0.0, 10.0, 0.0, 0.5)
        with c2:
            genre_filter = st.text_input("Genre", placeholder="Drama")
        with c3:
            year_from = st.number_input("Year from", min_value=1900, max_value=2025, value=1900)
        with c4:
            year_to = st.number_input("Year to", min_value=1900, max_value=2025, value=2025)
        submitted = st.form_submit_button("🔍 Search")

    if submitted and query:
        params = {"q": query, "top_k": 20, "min_rating": min_rating, "year_from": year_from, "year_to": year_to}
        if genre_filter.strip():
            params["genre"] = genre_filter.strip()
        data = fetch("/search", params)
        if data:
            st.markdown(f"<div class='section-header'>Found {data['total']} results for \"{query}\"</div>", unsafe_allow_html=True)
            render_grid(data["results"], cols=4, show_score=True)

# ── GENRE BROWSER ─────────────────────────────────────────────────────────────
elif page_nav == "🎭 Browse by Genre":
    st.markdown("<div class='section-header'>Browse by Genre</div>", unsafe_allow_html=True)

    genres_data = fetch("/genres")
    if genres_data:
        genres = genres_data["genres"]
        names = [f"{g['name']} ({g['count']:,})" for g in genres]
        raw_names = [g["name"] for g in genres]

        c1, c2 = st.columns([2, 1])
        with c1:
            selected_label = st.selectbox("Pick a genre", names)
        with c2:
            sort_by = st.selectbox("Sort by", ["popularity", "vote_average", "release_date"])

        selected_genre = raw_names[names.index(selected_label)]
        data = fetch(f"/genre/{selected_genre}", {"limit": 24, "sort_by": sort_by})
        if data:
            st.markdown(f"<div class='section-header'>{selected_genre} — {data['total']:,} films</div>", unsafe_allow_html=True)
            render_grid(data["results"], cols=4)

# ── RECOMMENDATIONS ───────────────────────────────────────────────────────────
elif page_nav == "🤖 Get Recommendations":
    st.markdown("<div class='section-header'>AI-Powered Recommendations</div>", unsafe_allow_html=True)
    st.markdown("Pick a movie you love and we'll find semantically similar ones using FAISS vector search.")

    movie_title = st.text_input("Search for a movie to base recommendations on", placeholder="e.g. The Dark Knight")
    top_k = st.slider("Number of recommendations", 5, 30, 10)

    if movie_title:
        # Search for the movie first
        results = fetch("/search", {"q": movie_title, "top_k": 5})
        if results and results["results"]:
            candidates = results["results"]
            titles = [f"{m['title']} ({m.get('year', '?')}) — ⭐ {m['vote_average']}" for m in candidates]
            chosen_label = st.selectbox("Select the movie:", titles)
            chosen = candidates[titles.index(chosen_label)]

            st.markdown("---")
            col_a, col_b = st.columns([1, 3])
            with col_a:
                st.markdown(f"**{chosen['title']}**")
                st.markdown(f"⭐ {chosen['vote_average']} | 📅 {chosen.get('year','?')}")
                st.markdown(genre_badges(chosen['genres']), unsafe_allow_html=True)
            with col_b:
                st.info(chosen.get("overview", ""))

            if st.button("🎯 Get Recommendations"):
                reco_data = fetch(f"/recommend/{chosen['id']}", {"top_k": top_k})
                if reco_data:
                    st.markdown(f"<div class='section-header'>Because you like: {chosen['title']}</div>", unsafe_allow_html=True)
                    render_grid(reco_data["recommendations"], cols=4, show_score=True)

# ── STATS ─────────────────────────────────────────────────────────────────────
elif page_nav == "📊 Stats":
    st.markdown("<div class='section-header'>Dataset Statistics</div>", unsafe_allow_html=True)
    data = fetch("/stats")
    if data:
        c1, c2, c3 = st.columns(3)
        c1.metric("Total Movies", f"{data['total_movies']:,}")
        c2.metric("Avg Rating", f"{data['avg_rating']} / 10")
        c3.metric("Year Range", f"{data['year_range']['min']} – {data['year_range']['max']}")

        st.markdown("#### Top Languages")
        lang_df = {"Language": list(data["languages"].keys()), "Count": list(data["languages"].values())}
        st.bar_chart(lang_df, x="Language", y="Count")

        genres_data = fetch("/genres")
        if genres_data:
            st.markdown("#### Genre Distribution")
            top10 = genres_data["genres"][:10]
            g_df = {"Genre": [g["name"] for g in top10], "Count": [g["count"] for g in top10]}
            st.bar_chart(g_df, x="Genre", y="Count")