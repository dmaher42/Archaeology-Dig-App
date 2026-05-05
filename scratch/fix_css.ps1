$path = "src/index.css"
$content = [System.IO.File]::ReadAllLines($path)
$newContent = New-Object System.Collections.Generic.List[string]

$inCorruptedZone = $false

for ($i = 0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    
    # Identify the start of the corruption
    if ($line -like "*.bureau-investigation-layout--focus .bureau-suspect-board {*") {
        $newContent.Add($line)
        $newContent.Add($content[++$i]) # display: none;
        $newContent.Add($content[++$i]) # }
        
        # Skip everything until we find ".bureau-archived-list {" (the next valid block)
        while ($i -lt $content.Count -and $content[$i] -notlike "*.bureau-archived-list {*") {
            $i++
        }
        
        # Insert the correct content
        $newContent.Add("")
        $newContent.Add(".bureau-suspect-name {")
        $newContent.Add("  font-family: 'Cinzel', serif;")
        $newContent.Add("  font-weight: 700;")
        $newContent.Add("  color: #ffffff;")
        $newContent.Add("  font-size: 0.85rem;")
        $newContent.Add("  line-height: 1.2;")
        $newContent.Add("  text-transform: uppercase;")
        $newContent.Add("  letter-spacing: 0.02em;")
        $newContent.Add("}")
        $newContent.Add("")
        $newContent.Add(".bureau-suspect-remove-btn {")
        $newContent.Add("  position: absolute;")
        $newContent.Add("  top: 0.5rem;")
        $newContent.Add("  right: 0.5rem;")
        $newContent.Add("  background: transparent;")
        $newContent.Add("  border: none;")
        $newContent.Add("  color: rgba(255, 255, 255, 0.3);")
        $newContent.Add("  padding: 0.25rem;")
        $newContent.Add("  cursor: pointer;")
        $newContent.Add("  transition: all 0.2s ease;")
        $newContent.Add("  display: flex;")
        $newContent.Add("}")
        $newContent.Add("")
        $newContent.Add(".bureau-suspect-remove-btn:hover {")
        $newContent.Add("  color: #f87171;")
        $newContent.Add("  transform: scale(1.1);")
        $newContent.Add("}")
        $newContent.Add("")
        $newContent.Add(".bureau-suspect-actions {")
        $newContent.Add("  display: flex;")
        $newContent.Add("  gap: 0.35rem;")
        $newContent.Add("  padding: 0 0.65rem 0.65rem;")
        $newContent.Add("}")
        $newContent.Add("")
        $newContent.Add(".bureau-suspect-actions .bureau-evidence-chip {")
        $newContent.Add("  flex: 1 1 0;")
        $newContent.Add("  padding-inline: 0.35rem;")
        $newContent.Add("}")
        $newContent.Add("")
        $newContent.Add(".bureau-archived-suspects {")
        $newContent.Add("  display: grid;")
        $newContent.Add("  gap: 0.65rem;")
        $newContent.Add("  margin-top: 0.85rem;")
        $newContent.Add("  padding-top: 0.85rem;")
        $newContent.Add("  border-top: 1px solid rgba(197, 160, 89, 0.16);")
        $newContent.Add("}")
        $newContent.Add("")
        
        # Add the line we found (which was the next valid block)
        if ($i -lt $content.Count) {
            $newContent.Add($content[$i])
        }
    } else {
        $newContent.Add($line)
    }
}

[System.IO.File]::WriteAllLines($path, $newContent)
Write-Host "CSS Fixed successfully."
