param(
    [string]$OutputName = 'site-elis-hostinger.zip'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$distDirectory = Join-Path $projectRoot 'dist'
$stageDirectory = Join-Path $distDirectory 'hostinger-package'
$zipPath = Join-Path $distDirectory $OutputName

$projectRootFull = [System.IO.Path]::GetFullPath($projectRoot)
$stageDirectoryFull = [System.IO.Path]::GetFullPath($stageDirectory)
if (-not $stageDirectoryFull.StartsWith($projectRootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Diretorio temporario fora do projeto.'
}

New-Item -ItemType Directory -Force -Path $distDirectory | Out-Null
if (Test-Path -LiteralPath $stageDirectoryFull) {
    Remove-Item -LiteralPath $stageDirectoryFull -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $stageDirectoryFull | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'index.html') -Destination $stageDirectoryFull
Copy-Item -LiteralPath (Join-Path $projectRoot '.htaccess') -Destination $stageDirectoryFull
Copy-Item -LiteralPath (Join-Path $projectRoot 'assets') -Destination $stageDirectoryFull -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'css') -Destination $stageDirectoryFull -Recurse

$stageJs = Join-Path $stageDirectoryFull 'js'
New-Item -ItemType Directory -Force -Path $stageJs | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'js\main.js') -Destination $stageJs

Compress-Archive -Path (Join-Path $stageDirectoryFull '*') -DestinationPath $zipPath -CompressionLevel Optimal -Force
Write-Output $zipPath
