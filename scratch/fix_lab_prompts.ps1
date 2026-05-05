$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$fix = @"

/* ==========================================================================
   THE LAB - FIXING BROKEN PROMPT BUTTONS (USER REQUEST)
   ========================================================================== */

.lab-prompt-btn {
    display: flex !important;
    flex-direction: column !important;
    text-align: left !important;
    gap: 0.15rem !important;
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(168, 134, 97, 0.25) !important;
    color: var(--sand-100) !important;
    padding: 0.75rem !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    width: 100% !important;
}

.lab-prompt-btn:hover {
    background: rgba(232, 158, 93, 0.1) !important;
    border-color: var(--accent) !important;
}

.lab-prompt-btn.selected {
    background: rgba(232, 158, 93, 0.2) !important;
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 1px var(--accent) inset !important;
}

.lab-prompt-title {
    display: block !important;
    color: var(--accent) !important;
    font-size: 0.9rem !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
}

.lab-prompt-desc {
    display: block !important;
    color: var(--sand-300) !important;
    font-size: 0.75rem !important;
    line-height: 1.2 !important;
}

/* Ensure icons in prompt buttons are styled */
.lab-prompt-icon {
    width: 32px !important;
    height: 32px !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.05) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 0.5rem !important;
    color: var(--accent) !important;
}

.lab-prompt-btn.selected .lab-prompt-icon {
    background: var(--accent) !important;
    color: #1a1510 !important;
}

"@

Set-Content $cssPath ($css + "`n`n" + $fix)

Write-Host "Lab Prompt Styling Fixed."
