# 音乐播放器 - 本地服务器
# 使用方法：右键 -> 使用PowerShell运行

$port = 8080
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  音乐播放器 - 本地服务器" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "服务器已启动！" -ForegroundColor Green
    Write-Host ""
    Write-Host "请在浏览器中打开：" -ForegroundColor Yellow
    Write-Host "  http://localhost:$port" -ForegroundColor White
    Write-Host ""
    Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = Join-Path $PWD ($request.Url.LocalPath -replace '^/', '')
        
        # 默认返回index.html
        if ([string]::IsNullOrEmpty($localPath) -or -not [System.IO.File]::Exists($localPath)) {
            $localPath = Join-Path $PWD "index.html"
        }

        if ([System.IO.File]::Exists($localPath)) {
            $content = [System.IO.File]::ReadAllBytes($localPath)
            $extension = [System.IO.Path]::GetExtension($localPath)
            
            # 设置正确的Content-Type
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".lrc" { $response.ContentType = "text/plain; charset=utf-8" }
                ".mp3" { $response.ContentType = "audio/mpeg" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".png" { $response.ContentType = "image/png" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            
            Write-Host "[$(Get-Date -Format "HH:mm:ss")] 加载: $($request.Url.LocalPath)" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $errorMessage = [System.Text.Encoding]::UTF8.GetBytes("404 - File not found")
            $response.OutputStream.Write($errorMessage, 0, $errorMessage.Length)
            
            Write-Host "[$(Get-Date -Format "HH:mm:ss")] 未找到: $($request.Url.LocalPath)" -ForegroundColor Red
        }

        $response.Close()
    }
}
catch [System.OperationCanceledException] {
    # 用户按Ctrl+C
}
finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "服务器已停止" -ForegroundColor Yellow
}
