$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - TEXT SIZE REFINEMENT
   ========================================================================== */

.bureau-case-info h2 {
    font-size: 2rem !important; /* Balanced header size */
}

.bureau-evidence-text p {
    font-size: 1.25rem !important; /* Balanced evidence size */
    line-height: 1.5 !important;
}

.bureau-case-file {
    padding: 1.75rem !important; /* Reduce padding slightly */
}

.bureau-evidence-box {
    padding: 1.5rem !important;
    border-radius: 16px !important;
}

"@

# Append these specific overrides to the end
Set-Content $cssPath ($css + "`n`n" + $newStyles)

Write-Host "Bureau Text Sizes Refined."
