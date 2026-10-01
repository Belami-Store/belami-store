function doPost(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  
  try {
    var data = JSON.parse(e.postData.contents);
    var toEmail = data.to;
    var subject = data.subject;
    var body = data.body;
    var pdfBase64 = data.pdfBase64;
    var pdfName = data.pdfName || "Invoice.pdf";
    
    var emailArgs = {
      to: toEmail,
      subject: subject,
      htmlBody: body
    };
    
    if (pdfBase64) {
      // Decode Base64 string to blob
      var decoded = Utilities.base64Decode(pdfBase64.split(",")[1]);
      var blob = Utilities.newBlob(decoded, "application/pdf", pdfName);
      emailArgs.attachments = [blob];
    }
    
    MailApp.sendEmail(emailArgs);
    
    return ContentService.createTextOutput(JSON.stringify({"success": true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"success": false, "error": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}