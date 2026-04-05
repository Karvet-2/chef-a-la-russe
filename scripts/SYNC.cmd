@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo ============================================
echo  Перенос UI в frontend\ и очистка корня
echo ============================================
node scripts\move-layout.js
if errorlevel 1 (
  echo Ошибка. Нужен установленный Node.js.
  pause
  exit /b 1
)
echo.
echo Готово. Дальше: npm run dev
pause
