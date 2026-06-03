@echo off
REM Frontend setup script for Windows

echo Setting up HalluProbe Frontend...

REM Check Node version
for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
echo Node version: %node_version%

REM Install dependencies
echo Installing dependencies...
cd frontend
call npm install

REM Create environment file
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_ENABLE_ANALYTICS=false
        echo NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
    ) > .env.local
)

echo.
echo Frontend setup complete!
echo.
echo Next steps:
echo   1. Start dev:    npm run dev
echo   2. Build:        npm run build
echo   3. Start prod:   npm start
echo.
echo URL: http://localhost:3000
