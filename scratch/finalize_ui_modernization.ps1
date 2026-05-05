$cssPath = "src/index.css"
$css = Get-Content $cssPath -Raw

# 1. Unify and Refine category-bin
$oldBinBlock = @'
.category-bin {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(168, 134, 97, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  min-height: 175px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  overflow: hidden;
}
'@

$newBinBlock = @'
.category-bin {
  background: var(--arch-panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--arch-panel-border);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-height: 220px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  overflow: hidden;
  position: relative;
}

.category-bin::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(248, 217, 176, 0.05), transparent);
  pointer-events: none;
}

.category-bin.is-over {
  background: rgba(248, 217, 176, 0.12);
  border-color: var(--arch-accent);
  box-shadow: 0 0 25px rgba(248, 217, 176, 0.2);
  transform: scale(1.02);
}
'@

if ($css -contains $oldBinBlock) {
    $css = $css.Replace($oldBinBlock, $newBinBlock)
}

# 2. Fix Lab Inspection Image
$oldImageBlock = @'
.lab-inspection-image {
  display: block;
  width: 100%;
  max-height: 280px;
  border-radius: 12px;
  object-fit: contain;
}
'@

$newImageBlock = @'
.lab-inspection-image {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 320px;
  border-radius: 12px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.4);
}
'@

if ($css -contains $oldImageBlock) {
    $css = $css.Replace($oldImageBlock, $newImageBlock)
}

# 3. Restore Bureau Suspect Card Animations
$oldSuspectBlock = @'
.bureau-suspect-card {
  background: var(--arch-panel);
  border: 1px solid var(--arch-panel-border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
'@

$newSuspectBlock = @'
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

.bureau-suspect-card:hover {
  transform: translateY(-5px);
  border-color: var(--arch-accent);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--arch-accent);
  background: rgba(41, 29, 17, 0.6);
}

.bureau-suspect-card.archived {
  opacity: 0.4;
  filter: grayscale(0.8);
  transform: scale(0.95);
}

.bureau-suspect-card.archived:hover {
  opacity: 0.6;
  filter: grayscale(0.4);
}
'@

if ($css -contains $oldSuspectBlock) {
    $css = $css.Replace($oldSuspectBlock, $newSuspectBlock)
}

# 4. Ensure Full Width for Phase Containers
$css = $css -replace '\.phase-container \{', ".phase-container {`n  width: 100%;`n  max-width: none;"

# Save the CSS
Set-Content $cssPath $css -NoNewline
Write-Host "CSS Modernized and Stabilized."
