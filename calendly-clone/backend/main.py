from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routers import events, availability, bookings, meetings
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on first run
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Calendly Clone API", version="1.0.0", lifespan=lifespan)

# --- UPDATED CORS SETTINGS ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://calendly-clone-lac.vercel.app/dashboard", # Your specific Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------

app.include_router(events.router,       prefix="/api/events",       tags=["events"])
app.include_router(availability.router, prefix="/api/availability", tags=["availability"])
app.include_router(bookings.router,     prefix="/api/bookings",     tags=["bookings"])
app.include_router(meetings.router,     prefix="/api/meetings",     tags=["meetings"])

@app.get("/")
def root():
    return {"message": "Calendly Clone API is running"}