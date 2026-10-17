<#
Converts the HTML produced by generate-data-dictionary.js into a Word document.

Usage from the repository root:
  powershell -ExecutionPolicy Bypass -File scripts\build-data-dictionary-docx.ps1

Optional input/output paths:
  powershell -ExecutionPolicy Bypass -File scripts\build-data-dictionary-docx.ps1 `
    -SourceHtml docs\DATA-DICTIONARY.html -OutputDocx docs\DATA-DICTIONARY.docx

Requires Microsoft Word for Windows. The HTML is already Word-ready; this
script exists when a true .docx file is required for submission.
#>
param(
  [string]$SourceHtml = (Join-Path $PSScriptRoot "..\docs\DATA-DICTIONARY.html"),
  [string]$OutputDocx = (Join-Path $PSScriptRoot "..\docs\DATA-DICTIONARY.docx")
)

$SourceHtml = [System.IO.Path]::GetFullPath($SourceHtml)
$OutputDocx = [System.IO.Path]::GetFullPath($OutputDocx)

if (-not (Test-Path $SourceHtml)) {
  throw "Source HTML was not found: $SourceHtml. Run node scripts\generate-data-dictionary.js first."
}

$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($SourceHtml)

  # A4 landscape makes the nine dictionary columns readable in Word.
  $document.PageSetup.Orientation = 1  # wdOrientLandscape
  $document.PageSetup.PaperSize = 7    # wdPaperA4
  $document.PageSetup.TopMargin = $word.CentimetersToPoints(1.2)
  $document.PageSetup.BottomMargin = $word.CentimetersToPoints(1.2)
  $document.PageSetup.LeftMargin = $word.CentimetersToPoints(1.2)
  $document.PageSetup.RightMargin = $word.CentimetersToPoints(1.2)

  $outDir = Split-Path -Parent $OutputDocx
  if ($outDir) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
  $document.SaveAs2($OutputDocx, 16) # wdFormatDocumentDefault (.docx)
  Write-Host "Created $OutputDocx"
}
finally {
  if ($document) { $document.Close(0) }
  if ($word) { $word.Quit() }
  if ($document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
  if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
