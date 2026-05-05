$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - COMPACT SIDE-BY-SIDE LAYOUT (3 ROWS)
   ========================================================================== */

.bureau-phase {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    height: 100vh;
    overflow: hidden; /* Prevent body scroll */
    background: radial-gradient(circle at center, #2c1d12 0%, #1a1510 100%);
}

.bureau-investigation-layout {
    display: grid !important;
    grid-template-columns: 420px 1fr !important;
    gap: 1.5rem !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 1800px !important;
    margin: 0 auto !important;
    flex: 1;
    min-height: 0; /* Allow grid items to shrink */
}

/* Compact Case File */
.bureau-case-file {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem !important;
    overflow-y: auto;
}

.bureau-case-info h2 {
    font-size: 1.8rem !important;
}

.bureau-evidence-box {
    padding: 1.25rem !important;
}

.bureau-evidence-text p {
    font-size: 1.2rem !important;
    line-height: 1.4 !important;
}

/* Compact Suspect Board */
.bureau-suspect-board {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem !important;
    overflow: hidden;
}

.bureau-suspect-header {
    margin-bottom: 0.5rem;
}

.bureau-suspect-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    grid-template-rows: repeat(3, 1fr) !important;
    gap: 0.75rem !important;
    flex: 1;
    min-height: 0;
}

.bureau-suspect-card {
    min-width: 0 !important; /* Allow shrinking */
    padding: 0.65rem 0.85rem !important;
    border-radius: 12px !important;
    font-size: 0.85rem !important;
}

.bureau-suspect-name {
    font-size: 0.8rem !important;
}

.bureau-suspect-icon-box {
    width: 32px !important;
    height: 32px !important;
}

/* Actions area */
.bureau-case-actions {
    margin-top: auto;
    padding-top: 1rem;
}

/* Scrollbar styling for compact view */
.bureau-case-file::-webkit-scrollbar,
.bureau-suspect-grid::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

.bureau-case-file::-webkit-scrollbar-thumb,
.bureau-suspect-grid::-webkit-scrollbar-thumb {
    background: var(--arch-accent);
    border-radius: 10px;
}

"@

# Remove everything after the first marker of modernization to avoid duplication
$marker = "/* =========================================================================="
$markerIndex = $css.IndexOf($marker)
if ($markerIndex -ge 0) {
    $css = $css.Substring(0, $markerIndex)
}

Set-Content $cssPath ($css + "`n`n" + $newStyles)
Write-Host "Bureau Layout Updated to Compact Side-by-Side."
