$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - CLUE-CENTRIC LAYOUT
   ========================================================================== */

.bureau-investigation-layout {
    display: grid !important;
    grid-template-columns: minmax(500px, 1fr) 1.2fr !important; /* Increase clue space */
    gap: 1.5rem !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 1800px !important;
    margin: 0 auto !important;
}

/* Bigger Case File */
.bureau-case-file {
    padding: 2rem !important;
}

.bureau-case-info h2 {
    font-size: 2.2rem !important;
}

.bureau-evidence-text p {
    font-size: 1.5rem !important;
    line-height: 1.6 !important;
}

/* Smaller Suspect Cards */
.bureau-suspect-board {
    padding: 1.25rem !important;
}

.bureau-suspect-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    grid-template-rows: repeat(3, 1fr) !important;
    gap: 0.5rem !important; /* Tighter gap */
}

.bureau-suspect-card {
    padding: 0.5rem 0.75rem !important;
    min-height: 0 !important;
    flex-direction: column !important; /* Stack icon and name for vertical compactness */
    text-align: center;
    gap: 0.35rem !important;
}

.bureau-suspect-icon-box {
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
}

.bureau-suspect-icon-box svg {
    width: 14px;
    height: 14px;
}

.bureau-suspect-name {
    font-size: 0.7rem !important;
    letter-spacing: 0;
}

.bureau-suspect-remove-btn {
    top: 0.25rem !important;
    right: 0.25rem !important;
    padding: 0.15rem !important;
}

"@

# Remove everything after the first marker of modernization to avoid duplication
$marker = "/* =========================================================================="
$markerIndex = $css.IndexOf($marker)
if ($markerIndex -ge 0) {
    $css = $css.Substring(0, $markerIndex)
}

Set-Content $cssPath ($css + "`n`n" + $newStyles)
Write-Host "Bureau Layout Updated to Clue-Centric View."
