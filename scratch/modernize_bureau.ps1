$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

# 1. Clean up old bureau styles (approximately lines 420-600 and 5100-5597)
# This is a bit complex with regex, so I'll just find specific markers or blocks.
# Better yet, I'll just append the new styles at the end, and they will override.
# However, to avoid a massive file, I'll try to remove the most conflicting ones.

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - MODERN UI REWORK
   ========================================================================== */

:root {
    --bureau-glass: rgba(22, 17, 12, 0.7);
    --bureau-glass-border: rgba(232, 158, 93, 0.2);
    --bureau-accent-gradient: linear-gradient(135deg, #E89E5D 0%, #c27d41 100%);
}

.bureau-phase {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: radial-gradient(circle at center, #2c1d12 0%, #1a1510 100%);
    min-height: 100%;
}

/* Glass Card Overrides */
.glass-card {
    background: var(--bureau-glass) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    border: 1px solid var(--bureau-glass-border) !important;
    border-radius: 28px !important;
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.05) !important;
    padding: 2.5rem !important;
}

/* Layout Strategy */
.bureau-investigation-layout {
    display: grid !important;
    grid-template-columns: 1fr 360px !important;
    gap: 2.5rem !important;
    align-items: start !important;
    width: 100% !important;
    max-width: 1400px !important;
    margin: 0 auto !important;
}

.bureau-investigation-layout--focus {
    grid-template-columns: 1fr !important;
    max-width: 1000px !important;
}

/* Case File Details */
.bureau-case-file {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    overflow: hidden;
}

.bureau-report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(168, 134, 97, 0.2);
    padding-bottom: 1.5rem;
}

.bureau-case-info h2 {
    font-family: 'Cinzel', serif !important;
    font-size: 2.5rem !important;
    color: var(--arch-text);
    margin: 0.5rem 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.bureau-score-badge {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid var(--arch-accent) !important;
    padding: 1rem 1.5rem !important;
    border-radius: 20px !important;
    box-shadow: 0 0 20px rgba(232, 158, 93, 0.15) !important;
}

.bureau-score-value {
    font-size: 2.2rem !important;
    color: var(--arch-accent) !important;
    text-shadow: 0 0 10px rgba(232, 158, 93, 0.3);
}

/* Tier Tabs */
.bureau-tier-tabs {
    display: flex;
    gap: 0.75rem;
    margin: 1.5rem 0;
}

.bureau-tier-tab {
    flex: 1;
    padding: 1.25rem !important;
    background: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(168, 134, 97, 0.15) !important;
    border-radius: 16px !important;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.bureau-tier-tab.current {
    background: rgba(232, 158, 93, 0.15) !important;
    border-color: var(--arch-accent) !important;
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(232, 158, 93, 0.2) !important;
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

/* Buttons */
.btn {
    padding: 1rem 1.8rem !important;
    border-radius: 14px !important;
    font-size: 0.9rem !important;
    letter-spacing: 0.08em !important;
}

.primary-btn {
    background: var(--bureau-accent-gradient) !important;
    color: #000 !important;
    box-shadow: 0 6px 20px rgba(232, 158, 93, 0.3) !important;
}

.primary-btn:hover {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 10px 30px rgba(232, 158, 93, 0.5) !important;
}

/* Suspect Card Grid */
.bureau-suspect-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
}

.bureau-suspect-card {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 20px !important;
    padding: 1.25rem !important;
    transition: all 0.3s ease !important;
}

.bureau-suspect-card:hover {
    background: rgba(232, 158, 93, 0.12) !important;
    border-color: var(--arch-accent) !important;
    transform: translateX(8px) !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.bureau-suspect-icon-box {
    background: rgba(232, 158, 93, 0.15) !important;
    border: 1px solid rgba(232, 158, 93, 0.3) !important;
}

"@

Set-Content $cssPath ($css + "`n`n" + $newStyles)
Write-Host "Bureau UI Modernized Successfully."
