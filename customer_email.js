// The URL of the Google Apps Script Web App
// YOU MUST REPLACE THIS URL AFTER DEPLOYING THE GOOGLE APPS SCRIPT
var CUSTOMER_EMAIL_API_URL = "https://script.google.com/macros/s/AKfycbxmGeVP0tq9V00EHwLW-32EdfD6fgMNGYBwKrkSY4pnzr7dXWVbr6sPfLOrj4au2F5i/exec";

// Function to dynamically generate an invoice PDF and return it as a Base64 string
window.generateInvoicePDF = async function(orderData) {
    if (typeof html2pdf === 'undefined') {
        console.warn("html2pdf library is not loaded.");
        return null;
    }

    const { orderId, name, phone, email, city, address, total, items, date, paymentMethod } = orderData;

    const invoiceDiv = document.createElement("div");
    invoiceDiv.style.padding = "30px";
    invoiceDiv.style.background = "#fff";
    invoiceDiv.style.color = "#333";
    invoiceDiv.style.fontFamily = "Arial, sans-serif";
    invoiceDiv.style.direction = "rtl";
    
    let itemsHtml = items.map(i => `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0;"><span>${i.name} (x${i.quantity || 1})</span><span>${i.price || 0} ر.س</span></div>`).join('');
    
    invoiceDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #b89047; margin: 0;">بيلامي للشوكولاتة</h1>
            <p style="color: #666; margin: 5px 0;">فاتورة طلب</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>رقم الطلب:</strong> #${orderId}</p>
            <p><strong>التاريخ:</strong> ${date || new Date().toLocaleDateString('ar-SA')}</p>
            <p><strong>العميل:</strong> ${name}</p>
            <p><strong>الهاتف:</strong> ${phone}</p>
            <p><strong>العنوان:</strong> ${city}، ${address}</p>
            <p><strong>طريقة الدفع:</strong> ${paymentMethod || 'الدفع الإلكتروني'}</p>
        </div>
        <div style="border-top: 2px solid #b89047; padding-top: 15px;">
            <h3 style="color: #b89047; margin-bottom: 15px;">تفاصيل المنتجات:</h3>
            ${itemsHtml}
            <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 1.2rem; font-weight: bold; color: #b89047;">
                <span>الإجمالي:</span>
                <span>${parseFloat(total).toFixed(2)} ر.س</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 40px; font-size: 0.9rem; color: #888;">
            شكراً لتسوقكم من بيلامي للشوكولاتة!
        </div>
    `;

    // Attach to DOM temporarily for html2pdf to render properly on mobile
    const wrapperDiv = document.createElement("div");
    wrapperDiv.style.position = "absolute";
    wrapperDiv.style.top = "-9999px";
    wrapperDiv.style.left = "-9999px";
    wrapperDiv.style.width = "800px"; // Provide enough width for PDF rendering
    wrapperDiv.style.height = "auto";
    wrapperDiv.style.overflow = "visible";
    wrapperDiv.style.opacity = "1";
    wrapperDiv.style.pointerEvents = "none";
    wrapperDiv.appendChild(invoiceDiv);
    document.body.appendChild(wrapperDiv);

    const opt = {
        margin:       10,
        filename:     `Invoice_${orderId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        const pdfBlob = await html2pdf().from(invoiceDiv).set(opt).output('blob');
        if (document.body.contains(wrapperDiv)) document.body.removeChild(wrapperDiv);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(pdfBlob);
        });
    } catch (e) {
        console.error("Error generating PDF:", e);
        if (document.body.contains(wrapperDiv)) document.body.removeChild(wrapperDiv);
        return null;
    }
};

// Generic function to send an email via the Apps Script API
window.sendCustomerEmail = async function(toEmail, subject, bodyHtml, pdfBase64 = null, pdfName = "Invoice.pdf") {
    if (!toEmail || toEmail.trim() === "") return false;
    
    let cleanBase64 = pdfBase64;
    if (pdfBase64 && pdfBase64.includes(',')) {
        cleanBase64 = pdfBase64.split(',')[1];
    }
    
    const payload = {
        to: toEmail,
        subject: subject,
        body: bodyHtml,
        pdfBase64: cleanBase64,
        pdfName: pdfName
    };
    
    try {
        const response = await fetch(CUSTOMER_EMAIL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Email API Error:", error);
        return false;
    }
};

// Higher-order function called when an order is successful
window.fireCustomerOrderEmail = async function(orderData) {
    if (!orderData.email) return;

    let pdfBase64 = await generateInvoicePDF(orderData);
    
    let itemsText = orderData.items.map(i => `<li>${i.name} (الكمية: ${i.quantity || 1})</li>`).join('');

    let bodyHtml = `
        <div style="direction: rtl; font-family: Arial, sans-serif;">
            <h2 style="color: #b89047;">شكراً لطلبك من بيلامي!</h2>
            <p>مرحباً ${orderData.name}،</p>
            <p>لقد استلمنا طلبك رقم <strong>#${orderData.orderId}</strong> بنجاح.</p>
            <p>تفاصيل الطلب:</p>
            <ul>
                ${itemsText}
            </ul>
            <p><strong>الإجمالي:</strong> ${parseFloat(orderData.total).toFixed(2)} ر.س</p>
            <p>مرفق مع هذه الرسالة الفاتورة الضريبية الخاصة بطلبك بصيغة PDF.</p>
            <p>نسعد بخدمتكم دائماً.</p>
        </div>
    `;

    await sendCustomerEmail(orderData.email, "تأكيد طلبك من بيلامي #" + orderData.orderId, bodyHtml, pdfBase64, "Invoice_" + orderData.orderId + ".pdf");
};
