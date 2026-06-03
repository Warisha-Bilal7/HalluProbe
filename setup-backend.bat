@echo off
REM Backend setup script for Windows

echo Setting up HalluProbe Backend...

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo Python version: %python_version%

REM Create virtual environment
if not exist "backend\venv" (
    echo Creating virtual environment...
    python -m venv backend\venv
)

REM Activate virtual environment
call backend\venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
cd backend
pip install -r requirements.txt

REM Create necessary directories
echo Creating directories...
if not exist "data" mkdir data
if not exist "checkpoints" mkdir checkpoints
if not exist "outputs" mkdir outputs
if not exist "logs" mkdir logs

echo.
echo Backend setup complete!
echo.
echo Next steps:
echo   1. Activate venv: backend\venv\Scripts\activate.bat
echo   2. Start API:     python run_server.py
echo   3. Start demo:    python run_demo.py
echo.
echo URLs:
echo   API:  http://localhost:8000
echo   Demo: http://localhost:7860
