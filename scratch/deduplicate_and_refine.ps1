$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

# 1. Unify lab-prompt-grid
$labPromptBlock = @'
.lab-prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.85rem;
  margin-top: 0.8rem;
}

.lab-prompt-btn {
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(248, 217, 176, 0.1);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.25s ease;
  text-align: left;
  cursor: pointer;
  color: var(--sand-100);
}

.lab-prompt-btn:hover {
  background: rgba(248, 217, 176, 0.08);
  border-color: rgba(248, 217, 176, 0.25);
}

.lab-prompt-btn.selected {
  background: rgba(248, 217, 176, 0.15);
  border-color: var(--arch-accent);
  box-shadow: 0 0 15px rgba(248, 217, 176, 0.1);
}
'@

# Remove all existing lab-prompt-grid related blocks first to avoid conflicts
$css = $css -replace '\.lab-prompt-grid \{[\s\S]*?\}', ""
$css = $css -replace '\.lab-prompt-btn \{[\s\S]*?\}', ""
$css = $css -replace '\.lab-prompt-btn:hover \{[\s\S]*?\}', ""
$css = $css -replace '\.lab-prompt-btn.selected \{[\s\S]*?\}', ""

# Append the unified block at the end of the Lab section (search for Lab section)
$labSectionMarker = "/* Lab Phase */"
if ($css -match [regex]::Escape($labSectionMarker)) {
    $css = $css.Replace($labSectionMarker, "$labSectionMarker`n$labPromptBlock")
}

# 2. Refine Bureau Suspect Board to a Grid
$oldBureauBoard = @'
.bureau-suspect-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
'@

$newBureauBoard = @'
.bureau-suspect-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.85rem;
  padding: 0.5rem;
}
'@

$css = $css.Replace($oldBureauBoard, $newBureauBoard)

# 3. Refine Suspect Cards for better layout
$oldSuspectInner = @'
.bureau-suspect-card {
  background: var(--arch-panel);
  backdrop-filter: blur(10px);
  border: 1px solid var(--arch-panel-border);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
'@

$newSuspectInner = @'
.bureau-suspect-card {
  background: var(--arch-panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--arch-panel-border);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 160px;
}
'@

$css = $css.Replace($oldSuspectInner, $newSuspectInner)

# 4. Remove duplicate category-bin blocks
# Find all occurrences of .category-bin { ... } and remove them, then keep only the refined one.
$css = $css -replace '(?s)\.category-bin \{.*?\}', ""
# Re-add the refined one in the Sort section
$sortSectionMarker = "/* Sorting & Lab Phases */"
$refinedBin = @'
.category-bin {
  background: var(--arch-panel);
  backdrop-filter: blur(16px);
  border: 1px solid var(--arch-panel-border);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-height: 240px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  overflow: hidden;
  position: relative;
}

.category-bin.is-over {
  background: rgba(248, 217, 176, 0.15);
  border-color: var(--arch-accent);
  box-shadow: 0 0 30px rgba(248, 217, 176, 0.3);
  transform: scale(1.03);
}
'@

if ($css -match [regex]::Escape($sortSectionMarker)) {
    $css = $css.Replace($sortSectionMarker, "$sortSectionMarker`n$refinedBin")
}

# Save the CSS
Set-Content $cssPath $css -NoNewline
Write-Host "CSS Deduplicated and Layout Refined."
