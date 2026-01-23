# Git commit script using GitHub Desktop's git
$gitPath = "C:\Users\suryanata\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"
$commitMessage = "Fix: api_backup4 watch page stream mapping and replace broken placeholder image"

Write-Host "Adding files..." -ForegroundColor Cyan
& $gitPath add .

Write-Host "`nCommitting changes..." -ForegroundColor Cyan
& $gitPath commit -m $commitMessage

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
& $gitPath push

Write-Host "`nDone!" -ForegroundColor Green
