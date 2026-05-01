@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   小小特工 · S4 出行 Demo
echo ==========================================
echo.
echo 启动本地服务器 http://127.0.0.1:5500
echo 在浏览器打开后即可游玩, 按 Ctrl+C 停止
echo.
python -m http.server 5500
