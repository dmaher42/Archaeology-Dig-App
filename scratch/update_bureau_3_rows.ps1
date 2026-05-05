$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - MODERN UI REWORK (3-ROW SUSPECT BOARD)
   ========================================================================== */

:root {
    --bureau-glass: rgba(22, 17, 12, 0.7);
    --bureau-glass-border: rgba(232, 158, 93, 0.2);
    --bureau-accent-gradient: linear-gradient(135deg, #E89E5D 0%, #c27d41 100%);
}

.bureau-phase {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    background: radial-gradient(circle at center, #2c1d12 0%, #1a1510 100%);
    min-height: 100%;
}

.glass-card {
    background: var(--bureau-glass) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    border: 1px solid var(--bureau-glass-border) !important;
    border-radius: 28px !important;
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.05) !important;
    padding: 2rem !important;
}

/* Layout Strategy - Vertical Stack for 3-row Suspect Board */
.bureau-investigation-layout {
    display: flex !important;
    flex-direction: column !important;
    gap: 2rem !important;
    width: 100% !important;
    max-width: 1600px !important;
    margin: 0 auto !important;
}

.bureau-investigation-layout--focus .bureau-suspect-board {
    display: none;
}

/* Case File Details */
.bureau-case-file {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
}

.bureau-report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(168, 134, 97, 0.2);
    padding-bottom: 1rem;
}

.bureau-case-info h2 {
    font-family: 'Cinzel', serif !important;
    font-size: 2.2rem !important;
    color: var(--arch-text);
    margin: 0.25rem 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.bureau-score-badge {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid var(--arch-accent) !important;
    padding: 0.75rem 1.25rem !important;
    border-radius: 16px !important;
    box-shadow: 0 0 15px rgba(232, 158, 93, 0.15) !important;
}

.bureau-score-value {
    font-size: 1.8rem !important;
    color: var(--arch-accent) !important;
    text-shadow: 0 0 10px rgba(232, 158, 93, 0.3);
}

/* Evidence Text */
.bureau-evidence-box {
    background: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(168, 134, 97, 0.2) !important;
    border-radius: 20px !important;
    padding: 2rem !important;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
}

.bureau-evidence-text p {
    font-family: 'Playfair Display', serif !important;
    font-size: 1.5rem !important;
    font-style: italic;
    color: var(--sand-100) !important;
    line-height: 1.6 !important;
}

/* Suspect Board - HORIZONTAL 3 ROWS */
.bureau-suspect-board {
    width: 100% !important;
    padding: 1.5rem 2rem !important;
}

.bureau-suspect-grid {
    display: grid !important;
    grid-template-rows: repeat(3, auto) !important;
    grid-auto-flow: column !important;
    gap: 1rem !important;
    overflow-x: auto !important;
    padding: 0.5rem 0.5rem 1.5rem 0.5rem !important;
    scrollbar-width: thin;
    scrollbar-color: var(--arch-accent) rgba(0,0,0,0.2);
}

.bureau-suspect-grid::-webkit-scrollbar {
    height: 8px;
}

.bureau-suspect-grid::-webkit-scrollbar-thumb {
    background: var(--arch-accent);
    border-radius: 10px;
}

.bureau-suspect-card {
    min-width: 260px !important;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.3s ease !important;
}

.bureau-suspect-card:hover {
    background: rgba(232, 158, 93, 0.12) !important;
    border-color: var(--arch-accent) !important;
    transform: translateY(-3px) !important;
}

.bureau-suspect-icon-box {
    background: rgba(232, 158, 93, 0.15) !important;
    border: 1px solid rgba(232, 158, 93, 0.3) !important;
}

"@

# Remove everything after the first marker of modernization to avoid duplication
$marker = "/* =========================================================================="
$markerIndex = $css.IndexOf($marker)
if ($markerIndex -ge 0) {
    $css = $css.Substring(0, $markerIndex)
}

Set-Content $cssPath ($css + "`n`n" + $newStyles)
Write-Host "Bureau Layout Updated to 3-Row Grid."
