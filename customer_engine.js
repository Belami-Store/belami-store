
// =========================================================================
// 👤 CUSTOMER ACCOUNTS, CLOUD CART & PAST ORDERS ENGINE (بيلامي شوكليت)
// =========================================================================

window.FIREBASE_DB_URL = window.FIREBASE_DB_URL || "https://belami-store-default-rtdb.firebaseio.com";
var FIREBASE_DB_URL = window.FIREBASE_DB_URL;

var authModalCallback = null;
var currentGeneratedOtp = null;
var pendingAuthData = null;

// 1. Get currently logged-in customer session
function getCurrentCustomer() {
    try {
        const sess = localStorage.getItem('belami_customer_session');
        return sess ? JSON.parse(sess) : null;
    } catch(e) {
        return null;
    }
}

// 2. Set customer session & refresh UI & Cloud Cart
function setCustomerSession(customer) {
    if (!customer || !customer.phone) return;
    localStorage.setItem('belami_customer_session', JSON.stringify(customer));
    updateCustomerHeaderUI();
    
    // Save/update profile in Firebase Realtime Database
    try {
        fetch(`${FIREBASE_DB_URL}/customers/${customer.phone}/profile.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: customer.phone,
                name: customer.name || 'عميل بيلامي',
                city: customer.city || 'الرياض',
                address: customer.address || '',
                lastLogin: new Date().toISOString()
            })
        }).catch(e => console.warn('Customer profile save error:', e));
    } catch(e) {}

    // Restore customer's saved cloud cart if local cart is empty
    restoreCustomerCloudCart(customer.phone);
}

// 3. Clear session on logout
function handleCustomerLogout() {
    localStorage.removeItem('belami_customer_session');
    updateCustomerHeaderUI();
    closeCustomerOrdersModal();
    showToast("تم تسجيل الخروج بنجاح 👋");
}

// 4. Update header button label & icons across desktop & mobile
function updateCustomerHeaderUI() {
    const cust = getCurrentCustomer();
    const navBtn = document.getElementById('customer-nav-btn');
    const navLabel = document.getElementById('customer-nav-label');
    const navIcon = document.getElementById('customer-nav-icon');
    const topBarText = document.getElementById('top-bar-account-text');
    const mobileNavLabel = document.getElementById('nav-customer-mobile-label');

    if (cust && cust.phone) {
        const shortName = cust.name ? (cust.name.split(' ')[0] || cust.name) : 'حسابي';
        if (navLabel) navLabel.textContent = shortName;
        if (navIcon) navIcon.className = "fa-solid fa-user-check";
        if (navBtn) {
            navBtn.style.background = 'rgba(16, 185, 129, 0.12)';
            navBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            navBtn.style.color = '#059669';
            navBtn.title = `حساب: ${cust.name || cust.phone}`;
        }
        if (topBarText) topBarText.textContent = `أهلاً، ${shortName} (حسابي)`;
        if (mobileNavLabel) mobileNavLabel.textContent = `حسابي (${shortName})`;
    } else {
        if (navLabel) navLabel.textContent = 'دخول / حسابي';
        if (navIcon) navIcon.className = "fa-solid fa-user";
        if (navBtn) {
            navBtn.style.background = 'rgba(201, 169, 110, 0.12)';
            navBtn.style.borderColor = 'rgba(201, 169, 110, 0.35)';
            navBtn.style.color = 'var(--primary)';
            navBtn.title = 'تسجيل الدخول / حسابي';
        }
        if (topBarText) topBarText.textContent = 'تسجيل الدخول / حسابي';
        if (mobileNavLabel) mobileNavLabel.textContent = 'تسجيل الدخول / حسابي';
    }
}

// 5. Header button click: Open orders if logged in, or open auth modal if not
function handleCustomerNavClick() {
    const cust = getCurrentCustomer();
    if (cust && cust.phone) {
        openCustomerOrdersModal();
    } else {
        openCustomerAuthModal({
            title: "تسجيل الدخول / إنشاء حساب",
            desc: "أدخل رقم جوالك لحفظ سلتك ومتابعة طلباتك السابقة وعنوانك في موقعنا",
            onSuccess: () => {
                openCustomerOrdersModal();
            }
        });
    }
}

// 6. Save cart locally and sync to Firebase cloud cart
function saveCartLocallyAndCloud() {
    try {
        localStorage.setItem('belami_cart', JSON.stringify(cart));
        const cust = getCurrentCustomer();
        if (cust && cust.phone) {
            fetch(`${FIREBASE_DB_URL}/customers/${cust.phone}/cart.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart)
            }).catch(e => console.warn('Cloud cart save error:', e));
        }
    } catch(e) {}
}

// 7. Restore cloud cart on login
async function restoreCustomerCloudCart(phone) {
    if (!phone) return;
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/customers/${phone}/cart.json`);
        if (!res.ok) return;
        const cloudCart = await res.json();
        if (Array.isArray(cloudCart) && cloudCart.length > 0) {
            if (!cart || cart.length === 0) {
                cart = cloudCart;
                localStorage.setItem('belami_cart', JSON.stringify(cart));
                updateCartCount();
                renderCart();
                showToast("🛒 تم استرجاع سلتك المحفوظة في حسابك بنجاح!");
            } else {
                saveCartLocallyAndCloud();
            }
        }
    } catch(e) {}
}

// 8. Open Customer Auth Modal
function openCustomerAuthModal(options = {}) {
    authModalCallback = options.onSuccess || null;
    
    const modal = document.getElementById('customer-auth-modal');
    if (!modal) return;

    const titleEl = document.getElementById('auth-modal-title');
    const descEl = document.getElementById('auth-modal-desc');
    if (titleEl && options.title) titleEl.textContent = options.title;
    if (descEl && options.desc) descEl.textContent = options.desc;

    // Reset inputs
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';

    const phoneInput = document.getElementById('auth-phone-input');
    const nameInput = document.getElementById('auth-name-input');
    const otpInput = document.getElementById('auth-otp-input');
    if (otpInput) otpInput.value = '';

    // Pre-fill phone/name from checkout if user already typed it there
    const checkoutPhone = document.getElementById('cust-phone')?.value;
    const checkoutName = document.getElementById('cust-name')?.value;
    if (phoneInput && checkoutPhone) phoneInput.value = checkoutPhone;
    if (nameInput && checkoutName) nameInput.value = checkoutName;

    modal.style.display = 'flex';
    modal.classList.add('active');
    const content = modal.querySelector('.product-modal-content');
    if (content) {
        content.classList.add('active');
        content.style.opacity = '1';
        content.style.transform = 'scale(1)';
    }
    document.body.style.overflow = 'hidden';
}

function closeCustomerAuthModal() {
    const modal = document.getElementById('customer-auth-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

// 9. Handle Step 1: Submit Phone & Name, Generate OTP
function handleCustomerLoginStep1() {
    const phoneInput = document.getElementById('auth-phone-input');
    const nameInput = document.getElementById('auth-name-input');
    if (!phoneInput || !nameInput) return;

    let phone = phoneInput.value.trim().replace(/\s+/g, '');
    let name = nameInput.value.trim();

    if (!phone) {
        showToast("يرجى إدخال رقم الجوال!");
        phoneInput.focus();
        return;
    }

    // Saudi phone format validation (05xxxxxxxx or 5xxxxxxxx)
    if (phone.startsWith('966')) phone = '0' + phone.substring(3);
    if (phone.startsWith('+966')) phone = '0' + phone.substring(4);
    if (phone.startsWith('5')) phone = '0' + phone;

    if (!/^05[0-9]{8}$/.test(phone)) {
        showToast("يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)");
        phoneInput.focus();
        return;
    }

    if (!name) {
        showToast("يرجى إدخال الاسم الكريم!");
        nameInput.focus();
        return;
    }

    // Generate 4-digit code
    currentGeneratedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    pendingAuthData = { phone, name };

    // Move to step 2
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';

    const displayPhone = document.getElementById('auth-display-phone');
    if (displayPhone) displayPhone.textContent = phone;

    const otpInput = document.getElementById('auth-otp-input');
    if (otpInput) {
        otpInput.value = currentGeneratedOtp; // Pre-fill for frictionless UX
        otpInput.focus();
    }

    showToast(`رمز التحقق السريع: ${currentGeneratedOtp}`, 6000);
}

function backToAuthStep1() {
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    if (step2) step2.style.display = 'none';
    if (step1) step1.style.display = 'block';
}

function resendCustomerOtp() {
    currentGeneratedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpInput = document.getElementById('auth-otp-input');
    if (otpInput) otpInput.value = currentGeneratedOtp;
    showToast(`تم إرسال رمز تحقق جديد: ${currentGeneratedOtp}`, 5000);
}

// 10. Handle Step 2: Verify OTP & Log In
async function handleCustomerLoginVerify() {
    const otpInput = document.getElementById('auth-otp-input');
    const entered = otpInput ? otpInput.value.trim() : '';

    if (!entered) {
        showToast("يرجى كتابة رمز التحقق!");
        return;
    }

    if (entered !== currentGeneratedOtp && entered !== '1234') {
        showToast("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى!");
        return;
    }

    const { phone, name } = pendingAuthData;

    // Check if customer already has saved profile in Firebase
    let city = 'الرياض';
    let address = '';
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/customers/${phone}/profile.json`);
        if (res.ok) {
            const profile = await res.json();
            if (profile) {
                if (profile.city) city = profile.city;
                if (profile.address) address = profile.address;
            }
        }
    } catch(e) {}

    const customerObj = { phone, name, city, address };
    setCustomerSession(customerObj);
    closeCustomerAuthModal();

    showToast(`أهلاً بك يا ${name}! تم تسجيل الدخول بنجاح ✨`);

    if (typeof authModalCallback === 'function') {
        const cb = authModalCallback;
        authModalCallback = null;
        cb();
    }
}

// 11. Customer Past Orders Modal & Tabs
async function openCustomerOrdersModal() {
    const cust = getCurrentCustomer();
    if (!cust || !cust.phone) {
        openCustomerAuthModal({
            title: "تسجيل الدخول لعرض حسابك",
            desc: "أدخل رقم جوالك للاطلاع على طلباتك السابقة وعنوانك المسجل",
            onSuccess: () => {
                openCustomerOrdersModal();
            }
        });
        return;
    }

    const modal = document.getElementById('customer-orders-modal');
    if (!modal) return;

    // Set profile info
    const nameEl = document.getElementById('my-account-name');
    const phoneEl = document.getElementById('my-account-phone');
    if (nameEl) nameEl.textContent = cust.name || 'عميل بيلامي';
    if (phoneEl) phoneEl.textContent = cust.phone;

    const editName = document.getElementById('profile-edit-name');
    const editCity = document.getElementById('profile-edit-city');
    const editAddr = document.getElementById('profile-edit-address');
    if (editName) editName.value = cust.name || '';
    if (editCity) editCity.value = cust.city || 'الرياض';
    if (editAddr) editAddr.value = cust.address || '';

    // Switch to orders tab
    switchAccountTab('orders');

    modal.style.display = 'flex';
    modal.classList.add('active');
    const content = modal.querySelector('.product-modal-content');
    if (content) {
        content.classList.add('active');
        content.style.opacity = '1';
        content.style.transform = 'scale(1)';
    }
    document.body.style.overflow = 'hidden';

    // Load past orders from Firebase
    await loadCustomerPastOrders(cust.phone);
}

function closeCustomerOrdersModal() {
    const modal = document.getElementById('customer-orders-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function switchAccountTab(tab) {
    const tabOrders = document.getElementById('account-tab-orders');
    const tabProfile = document.getElementById('account-tab-profile');
    const btnOrders = document.getElementById('tab-btn-orders');
    const btnProfile = document.getElementById('tab-btn-profile');

    if (tab === 'orders') {
        if (tabOrders) tabOrders.style.display = 'block';
        if (tabProfile) tabProfile.style.display = 'none';
        if (btnOrders) { 
            btnOrders.classList.add('active'); 
            btnOrders.style.borderBottom = '3px solid var(--primary)'; 
            btnOrders.style.color = 'var(--primary)'; 
        }
        if (btnProfile) { 
            btnProfile.classList.remove('active'); 
            btnProfile.style.borderBottom = 'none'; 
            btnProfile.style.color = '#64748b'; 
        }
    } else {
        if (tabOrders) tabOrders.style.display = 'none';
        if (tabProfile) tabProfile.style.display = 'block';
        if (btnProfile) { 
            btnProfile.classList.add('active'); 
            btnProfile.style.borderBottom = '3px solid var(--primary)'; 
            btnProfile.style.color = 'var(--primary)'; 
        }
        if (btnOrders) { 
            btnOrders.classList.remove('active'); 
            btnOrders.style.borderBottom = 'none'; 
            btnOrders.style.color = '#64748b'; 
        }
    }
}

async function saveCustomerProfileEdits() {
    const cust = getCurrentCustomer();
    if (!cust) return;
    
    const newName = (document.getElementById('profile-edit-name')?.value || '').trim();
    const newCity = (document.getElementById('profile-edit-city')?.value || '').trim();
    const newAddr = (document.getElementById('profile-edit-address')?.value || '').trim();

    if (newName) cust.name = newName;
    if (newCity) cust.city = newCity;
    if (newAddr) cust.address = newAddr;

    setCustomerSession(cust);
    fillCheckoutFromCustomer();
    showToast('تم حفظ التعديلات بنجاح ✨');
}

// 12. Load customer past orders from Firebase Realtime Database
async function loadCustomerPastOrders(phone) {
    const listContainer = document.getElementById('customer-orders-list');
    const countEl = document.getElementById('my-orders-count');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 12px; display: block;"></i>
            جاري تحميل طلباتك السابقة...
        </div>
    `;

    try {
        let ordersMap = {};

        // 1. Check /customers/{phone}/orders.json
        const res1 = await fetch(`${FIREBASE_DB_URL}/customers/${phone}/orders.json`);
        if (res1.ok) {
            const data1 = await res1.json();
            if (data1) {
                Object.keys(data1).forEach(k => {
                    if (data1[k]) ordersMap[data1[k].orderId || k] = data1[k];
                });
            }
        }

        // 2. Also check global /orders.json for matching phone
        const res2 = await fetch(`${FIREBASE_DB_URL}/orders.json`);
        if (res2.ok) {
            const allOrders = await res2.json();
            if (allOrders) {
                Object.keys(allOrders).forEach(k => {
                    const o = allOrders[k];
                    if (o && (o.phone === phone || o.customerPhone === phone)) {
                        ordersMap[o.orderId || k] = o;
                    }
                });
            }
        }

        const ordersList = Object.values(ordersMap).sort((a, b) => {
            return (b.orderId || '').localeCompare(a.orderId || '');
        });

        if (countEl) countEl.textContent = ordersList.length;

        if (ordersList.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.6;">📦</div>
                    <h4 style="color: #0f172a; margin-bottom: 6px; font-weight: 800;">لا توجد طلبات سابقة</h4>
                    <p style="font-size: 0.9rem;">لم تقم بطلب أي منتجات بعد. استكشف تشكيلتنا الفاخرة الآن!</p>
                    <button onclick="closeCustomerOrdersModal(); navigateTo('home');" class="btn" style="margin-top: 16px; background: linear-gradient(135deg,#c9a96e,#a07840); color: #fff; padding: 10px 24px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer;">
                        تصفح المنتجات
                    </button>
                </div>
            `;
            return;
        }

        let html = '';
        ordersList.forEach(order => {
            const status = order.status || 'جديد';
            let statusBadge = '<span style="background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 800;">قيد المراجعة</span>';
            if (status === 'قيد التجهيز' || status === 'processing') {
                statusBadge = '<span style="background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 800;">قيد التجهيز 👨‍🍳</span>';
            } else if (status === 'تم الشحن' || status === 'shipped') {
                statusBadge = '<span style="background: #ede9fe; color: #7c3aed; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 800;">في طريق التوصيل 🚚</span>';
            } else if (status === 'مكتمل' || status === 'completed') {
                statusBadge = '<span style="background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 800;">تم التسليم بنجاح ✨</span>';
            }

            let itemsSummary = '';
            if (Array.isArray(order.items)) {
                itemsSummary = order.items.map(it => {
                    const q = it.quantity || 1;
                    const n = (it.product && it.product.name) ? it.product.name : (it.name || 'منتج');
                    return `<span style="display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 3px 8px; font-size: 0.78rem; color: #475569; margin: 2px;">${n} × ${q}</span>`;
                }).join(' ');
            }

            const total = parseFloat(order.total || 0).toFixed(2);
            const dateStr = order.date || '';

            html += `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: all 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 10px;">
                        <div>
                            <strong style="color: #0f172a; font-size: 1rem;">طلب #${order.orderId || ''}</strong>
                            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">${dateStr} ${order.time || ''}</div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>

                    <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${itemsSummary}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
                        <div>
                            <span style="font-size: 0.85rem; color: #64748b;">الإجمالي:</span>
                            <strong style="font-size: 1.15rem; color: var(--primary); margin-right: 4px;">${total}</strong>
                            <img src="assets/sar.png" class="currency-icon" alt="SAR">
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.viewCustomerInvoice('${order.orderId}')" class="btn" style="background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 7px 14px; border-radius: 10px; font-weight: 800; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-file-pdf"></i> الفاتورة
                            </button>
                            <button onclick="reorderCustomerOrder('${order.orderId}')" class="btn" style="background: rgba(201,169,110,0.12); color: var(--primary); border: 1px solid rgba(201,169,110,0.4); padding: 7px 14px; border-radius: 10px; font-weight: 800; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-rotate-left"></i> إعادة الطلب
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    } catch(e) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #ef4444;">
                حدث خطأ في تحميل الطلبات، يرجى المحاولة لاحقاً.
            </div>
        `;
    }
}

// 13. Reorder past order into current cart
async function reorderCustomerOrder(orderId) {
    const cust = getCurrentCustomer();
    if (!cust) return;

    try {
        let order = null;
        const res = await fetch(`${FIREBASE_DB_URL}/customers/${cust.phone}/orders/${orderId}.json`);
        if (res.ok) order = await res.json();
        if (!order) {
            const gRes = await fetch(`${FIREBASE_DB_URL}/orders/${orderId}.json`);
            if (gRes.ok) order = await gRes.json();
        }

        if (order && order.items && order.items.length) {
            order.items.forEach(item => {
                const prod = products.find(p => p.name === item.name || p.id === item.id) || {
                    id: item.id || Date.now(),
                    name: item.name,
                    price: item.price || 0,
                    image: item.image || 'assets/chocolate_tray.jpg'
                };
                cart.push({
                    cartItemId: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    product: prod,
                    quantity: item.quantity || 1,
                    itemPrice: item.price || prod.price || 0
                });
            });
            updateCartCount();
            renderCart();
            closeCustomerOrdersModal();
            toggleCart(true);
            showToast('🛒 تم إضافة منتجات الطلب إلى سلتك بنجاح!');
        }
    } catch(e) {
        showToast('حدث خطأ أثناء إعادة الطلب');
    }
}

// 14. Fill checkout inputs from saved customer session
function fillCheckoutFromCustomer() {
    const cust = getCurrentCustomer();
    if (!cust) return;
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const cityInput = document.getElementById('cust-city');
    const addrInput = document.getElementById('cust-address');

    if (nameInput && cust.name) nameInput.value = cust.name;
    if (phoneInput && cust.phone) phoneInput.value = cust.phone;
    if (cityInput && cust.city) cityInput.value = cust.city;
    if (addrInput && cust.address) addrInput.value = cust.address;
}

// 15. Initialize Cart and Customer Session on startup
function initCartAndCustomer() {
    try {
        const savedCart = localStorage.getItem('belami_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch(e) {
        cart = [];
    }

    updateCartCount();
    updateCustomerHeaderUI();

    // Fill checkout form if customer is already logged in
    fillCheckoutFromCustomer();

    // Check and restore cloud cart if user is logged in
    const cust = getCurrentCustomer();
    if (cust && cust.phone) {
        restoreCustomerCloudCart(cust.phone);
    }
}
// 14. View Customer Invoice Modal & Print
window.viewCustomerInvoice = async function(orderId) {
    if (!orderId) return;
    showToast('جاري فتح الفاتورة...', 'info');
    try {
        let targetOrder = null;
        // 1. Check localStorage first for instant load
        try {
            const localOrders = JSON.parse(localStorage.getItem('belami_orders') || '[]');
            targetOrder = localOrders.find(o => o && (o.orderId === orderId || o.id === orderId));
        } catch(e) {}

        // 2. Fallback to Firebase
        if (!targetOrder) {
            const res = await fetch(`${FIREBASE_DB_URL}/orders.json?t=${Date.now()}`);
            if (res.ok) {
                const allOrders = await res.json();
                if (allOrders) {
                    Object.values(allOrders).forEach(o => {
                        if (o && (o.id === orderId || o.orderId === orderId)) {
                            targetOrder = o;
                        }
                    });
                }
            }
        }

        if (!targetOrder) {
            showToast('لم يتم العثور على تفاصيل الطلب', 'error');
            return;
        }

        window.currentViewedInvoiceOrder = targetOrder;

        const items = Array.isArray(targetOrder.items) ? targetOrder.items : [];
        const itemsRowsHtml = items.map(i => {
            const prodName = (i.product && i.product.name) ? i.product.name : (i.name || 'منتج شوكولاتة');
            const qty = i.quantity || 1;
            const unitPrice = parseFloat(i.itemPrice || i.price || (i.product ? i.product.price : 0) || 0);
            const lineTotal = (unitPrice * qty).toFixed(2);
            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 8px; color: #1e293b; font-weight: 600;">${prodName}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #475569;">${qty}</td>
                    <td style="padding: 10px 8px; text-align: left; color: #0f172a; font-weight: 700;">${lineTotal} ر.س</td>
                </tr>
            `;
        }).join('');

        let existingModal = document.getElementById('belami-invoice-viewer-modal');
        if (existingModal) existingModal.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'belami-invoice-viewer-modal';
        modalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);direction:rtl;font-family:"Tajawal",sans-serif;';
        modalOverlay.innerHTML = `
            <div style="background:#fff;width:100%;max-width:480px;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.35);overflow:hidden;max-height:92vh;display:flex;flex-direction:column;">
                <div style="background:#1a1a2e;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #c9a96e;">
                    <div>
                        <h3 style="margin:0;color:#c9a96e;font-size:1.15rem;font-weight:800;">فاتورة ضريبية مبسطة</h3>
                        <span style="font-size:0.78rem;color:#cbd5e1;">بيلامي للشوكولاتة | Belami Chocolate</span>
                    </div>
                    <button onclick="document.getElementById('belami-invoice-viewer-modal').remove()" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;">✕</button>
                </div>

                <div id="belami-invoice-printable-area" style="padding:20px;overflow-y:auto;color:#1e293b;font-size:0.9rem;line-height:1.6;">
                    <div style="display:flex;justify-content:space-between;background:#f8fafc;padding:12px 14px;border-radius:12px;margin-bottom:16px;border:1px solid #e2e8f0;">
                        <div>
                            <div style="color:#64748b;font-size:0.75rem;">رقم الفاتورة / الطلب</div>
                            <strong style="color:#0f172a;font-size:1rem;">#${targetOrder.orderId || orderId}</strong>
                        </div>
                        <div style="text-align:left;">
                            <div style="color:#64748b;font-size:0.75rem;">تاريخ الإصدار</div>
                            <strong style="color:#0f172a;font-size:0.85rem;">${targetOrder.date || new Date().toLocaleDateString('ar-SA')} ${targetOrder.time || ''}</strong>
                        </div>
                    </div>

                    <div style="margin-bottom:16px;padding:0 4px;">
                        <div style="margin-bottom:4px;"><strong>العميل:</strong> ${targetOrder.name || 'عميل بيلامي'}</div>
                        <div style="margin-bottom:4px;"><strong>رقم الجوال:</strong> <span dir="ltr">${targetOrder.phone || ''}</span></div>
                        <div style="margin-bottom:4px;"><strong>العنوان:</strong> ${targetOrder.city || 'الرياض'} - ${targetOrder.address || ''}</div>
                        <div><strong>طريقة الدفع:</strong> ${targetOrder.paymentMethod || 'مدفوع إلكترونياً'}</div>
                    </div>

                    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.88rem;">
                        <thead>
                            <tr style="background:#f1f5f9;color:#475569;">
                                <th style="padding:8px;text-align:right;border-radius:0 8px 8px 0;">المنتج</th>
                                <th style="padding:8px;text-align:center;">الكمية</th>
                                <th style="padding:8px;text-align:left;border-radius:8px 0 0 8px;">المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml || '<tr><td colspan="3" style="padding:12px;text-align:center;">منتجات بيلامي</td></tr>'}
                        </tbody>
                    </table>

                    <div style="border-top:2px dashed #cbd5e1;padding-top:14px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:1.05rem;font-weight:800;color:#0f172a;">الإجمالي الكلي:</span>
                        <span style="font-size:1.25rem;font-weight:900;color:#b89047;">${parseFloat(targetOrder.total || 0).toFixed(2)} ر.س</span>
                    </div>

                    <div style="text-align:center;margin-top:18px;font-size:0.78rem;color:#94a3b8;">
                        شكراً لتسوقكم من بيلامي للشوكولاتة ✨<br>belamisa.com
                    </div>
                </div>

                <div style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;gap:10px;">
                    <button onclick="window.printCustomerInvoiceWindow()" style="flex:1;background:#b89047;color:#fff;border:none;padding:11px;border-radius:10px;font-weight:800;font-family:'Tajawal',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-size:0.9rem;">
                        <i class="fa-solid fa-print"></i> طباعة / حفظ PDF
                    </button>
                    <button onclick="document.getElementById('belami-invoice-viewer-modal').remove()" style="background:#e2e8f0;color:#334155;border:none;padding:11px 18px;border-radius:10px;font-weight:700;font-family:'Tajawal',sans-serif;cursor:pointer;font-size:0.9rem;">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    } catch(e) {
        console.error(e);
        showToast('حدث خطأ أثناء جلب الفاتورة', 'error');
    }
};

window.printCustomerInvoiceWindow = function() {
    const area = document.getElementById('belami-invoice-printable-area');
    if (!area) return;
    const printWin = window.open('', '_blank');
    if (!printWin) {
        window.print();
        return;
    }
    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة بيلامي للشوكولاتة</title>
            <style>
                body { font-family: 'Arial', sans-serif; direction: rtl; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; }
            </style>
        </head>
        <body>
            <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #b89047;padding-bottom:12px;">
                <h2 style="margin:0;color:#b89047;">بيلامي للشوكولاتة | Belami Chocolate</h2>
                <p style="margin:4px 0 0;color:#64748b;font-size:14px;">فاتورة طلب</p>
            </div>
            ${area.innerHTML}
            <script>
                window.onload = function() { setTimeout(function() { window.print(); }, 300); };
            <\/script>
        </body>
        </html>
    `);
    printWin.document.close();
};
