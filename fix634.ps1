$content = Get-Content customer_engine.js -Raw
$content = $content -replace "pdfWindow\.document\.write\(\\\<iframe width='100%' height='100%' src='\\\'\>\<\/iframe\>\\\);", "pdfWindow.document.write('<iframe width=\'100%\' height=\'100%\' src=\'' + base64Url + '\'></iframe>');"
Set-Content customer_engine.js $content -Encoding UTF8 -NoNewline
Write-Host "Fixed!"
