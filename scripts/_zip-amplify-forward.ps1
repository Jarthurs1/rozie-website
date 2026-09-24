
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Cursor Programs\Rozie Website\amplify-dist.zip'
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
$zip = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
try {
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\apple-touch-icon.svg
'@, 'apple-touch-icon.svg', [IO.Compression.CompressionLevel]::Optimal)
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\assets\index-BqbHVgZL.css
'@, 'assets/index-BqbHVgZL.css', [IO.Compression.CompressionLevel]::Optimal)
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\assets\index-D9eSo-VE.js
'@, 'assets/index-D9eSo-VE.js', [IO.Compression.CompressionLevel]::Optimal)
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\favicon.svg
'@, 'favicon.svg', [IO.Compression.CompressionLevel]::Optimal)
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\icons.svg
'@, 'icons.svg', [IO.Compression.CompressionLevel]::Optimal)
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'
C:\Cursor Programs\Rozie Website\dist\index.html
'@, 'index.html', [IO.Compression.CompressionLevel]::Optimal)
} finally { $zip.Dispose() }
$check = [IO.Compression.ZipFile]::OpenRead($zipPath)
$names = @($check.Entries | ForEach-Object { $_.FullName })
$check.Dispose()
$names | ForEach-Object { Write-Host $_ }
$badSlash = @($names | Where-Object { $_.Contains([char]92) }).Count
$badDot = @($names | Where-Object { $_.StartsWith('./') -or $_.StartsWith('.\') }).Count
if ($badSlash -gt 0) { throw "backslash entries: $badSlash" }
if ($badDot -gt 0) { throw "dot-slash entries: $badDot" }
if (-not ($names -contains 'index.html')) { throw "missing index.html" }
if (-not ($names | Where-Object { $_ -like 'assets/*.js' })) { throw "missing assets/*.js" }
Write-Host "OK amplify zip entries=$($names.Count)"
