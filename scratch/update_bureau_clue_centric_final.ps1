$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - CLUE-CENTRIC & COMPACT (FINAL REFINEMENT)
   ========================================================================== */

.bureau-phase {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    height: 100vh;
    overflow: hidden;
    background: radial-gradient(circle at center, #2c1d12 0%, #1a1510 100%);
}

.bureau-investigation-layout {
    display: grid !important;
    grid-template-columns: 1.2fr 1fr !important; /* Balanced but clue-favored */
    gap: 2rem !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 1800px !important;
    margin: 0 auto !important;
    flex: 1;
    min-height: 0;
}

/* Bigger, More Readable Case File */
.bureau-case-file {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem !important; /* Generous padding for the main game part */
    overflow-y: auto;
}

.bureau-case-info h2 {
    font-family: 'Cinzel', serif !important;
    font-size: 2.6rem !important;
    color: var(--arch-text);
    margin: 0.5rem 0;
}

.bureau-evidence-box {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(168, 134, 97, 0.3) !important;
    border-radius: 24px !important;
    padding: 2rem !important;
    box-shadow: inset 0 4px 20px rgba(0,0,0,0.4);
}

.bureau-evidence-text p {
    font-family: 'Playfair Display', serif !important;
    font-size: 1.6rem !important;
    line-height: 1.6 !important;
    font-style: italic;
    color: var(--sand-100);
}

/* Compact, Efficient Suspect Board */
.bureau-suspect-board {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem !important;
    overflow: hidden;
}

.bureau-suspect-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important; /* ENFORCE 4 COLUMNS */
    grid-template-rows: repeat(3, 1fr) !important;    /* ENFORCE 3 ROWS */
    gap: 0.75rem !important;
    flex: 1;
    min-height: 0;
}

.bureau-suspect-card {
    display: flex !important;
    flex-direction: column !important; /* Stack icon/name vertically to save width */
    align-items: center !important;
    justify-content: center !important;
    text-align: center;
    padding: 0.5rem !important;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    min-width: 0 !important; /* Critical for grid wrapping prevention */
    position: relative;
}

.bureau-suspect-card:hover {
    background: rgba(232, 158, 93, 0.12) !important;
    border-color: var(--arch-accent) !important;
    transform: translateY(-2px) !important;
}

.bureau-suspect-icon-box {
    width: 32px !important;
    height: 32px !important;
    background: rgba(232, 158, 93, 0.1) !important;
    border-radius: 8px !important;
    display: grid;
    place-items: center;
    margin-bottom: 0.25rem;
}

.bureau-suspect-name {
    font-family: 'Outfit', sans-serif !important; /* Cleaner font for small text */
    font-size: 0.75rem !important;
    font-weight: 700;
    line-height: 1.1;
    color: var(--sand-100);
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.bureau-suspect-remove-btn {
    position: absolute !important;
    top: 4px !important;
    right: 4px !important;
    opacity: 0.4;
}

.bureau-suspect-card:hover .bureau-suspect-remove-btn {
    opacity: 1;
}

/* Fix for the "Removed civilisations" bar */
.bureau-archived-suspects {
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(168, 134, 97, 0.2);
}

"@

# Remove previous modernization blocks to ensure clean state
$marker = "/* =========================================================================="
$markerIndex = $css.IndexOf($marker)
if ($markerIndex -ge 0) {
    $css = $css.Substring(0, $markerIndex)
}

Set-Content $cssPath ($css + "`n`n" + $newStyles)
Write-Host "Bureau Layout Updated to Clue-Centric (4x3 Grid Enforced)."
