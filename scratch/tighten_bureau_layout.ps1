$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

$newStyles = @"

/* ==========================================================================
   THE ANTIQUITIES BUREAU - VERTICAL SPACE OPTIMIZATION
   ========================================================================== */

.bureau-suspect-board {
    gap: 0.5rem !important; /* Reduce gap between header, description, and grid */
    padding: 1.25rem !important;
}

.bureau-suspect-header {
    margin-bottom: 0 !important;
}

.bureau-suspect-header h2 {
    margin-bottom: 2px !important;
}

.bureau-suspect-board p {
    margin-bottom: 0.25rem !important;
    font-size: 0.85rem !important;
    line-height: 1.2 !important;
    opacity: 0.8;
}

.bureau-suspect-grid {
    gap: 0.5rem !important; /* Tighten grid gap as well */
}

"@

# This script appends/updates the existing modernization block. 
# Since I've been using a marker, I'll just append these refinements to the end of the file or update the existing block.
# Actually, I'll just update the existing block by replacing the relevant lines.

$marker = "/* =========================================================================="
$markerIndex = $css.IndexOf($marker)
if ($markerIndex -ge 0) {
    # If the marker exists, I'll just append these specific overrides to the end to ensure they take precedence
    Set-Content $cssPath ($css + "`n`n" + $newStyles)
} else {
    Set-Content $cssPath ($css + "`n`n" + $newStyles)
}

Write-Host "Bureau Layout Vertically Tightened."
