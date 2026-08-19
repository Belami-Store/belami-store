# PowerShell Script to extract PDF page to PNG using WinRT APIs
$pdfPath = "C:\Users\aasbb\.gemini\antigravity\brain\85e6d66f-6ff8-4fb6-9a40-970eb20ddac6\media__1783891730904.pdf"
$outputPath = "C:\Users\aasbb\.gemini\antigravity\scratch\chocolate-store\assets\logo.png"

# Load WinRT assemblies
[void][Windows.Security.Cryptography.CryptographicBuffer, Windows.Security.Cryptography, ContentType=WindowsRuntime]

# Load File
$file = [Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath).GetAwaiter().GetResult()
$pdfDocument = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file).GetAwaiter().GetResult()
$page = $pdfDocument.GetPage(0)

# Get target folder and create output file
$folderPath = "C:\Users\aasbb\.gemini\antigravity\scratch\chocolate-store\assets"
$folder = [Windows.Storage.StorageFolder]::GetFolderFromPathAsync($folderPath).GetAwaiter().GetResult()
$outputFile = $folder.CreateFileAsync("logo.png", [Windows.Storage.CreationCollisionOption]::ReplaceExisting).GetAwaiter().GetResult()

# Render to stream
$stream = $outputFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite).GetAwaiter().GetResult()
$page.RenderToStreamAsync($stream).GetAwaiter().GetResult()
$stream.FlushAsync().GetAwaiter().GetResult()

# Clean up
$stream.Dispose()
$page.Dispose()

Write-Output "Logo extracted successfully to assets/logo.png"
