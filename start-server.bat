@echo off
echo ========================================
echo   音乐播放器 - 本地服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.
echo 服务器启动后，请在浏览器中打开：
echo   http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000

if errorlevel 1 (
    echo.
    echo Python未找到，尝试用PowerShell启动...
    powershell -Command "$listener = [System.Net.HttpListener]::new(); $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host '服务器已启动，按回车停止'; $context = $listener.GetContext(); $response = $context.Response; $filePath = Join-Path $PWD ($context.Request.Url.LocalPath -replace '^/', ''); if ([System.IO.File]::Exists($filePath)) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentType = [System.Web.MimeMapping]::GetMimeMapping($filePath); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; } $response.Close(); $listener.Stop();"
)
