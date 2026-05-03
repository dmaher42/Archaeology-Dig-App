Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceDeck = Join-Path $root 'Curicculum Docs\Copy of 2. Human Migration Theories & Civilisations.pptx'
$outputDeck = Join-Path $root 'Curicculum Docs\Human Migration ENGAGING VERSION.pptx'
$outputPdf = Join-Path $root 'Curicculum Docs\Human Migration ENGAGING VERSION.pdf'
$artifactDir = Join-Path $root 'artifacts\human-migration-engaging'
$assetDir = Join-Path $artifactDir 'assets'
$previewDir = Join-Path $artifactDir 'previews'
$fontDir = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'

New-Item -ItemType Directory -Force -Path $artifactDir, $assetDir, $previewDir, $fontDir | Out-Null

function U {
  param([Parameter(Mandatory)] [int] $CodePoint)
  [char]::ConvertFromUtf32($CodePoint)
}

$FOOD = U 0x1F355
$WATER = U 0x1F4A7
$COLD = U 0x2744
$DANGER = U 0x26A0
$ANIMALS = U 0x1F43E
$SAFETY = U 0x1F6E1
$WAVE = U 0x1F30A
$DESERT = U 0x1F3DC
$LEAF = U 0x1F33F

function ColorFromHex {
  param([Parameter(Mandatory)] [string] $Hex)
  $clean = $Hex.Trim().TrimStart('#')
  if ($clean.Length -ne 6) { throw "Expected 6-digit hex color: $Hex" }
  $r = $clean.Substring(0, 2)
  $g = $clean.Substring(2, 2)
  $b = $clean.Substring(4, 2)
  [Convert]::ToInt32(($b + $g + $r), 16)
}

$COLOR_NAVY = ColorFromHex '1E2A38'
$COLOR_SAND = ColorFromHex 'EAD2AC'
$COLOR_ORANGE = ColorFromHex 'F77F00'
$COLOR_WHITE = ColorFromHex 'FFFFFF'

function Ensure-File {
  param(
    [Parameter(Mandatory)] [string] $Url,
    [Parameter(Mandatory)] [string] $Path
  )
  if (-not (Test-Path $Path)) {
    Invoke-WebRequest -Uri $Url -OutFile $Path -UseBasicParsing
  }
  $Path
}

function Ensure-EmbeddedMedia {
  param(
    [Parameter(Mandatory)] [string] $DeckPath,
    [Parameter(Mandatory)] [string] $EntryName,
    [Parameter(Mandatory)] [string] $Path
  )
  if (Test-Path $Path) { return $Path }
  $zip = [System.IO.Compression.ZipFile]::OpenRead($DeckPath)
  try {
    $entry = $zip.GetEntry($EntryName)
    if (-not $entry) {
      throw "Embedded media not found: $EntryName"
    }
    $input = $entry.Open()
    try {
      $output = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
      try {
        $input.CopyTo($output)
      }
      finally {
        $output.Dispose()
      }
    }
    finally {
      $input.Dispose()
    }
  }
  finally {
    $zip.Dispose()
  }
  $Path
}

function Install-Font {
  param(
    [Parameter(Mandatory)] [string] $Url,
    [Parameter(Mandatory)] [string] $FileName
  )
  $dest = Join-Path $fontDir $FileName
  if (-not (Test-Path $dest)) {
    $tmp = Join-Path $artifactDir $FileName
    Ensure-File -Url $Url -Path $tmp | Out-Null
    Copy-Item -Force $tmp $dest
  }
  $dest
}

function Load-Font {
  param([Parameter(Mandatory)] [string] $Path)
  if (-not ('FontSessionLoader' -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class FontSessionLoader {
  [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
  public static extern int AddFontResourceEx(string lpszFilename, uint fl, IntPtr pdv);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
"@ | Out-Null
  }
  [void][FontSessionLoader]::AddFontResourceEx($Path, 0, [IntPtr]::Zero)
  [void][FontSessionLoader]::SendMessage([IntPtr]0xffff, 0x001D, [IntPtr]::Zero, [IntPtr]::Zero)
}

function Crop-ToRatio {
  param(
    [Parameter(Mandatory)] [string] $SourcePath,
    [Parameter(Mandatory)] [string] $DestPath,
    [Parameter(Mandatory)] [double] $Ratio,
    [int] $Width = 1920,
    [int] $Height = 1080
  )

  if (Test-Path $DestPath) { return $DestPath }

  $image = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $srcRatio = $image.Width / $image.Height
    if ($srcRatio -gt $Ratio) {
      $cropWidth = [int][math]::Round($image.Height * $Ratio)
      $cropHeight = $image.Height
      $cropX = [int][math]::Round(($image.Width - $cropWidth) / 2)
      $cropY = 0
    }
    else {
      $cropWidth = $image.Width
      $cropHeight = [int][math]::Round($image.Width / $Ratio)
      $cropX = 0
      $cropY = [int][math]::Round(($image.Height - $cropHeight) / 2)
    }

    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $bitmap.SetResolution(96, 96)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage(
        $image,
        (New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)),
        $cropX,
        $cropY,
        $cropWidth,
        $cropHeight,
        [System.Drawing.GraphicsUnit]::Pixel
      )
      $bitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
  finally {
    $image.Dispose()
  }
  $DestPath
}

function Add-ShapeBox {
  param(
    $Slide,
    [double] $Left,
    [double] $Top,
    [double] $Width,
    [double] $Height,
    [int] $Rgb,
    [double] $Transparency = 0,
    [bool] $Line = $false,
    [int] $LineRgb = 0
  )
  $shape = $Slide.Shapes.AddShape(1, $Left, $Top, $Width, $Height)
  $shape.Fill.Solid()
  $shape.Fill.ForeColor.RGB = $Rgb
  $shape.Fill.Transparency = $Transparency
  if ($Line) {
    $shape.Line.Visible = -1
    $shape.Line.ForeColor.RGB = $LineRgb
    $shape.Line.Weight = 1.1
  }
  else {
    $shape.Line.Visible = 0
  }
  $shape
}

function Add-Text {
  param(
    $Slide,
    [string] $Text,
    [double] $Left,
    [double] $Top,
    [double] $Width,
    [double] $Height,
    [string] $FontName = 'Open Sans',
    [int] $FontSize = 24,
    [bool] $Bold = $false,
    [int] $Rgb = 0xFFFFFF,
    [int] $Align = 1
  )
  $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $shape.Line.Visible = 0
  $shape.Fill.Visible = $false
  $shape.TextFrame.WordWrap = -1
  $shape.TextFrame.AutoSize = 0
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.TextRange.Font.Name = $FontName
  $shape.TextFrame.TextRange.Font.Size = $FontSize
  $shape.TextFrame.TextRange.Font.Bold = $(if ($Bold) { -1 } else { 0 })
  $shape.TextFrame.TextRange.Font.Color.RGB = $Rgb
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $Align
  $shape
}

function Add-Line {
  param(
    $Slide,
    [double] $X1,
    [double] $Y1,
    [double] $X2,
    [double] $Y2,
    [int] $Rgb,
    [double] $Weight = 2
  )
  $line = $Slide.Shapes.AddLine($X1, $Y1, $X2, $Y2)
  $line.Line.ForeColor.RGB = $Rgb
  $line.Line.Weight = $Weight
  $line
}

function Add-Picture {
  param(
    $Slide,
    [string] $Path,
    [double] $Left,
    [double] $Top,
    [double] $Width,
    [double] $Height
  )
  $Slide.Shapes.AddPicture($Path, 0, -1, $Left, $Top, $Width, $Height)
}

function Set-Notes {
  param($Slide, [string] $Text)
  $Slide.NotesPage.Shapes.Item(2).TextFrame.TextRange.Text = $Text
}

function Add-Cover {
  param(
    $Slide,
    [string] $ImagePath,
    [string] $Title,
    [string] $Body,
    [string] $Notes
  )
  Add-Picture -Slide $Slide -Path $ImagePath -Left 0 -Top 0 -Width 960 -Height 540 | Out-Null
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY -Transparency 0.42 | Out-Null
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb 0x000000 -Transparency 0.78 | Out-Null
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 500 -Height 28 -Rgb $COLOR_NAVY | Out-Null
  Add-ShapeBox -Slide $Slide -Left 46 -Top 46 -Width 8 -Height 118 -Rgb $COLOR_ORANGE | Out-Null
  Add-Text -Slide $Slide -Text $Title -Left 84 -Top 48 -Width 800 -Height 70 -FontName 'Montserrat' -FontSize 34 -Bold $true -Rgb $COLOR_WHITE | Out-Null
  Add-Text -Slide $Slide -Text $Body -Left 84 -Top 124 -Width 760 -Height 110 -FontName 'Open Sans' -FontSize 24 -Rgb $COLOR_SAND | Out-Null
  Set-Notes -Slide $Slide -Text $Notes
}

function Add-PromptSlide {
  param(
    $Slide,
    [string] $Title,
    [string] $Body,
    [string] $Notes,
    [string[]] $Lines = @()
  )
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY | Out-Null
  Add-ShapeBox -Slide $Slide -Left 52 -Top 54 -Width 8 -Height 112 -Rgb $COLOR_ORANGE | Out-Null
  Add-Text -Slide $Slide -Text $Title -Left 84 -Top 48 -Width 700 -Height 76 -FontName 'Montserrat' -FontSize 34 -Bold $true -Rgb $COLOR_WHITE | Out-Null
  Add-Text -Slide $Slide -Text $Body -Left 84 -Top 126 -Width 620 -Height 54 -FontName 'Open Sans' -FontSize 24 -Rgb $COLOR_SAND | Out-Null
  if ($Lines.Count -gt 0) {
    $top = 214
    foreach ($line in $Lines) {
      Add-ShapeBox -Slide $Slide -Left 84 -Top $top -Width 320 -Height 42 -Rgb $COLOR_NAVY -Transparency 0.08 -Line $true -LineRgb $COLOR_SAND | Out-Null
      Add-Text -Slide $Slide -Text $line -Left 102 -Top ($top + 8) -Width 282 -Height 24 -FontName 'Open Sans' -FontSize 20 -Rgb $COLOR_WHITE | Out-Null
      $top += 54
    }
  }
  Set-Notes -Slide $Slide -Text $Notes
}

function Add-DecisionSlide {
  param(
    $Slide,
    [string] $Title,
    [string] $Body,
    [string] $Notes,
    [string[]] $Choices
  )
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY | Out-Null
  Add-ShapeBox -Slide $Slide -Left 52 -Top 54 -Width 8 -Height 112 -Rgb $COLOR_ORANGE | Out-Null
  Add-Text -Slide $Slide -Text $Title -Left 84 -Top 48 -Width 700 -Height 76 -FontName 'Montserrat' -FontSize 34 -Bold $true -Rgb $COLOR_WHITE | Out-Null
  Add-Text -Slide $Slide -Text $Body -Left 84 -Top 126 -Width 620 -Height 54 -FontName 'Open Sans' -FontSize 24 -Rgb $COLOR_SAND | Out-Null
  $top = 214
  foreach ($choice in $Choices) {
    Add-ShapeBox -Slide $Slide -Left 84 -Top $top -Width 320 -Height 42 -Rgb $COLOR_NAVY -Transparency 0.08 -Line $true -LineRgb $COLOR_SAND | Out-Null
    Add-Text -Slide $Slide -Text $choice -Left 102 -Top ($top + 8) -Width 282 -Height 24 -FontName 'Open Sans' -FontSize 20 -Rgb $COLOR_WHITE | Out-Null
    $top += 54
  }
  Set-Notes -Slide $Slide -Text $Notes
}

function Add-TerrainSlide {
  param(
    $Slide,
    [string] $Title,
    [string] $Body,
    [string] $Notes,
    [string] $IcePath,
    [string] $DesertPath,
    [string] $RiverPath
  )

  Add-Picture -Slide $Slide -Path $IcePath -Left 0 -Top 0 -Width 320 -Height 540 | Out-Null
  Add-Picture -Slide $Slide -Path $DesertPath -Left 320 -Top 0 -Width 320 -Height 540 | Out-Null
  Add-Picture -Slide $Slide -Path $RiverPath -Left 640 -Top 0 -Width 320 -Height 540 | Out-Null
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY -Transparency 0.44 | Out-Null
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 430 -Height 540 -Rgb $COLOR_NAVY -Transparency 0.26 | Out-Null
  Add-Text -Slide $Slide -Text $Title -Left 54 -Top 48 -Width 300 -Height 72 -FontName 'Montserrat' -FontSize 32 -Bold $true -Rgb $COLOR_WHITE | Out-Null
  Add-Text -Slide $Slide -Text $Body -Left 54 -Top 124 -Width 290 -Height 56 -FontName 'Open Sans' -FontSize 24 -Rgb $COLOR_SAND | Out-Null
  $top = 214
  foreach ($choice in @("Ice $COLD", "Ocean $WAVE", "Desert $DESERT")) {
    Add-ShapeBox -Slide $Slide -Left 54 -Top $top -Width 280 -Height 42 -Rgb $COLOR_NAVY -Transparency 0.08 -Line $true -LineRgb $COLOR_SAND | Out-Null
    Add-Text -Slide $Slide -Text $choice -Left 72 -Top ($top + 8) -Width 242 -Height 24 -FontName 'Open Sans' -FontSize 20 -Rgb $COLOR_WHITE | Out-Null
    $top += 54
  }
  Set-Notes -Slide $Slide -Text $Notes
}

function Add-MapSlide {
  param(
    $Slide,
    [string] $ImagePath,
    [string] $Title,
    [string] $Body,
    [string] $Notes
  )
  Add-Cover -Slide $Slide -ImagePath $ImagePath -Title $Title -Body $Body -Notes $Notes
}

if (-not (Test-Path $sourceDeck)) {
  throw "Source deck not found: $sourceDeck"
}

$montserratRegular = Install-Font -Url 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf' -FileName 'Montserrat-Regular.ttf'
$montserratBold = Install-Font -Url 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf' -FileName 'Montserrat-Bold.ttf'
$openSansRegular = Install-Font -Url 'https://github.com/googlefonts/opensans/raw/main/fonts/ttf/OpenSans-Regular.ttf' -FileName 'OpenSans-Regular.ttf'
$openSansBold = Install-Font -Url 'https://github.com/googlefonts/opensans/raw/main/fonts/ttf/OpenSans-Bold.ttf' -FileName 'OpenSans-Bold.ttf'

Load-Font $montserratRegular
Load-Font $montserratBold
Load-Font $openSansRegular
Load-Font $openSansBold

$worldMapSource = Join-Path $assetDir 'world-map-source.png'
$africaSource = Join-Path $assetDir 'africa-source.jpg'
$desertSource = Join-Path $assetDir 'desert-source.jpg'
$snowSource = Join-Path $assetDir 'snow-source.jpg'
$riverSource = Join-Path $assetDir 'river-source.jpg'
$origMigrationCover = Join-Path $assetDir 'orig-path-of-human-migration.jpg'
$origOutOfAfricaMap = Join-Path $assetDir 'orig-out-of-africa-map.png'
$origTimeline = Join-Path $assetDir 'orig-migration-timeline.png'
$origEvolution = Join-Path $assetDir 'orig-evolution.png'

Ensure-File -Url 'https://upload.wikimedia.org/wikipedia/commons/d/d1/A_blank_world_map.png' -Path $worldMapSource | Out-Null
Ensure-File -Url 'https://upload.wikimedia.org/wikipedia/commons/e/e6/La_for%C3%AAt_de_Bandia_11.jpg' -Path $africaSource | Out-Null
Ensure-File -Url 'https://upload.wikimedia.org/wikipedia/commons/8/84/Dry_desert_and_towering_sandstone_mountains_in_Monument_Valley.jpg' -Path $desertSource | Out-Null
Ensure-File -Url 'https://upload.wikimedia.org/wikipedia/commons/b/be/Snow_and_ice_scenic_landscape.jpg' -Path $snowSource | Out-Null
Ensure-File -Url 'https://upload.wikimedia.org/wikipedia/commons/2/23/River_valley_%28509356587%29.jpg' -Path $riverSource | Out-Null
Ensure-EmbeddedMedia -DeckPath $sourceDeck -EntryName 'ppt/media/image4.jpg' -Path $origMigrationCover | Out-Null
Ensure-EmbeddedMedia -DeckPath $sourceDeck -EntryName 'ppt/media/image10.png' -Path $origOutOfAfricaMap | Out-Null
Ensure-EmbeddedMedia -DeckPath $sourceDeck -EntryName 'ppt/media/image8.png' -Path $origTimeline | Out-Null
Ensure-EmbeddedMedia -DeckPath $sourceDeck -EntryName 'ppt/media/image6.png' -Path $origEvolution | Out-Null

$worldCover = Crop-ToRatio -SourcePath $origMigrationCover -DestPath (Join-Path $assetDir 'world-cover.png') -Ratio (16 / 9)
$worldMap = Crop-ToRatio -SourcePath $worldMapSource -DestPath (Join-Path $assetDir 'world-map.png') -Ratio (16 / 9)
$outOfAfricaMap = Crop-ToRatio -SourcePath $origOutOfAfricaMap -DestPath (Join-Path $assetDir 'out-of-africa-map.png') -Ratio (16 / 9)
$timelineCover = Crop-ToRatio -SourcePath $origTimeline -DestPath (Join-Path $assetDir 'timeline-cover.png') -Ratio (16 / 9)
$evolutionCover = Crop-ToRatio -SourcePath $origEvolution -DestPath (Join-Path $assetDir 'evolution-cover.png') -Ratio (16 / 9)
$africaCover = Crop-ToRatio -SourcePath $africaSource -DestPath (Join-Path $assetDir 'africa-cover.png') -Ratio (16 / 9)
$desertCover = Crop-ToRatio -SourcePath $desertSource -DestPath (Join-Path $assetDir 'desert-cover.png') -Ratio (16 / 9)
$terrainRatio = 320 / 540
$snowPanel = Crop-ToRatio -SourcePath $snowSource -DestPath (Join-Path $assetDir 'snow-panel.png') -Ratio $terrainRatio -Width 320 -Height 540
$desertPanel = Crop-ToRatio -SourcePath $desertSource -DestPath (Join-Path $assetDir 'desert-panel.png') -Ratio $terrainRatio -Width 320 -Height 540
$riverPanel = Crop-ToRatio -SourcePath $riverSource -DestPath (Join-Path $assetDir 'river-panel.png') -Ratio $terrainRatio -Width 320 -Height 540
$riverCover = Crop-ToRatio -SourcePath $riverSource -DestPath (Join-Path $assetDir 'river-cover.png') -Ratio (16 / 9)

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$pres = $pp.Presentations.Open($sourceDeck, $true, $false, $false)
$pres.PageSetup.SlideWidth = 960
$pres.PageSetup.SlideHeight = 540

while ($pres.Slides.Count -gt 0) {
  $pres.Slides.Item(1).Delete()
}

$slides = @(
  @{ Type = 'cover'; Image = $worldCover; Title = 'The First Journey'; Body = 'How did humans spread across the world?'; Notes = 'Introduce lesson as a journey story.' },
  @{ Type = 'cover'; Image = $africaCover; Title = 'You must leave your home'; Body = "- No food $FOOD`n- Climate changing $COLD`n- Danger $DANGER"; Notes = 'Create urgency.' },
  @{ Type = 'prompt'; Title = 'You can only take 3 things'; Body = 'What do you take?'; Notes = 'Students discuss.' },
  @{ Type = 'decision'; Title = 'Where do you go?'; Body = ''; Choices = @('Stay', 'Follow animals', 'Find water', 'Explore'); Notes = 'Turn and talk.' },
  @{ Type = 'cover'; Image = $outOfAfricaMap; Title = 'This actually happened'; Body = "- Humans started in Africa`n- They moved over time"; Notes = 'Reveal concept.' },
  @{ Type = 'prompt'; Title = 'Why did they move?'; Body = 'Why leave home?'; Notes = 'Students answer first.' },
  @{ Type = 'decision'; Title = 'Push factors'; Body = ''; Choices = @("- No food $FOOD", "- Climate $COLD", "- Danger $DANGER"); Notes = 'Explain push.' },
  @{ Type = 'decision'; Title = 'Pull factors'; Body = ''; Choices = @("- Water $WATER", "- Animals $ANIMALS", "- Better land $LEAF" ); Notes = 'Explain pull.' },
  @{ Type = 'terrain'; Title = 'Can you survive?'; Body = ''; Notes = 'Students choose routes.' },
  @{ Type = 'cover'; Image = $outOfAfricaMap; Title = 'Choose your path'; Body = 'Where do you go?'; Notes = 'Students point/draw.' },
  @{ Type = 'prompt'; Title = 'Key idea'; Body = "Humans followed:`n- food $FOOD`n- water $WATER`n- safety $SAFETY"; Notes = 'Core takeaway.' },
  @{ Type = 'cover'; Image = $timelineCover; Title = 'This took time'; Body = "- Not one journey`n- Many generations"; Notes = 'Explain slow movement.' },
  @{ Type = 'cover'; Image = $evolutionCover; Title = 'Eventually...'; Body = 'People stopped moving'; Notes = 'Lead into settlement.' },
  @{ Type = 'prompt'; Title = 'Where would you settle?'; Body = "- Water $WATER`n- Food $FOOD`n- Safety $SAFETY"; Notes = 'Students answer.' },
  @{ Type = 'cover'; Image = $riverCover; Title = 'This is where civilisations begin'; Body = "- Nile`n- Indus`n- Yellow River"; Notes = 'Link to next unit/booklet.' },
  @{ Type = 'final'; Title = 'Final question'; Body = 'Would you have survived?'; Notes = 'Reflection.' }
)

function Add-SettlementSlide {
  param($Slide, [string] $Title, [string] $Body, [string] $Notes)
  Add-ShapeBox -Slide $Slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY | Out-Null
  Add-Text -Slide $Slide -Text $Title -Left 84 -Top 54 -Width 360 -Height 52 -FontName 'Montserrat' -FontSize 34 -Bold $true -Rgb $COLOR_WHITE | Out-Null
  Add-Text -Slide $Slide -Text $Body -Left 84 -Top 122 -Width 450 -Height 46 -FontName 'Open Sans' -FontSize 26 -Rgb $COLOR_SAND | Out-Null
  Add-ShapeBox -Slide $Slide -Left 84 -Top 230 -Width 780 -Height 156 -Rgb $COLOR_NAVY -Transparency 0.14 -Line $true -LineRgb $COLOR_SAND | Out-Null
  Add-Text -Slide $Slide -Text 'Settlement' -Left 124 -Top 262 -Width 220 -Height 36 -FontName 'Montserrat' -FontSize 30 -Bold $true -Rgb $COLOR_ORANGE | Out-Null
  Add-Text -Slide $Slide -Text 'Water, food, safety' -Left 124 -Top 310 -Width 320 -Height 28 -FontName 'Open Sans' -FontSize 20 -Rgb $COLOR_WHITE | Out-Null
  Set-Notes -Slide $Slide -Text $Notes
}

for ($i = 0; $i -lt $slides.Count; $i++) {
  $slide = $pres.Slides.Add($i + 1, 12)
  $spec = $slides[$i]
  switch ($spec.Type) {
    'cover' {
      Add-Cover -Slide $slide -ImagePath $spec.Image -Title $spec.Title -Body $spec.Body -Notes $spec.Notes
    }
    'prompt' {
      Add-PromptSlide -Slide $slide -Title $spec.Title -Body $spec.Body -Notes $spec.Notes
    }
    'decision' {
      Add-DecisionSlide -Slide $slide -Title $spec.Title -Body $spec.Body -Notes $spec.Notes -Choices $spec.Choices
    }
    'terrain' {
      Add-TerrainSlide -Slide $slide -Title $spec.Title -Body $spec.Body -Notes $spec.Notes -IcePath $snowPanel -DesertPath $desertPanel -RiverPath $riverPanel
    }
    'settlement' {
      Add-SettlementSlide -Slide $slide -Title $spec.Title -Body $spec.Body -Notes $spec.Notes
    }
    'final' {
      Add-ShapeBox -Slide $slide -Left 0 -Top 0 -Width 960 -Height 540 -Rgb $COLOR_NAVY | Out-Null
      Add-Text -Slide $slide -Text $spec.Title -Left 84 -Top 58 -Width 400 -Height 50 -FontName 'Montserrat' -FontSize 34 -Bold $true -Rgb $COLOR_WHITE | Out-Null
      Add-ShapeBox -Slide $slide -Left 84 -Top 146 -Width 500 -Height 138 -Rgb $COLOR_NAVY -Transparency 0.12 -Line $true -LineRgb $COLOR_ORANGE | Out-Null
      Add-Text -Slide $slide -Text $spec.Body -Left 112 -Top 178 -Width 440 -Height 60 -FontName 'Open Sans' -FontSize 28 -Bold $true -Rgb $COLOR_SAND | Out-Null
      Add-Line -Slide $slide -X1 84 -Y1 336 -X2 876 -Y2 336 -Rgb $COLOR_ORANGE -Weight 2.2 | Out-Null
      Add-Text -Slide $slide -Text 'Reflection' -Left 84 -Top 360 -Width 140 -Height 24 -FontName 'Open Sans' -FontSize 16 -Rgb $COLOR_WHITE | Out-Null
      Set-Notes -Slide $slide -Text $spec.Notes
    }
  }
}

try {
  $pres.SaveAs($outputDeck, 24)
}
catch {
  throw "Failed to save PPTX: $($_.Exception.Message)"
}

try {
  $pres.ExportAsFixedFormat($outputPdf, 2)
}
catch {
  $pres.SaveAs($outputPdf, 32)
}

for ($i = 1; $i -le $pres.Slides.Count; $i++) {
  $png = Join-Path $previewDir ('slide-' + $i.ToString('00') + '.png')
  $pres.Slides.Item($i).Export($png, 'PNG', 1920, 1080)
}

$pres.Close()
$pp.Quit()

Write-Host "Saved PPTX: $outputDeck"
Write-Host "Saved PDF: $outputPdf"
Write-Host "Preview PNGs: $previewDir"
