# Git commit script using GitHub Desktop's git
$gitPath = "C:\Users\suryanata\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"
$commitMessage = "Update Telegram bot config to include API Backup 4 and set api_primary as default"

Write-Host "Adding files..." -ForegroundColor Cyan
& $gitPath add .

Write-Host "`nCommitting changes..." -ForegroundColor Cyan
& $gitPath commit -m $commitMessage

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
& $gitPath push

Write-Host "`nDone!" -ForegroundColor Green
