"""Main application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0-eva-nodus",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
from routes_auth import router as auth_router
from routes_biens import router as biens_router
from routes_scoring import router as scoring_router
from routes_contact import router as contact_router
from routes_admin import router as admin_router

app.include_router(auth_router)
app.include_router(biens_router)
app.include_router(scoring_router)
app.include_router(contact_router)
app.include_router(admin_router)

@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.0.0-eva-nodus"}

@app.on_event("startup")
def startup():
    init_db()