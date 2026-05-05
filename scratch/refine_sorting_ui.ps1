$path = "src/index.css"
$content = [System.IO.File]::ReadAllLines($path)
$newContent = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    
    # 1. Unify Buttons - Delete the large definition at 4608
    if ($line -like ".btn {*" -and $i -gt 4000) {
        # Skip this block and the hover block
        while ($i -lt $content.Count -and $content[$i] -notlike "*primary-btn {*") {
            $i++
        }
        # Keep the primary-btn part but we will override it anyway
        $newContent.Add(".primary-btn { background: var(--arch-accent) !important; color: #111 !important; }")
        continue
    }

    # 2. Optimize Sort Layout (Full Width)
    if ($line -like ".sort-layout {*") {
        $newContent.Add(".sort-layout {")
        $newContent.Add("  display: grid;")
        $newContent.Add("  grid-template-columns: 360px 1fr;")
        $newContent.Add("  gap: 2rem;")
        $newContent.Add("  margin-top: 1rem;")
        $newContent.Add("  height: calc(100vh - 175px);")
        $newContent.Add("  min-height: 550px;")
        $newContent.Add("}")
        while ($i -lt $content.Count -and $content[$i] -notlike "}") { $i++ }
        continue
    }

    # 3. Optimize Bins Grid
    if ($line -like ".sort-bins-grid {*") {
        $newContent.Add(".sort-bins-grid {")
        $newContent.Add("  display: grid;")
        $newContent.Add("  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));")
        $newContent.Add("  gap: 1.25rem;")
        $newContent.Add("  height: 100%;")
        $newContent.Add("}")
        while ($i -lt $content.Count -and $content[$i] -notlike "}") { $i++ }
        continue
    }

    # 4. Refine Status Panel
    if ($line -like ".phase-status-panel-compact {*") {
        $newContent.Add(".phase-status-panel-compact {")
        $newContent.Add("  display: flex;")
        $newContent.Add("  justify-content: space-between;")
        $newContent.Add("  align-items: center;")
        $newContent.Add("  background: rgba(41, 29, 17, 0.7);")
        $newContent.Add("  border: 1px solid var(--arch-panel-border);")
        $newContent.Add("  padding: 0.75rem 1.75rem;")
        $newContent.Add("  border-radius: 20px;")
        $newContent.Add("  backdrop-filter: blur(16px);")
        $newContent.Add("  -webkit-backdrop-filter: blur(16px);")
        $newContent.Add("  box-shadow: 0 10px 40px rgba(0,0,0,0.5);")
        $newContent.Add("  margin-bottom: 1.25rem;")
        $newContent.Add("  position: relative;")
        $newContent.Add("  overflow: hidden;")
        $newContent.Add("}")
        while ($i -lt $content.Count -and $content[$i] -notlike "}") { $i++ }
        continue
    }

    $newContent.Add($line)
}

[System.IO.File]::WriteAllLines($path, $newContent)
Write-Host "Sorting UI Refined successfully."
