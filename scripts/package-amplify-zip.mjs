#!/usr/bin/env node
/**
 * Build Amplify deploy zip with clean forward-slash paths.
 * - No Windows backslashes (breaks iPhone Safari)
 * - No "./" prefixes (breaks Amplify root index.html)
 *
 * Usage: npm run build && node scripts/package-amplify-zip.mjs
 */

import { spawnSync } from 'node:child_process'
import { access, readdir, stat, writeFile, unlink } from 'node:fs/promises'
import { resolve, dirname, relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distDir = resolve(root, 'dist')
const zipPath = resolve(root, 'amplify-dist.zip')
const ps1 = resolve(root, 'scripts', '_zip-amplify-forward.ps1')

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(dir, base = dir, acc = []) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name)
    const info = await stat(full)
    if (info.isDirectory()) await listFiles(full, base, acc)
    else {
      const entry = relative(base, full).split('\\').join('/')
      acc.push({ full, entry })
    }
  }
  return acc
}

async function main() {
  if (!(await exists(distDir))) {
    throw new Error('dist/ missing — run npm run build first')
  }

  try {
    await unlink(zipPath)
  } catch {
    /* ignore */
  }

  const files = await listFiles(distDir)
  if (!files.some((f) => f.entry === 'index.html')) {
    throw new Error('dist/index.html missing')
  }

  const lines = files
    .map(
      (f) =>
        `[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, @'\n${f.full}\n'@, '${f.entry.replace(/'/g, "''")}', [IO.Compression.CompressionLevel]::Optimal)`,
    )
    .join('\n')

  // Use single-quoted here-strings for Windows paths with spaces.
  const script = `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = '${zipPath.replace(/'/g, "''")}'
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
$zip = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
try {
${lines}
} finally { $zip.Dispose() }
$check = [IO.Compression.ZipFile]::OpenRead($zipPath)
$names = @($check.Entries | ForEach-Object { $_.FullName })
$check.Dispose()
$names | ForEach-Object { Write-Host $_ }
$badSlash = @($names | Where-Object { $_.Contains([char]92) }).Count
$badDot = @($names | Where-Object { $_.StartsWith('./') -or $_.StartsWith('.\\') }).Count
if ($badSlash -gt 0) { throw "backslash entries: $badSlash" }
if ($badDot -gt 0) { throw "dot-slash entries: $badDot" }
if (-not ($names -contains 'index.html')) { throw "missing index.html" }
if (-not ($names | Where-Object { $_ -like 'assets/*.js' })) { throw "missing assets/*.js" }
Write-Host "OK amplify zip entries=$($names.Count)"
`

  await writeFile(ps1, script, 'utf8')
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1],
    { cwd: root, stdio: 'inherit' },
  )
  if (result.status !== 0) throw new Error('Failed to create amplify-dist.zip')
  console.log(`Wrote ${zipPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
