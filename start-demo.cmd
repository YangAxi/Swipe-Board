@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\.bin\vite.cmd" (
  echo Installing project dependencies...
  call npm.cmd ci
  if errorlevel 1 (
    echo Dependency installation failed. Please keep this window open and share the error.
    pause
    exit /b 1
  )
)
echo Starting Swipe Board. Keep this window open.
echo Open the Local URL printed below in your browser.
call npm.cmd run dev
pause
