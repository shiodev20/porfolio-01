# DEV helper - resized copies of photos (the originals are never touched).
#   Modal previews (tools/build-image-list.js):  ... make-thumbs.ps1 <src> <dest.jpg>
#   Web-size copies used on the pages:           ... make-thumbs.ps1 <src> <dest.png|jpg> 1600 82
# A .png destination keeps transparency (cut-out portraits); a .jpg gets a white backdrop.
param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dest,
  [int]$MaxWidth = 480,
  [int]$Quality = 78
)
Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile($Src)
try {
  $w = [Math]::Min($MaxWidth, $img.Width)
  $h = [int][Math]::Round($img.Height * $w / $img.Width)
  $png = $Dest.ToLower().EndsWith(".png")
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  if ($png) { $g.Clear([System.Drawing.Color]::Transparent) } else { $g.Clear([System.Drawing.Color]::White) }
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)

  New-Item -ItemType Directory -Force -Path (Split-Path $Dest) | Out-Null
  if ($png) {
    $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Quality)
    $bmp.Save($Dest, $codec, $params)
  }
  $g.Dispose(); $bmp.Dispose()
  Write-Output "$w`x$h"
} finally {
  $img.Dispose()
}
