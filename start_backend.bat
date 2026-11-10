@echo off
echo ========================================================
echo Starting EcoGuard FastAPI Backend
echo API URL: http://127.0.0.1:8000
echo Interactive API Docs: http://127.0.0.1:8000/docs
echo ========================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
