@echo off
echo ========================================================
echo Starting EcoGuard Unified Intelligence Platform
echo Web Dashboard & API: http://127.0.0.1:8000
echo Interactive API Docs: http://127.0.0.1:8000/docs
echo ========================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
pause
