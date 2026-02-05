param(
  [string]$OutputRoot = "supabase\\backups"
)

$ErrorActionPreference = "Stop"

function Invoke-DbDump {
  param(
    [string[]]$Args,
    [string]$OutFile,
    [string]$Label
  )

  Write-Host "Backing up $Label to $OutFile..."
  $argsList = @("db", "dump") + $Args
  if ($script:UseLocalPgDump) {
    $argsList += "--use-pg-dump"
  }
  supabase @argsList | Out-File -Encoding utf8 $OutFile
  if ($LASTEXITCODE -ne 0) {
    throw "supabase db dump failed for $Label (exit code $LASTEXITCODE)"
  }
}

$script:UseLocalPgDump = $false
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($pgDump) {
  $script:UseLocalPgDump = $true
  Write-Host "Using local pg_dump at $($pgDump.Source)"
} else {
  Write-Host "pg_dump not found. Supabase CLI will attempt to use Docker."
  Write-Host "If Docker is not available, install Docker Desktop or PostgreSQL client tools."
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $OutputRoot $timestamp
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Invoke-DbDump -Args @("--roles-only") -OutFile (Join-Path $backupDir "roles.sql") -Label "roles"
Invoke-DbDump -Args @("--schema-only") -OutFile (Join-Path $backupDir "schema.sql") -Label "schema"
Invoke-DbDump -Args @("--data-only") -OutFile (Join-Path $backupDir "data.sql") -Label "data"
Invoke-DbDump -Args @() -OutFile (Join-Path $backupDir "full.sql") -Label "full dump"

Write-Host "Backup completed in $backupDir"

