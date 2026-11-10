import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .api import (
    health,
    regions,
    overview,
    monitoring,
    risk,
    graph,
    simulation,
    alerts,
    sources,
    reports
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(health.router, prefix="/api", tags=["System Health"])
app.include_router(overview.router, prefix="/api", tags=["Overview Dashboard"])
app.include_router(regions.router, prefix="/api", tags=["Regions"])
app.include_router(monitoring.router, prefix="/api", tags=["Environmental Monitoring"])
app.include_router(risk.router, prefix="/api", tags=["Risk Engine"])
app.include_router(graph.router, prefix="/api", tags=["Ecological Graph"])
app.include_router(simulation.router, prefix="/api", tags=["Intervention Simulator"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts & Warnings"])
app.include_router(sources.router, prefix="/api", tags=["Data Sources & Audit"])
app.include_router(reports.router, prefix="/api", tags=["Exportable Reports"])

# Serve frontend build if dist folder exists
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept /api or docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "documentation": "/docs",
            "api_prefix": "/api"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

