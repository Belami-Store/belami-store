// Email API URL (Google Apps Script Web App URL)
// ⚠️ قم باستبدال هذا الرابط بالرابط الخاص بك بعد نشر سكربت backend/email_api.gs
var CUSTOMER_EMAIL_API_URL = "https://script.google.com/macros/s/AKfycbxmGeVP0tq9V00EHwLW-32EdfD6fgMNGYBwKrkSY4pnzr7dXWVbr6sPfLOrj4au2F5i/exec";

async function generateInvoicePDF(orderId, name, phone, city, address, paymentMethod, total, items, date) {
    const invoiceDiv = document.createElement("div");
    invoiceDiv.style.padding = "30px";
    invoiceDiv.style.background = "#fff";
    invoiceDiv.style.color = "#333";
    invoiceDiv.style.fontFamily = "Arial, sans-serif";
    invoiceDiv.style.direction = "rtl";
    
    let itemsHtml = items.map(i => <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0;"><span>\ (\)</span><span>\</span></div>).join('');
    
    invoiceDiv.innerHTML = \
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #b89047; margin: 0;">بيلامي للشوكولاتة</h1>
            <p style="color: #666; margin: 5px 0;">فاتورة ضريبية مبسطة</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>رقم الطلب:</strong> #\</p>
            <p><strong>التاريخ:</strong> \</p>
            <p><strong>العميل:</strong> \</p>
            <p><strong>الجوال:</strong> \</p>
            <p><strong>العنوان:</strong> \، \</p>
            <p><strong>طريقة الدفع:</strong> \</p>
        </div>
        <div style="margin-bottom: 20px;">
            \
        </div>
        <div style="text-align: left; font-size: 1.2rem; font-weight: bold; color: #b89047;">
            الإجمالي: \ ر.س
        </div>
        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 0.9rem;">
            شكراً لتسوقكم من بيلامي للشوكولاتة
        </div>
    \;
    
    document.body.appendChild(invoiceDiv);
    
    const opt = {
        margin: 10,
        filename: 'Invoice-' + orderId + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        const pdfBase64 = await html2pdf().from(invoiceDiv).set(opt).outputPdf('datauristring');
        document.body.removeChild(invoiceDiv);
        return pdfBase64;
    } catch(e) {
        document.body.removeChild(invoiceDiv);
        console.error("PDF Generation error", e);
        return null;
    }
}

async function sendCustomerEmail(toEmail, subject, bodyHtml, pdfBase64 = null, pdfName = null) {
    if (!toEmail) return false;
    if (CUSTOMER_EMAIL_API_URL.includes("YOUR_SCRIPT_ID")) {
        console.warn("لم يتم إعداد رابط الـ API لإرسال الإيميلات بعد. يرجى مراجعة ملف backend/email_api.gs");
        return false;
    }
    
    try {
        const res = await fetch(CUSTOMER_EMAIL_API_URL, {
            method: 'POST',
            mode: 'no-cors', // Because Google Apps script CORS can be tricky, but no-cors means we can't read response. Actually, using CORS works if doGet/doOptions are set up.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: toEmail,
                subject: subject,
                body: bodyHtml,
                pdfBase64: pdfBase64,
                pdfName: pdfName
            })
        });
        return true;
    } catch (e) {
        console.error("Email send error", e);
        return false;
    }
}

// We need to fetch email from form if available, or from customer profile
function getCustomerEmailToUse() {
    let email = document.getElementById('cust-email') ? document.getElementById('cust-email').value : null;
    if (!email) {
        try {
            let cust = JSON.parse(localStorage.getItem('belami_customer_session') || '{}');
            if (cust && cust.email) email = cust.email;
        } catch(e){}
    }
    return email;
}

// Function to handle firing the customer email
window.fireCustomerOrderEmail = async function(orderData) {
    let email = getCustomerEmailToUse();
    if (!email) return; // No email to send to
    
    let pdfBase64 = await generateInvoicePDF(
        orderData.orderId, 
        orderData.name, 
        orderData.phone, 
        orderData.city, 
        orderData.address, 
        orderData.paymentMethod, 
        orderData.total, 
        orderData.items, 
        orderData.date || new Date().toLocaleDateString('ar-SA')
    );
    
    let body = 
        <div style="direction: rtl; font-family: Arial, sans-serif;">
            <h2 style="color: #b89047;">مرحباً \،</h2>
            <p>شكراً لتسوقك من بيلامي للشوكولاتة. تم تأكيد طلبك بنجاح!</p>
            <p><strong>رقم الطلب:</strong> #\</p>
            <p>مرفق مع هذه الرسالة فاتورة الشراء بصيغة PDF.</p>
            <p>سنقوم بإعلامك فور تغير حالة الطلب.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #999;">هذا البريد إلكتروني تم إنشاؤه آلياً.</p>
        </div>
    ;
    
    await sendCustomerEmail(email, "تأكيد طلبك من بيلامي #" + orderData.orderId, body, pdfBase64, "Invoice-" + orderData.orderId + ".pdf");
};