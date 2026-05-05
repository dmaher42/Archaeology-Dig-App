$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$overrides = @"

/* ==========================================================================
   THE LAB - TIGHTENING SPACING (USER REQUEST)
   ========================================================================== */

.lab-tray-list {
    gap: 0.35rem !important;
}

.lab-tray-card {
    padding: 0.45rem 0.6rem !important;
}

.lab-tray-name {
    font-size: 0.88rem !important; /* Slightly smaller for tighter layout */
}

.lab-tray-meta {
    font-size: 0.7rem !important;
    margin-top: 1px !important;
}

.lab-bench-content {
    gap: 0.5rem !important;
}

.lab-inspection-box {
    gap: 0.65rem !important;
    padding: 0.75rem !important;
}

.lab-inspection-grid {
    gap: 0.75rem !important;
}

.lab-inspection-media {
    min-height: 180px !important;
}

.lab-analysis-section {
    padding-bottom: 0.85rem !important;
    margin-bottom: 0.85rem !important;
}

.lab-section-title {
    margin-bottom: 0.25rem !important;
}

.lab-section-instruction {
    margin-bottom: 0.5rem !important;
    font-size: 0.85rem !important;
}

.lab-answer-grid,
.lab-prompt-grid {
    gap: 0.5rem !important;
}

.lab-answer-card,
.lab-prompt-btn {
    padding: 0.65rem !important;
}

.lab-prompt-desc {
    line-height: 1.1 !important;
}

.lab-briefing-card {
    margin-bottom: 0.75rem !important;
    padding: 0.75rem 1rem !important;
}

.lab-briefing-card p {
    font-size: 0.88rem !important;
    line-height: 1.3 !important;
}

"@

Set-Content $cssPath ($css + "`n`n" + $overrides)

Write-Host "Lab Spacing Tightened."
