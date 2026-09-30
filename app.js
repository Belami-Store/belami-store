// --- CRM TRACKING ---
async function trackVisitor() {
    if(sessionStorage.getItem('v_tracked')) return;
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        let visitors = await dbFetch('crm_visitors');
        if(!visitors || !Array.isArray(visitors)) visitors = [];
        visitors.push({
            ip: data.ip || 'Unknown',
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            time: new Date().toLocaleString('en-GB')
        });
        if(visitors.length > 200) visitors = visitors.slice(-200);
        await dbSave('crm_visitors', visitors);
        sessionStorage.setItem('v_tracked', '1');
    } catch(e) { console.log(e); }
}
async function trackProductView(id) {
    try {
        let views = await dbFetch('crm_views');
        if(!views) views = {};
        views[id] = (views[id] || 0) + 1;
        await dbSave('crm_views', views);
    } catch(e){}
}
// Products Data (Default fallback)
const defaultProducts = [
    {
        id: 1,
        name: "بوكس كلاسيك",
        description: "21 قطعة من الشوكلاته الفاخرة المعدة من اجود المكونات بثلاث نكهات مميزة البندق الكرانشي والسولتد كراميل والفول السوداني او التوت مع البستاشيو",
        price: 99,
        category: "boxes",
        image: "assets/luxury_chocolate_box.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 2,
        name: "صينية الضيافة المميزة",
        description: "كيلو من الشوكلاته البلجيكية الفاخرة بنكهات مميزة حسب اختيارك (كلاسيك، كريمينو، ترافلز)",
        price: 399,
        category: "trays",
        image: "assets/chocolate_tray.jpg",
        badge: "الأكثر طلباً",
        isOutOfStock: false,
        options: ["كلاسيك", "كريمينو", "ترافلز"]
    },
    {
        id: 3,
        name: "صينية الاهداء",
        description: "شوكولاتة بيلامي الفاخرة في صينية أنيقة بداخل بوكس إهداء راقٍ يليق بك، مع إمكانية إرفاق كرت إهداء حسب رغبتك.",
        price: 180,
        category: "gifts",
        image: "assets/gift_tray.jpg",
        badge: "الأكثر طلباً",
        isOutOfStock: false
    },
    {
        id: 4,
        name: "بوكس البيكان",
        description: "بيكان مكرمل بنكهتنا الخاصه ومغطى بشوكلاته بلجيكية فاخرة تليق بذائقتك",
        price: 99,
        category: "boxes",
        image: "assets/pecan_box.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 5,
        name: "بكجات الضيافة والمناسبات",
        description: "بكجات متكاملة لضيافة مناسباتكم الراقية. تشمل صواني الشوكولاتة الفاخرة والموالح الفرنسية الناشفة شاملة التوصيل واستلام الصواني. يرجى التواصل معنا عبر الواتساب لتأكيد الموقع والاتفاق على تفاصيل النكهات المفضلة.",
        price: 1100,
        category: "hospitality",
        image: "assets/events_package.jpg",
        badge: "الأكثر مبيعاً",
        options: [
            "باكج 20 شخص (1100 ر.س)",
            "باكج 50 شخص (2100 ر.س)",
            "باكج 100 شخص (5500 ر.س)",
            "باكج 200 شخص (10900 ر.س)"
        ],
        isOutOfStock: false
    },
    {
        id: 6,
        name: "بوكس الكريمينو وبايتس اللوز بالكراميل",
        description: "اكثر من 60 قطعة شوكلاته من الكريمينو الكلاسيك وبايتس اللوز المغطى بالكراميل والشوكلاته البلجيكية الفاخرة",
        price: 89,
        category: "boxes",
        image: "assets/cremino_box.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 7,
        name: "بوكس الشوكولاتة المخصص الثنائي (2 قطعة)",
        description: "بوكس أنيق يحتوي على قطعتين من الشوكولاتة الفاخرة، مع إمكانية طباعة ثيم مناسباتكم وشعاركم (اللوقو) الخاص على العلبة. نكهات الشوكولاتة حسب الطلب تشمل نكهاتنا الكلاسيكية الفاخرة أو نكهات مبتكرة خاصة بكم لتناسب هوية شركتكم.",
        price: 17,
        category: "corporate",
        image: "assets/corporate_box_2pcs.jpg",
        images: [
            "assets/corporate_box_2pcs.jpg",
            "assets/corporate_box_2pcs_bulk.jpg"
        ],
        badge: "الأكثر طلباً",
        isOutOfStock: false
    },
    {
        id: 8,
        name: "صينية شوكلاته سيجنتشر",
        description: "صينية شوكولاتة بتنسيق فاخر تجمع بين الجمال والتنوع، مناسبة للضيافة والهدايا. بندق كرانشي، اسبريسو، فول سوداني، سولتد كراميل. لا تقل عن 65 قطعة شوكولاتة",
        price: 290,
        category: "trays",
        image: "assets/signature_tray.jpg",
        badge: "سيجنتشر",
        isOutOfStock: false
    },
    {
        id: 9,
        name: "بوكس الكريمينو واللوز",
        description: "شوكولاتة بيلامي الفاخرة من الكريمينو وبايتس اللوز بالكراميل منسقة في صينية دائرية بداخل بوكس إهداء راقٍ مع الشنطة، إهداء استثنائي لمن تحب.",
        price: 180,
        category: "gifts",
        image: "assets/cremino_almond_gift.jpg",
        badge: "إهداء راقٍ",
        isOutOfStock: false
    },
    {
        id: 10,
        name: "بوكس الكريمينو نصف كيلو",
        description: "نصف كيلو من الكريمينو الكلاسيك بطبقات من الشوكلاته والبندق بنكهات عميقة خالية من الزيوت المهدرجة والنكهات الصناعية",
        price: 170,
        category: "boxes",
        image: "assets/cremino_half_kilo.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 11,
        name: "بوكس النكهات العالمية (بيلامي كأس العالم)",
        description: "21 قطعة شوكلاته ل6 نكهات مبتكرة ومستوحاة من افضل 6 دول مشاركة.. تورون اسبانيا.. وبينت بتر بالتوت من امريكا وهيل من السعوديه ودولسي من البرتغال وكاربينيا الليمون الاخضر من البرازيل وفطيرة التفاح من ألمانيا",
        price: 109,
        category: "boxes",
        image: "assets/world_cup_box.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 12,
        name: "صينية الفخامة",
        description: "صينية شوكولاتة بتنسيق فاخر تجمع بين الجمال والتنوع، مناسبة للضيافة والهدايا. بندق كرانشي، اسبريسو، فول سوداني، سولتد كراميل. لا تقل عن 65 قطعة شوكولاتة",
        price: 290,
        category: "trays",
        image: "assets/luxury_tray.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 13,
        name: "صينية شوكولاته التوليب",
        description: "صينية شوكولاتة بتنسيق فاخر تجمع بين الجمال والتنوع، مناسبة للضيافة والهدايا. لا تقل عن 65 قطعة شوكولاته من النكهات الفاخرة: توت مع بستاشيو واسبريسو وبندق كراشي او فول سوداني",
        price: 280,
        category: "trays",
        image: "assets/tulip_tray.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 14,
        name: "صينية الكريمينو البايتس",
        description: "صينية شوكولاتة بتنسيق فاخر تجمع بين الجمال والتنوع، مناسبة للضيافة والهدايا. لا تقل عن 70 قطعة من الكريمينو وبايتس اللوز بالكراميل والشوكولاتة البلجيكية الفاخرة.",
        price: 290,
        category: "trays",
        image: "assets/cremino_bites_tray.jpg",
        badge: "",
        isOutOfStock: false
    },
    {
        id: 15,
        name: "صينية هدية بورد ليلي الاصفر",
        description: "تنسيق إهداء استثنائي يجمع بين بوكس الشوكولاتة السوداء الفاخرة وباقة أنيقة من زهور الليلي الصفراء الزاهية، مع إمكانية إرفاق كرت إهداء خاص بك.",
        price: 180,
        category: "gifts",
        image: "assets/yellow_lily_gift.jpg",
        badge: "جديد",
        isOutOfStock: false
    },
    {
        id: 16,
        name: "شوكولاتة لوجو مطبوعة بالكيلو (بدون بوكس)",
        description: "شوكولاتة بلجيكية فاخرة مطبوعة بالكامل بشعار شركتكم (اللوجو) أو الثيم الخاص بكم بدقة عالية. مثالية للتقديم والضيافة في فعاليات الشركات واجتماعات العمل. الكيلو يحتوي على حوالي 60 حبة بالشكل والمذاق الرائع.",
        price: 280,
        category: "corporate",
        image: "assets/corporate_logo_chocolates.jpg",
        badge: "طلب خاص",
        isOutOfStock: false
    },
    {
        id: 17,
        name: "بوكس الشوكولاتة المخصص المفرد (حبة واحدة)",
        description: "بوكس إهداء فاخر ومميز يحتوي على حبة واحدة من الشوكولاتة البلجيكية الفاخرة المطبوعة بشعار شركتكم (اللوقو). يأتي البوكس بتصميم مخصص وأنيق مع شريط ستان راقٍ يليق بهويتكم.",
        price: 14,
        category: "corporate",
        image: "assets/corporate_box_1pc.jpg",
        badge: "جديد",
        isOutOfStock: false
    },
    {
        id: 18,
        name: "شوكولاتة بالكيلو (الأنواع الأساسية)",
        description: "شوكولاتة بلجيكية فاخرة بالوزن حسب اختياركم. يرجى اختيار الوزن والنوع المفضل (كلاسيك، ترافلز، كريمينو كلاسيك، أو بيكان مكرمل)، وكتابة النكهة المفضلة في مربع الملاحظات بالأسفل.\n\nالنكهات المتوفرة:\n• كلاسيك: (بندق كرانشي، فول سوداني، سولتد كراميل، توت مع بستاشيو، دولتشي، اسبريسو، جندويا اللوز، كراميل بالسمسم والمكسرات).\n• ترافلز: (كراميل دارك شوكليت، جناش القهوة الدارك).\n• كريمينو كلاسيك.\n• بيكان مكرمل.",
        price: 85,
        category: "boxes",
        image: "assets/chocolate_by_kilo.jpg",
        badge: "بالوزن",
        options: [
            "ربع كيلو كلاسيك (85 ر.س)",
            "ربع كيلو ترافلز (85 ر.س)",
            "ربع كيلو كريمينو كلاسيك (85 ر.س)",
            "ربع كيلو بيكان مكرمل (85 ر.س)",
            "نصف كيلو كلاسيك (170 ر.س)",
            "نصف كيلو ترافلز (170 ر.س)",
            "نصف كيلو كريمينو كلاسيك (170 ر.س)",
            "نصف كيلو بيكان مكرمل (170 ر.س)",
            "كيلو كلاسيك (340 ر.س)",
            "كيلو ترافلز (340 ر.س)",
            "كيلو كريمينو كلاسيك (340 ر.س)",
            "كيلو بيكان مكرمل (340 ر.س)"
        ],
        isOutOfStock: false
    },
    {
        id: 19,
        name: "شوكولاتة بالنكهات الخاصة (بالطلب)",
        description: "نصنعها لكم بالطلب خصيصاً بمكونات طازجة وحشوات مبتكرة. الحد الأدنى للطلب نصف كيلو (500 جرام) لكل نكهة مخصصة. يرجى اختيار الوزن والنوع، وتحديد النكهات المفضلة في مربع الملاحظات بالأسفل.\n\nالنكهات الخاصة المتوفرة:\n• كلاسيك خاص: (تشيز توت، تشيز ليمون، جناش التوت والليمون الأخضر، تيراميسو، سينابون، هيل).\n• كرانشي خاص: (لوز، سمسم، زعتر).\n• أعواد: (برتقال، سولتد كراميل مع سمسم).\n• شوكولاتة ملونة بالنكهات.",
        price: 170,
        category: "boxes",
        image: "assets/special_flavors_chocolate.jpg",
        images: [
            "assets/special_flavors_chocolate.jpg",
            "assets/special_flavors_gallery.jpg"
        ],
        badge: "بالطلب",
        options: [
            "نصف كيلو كلاسيك خاص (170 ر.س)",
            "نصف كيلو كرانشي خاص (170 ر.س)",
            "نصف كيلو أعواد (170 ر.س)",
            "نصف كيلو شوكولاتة ملونة (170 ر.س)",
            "كيلو كلاسيك خاص (340 ر.س)",
            "كيلو كرانشي خاص (340 ر.س)",
            "كيلو أعواد (340 ر.س)",
            "كيلو شوكولاتة ملونة (340 ر.س)"
        ],
        isOutOfStock: false
    },
    {
        id: 20,
        name: "شوكولاتة خالية من السكر المضاف",
        description: "شوكولاتة بلجيكية فاخرة ولذيذة خالية تماماً من السكر المضاف, معدة خصيصاً للراغبين في بدائل صحية دون المساومة على المذاق الغني والفاخر. الحد الأدنى للطلب هو نصف كيلو (500 جرام).",
        price: 220,
        category: "boxes",
        image: "assets/sugar_free_chocolate.jpg",
        badge: "صحي / دايت",
        options: [
            "نصف كيلو خالية من السكر (220 ر.س)",
            "كيلو كامل خالية من السكر (440 ر.س)"
        ],
        isOutOfStock: false
    },
    {
        id: 21,
        name: "شوكولاتة قهوتك اليوم",
        description: "صينية شوكولاتة فاخرة بـ 99 ر.س مثالية لجمعاتكم وقهوتكم اليومية. تتوفر بثلاثة أصناف فاخرة حسب اختيارك: الشوكولاتة الملونة، الكلاسيك، أو الكريمينو.",
        price: 99,
        category: "trays",
        image: "assets/daily_coffee_all.jpg",
        images: [
            "assets/daily_coffee_all.jpg",
            "assets/daily_coffee_colored.jpg",
            "assets/daily_coffee_classic.jpg",
            "assets/daily_coffee_cremino.jpg"
        ],
        badge: "جديد ☕",
        options: [
            "الشوكولاتة الملونة",
            "الكلاسيك",
            "الكريمينو"
        ],
        isOutOfStock: false
    }
];

// App State
let products = [];
let cart = [];
let activeCategory = 'all';
let currentShippingCost = 35;

let reviewsList = [
    { name: "أمل عبدالله", text: "ما شاء الله الشوكولاتة جداً رائعة ولذيذة، والخدمة سريعة والتوصيل في الوقت المحدد. سأكرر الطلب بالتأكيد.", stars: 5, date: "عميل موثوق" },
    { name: "خالد محمد", text: "من أفضل براندات الشوكولاتة دايماً اطلبها وأثق فيها. البوكسات شكلها يواجه ويفتح النفس ويبيض الوجه في الإهداء.", stars: 5, date: "عميل موثوق" }
];
let activeDiscountPercent = 0;
let appliedCouponCode = "";

const DB_BUCKET = "belami_sa_85e6d66f";
const DB_BASE_URL = `https://kvdb.io/buckets/${DB_BUCKET}/keys`;

let storeSettings = {
    name: "بيلامي شوكليت",
    logo: "assets/logo.png",
    shippingCost: 35,
    pickupEnabled: true,
    categories: [
        { id: "boxes", name: "بوكسات" },
        { id: "trays", name: "صواني" },
        { id: "gifts", name: "هدايا" },
        { id: "hospitality", name: "بكجات ضيافة" },
        { id: "corporate", name: "هدايا الشركات" }
    ],
    moyasarKey: "pk_test_h5N7sF1hTefjR4ePehQZc8VfF2G5K8sQ1jP6VfB2", // Demo key
    tapKey: "pk_test_V32tNaCg6sbZPH9q5J0SdA0E", // Sandbox default
    paylinkKey: "APP_ID_1784424601276",
    paylinkSecret: "3d338d24-08f6-3e0c-bd14-d7bf76261ba1",
    paylinkLink: "https://pylnk.me/l/QVC2xH",
    tamaraKey: "038760f6-0cb9-44fd-b61c-4615a63a9472",
    activeGateway: "paylink",
    testMode: false
};

// Fast local storage fetch (non-blocking, instant loading)
function dbFetchLocal(key, defaultValue) {
    const local = localStorage.getItem('local_db_' + key);
    if (local) {
        try {
            return JSON.parse(local);
        } catch (e) {
            console.error("Local parse error for key " + key, e);
        }
    }
    return defaultValue;
}

// Fetch key from kvdb.io with a small 3-second timeout to prevent UI hang
async function dbFetch(key, defaultValue) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${DB_BASE_URL}/${key}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 200) {
            return await response.json();
        } else if (response.status === 404) {
            if (defaultValue !== null) {
                dbSave(key, defaultValue);
            }
            return defaultValue;
        }
    } catch (e) {
        console.error("DB Fetch Error for key " + key + ":", e);
    }
    if (defaultValue === null) return null;
    return dbFetchLocal(key, defaultValue);
}

// Save key instantly to localStorage and update cloud in background (never blocks UI)
function dbSave(key, value) {
    localStorage.setItem('local_db_' + key, JSON.stringify(value));
    fetch(`${DB_BASE_URL}/${key}?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
    }).catch(e => {
        console.error("Cloud sync save error for key " + key + ":", e);
    });
}

// Loud pleasant bell chime for new orders
function playNewOrderSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
        console.log("Audio alert error:", e);
    }
}

// Send instant email notification to store email: belamichoco@gmail.com
function sendOrderEmailNotification(orderData) {
    try {
        fetch('https://formsubmit.co/ajax/belamichoco@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `🔔 طلب جديد في متجر بيلامي #${orderData.orderId} بقيمة ${orderData.total.toFixed(2)} ر.س`,
                "رقم الطلب": `#${orderData.orderId}`,
                "اسم العميل": orderData.name,
                "رقم الجوال": orderData.phone,
                "العنوان والمدينة": `${orderData.city}، ${orderData.address}`,
                "طريقة الدفع": orderData.paymentMethod,
                "إجمالي المبلغ": `${orderData.total.toFixed(2)} ر.س`,
                "تاريخ الطلب": orderData.date,
                "المنتجات": orderData.items.map(i => `${i.name} (الكمية: ${i.quantity})`).join(', ')
            })
        }).catch(err => console.warn("Email alert error:", err));
    } catch (e) {
        console.warn("Could not dispatch order email:", e);
    }
}

function applyStoreSettings() {
    const logoImg = document.getElementById('logo-img');
    const footerLogoImg = document.getElementById('footer-logo-img');
    const logoFallback = document.getElementById('logo-fallback');
    const footerLogoFallback = document.getElementById('footer-logo-fallback');

    if (logoImg && storeSettings.logo) {
        resolveImage(storeSettings.logo, logoImg).then(() => {
            logoImg.style.display = 'block';
            if (logoFallback) logoFallback.style.display = 'none';
        });
    }
    if (footerLogoImg && storeSettings.logo) {
        resolveImage(storeSettings.logo, footerLogoImg).then(() => {
            footerLogoImg.style.display = 'block';
            if (footerLogoFallback) footerLogoFallback.style.display = 'none';
        });
    }
    
    // Update category nav
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        let navHtml = `<li class="nav-item active" id="nav-home-link"><a href="#" onclick="navigateTo('home')">الرئيسية</a></li>`;
        storeSettings.categories.forEach(cat => {
            navHtml += `<li class="nav-item"><a href="#" onclick="openCategoryView('${cat.id}')">${cat.name}</a></li>`;
        });
        navHtml += `<li class="nav-item"><a href="#contact" onclick="navigateTo('home'); scrollToSection('contact')">اتصل بنا</a></li>`;
        navMenu.innerHTML = navHtml;
    }
    
    currentShippingCost = storeSettings.shippingCost;

    const noticeEl = document.getElementById("checkout-gateway-notice");
    if (noticeEl) {
        if (storeSettings.activeGateway === 'paylink') {
            noticeEl.innerHTML = `يتم معالجة وتأمين جميع العمليات البنكية بواسطة بوابة الدفع السعودية الرسمية <strong>بي لينك (Paylink)</strong> المرخصة من البنك المركزي السعودي (SAMA).`;
        } else if (storeSettings.activeGateway === 'tap') {
            noticeEl.innerHTML = `يتم معالجة وتأمين جميع العمليات البنكية بواسطة بوابة الدفع الرسمية <strong>تاب (Tap Payments)</strong>.`;
        } else {
            noticeEl.innerHTML = `يتم معالجة وتأمين جميع العمليات البنكية بواسطة بوابة الدفع الرسمية <strong>ميسر (Moyasar)</strong>.`;
        }
    }
}

// Check if the current URL contains a redirect from Moyasar
async function checkMoyasarCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pay_success') === 'true') {
        const status = urlParams.get('status');
        const paymentId = urlParams.get('id');
        const orderId = urlParams.get('orderId');
        const name = urlParams.get('name');
        const phone = urlParams.get('phone');
        const city = urlParams.get('city');
        const address = urlParams.get('address');
        const total = parseFloat(urlParams.get('total') || '0');
        const coupon = urlParams.get('coupon') || '';

            const isMoyasarSuccess = status === 'captured';
            const isTapSuccess = urlParams.has('tap_id') || urlParams.has('charge_id') || (!status && urlParams.get('pay_success') === 'true');

            if (isMoyasarSuccess || isTapSuccess) {
                const gatewayName = isMoyasarSuccess ? 'ميسر' : 'تاب (Tap)';
                const gatewayPaymentId = paymentId || 'TAP_PAY';
                
                // Parse purchased items & increment buy counts
                const itemsParam = urlParams.get('items');
                const orderItems = [];
                let productsUpdated = false;
                
                if (itemsParam) {
                    itemsParam.split(',').forEach(part => {
                        if (part.includes(':')) {
                            const [pId, qty] = part.split(':').map(Number);
                            const prodIndex = products.findIndex(p => p.id === pId);
                            if (prodIndex !== -1) {
                                products[prodIndex].purchaseCount = (products[prodIndex].purchaseCount || 0) + (qty || 1);
                                productsUpdated = true;
                                orderItems.push({
                                    name: products[prodIndex].name,
                                    quantity: qty
                                });
                            }
                        }
                    });
                    if (productsUpdated) {
                        dbSave('products', products);
                        renderProducts();
                    }
                }

                // Save Order to cloud database CRM
                await saveOrderToAdmin(orderId, name, phone, city, address, `مدفوع إلكترونياً (${gatewayName}: ${gatewayPaymentId})`, total, orderItems);
            
            // Log administrative alert
            logAdminAlert(`🎉 طلب جديد رقم #${orderId} مدفوع إلكترونياً بقيمة ${total.toFixed(2)} ر.س`);
            localStorage.setItem('belami_new_order_trigger', Date.now().toString());
            playNotificationSound();

            // Clear local cart
            cart = [];
            updateCartCount();

            // Fill receipt details in DOM
            document.getElementById("receipt-order-id").textContent = `#${orderId}`;
            document.getElementById("receipt-name").textContent = name;
            document.getElementById("receipt-phone").textContent = phone;
            document.getElementById("receipt-address").textContent = `${city}، ${address}`;
            document.getElementById("receipt-payment").textContent = `مدفوع إلكترونياً (ميسر: ${paymentId})`;
            document.getElementById("receipt-total").textContent = `${total.toFixed(2)} ر.س`;

            // Build WhatsApp message
            const shippingMethodName = total > 1000 ? "توصيل مجاني للمناسبات" : (currentShippingCost === 35 ? "توصيل لجميع أحياء الرياض (35 ر.س)" : "استلام من الرياض - حي الشفا (مجاناً)");
            const couponText = coupon ? `\n*كود الخصم المطبق:* ${coupon} (خصم 5%)` : "";
            const msg = `مرحباً بيلامي للشوكولاتة، أود تأكيد طلبي المدفوع إلكترونياً:\n\n*رقم الطلب:* #${orderId}\n*رقم الدفع:* ${paymentId}\n*الاسم:* ${name}\n*رقم الجوال:* ${phone}\n*طريقة الاستلام:* ${shippingMethodName}\n*العنوان:* ${city}، ${address}${couponText}\n*المجموع الإجمالي:* ${total.toFixed(2)} ر.س`;
            const waLink = `https://api.whatsapp.com/send?phone=966535671116&text=${encodeURIComponent(msg)}`;
            const waBtn = document.getElementById("whatsapp-confirm-btn");
            if (waBtn) {
                waBtn.href = waLink;
                waBtn.style.display = "inline-flex";
            }

            // Remove query params silently from address bar so page refreshes don't re-execute logic
            window.history.replaceState({}, document.title, window.location.pathname);

            navigateTo('success');
            showToast("تم الدفع وتسجيل طلبك بنجاح!");
        } else {
            showToast("فشلت عملية الدفع! يرجى المحاولة ببطاقة أخرى.");
            window.history.replaceState({}, document.title, window.location.pathname);
            navigateTo('checkout');
        }
    }
}

// Background cloud sync to keep local data updated without overwriting user edits
async function syncCloudData() {
    try {
        // Fetch Banner
        const bannerData = await dbFetch('banner', null);        const topBanner = document.getElementById('top-announcement-bar');
        if (topBanner) {
            if (bannerData && (bannerData.visible === false || bannerData.visible === 'false')) {
                topBanner.style.display = 'none';

            } else {
                topBanner.style.display = 'block';
                const text = bannerData ? bannerData.text : '🔥 لا تفوتكم عروض ما قبل الإجازة السنوية (خصم 10%) &nbsp; | &nbsp; ⏳ آخر وقت للطلب 28 يوليو 🎁';
                const span1 = document.getElementById('top-announcement-text1');
                const span2 = document.getElementById('top-announcement-text2');
                if (span1) span1.innerHTML = text;
                if (span2) span2.innerHTML = text;
            }
        }

        const hasLocalProducts = localStorage.getItem('local_db_products');
        if (!hasLocalProducts) {
            const freshProducts = await dbFetch('products', null);
            if (freshProducts && freshProducts.length > 0) {
                products = freshProducts;
                localStorage.setItem('local_db_products', JSON.stringify(products));
                renderProducts();
            }
        }

        const hasLocalSettings = localStorage.getItem('local_db_settings');
        if (!hasLocalSettings) {
            const freshSettings = await dbFetch('settings', null);
            if (freshSettings) {
                storeSettings = freshSettings;
                localStorage.setItem('local_db_settings', JSON.stringify(storeSettings));
                applyStoreSettings();
            }
        }
    } catch (e) {
        console.warn("Background cloud sync skipped:", e);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    trackVisitor();
    // Load immediately from local cache (offline-first, instant render)
    storeSettings = dbFetchLocal('settings', storeSettings);
    products = dbFetchLocal('products', defaultProducts);
    reviewsList = dbFetchLocal('store_reviews', reviewsList);
    
    // Ensure product 21 ("شوكولاتة قهوتك اليوم") exists in products list
    if (!products.some(p => p.id === 21)) {
        const prod21 = defaultProducts.find(p => p.id === 21);
        if (prod21) products.push(prod21);
        localStorage.setItem('local_db_products', JSON.stringify(products));
    }

    // Ensure Paylink keys are pre-configured
    if (!storeSettings.paylinkKey) {
        storeSettings.paylinkKey = "APP_ID_1784424601276";
        storeSettings.paylinkSecret = "3d338d24-08f6-3e0c-bd14-d7bf76261ba1";
        storeSettings.activeGateway = "paylink";
        storeSettings.testMode = false;
        localStorage.setItem('local_db_settings', JSON.stringify(storeSettings));
    }

    applyStoreSettings();
    renderProducts();
    renderReviews();
    updateCartCount();

    // Start background sync with kvdb.io (non-blocking)
    syncCloudData();

    // Check Moyasar payment redirect status
    await checkMoyasarCallback();

    // Generate JSON-LD Schema for Google Search Rich Snippets
    generateProductSchemaMarkup();

    // Handle deep-linking to specific products (Google Search index or direct sharing)
    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#product-')) {
            const prodId = parseInt(hash.replace('#product-', ''));
            if (!isNaN(prodId)) {
                openProductModal(prodId);
            }
        }
    };
    handleDeepLink();
    window.addEventListener('hashchange', handleDeepLink);

    if (window.location.hash === '#admin') {
        navigateTo('admin');
    }

    // Track visits
    if (!sessionStorage.getItem('belami_session_active')) {
        sessionStorage.setItem('belami_session_active', 'true');
        
        let visits = parseInt(localStorage.getItem('belami_visits') || '0');
        localStorage.setItem('belami_visits', (visits + 1).toString());
        
        // Update cloud visits count
        let cloudVisits = parseInt(await dbFetch('visits', '0'));
        await dbSave('visits', (cloudVisits + 1).toString());

        logAdminAlert(`👀 زائر جديد تصفح المتجر الآن`);
        localStorage.setItem('belami_alerts', localStorage.getItem('belami_alerts')); // trigger storage sync
    }

    // Sticky Header Scroll Effect
    window.addEventListener("scroll", () => {
        const header = document.getElementById("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
});

// Render Products Grid
function renderProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // Filter products based on activeCategory
    const filtered = activeCategory === 'all' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.95rem;">لا توجد منتجات في هذا القسم حالياً.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        let badgeHtml = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
        
        let buttonHtml = '';
        if (p.isOutOfStock) {
            buttonHtml = `
                <button class="btn btn-secondary" style="border-color: #ddd; color: #999; cursor: not-allowed; padding: 6px 14px; font-size: 0.9rem;" disabled>
                    نفدت الكمية
                </button>
            `;
        } else {
            buttonHtml = `
                <button class="btn-icon" onclick="addToCart(${p.id})" aria-label="إضافة إلى السلة">
                    <i class="fa-solid fa-cart-plus"></i>
                </button>
            `;
        }

        card.innerHTML = `
            ${badgeHtml}
            <a href="#product-${p.id}" class="product-img-wrapper" style="display: block; cursor: pointer; text-decoration: none;">
                <img id="prod-card-img-${p.id}" alt="${p.name}" class="product-img" loading="lazy">
            </a>
            <div class="product-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; width: 100%;">
                    <span class="product-cat" style="margin-bottom: 0;">${getCategoryName(p.category)}</span>
                    ${p.purchaseCount ? `<span style="font-size: 0.72rem; color: var(--text-gold); font-weight: bold; display: flex; align-items: center; gap: 3px;"><i class="fa-solid fa-fire"></i> بيع ${p.purchaseCount} مرة</span>` : ''}
                </div>
                <h3 class="product-name" style="transition: color 0.2s;">
                    <a href="#product-${p.id}" style="color: inherit; text-decoration: none;">${p.name}</a>
                </h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-footer">
                    <span class="product-price">${p.price} <span>ر.س</span></span>
                    ${buttonHtml}
                </div>
            </div>
        `;
        grid.appendChild(card);
        resolveImage(p.image, document.getElementById(`prod-card-img-${p.id}`));
    });



    // Update active state in main header nav
    // Update active state in main header nav
    const navItems = document.querySelectorAll(".nav-menu .nav-item");
    navItems.forEach(item => {
        item.classList.remove("active");
    });
    
    if (activeCategory === 'all') {
        const homeLink = document.getElementById("nav-home-link");
        if (homeLink) homeLink.classList.add("active");
    } else {
        const catName = getCategoryName(activeCategory);
        navItems.forEach(item => {
            const link = item.querySelector("a");
            if (link && link.textContent.trim() === catName.trim()) {
                item.classList.add("active");
            }
        });
    }
}

function getCategoryName(cat) {
    const catNames = {
        'boxes': 'بوكسات',
        'trays': 'صواني',
        'gifts': 'هدايا',
        'hospitality': 'بكجات ضيافة',
        'corporate': 'هدايا الشركات'
    };
    return catNames[cat] || cat;
}

// Filter & Open Standalone Category Shop View
function openCategoryView(category) {
    activeCategory = category;
    
    const titleElement = document.getElementById("store-view-title");
    const descElement = document.getElementById("store-view-desc");
    
    if (titleElement && descElement) {
        if (category === 'boxes') {
            titleElement.textContent = "بوكساتنا";
            descElement.textContent = "تشكيلة من بوكسات الشوكولاتة البلجيكية الفاخرة المنسقة بعناية";
        } else if (category === 'trays') {
            titleElement.textContent = "صوانينا";
            descElement.textContent = "صواني التقديم والضيافة الراقية والمزينة لتناسب تجمعاتكم السعيدة";
        } else if (category === 'gifts') {
            titleElement.textContent = "هدايانا";
            descElement.textContent = "تنسيقات الهدايا المميزة والفاخرة للمناسبات الخاصة والإهداء";
        } else if (category === 'hospitality') {
            titleElement.textContent = "ضيافتنا";
            descElement.textContent = "بكجات ضيافة متكاملة بألذ النكهات المبتكرة لتناسب كافة الحفلات";
        } else if (category === 'corporate') {
            titleElement.textContent = "هدايا الشركات";
            descElement.textContent = "حلول وتنسيقات مخصصة لهدايا قطاع الأعمال والشركات والمناسبات الرسمية";
        } else {
            titleElement.textContent = "منتجاتنا";
            descElement.textContent = "تصفح تشكيلة بيلامي الكاملة والفاخرة من الشوكولاتة والحلويات";
        }
    }
    
    renderProducts();
    navigateTo('store');
}

// Filter Products
function filterProducts(category) {
    activeCategory = category;
    renderProducts();
}

// Navigation between views (SPA router)
function navigateTo(view) {
    const homeView = document.getElementById("home-view");
    const storeView = document.getElementById("store-view");
    const checkoutView = document.getElementById("checkout-view");
    const successView = document.getElementById("success-view");
    const adminView = document.getElementById("admin-view");

    // Remove active classes
    homeView.classList.remove("active");
    if (storeView) storeView.classList.remove("active");
    checkoutView.classList.remove("active");
    successView.classList.remove("active");
    if (adminView) {
        adminView.classList.remove("active");
        adminView.style.display = "none";
    }

    if (view === 'home') {
        homeView.classList.add("active");
        // Reset category in main menu to active-home
        const navItems = document.querySelectorAll(".nav-menu .nav-item");
        navItems.forEach(item => item.classList.remove("active"));
        const homeLink = document.getElementById("nav-home-link");
        if (homeLink) homeLink.classList.add("active");
    } else if (view === 'store') {
        if (storeView) storeView.classList.add("active");
    } else if (view === 'checkout') {
        checkoutView.classList.add("active");
        renderCheckoutSummary();
    } else if (view === 'success') {
        successView.classList.add("active");
    } else if (view === 'admin') {
        // Redirect completely to the new standalone admin dashboard
        window.location.href = 'admin.html';
        return;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu if open
    const navMenu = document.getElementById("nav-menu");
    if (navMenu && navMenu.classList.contains("open")) {
        toggleMobileMenu();
    }
}

// Scroll to any section smoothly
function scrollToSection(id) {
    setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// Scroll to Store Section
function scrollToStore() {
    scrollToSection("store");
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const navMenu = document.getElementById("nav-menu");
    const menuIcon = document.getElementById("menu-icon");
    navMenu.classList.toggle("open");
    
    if (navMenu.classList.contains("open")) {
        menuIcon.className = "fa-solid fa-xmark";
    } else {
        menuIcon.className = "fa-solid fa-bars";
    }
}

// Cart Drawer Handling
function toggleCart(open) {
    const overlay = document.getElementById("cart-overlay");
    const drawer = document.getElementById("cart-drawer");
    
    if (open) {
        overlay.classList.add("open");
        drawer.classList.add("open");
        renderCart();
    } else {
        overlay.classList.remove("open");
        drawer.classList.remove("open");
    }
}

// Add Item to Cart
function addToCart(productId, quantity = 1, deliveryDate = '', customNote = '', productOption = '', giftSender = '', giftRecipient = '', giftPhone = '', giftLocation = '', printMessage = '') {
    const product = products.find(p => p.id === productId);
    if (!product || product.isOutOfStock) return;

    const existing = cart.find(item => 
        item.product.id === productId && 
        item.deliveryDate === deliveryDate && 
        item.customNote === customNote &&
        item.productOption === productOption &&
        item.giftSender === giftSender &&
        item.giftRecipient === giftRecipient &&
        item.giftPhone === giftPhone &&
        item.giftLocation === giftLocation &&
        item.printMessage === printMessage
    );

    if (existing) {
        existing.quantity += quantity;
    } else {
        const itemPrice = product.price + (printMessage !== '' ? 5 : 0);
        cart.push({ 
            cartItemId: Date.now() + '-' + Math.floor(Math.random() * 1000),
            product, 
            quantity,
            deliveryDate,
            customNote,
            productOption,
            giftSender,
            giftRecipient,
            giftPhone,
            giftLocation,
            printMessage,
            itemPrice
        });
    }

    updateCartCount();
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
    
    // Admin log and trigger
    logAdminAlert(`🛒 أضاف عميل منتج [${product.name}] للسلة (الكمية: ${quantity})`);
    localStorage.setItem('belami_cart_add_trigger', Date.now().toString());
    
    // Auto-open cart drawer
    toggleCart(true);
    
    // Dynamic mini anim on bag button
    const bagBtn = document.querySelector(".cart-icon-btn");
    if (bagBtn) {
        bagBtn.style.transform = "scale(1.2)";
        setTimeout(() => bagBtn.style.transform = "scale(1)", 200);
    }
}

// Update Qty in Cart
function updateQuantity(cartItemId, change) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(cartItemId);
    } else {
        renderCart();
        updateCartCount();
    }
}

// Remove from Cart
function removeFromCart(cartItemId) {
    const index = cart.findIndex(item => item.cartItemId === cartItemId);
    if (index === -1) return;
    
    const name = cart[index].product.name;
    cart.splice(index, 1);
    
    renderCart();
    updateCartCount();
    showToast(`تمت إزالة "${name}" من السلة`);
}

// Update Badge Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cart-badge-count").textContent = count;
}

// Calculate totals
function getSubtotal() {
    return cart.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
}

// Render Cart Drawer Contents
function renderCart() {
    const container = document.getElementById("cart-items-container");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>سلتك فارغة حالياً</p>
                <button class="btn btn-secondary" onclick="toggleCart(false); scrollToStore();">اذهب للمتجر</button>
            </div>
        `;
        document.getElementById("cart-checkout-button").disabled = true;
        document.getElementById("cart-total-value").textContent = "0.00 ر.س";
        return;
    }

    document.getElementById("cart-checkout-button").disabled = false;

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        
        let metaHtml = "";
        if (item.productOption) {
            metaHtml += `<div class="cart-item-meta" style="font-size: 0.78rem; color: var(--primary); margin-top: 3px; display: flex; align-items: center; gap: 4px; font-weight: bold;"><i class="fa-solid fa-sliders" style="font-size: 0.85rem;"></i> النكهة: ${item.productOption}</div>`;
        }
        if (item.printMessage) {
            metaHtml += `<div class="cart-item-meta" style="font-size: 0.78rem; color: var(--text-gold); margin-top: 3px; display: flex; align-items: center; gap: 4px; font-weight: bold;"><i class="fa-solid fa-print" style="font-size: 0.85rem;"></i> عبارة الطباعة: ${item.printMessage}</div>`;
        }
        if (item.deliveryDate) {
            metaHtml += `<div class="cart-item-meta" style="font-size: 0.78rem; color: var(--text-gold); margin-top: 3px; display: flex; align-items: center; gap: 4px;"><i class="fa-regular fa-calendar" style="font-size: 0.85rem;"></i> توصيل: ${item.deliveryDate}</div>`;
        }
        if (item.customNote) {
            metaHtml += `<div class="cart-item-meta" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.customNote}"><i class="fa-regular fa-comment" style="font-size: 0.85rem;"></i> ملاحظة: ${item.customNote}</div>`;
        }
        if (item.giftSender || item.giftRecipient) {
            metaHtml += `<div class="cart-item-meta" style="font-size: 0.75rem; color: #25D366; margin-top: 2px; display: flex; align-items: center; gap: 4px; font-weight: bold;"><i class="fa-solid fa-gift" style="font-size: 0.8rem;"></i> هدية: من ${item.giftSender || 'فاعل خير'} إلى ${item.giftRecipient || 'مستلم'}</div>`;
        }

        div.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.product.name}</h4>
                <span class="cart-item-price">${item.itemPrice} ر.س</span>
                ${metaHtml}
                <div class="cart-item-qty" style="margin-top: 6px;">
                    <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')" aria-label="حذف">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        `;
        container.appendChild(div);
    });

    const subtotal = getSubtotal();
    document.getElementById("cart-total-value").textContent = `${subtotal.toFixed(2)} ر.س`;
}

// Go to Checkout Screen
function goToCheckout() {
    if (cart.length === 0) {
        showToast("السلة فارغة، يرجى إضافة منتجات أولاً!");
        return;
    }
    toggleCart(false);
    navigateTo('checkout');
}

// Render Checkout Summary Sidebar
function renderCheckoutSummary() {
    const container = document.getElementById("checkout-summary-items");
    container.innerHTML = "";

    cart.forEach(item => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.marginBottom = "15px";
        div.style.paddingBottom = "15px";
        div.style.borderBottom = "1px dashed rgba(184, 144, 71, 0.1)";
        
        let metaHtml = "";
        if (item.productOption) {
            metaHtml += `<div style="font-size: 0.72rem; color: var(--primary); margin-top: 2px; font-weight: bold;"><i class="fa-solid fa-sliders"></i> النكهة: ${item.productOption}</div>`;
        }
        if (item.printMessage) {
            metaHtml += `<div style="font-size: 0.72rem; color: var(--text-gold); margin-top: 2px; font-weight: bold;"><i class="fa-solid fa-print"></i> عبارة: ${item.printMessage}</div>`;
        }
        if (item.deliveryDate) {
            metaHtml += `<div style="font-size: 0.72rem; color: var(--text-gold); margin-top: 2px;"><i class="fa-regular fa-calendar"></i> توصيل: ${item.deliveryDate}</div>`;
        }
        if (item.customNote) {
            metaHtml += `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.customNote}"><i class="fa-regular fa-comment"></i> ${item.customNote}</div>`;
        }
        if (item.giftSender || item.giftRecipient) {
            metaHtml += `<div style="font-size: 0.7rem; color: #25D366; margin-top: 1px; font-weight: bold;"><i class="fa-solid fa-gift"></i> هدية: من ${item.giftSender || 'فاعل خير'} إلى ${item.giftRecipient || 'مستلم'}</div>`;
        }

        div.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: center;">
                <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
                <div>
                    <h5 style="color: var(--text-dark); font-size: 0.9rem; margin-bottom: 2px;">${item.product.name}</h5>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">الكمية: ${item.quantity}</span>
                    ${metaHtml}
                </div>
            </div>
            <span style="color: var(--text-gold); font-weight: 700; font-size: 0.95rem;">${(item.itemPrice * item.quantity).toFixed(2)} ر.س</span>
        `;
        container.appendChild(div);
    });

    const subtotal = getSubtotal();
    const shipping = currentShippingCost;
    const discount = subtotal * (activeDiscountPercent / 100);
    const total = getTotalPrice();

    document.getElementById("checkout-subtotal").textContent = `${subtotal.toFixed(2)} ر.س`;
    document.getElementById("checkout-shipping").textContent = shipping === 0 ? "مجاناً" : `${shipping.toFixed(2)} ر.س`;
    
    const discountRow = document.getElementById("coupon-discount-row");
    const discountVal = document.getElementById("checkout-discount");
    if (discountRow && discountVal) {
        if (activeDiscountPercent > 0) {
            discountRow.style.display = "table-row";
            discountVal.textContent = `-${discount.toFixed(2)} ر.س`;
        } else {
            discountRow.style.display = "none";
        }
    }

    document.getElementById("checkout-total").textContent = `${total.toFixed(2)} ر.س`;
}

// Toast Notifications
function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: var(--text-gold); font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Remove toast after animation completes
    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Payment Selection Toggle
// Payment Selection Toggle
function selectPaymentMethod(method) {
    const payCard = document.getElementById("pay-card");
    const payApplePay = document.getElementById("pay-applepay");
    const cardBox = document.getElementById("card-fields-box");
    const appleBox = document.getElementById("applepay-fields-box");
    const submitBtn = document.getElementById("pay-submit-btn");

    const cards = document.querySelectorAll(".payment-method-card");
    if (cards) {
        cards.forEach(card => {
            card.classList.remove("active");
            card.style.border = "1px solid rgba(184, 144, 71, 0.1)";
            card.style.background = "#fff";
        });
    }

    if (method === 'card') {
        if (payCard) payCard.checked = true;
        if (cards && cards[0]) {
            cards[0].classList.add("active");
            cards[0].style.border = "1px solid var(--primary)";
            cards[0].style.background = "rgba(184, 144, 71, 0.05)";
        }
        if (cardBox) cardBox.style.display = "block";
        if (appleBox) appleBox.style.display = "none";
        if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> إتمام الدفع بالبطاقة والتأكيد الآن`;
    } else if (method === 'applepay') {
        if (payApplePay) payApplePay.checked = true;
        if (cards && cards[1]) {
            cards[1].classList.add("active");
            cards[1].style.border = "1px solid var(--primary)";
            cards[1].style.background = "rgba(184, 144, 71, 0.05)";
        }
        if (cardBox) cardBox.style.display = "none";
        if (appleBox) appleBox.style.display = "block";
        if (submitBtn) submitBtn.innerHTML = `<i class="fa-brands fa-apple"></i> الدفع المباشر عبر Apple Pay `;
    }
}

// Card Form Interaction (Flip & Live Preview)
function flipCard() {
    const preview = document.getElementById("card-preview");
    preview.classList.toggle("flipped");
}

// Open Moyasar Payment modal and initialize form
async function handleCheckoutSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const city = document.getElementById("cust-city").value;
    const address = document.getElementById("cust-address").value;
    const paymentMethod = document.querySelector('input[name="payment_type"]:checked').value;

    const subtotal = getSubtotal();
    const shipping = currentShippingCost;
    const total = getTotalPrice();

    const orderId = `BEL-${Math.floor(10000 + Math.random() * 90000)}`;

    const hasMoyasarLiveKey = storeSettings.moyasarKey && storeSettings.moyasarKey.startsWith("pk_live_");
    const hasTapLiveKey = storeSettings.tapKey && storeSettings.tapKey.startsWith("pk_live_");

    if (paymentMethod === 'bank' || paymentMethod === 'tamara' || storeSettings.activeGateway === 'direct') {
        const orderItems = cart.map(item => ({
            name: item.product.name,
            quantity: item.quantity
        }));
        
        let methodTitle = "تحويل بنكي مباشر (بانتظار الإيصال)";
        if (paymentMethod === 'tamara') methodTitle = "تقسيط تمارا (بانتظار الرابط)";

        // Save order to belami_orders array
        const orders = JSON.parse(localStorage.getItem('belami_orders') || '[]');
        const newOrder = {
            orderId,
            name,
            phone,
            city,
            address,
            paymentMethod: methodTitle,
            total,
            items: orderItems,
            date: new Date().toLocaleDateString('ar-SA')
        };
        orders.unshift(newOrder);
        localStorage.setItem('belami_orders', JSON.stringify(orders));
        
        // Save customer CRM record
        const customers = JSON.parse(localStorage.getItem('belami_customers') || '{}');
        if (!customers[phone]) {
            customers[phone] = { name, phone, city, address, spent: 0 };
        }
        customers[phone].spent += total;
        localStorage.setItem('belami_customers', JSON.stringify(customers));
        
        // Log notification/alert
        logAdminAlert(`🛒 طلب جديد رقم #${orderId} عبر ${methodTitle} بقيمة ${total.toFixed(2)} ر.س`);
        localStorage.setItem('belami_new_order_trigger', Date.now().toString());

        // Play loud sound chime and send email to belamichoco@gmail.com
        playNewOrderSound();
        sendOrderEmailNotification(newOrder);

        // Clear local cart
        cart = [];
        updateCartCount();

        // Fill receipt details
        document.getElementById("receipt-order-id").textContent = `#${orderId}`;
        document.getElementById("receipt-name").textContent = name;
        document.getElementById("receipt-phone").textContent = phone;
        document.getElementById("receipt-address").textContent = `${city}، ${address}`;
        document.getElementById("receipt-payment").textContent = methodTitle;
        document.getElementById("receipt-total").textContent = `${total.toFixed(2)} ر.س`;

        // Build WhatsApp message
        const couponText = appliedCouponCode ? `\n*كود الخصم المطبق:* ${appliedCouponCode} (خصم 5%)` : "";
        const msg = `مرحباً بيلامي للشوكولاتة، أود تأكيد طلبي عبر ${methodTitle}:\n\n*رقم الطلب:* #${orderId}\n*الاسم:* ${name}\n*رقم الجوال:* ${phone}\n*العنوان:* ${city}، ${address}${couponText}\n*المجموع الإجمالي:* ${total.toFixed(2)} ر.س\n\nيرجى تأكيد إرسال التفاصيل لتجهيز الشحنة.`;
        const waLink = `https://api.whatsapp.com/send?phone=966535671116&text=${encodeURIComponent(msg)}`;
        const waBtn = document.getElementById("whatsapp-confirm-btn");
        if (waBtn) {
            waBtn.href = waLink;
            waBtn.style.display = "inline-flex";
            waBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> تأكيد الطلب وإرسال التفاصيل عبر الواتساب`;
        }

        navigateTo('success');
        showToast(`تم تسجيل طلبك رقم #${orderId} بنجاح!`);
        return;
    }

    // Build callback URL with checkout details as query parameters
    const itemsParam = cart.map(item => `${item.product.id}:${item.quantity}`).join(',');
    const callbackUrl = window.location.origin + window.location.pathname + 
        `?pay_success=true&orderId=${orderId}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&city=${encodeURIComponent(city)}&address=${encodeURIComponent(address)}&total=${total}&shipping=${shipping}&items=${itemsParam}&coupon=${appliedCouponCode}`;

    // ROUTE PAYMENT GATEWAYS VIA DIRECT PAYLINK LINK (https://pylnk.me/l/QVC2xH)
    if (storeSettings.activeGateway === 'paylink') {
        const paylinkDirectUrl = (storeSettings.paylinkLink && storeSettings.paylinkLink.trim() !== "") 
            ? storeSettings.paylinkLink.trim() 
            : `https://pylnk.me/l/QVC2xH`;

        // Save order details locally
        const orderItems = cart.map(item => ({ name: item.product.name, quantity: item.quantity }));
        const newOrder = {
            orderId,
            name,
            phone,
            city,
            address,
            paymentMethod: `بطاقة مدى / Apple Pay (Paylink - APP_ID_1784424601276)`,
            total,
            items: orderItems,
            date: new Date().toLocaleDateString('ar-SA')
        };
        
        // Dispatch instant email alert to belamichoco@gmail.com & play sound chime
        logAdminAlert(`💳 طلب دفع إلكتروني عبر Paylink رقم #${orderId} بقيمة ${total.toFixed(2)} ر.س`);
        sendOrderEmailNotification(newOrder);
        playNewOrderSound();

        showToast("جاري توجيهك فوراً لصفحة السداد المباشرة في Paylink...");
        setTimeout(() => {
            window.location.href = paylinkDirectUrl;
        }, 500);
        return;
    }

    if (storeSettings.activeGateway === 'tap') {
        let tapPubKey = storeSettings.tapKey || "";
        if (storeSettings.testMode || !tapPubKey) {
            tapPubKey = "pk_test_V32tNaCg6sbZPH9q5J0SdA0E"; // Tap sandbox public key
        }

        // Initialize Tap goSell JS lightbox configurations
        goSell.config({
            gateway: {
                publicKey: tapPubKey,
                language: "ar",
                supportedCurrencies: "all",
            },
            customer: {
                first_name: name,
                email: `customer_${phone}@belami.sa`,
                phone: {
                    country_code: "966",
                    number: phone.replace("+966", "").replace("966", "").trim()
                }
            },
            transaction: {
                mode: "charge",
                charge: {
                    description: `طلب رقم ${orderId} - متجر بيلامي`,
                    amount: total,
                    currency: "SAR",
                    redirect: callbackUrl,
                    post: null
                }
            }
        });

        // Open Tap secure Lightbox payment modal on screen
        setTimeout(() => {
            goSell.openLightBox();
        }, 100);
        return;
    }

    // Open Moyasar Modal
    const modal = document.getElementById("moyasar-modal");
    if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
            modal.style.opacity = "1";
            modal.querySelector(".moyasar-modal-content").style.transform = "scale(1)";
        }, 10);
    }

    // Determine publishable key and test/live state based on settings
    let pubKey = storeSettings.moyasarKey;
    if (storeSettings.testMode) {
        pubKey = "pk_test_h5N7sF1hTefjR4ePehQZc8VfF2G5K8sQ1jP6VfB2"; // Moyasar demo publishable key
    }

    // Initialize Moyasar Payment Form inside container '.mysr-form'
    const formContainer = document.querySelector(".mysr-form");
    if (formContainer) formContainer.innerHTML = "";

    Moyasar.init({
        element: '.mysr-form',
        amount: Math.round(total * 100), // Halalas
        currency: 'SAR',
        description: `طلب رقم ${orderId} - متجر بيلامي`,
        publishable_api_key: pubKey,
        callback_url: callbackUrl,
        methods: paymentMethod === 'card' ? ['creditcard'] : ['applepay'],
        supported_networks: ['mada', 'visa', 'mastercard'],
        apple_pay: {
            country: 'SA',
            label: 'Belami Chocolate',
            validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate'
        }
    });
}

function closeMoyasarModal() {
    const modal = document.getElementById("moyasar-modal");
    if (modal) {
        modal.style.opacity = "0";
        modal.querySelector(".moyasar-modal-content").style.transform = "scale(0.9)";
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }
}

// Global state for product details modal
let currentModalProduct = null;
let currentModalQty = 1;

// Open product details modal
function openProductModal(productId) {
    trackProductView(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentModalProduct = product;
    currentModalQty = 1;

    // Set UI elements
    resolveImage(product.image, document.getElementById("modal-product-img"));
    document.getElementById("modal-product-img").alt = product.name;
    document.getElementById("modal-product-cat").textContent = getCategoryName(product.category);
    document.getElementById("modal-product-name").textContent = product.name;
    document.getElementById("modal-product-desc").textContent = product.description;
    document.getElementById("modal-qty").textContent = currentModalQty;

    // Populating multi-image thumbnail gallery
    const thumbsContainer = document.getElementById("modal-thumbnails-container");
    if (thumbsContainer) {
        thumbsContainer.innerHTML = "";
        const galleryImages = product.images || [product.image];
        if (galleryImages.length > 1) {
            galleryImages.forEach((imgSrc, index) => {
                const thumb = document.createElement("img");
                thumb.alt = `${product.name} - ${index + 1}`;
                thumb.style.width = "45px";
                thumb.style.height = "45px";
                thumb.style.objectFit = "cover";
                thumb.style.borderRadius = "6px";
                thumb.style.cursor = "pointer";
                thumb.style.border = index === 0 ? "2px solid var(--primary)" : "1px solid rgba(184, 144, 71, 0.2)";
                thumb.style.transition = "all 0.2s ease";
                
                thumb.onclick = () => {
                    resolveImage(imgSrc, document.getElementById("modal-product-img"));
                    Array.from(thumbsContainer.children).forEach(child => {
                        child.style.border = "1px solid rgba(184, 144, 71, 0.2)";
                    });
                    thumb.style.border = "2px solid var(--primary)";
                };
                thumbsContainer.appendChild(thumb);
                resolveImage(imgSrc, thumb);
            });
            thumbsContainer.style.display = "flex";
        } else {
            thumbsContainer.style.display = "none";
        }
    }

    // Toggle hospitality notice
    const hospNotice = document.getElementById("modal-hospitality-notice");
    if (hospNotice) {
        hospNotice.style.display = product.category === 'hospitality' ? "block" : "none";
    }

    // Reset customizations inputs
    document.getElementById("modal-custom-note").value = "";
    const printMsgSelect = document.getElementById("modal-print-message");
    if (printMsgSelect) printMsgSelect.value = "";

    // Call update modal price to compute initial price
    updateModalPrice();
    
    // Dynamic Options select population
    const optionsContainer = document.getElementById("modal-options-container");
    const optionsSelect = document.getElementById("modal-product-option");
    if (optionsContainer && optionsSelect) {
        optionsSelect.onchange = () => {
            updateModalPrice();
            if (currentModalProduct && currentModalProduct.id === 21) {
                const selectedOpt = optionsSelect.value;
                let targetImg = "assets/daily_coffee_all.jpg";
                if (selectedOpt.includes("الملونة")) targetImg = "assets/daily_coffee_colored.jpg";
                else if (selectedOpt.includes("الكلاسيك")) targetImg = "assets/daily_coffee_classic.jpg";
                else if (selectedOpt.includes("الكريمينو")) targetImg = "assets/daily_coffee_cremino.jpg";
                resolveImage(targetImg, document.getElementById("modal-product-img"));
            }
        };

        if (product.options && product.options.length > 0) {
            optionsSelect.innerHTML = "";
            product.options.forEach(opt => {
                const oEl = document.createElement("option");
                oEl.value = opt;
                oEl.textContent = opt;
                optionsSelect.appendChild(oEl);
            });
            optionsContainer.style.display = "block";
        } else {
            optionsSelect.innerHTML = "";
            optionsContainer.style.display = "none";
        }
    }
    
    // Set date input minimum value (tomorrow, or 3 days for custom/sugar-free)
    const dateInput = document.getElementById("modal-delivery-date");
    if (dateInput) {
        const isCustomOrder = (product.id === 19 || product.id === 20);
        const minDays = isCustomOrder ? 3 : 1;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + minDays);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDate.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        dateInput.value = "";

        const hintEl = document.getElementById("modal-date-hint");
        if (hintEl) {
            hintEl.innerHTML = isCustomOrder 
                ? "* يتطلب هذا المنتج الخاص 3 أيام عمل للتجهيز والتحضير." 
                : "* التوصيل في نفس اليوم للطلبات قبل 7:00 مساءً. بعد 7:00 مساءً تشحن حسب توفر المندوب أو في اليوم التالي مباشرة.";
        }
    }

    // Gifting options block initialization
    const giftingContainer = document.getElementById("modal-gifting-container");
    const giftingFields = document.getElementById("modal-gifting-fields");
    const giftCheckbox = document.getElementById("modal-is-gift");
    if (giftingContainer) {
        if (product.category === 'gifts') {
            giftingContainer.style.display = "block";
            if (giftCheckbox) giftCheckbox.checked = false;
            if (giftingFields) giftingFields.style.display = "none";
            // Reset Gifting fields inputs
            document.getElementById("modal-gift-sender").value = "";
            document.getElementById("modal-gift-recipient").value = "";
            document.getElementById("modal-gift-phone").value = "";
            document.getElementById("modal-gift-location").value = "";
        } else {
            giftingContainer.style.display = "none";
        }
    }

    // Toggle out-of-stock styles
    const addBtn = document.getElementById("modal-add-btn");
    if (addBtn) {
        if (product.isOutOfStock) {
            addBtn.disabled = true;
            addBtn.innerHTML = `نفدت الكمية`;
            addBtn.style.background = "#ccc";
            addBtn.style.cursor = "not-allowed";
        } else {
            addBtn.disabled = false;
            addBtn.innerHTML = `إضافة إلى السلة <i class="fa-solid fa-bag-shopping"></i>`;
            addBtn.style.background = "";
            addBtn.style.cursor = "";
        }
    }

    // Open overlay & modal
    document.getElementById("product-modal").classList.add("active");
    document.getElementById("product-modal-content").classList.add("active");

    // Update hash for deep-linking
    if (window.location.hash !== `#product-${product.id}`) {
        window.history.pushState(null, null, `#product-${product.id}`);
    }
}

// Close product details modal
function closeProductModal() {
    document.getElementById("product-modal").classList.remove("active");
    document.getElementById("product-modal-content").classList.remove("active");
    currentModalProduct = null;

    // Clear hash silently
    if (window.location.hash.startsWith('#product-')) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
}

// Update modal display price if printed message option is selected
function updateModalPrice() {
    if (!currentModalProduct) return;
    
    let basePrice = currentModalProduct.price;
    const optionsSelect = document.getElementById("modal-product-option");
    if (optionsSelect && optionsSelect.value) {
        const match = optionsSelect.value.match(/(\d+)\s*ر\.س/);
        if (match) {
            basePrice = parseInt(match[1], 10);
        }
    }

    const printMsgSelect = document.getElementById("modal-print-message");
    const extra = (printMsgSelect && printMsgSelect.value !== "") ? 5 : 0;
    const totalPrice = basePrice + extra;
    document.getElementById("modal-product-price").innerHTML = `${totalPrice} <span>ر.س</span>`;
}

// Adjust quantity counter inside modal
function adjustModalQty(change) {
    if (!currentModalProduct) return;
    
    currentModalQty += change;
    if (currentModalQty < 1) currentModalQty = 1;
    
    document.getElementById("modal-qty").textContent = currentModalQty;
}

// Toggle gift options input fields inside modal
function toggleGiftingFields(checkbox) {
    const fields = document.getElementById("modal-gifting-fields");
    if (fields) {
        fields.style.display = checkbox.checked ? "flex" : "none";
    }
}

// Add product to cart with custom options
function addModalProductToCart() {
    if (!currentModalProduct || currentModalProduct.isOutOfStock) return;

    const deliveryDate = document.getElementById("modal-delivery-date").value;
    const customNote = document.getElementById("modal-custom-note").value.trim();

    let productOption = "";
    const optionsSelect = document.getElementById("modal-product-option");
    if (optionsSelect && currentModalProduct.options && currentModalProduct.options.length > 0) {
        productOption = optionsSelect.value;
    }

    // Capture Gifting options if selected
    let giftSender = "";
    let giftRecipient = "";
    let giftPhone = "";
    let giftLocation = "";
    const giftCheckbox = document.getElementById("modal-is-gift");
    if (giftCheckbox && giftCheckbox.checked && currentModalProduct.category === 'gifts') {
        giftSender = document.getElementById("modal-gift-sender").value.trim();
        giftRecipient = document.getElementById("modal-gift-recipient").value.trim();
        giftPhone = document.getElementById("modal-gift-phone").value.trim();
        giftLocation = document.getElementById("modal-gift-location").value.trim();
    }

    // Capture print message
    let printMessage = "";
    const printMessageSelect = document.getElementById("modal-print-message");
    if (printMessageSelect) {
        printMessage = printMessageSelect.value;
    }

    // Call standard add to cart with parameters
    addToCart(currentModalProduct.id, currentModalQty, deliveryDate, customNote, productOption, giftSender, giftRecipient, giftPhone, giftLocation, printMessage);
    
    // Close modal
    closeProductModal();
}

// Update checkout totals dynamically based on shipping selection
function updateShippingMethod(cost) {
    currentShippingCost = cost;
    
    const deliveryRadio = document.getElementById("ship-delivery");
    const pickupRadio = document.getElementById("ship-pickup");
    
    // Reset GPS status display
    const gpsStatus = document.getElementById("gps-status");
    const gpsIcon = document.getElementById("gps-icon");
    const gpsText = document.getElementById("gps-text");
    if (gpsStatus) gpsStatus.style.display = "none";
    if (gpsIcon) gpsIcon.className = "fa-solid fa-location-crosshairs";
    if (gpsText) gpsText.textContent = "تحديد موقعي";

    if (deliveryRadio && pickupRadio) {
        const deliveryParent = deliveryRadio.closest('.delivery-method-label');
        const pickupParent = pickupRadio.closest('.delivery-method-label');
        
        if (deliveryParent && pickupParent) {
            if (cost === 35) {
                // Style Delivery Active
                deliveryParent.style.border = "2px solid var(--primary)";
                deliveryParent.style.background = "rgba(184, 144, 71, 0.05)";
                pickupParent.style.border = "1px solid rgba(184, 144, 71, 0.2)";
                pickupParent.style.background = "#fff";
                
                // Show address form group and reset required validation
                const addrGroup = document.getElementById("address-form-group");
                if (addrGroup) addrGroup.style.display = "block";
                const addrInput = document.getElementById("cust-address");
                if (addrInput) {
                    addrInput.required = true;
                    if (addrInput.value === "استلام من فرع الرياض - حي الشفا") {
                        addrInput.value = "";
                    }
                }
            } else {
                // Style Pickup Active
                pickupParent.style.border = "2px solid var(--primary)";
                pickupParent.style.background = "rgba(184, 144, 71, 0.05)";
                deliveryParent.style.border = "1px solid rgba(184, 144, 71, 0.2)";
                deliveryParent.style.background = "#fff";
                
                // Hide address form group and fill with branch address
                const addrGroup = document.getElementById("address-form-group");
                if (addrGroup) addrGroup.style.display = "none";
                const addrInput = document.getElementById("cust-address");
                if (addrInput) {
                    addrInput.required = false;
                    addrInput.value = "استلام من فرع الرياض - حي الشفا";
                }
            }
        }
    }
    
    // Rerender summary to update total calculations
    renderCheckoutSummary();
}

// Get HTML5 Geolocation coordinates and form Google Maps link
function getCurrentLocation() {
    const gpsIcon = document.getElementById("gps-icon");
    const gpsText = document.getElementById("gps-text");
    const gpsStatus = document.getElementById("gps-status");
    const addressInput = document.getElementById("cust-address");

    if (!navigator.geolocation) {
        showToast("المتصفح الخاص بك لا يدعم تحديد الموقع الجغرافي.");
        return;
    }

    gpsIcon.className = "fa-solid fa-spinner fa-spin";
    gpsText.textContent = "جاري التحديد...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
            
            // Auto fill address input
            addressInput.value = `📍 موقعي على الخريطة: ${mapUrl}`;
            
            // Update GPS button status
            gpsIcon.className = "fa-solid fa-location-dot";
            gpsText.textContent = "تم التحديد";
            if (gpsStatus) gpsStatus.style.display = "flex";
            
            showToast("تم تحديد موقعك الجغرافي بنجاح!");
        },
        (error) => {
            console.error("GPS Error:", error);
            gpsIcon.className = "fa-solid fa-location-crosshairs";
            gpsText.textContent = "تحديد موقعي";
            if (gpsStatus) gpsStatus.style.display = "none";
            
            let errMsg = "فشل التقاط موقعك. يرجى تفعيل الـ GPS في جهازك والسماح للمتصفح بالوصول إليه.";
            if (error.code === error.PERMISSION_DENIED) {
                errMsg = "يرجى السماح بصلاحية الوصول لموقعك الجغرافي لتحديد الإحداثيات.";
            }
            showToast(errMsg);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Trigger simulated Apple Pay verification sheet
function triggerApplePaySimulation() {
    // Form Validation first
    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const cityInput = document.getElementById("cust-city");
    const addressInput = document.getElementById("cust-address");

    if (!nameInput.value.trim()) {
        showToast("يرجى إدخال الاسم الكامل أولاً.");
        nameInput.focus();
        return;
    }
    if (!phoneInput.value.trim() || !phoneInput.checkValidity()) {
        showToast("يرجى إدخال رقم جوال صحيح (05xxxxxxxx).");
        phoneInput.focus();
        return;
    }
    if (!cityInput.value.trim()) {
        showToast("يرجى تحديد المدينة أولاً.");
        cityInput.focus();
        return;
    }
    if (currentShippingCost === 35 && !addressInput.value.trim()) {
        showToast("يرجى كتابة عنوان التوصيل بالتفصيل.");
        addressInput.focus();
        return;
    }

    // Populate Sheet details
    const shippingMethodName = currentShippingCost === 35 ? "Riyadh Delivery (35.00 SAR)" : "Pickup from Al-Shifa (Free)";
    document.getElementById("ap-shipping-address").textContent = `${cityInput.value.trim()} - ${shippingMethodName}`;
    document.getElementById("ap-contact").textContent = phoneInput.value.trim();
    
    const subtotal = getSubtotal();
    const total = getTotalPrice();
    document.getElementById("ap-total-price").textContent = `${total.toFixed(2)} SAR`;

    // Reset Sheet biometric UI state
    const sensorIcon = document.getElementById("ap-sensor-icon");
    const statusText = document.getElementById("ap-status-text");
    if (sensorIcon) {
        sensorIcon.className = "fa-solid fa-face-id";
        sensorIcon.style.color = "#007aff";
    }
    if (statusText) {
        statusText.textContent = "Click sensor to pay with Face ID";
    }

    // Open Overlay
    const overlay = document.getElementById("apple-pay-sheet-overlay");
    const sheet = document.getElementById("apple-pay-sheet");
    if (overlay && sheet) {
        overlay.style.display = "flex";
        setTimeout(() => {
            overlay.style.opacity = "1";
            sheet.style.transform = "translateY(0)";
        }, 10);
    }
}

// Close simulated Apple Pay verification sheet
function closeApplePaySimulation() {
    const overlay = document.getElementById("apple-pay-sheet-overlay");
    const sheet = document.getElementById("apple-pay-sheet");
    if (overlay && sheet) {
        sheet.style.transform = "translateY(100%)";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
        }, 300);
    }
}

let isApVerifying = false;

// Start biometric Face ID verification simulation
function startApplePayBiometric() {
    if (isApVerifying) return;
    isApVerifying = true;

    const sensorIcon = document.getElementById("ap-sensor-icon");
    const statusText = document.getElementById("ap-status-text");

    if (sensorIcon && statusText) {
        // Step 1: Scanning Loader
        sensorIcon.className = "fa-solid fa-circle-notch fa-spin";
        sensorIcon.style.color = "#007aff";
        statusText.textContent = "Verifying...";

        // Step 2: Verification Done
        setTimeout(() => {
            sensorIcon.className = "fa-solid fa-circle-check";
            sensorIcon.style.color = "#25d366";
            statusText.textContent = "Completed";
            
            showToast("تم الدفع عبر Apple Pay بنجاح!");

            // Step 3: Complete checkout submit
            setTimeout(() => {
                isApVerifying = false;
                closeApplePaySimulation();
                
                // Form submission logic
                processApplePayCheckout();
            }, 1000);
        }, 1500);
    }
}

// Process Simulated Apple Pay Order Completion
function processApplePayCheckout() {
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const city = document.getElementById("cust-city").value;
    const address = document.getElementById("cust-address").value;
    
    const subtotal = getSubtotal();
    const shipping = currentShippingCost;
    const total = getTotalPrice();
    
    const orderId = `BEL-${Math.floor(10000 + Math.random() * 90000)}`;
    
    document.getElementById("receipt-order-id").textContent = `#${orderId}`;
    document.getElementById("receipt-name").textContent = name;
    document.getElementById("receipt-phone").textContent = phone;
    document.getElementById("receipt-address").textContent = `${city}، ${address}`;
    document.getElementById("receipt-payment").textContent = 'Apple Pay (محاكاة آمنة)';
    document.getElementById("receipt-total").textContent = `${total.toFixed(2)} ر.س`;

    let orderItemsText = '';
    cart.forEach(item => {
        orderItemsText += `\n- ${item.product.name}`;
        if (item.productOption) {
            orderItemsText += ` [نكهة: ${item.productOption}]`;
        }
        if (item.printMessage) {
            orderItemsText += ` [العبارة: ${item.printMessage}]`;
        }
        orderItemsText += ` (الكمية: ${item.quantity}) - ${item.itemPrice} ر.س`;
        if (item.deliveryDate) {
            orderItemsText += ` (تاريخ التوصيل: ${item.deliveryDate})`;
        }
        if (item.customNote) {
            orderItemsText += ` (ملاحظة: ${item.customNote})`;
        }
        if (item.giftSender || item.giftRecipient) {
            orderItemsText += ` (تفاصيل الهدية: من [${item.giftSender || 'فاعل خير'}] إلى [${item.giftRecipient || 'مستلم'}], جوال المهدى إليه: ${item.giftPhone || 'غير محدد'}, موقع التوصيل: ${item.giftLocation || 'غير محدد'})`;
        }
    });

    const shippingMethodName = currentShippingCost === 35 ? "توصيل لجميع أحياء الرياض (35 ر.س)" : "استلام من الرياض - حي الشفا (مجاناً)";
    const couponText = appliedCouponCode ? `\n*كود الخصم المطبق:* ${appliedCouponCode} (خصم 5%)` : "";
    const msg = `مرحباً بيلامي للشوكولاتة، أود تأكيد طلبي:\n\n*رقم الطلب:* #${orderId}\n*الاسم:* ${name}\n*رقم الجوال:* ${phone}\n*طريقة الاستلام:* ${shippingMethodName}\n*العنوان:* ${city}، ${address}${couponText}\n*طريقة الدفع:* Apple Pay\n\n*المنتجات:*${orderItemsText}\n\n*المجموع الإجمالي:* ${total.toFixed(2)} ر.س`;
    
    const waLink = `https://api.whatsapp.com/send?phone=966535671116&text=${encodeURIComponent(msg)}`;
    const waBtn = document.getElementById("whatsapp-confirm-btn");
    if (waBtn) {
        waBtn.href = waLink;
        waBtn.style.display = "inline-flex";
    }

    // Save Order & Customer details to dashboard CRM
    saveOrderToAdmin(orderId, name, phone, city, address, 'Apple Pay', total, cart);
    
    // Log alert and set cross-tab trigger
    logAdminAlert(`🎉 طلب جديد رقم #${orderId} (Apple Pay) من العميل [${name}] بقيمة ${total.toFixed(2)} ر.س`);
    localStorage.setItem('belami_new_order_trigger', Date.now().toString());

    cart = [];
    updateCartCount();
    navigateTo('success');
}

// Save order and customer to localStorage CRM
function saveOrderToAdmin(orderId, name, phone, city, address, paymentMethod, total, items) {
    // 1. Save order details
    const orders = JSON.parse(localStorage.getItem('belami_orders') || '[]');
    const newOrder = {
        orderId,
        name,
        phone,
        city,
        address,
        paymentMethod,
        total,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        items: items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.itemPrice }))
    };
    orders.push(newOrder);
    localStorage.setItem('belami_orders', JSON.stringify(orders));

    // 2. Add or update customer in CRM (Phone index)
    const customers = JSON.parse(localStorage.getItem('belami_customers') || '{}');
    if (!customers[phone]) {
        customers[phone] = {
            name,
            phone,
            city,
            address,
            spent: 0
        };
    }
    customers[phone].spent += total;
    localStorage.setItem('belami_customers', JSON.stringify(customers));
}

// Log administrative alert to localStorage feed
function logAdminAlert(message) {
    const alerts = JSON.parse(localStorage.getItem('belami_alerts') || '[]');
    const newAlert = {
        id: Date.now() + '-' + Math.floor(Math.random() * 100),
        message,
        time: new Date().toLocaleTimeString()
    };
    alerts.unshift(newAlert);
    if (alerts.length > 50) alerts.pop();
    localStorage.setItem('belami_alerts', JSON.stringify(alerts));
}

// Play notification ringtone chime (Web Audio API - Offline compatible)
function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Pitch 1 (chime part 1)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 pitch
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        
        // Pitch 2 (chime part 2)
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6 pitch
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);
            osc2.start();
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            setTimeout(() => osc2.stop(), 500);
        }, 120);
        
        setTimeout(() => osc.stop(), 300);
    } catch(e) {
        console.error("Web Audio Alert Error:", e);
    }
}

function getCategoryName(catId) {
    const cat = storeSettings.categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
}

// Render Admin Merchant Dashboard figures and feeds
async function renderAdminDashboard() {
    // Reload visits, orders, alerts from db / storage
    const visits = parseInt(await dbFetch('visits', '0'));
    const orders = JSON.parse(localStorage.getItem('belami_orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('belami_customers') || '{}');
    const alerts = JSON.parse(localStorage.getItem('belami_alerts') || '[]');

    // Calculate revenue
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Calculate conversion rate
    const conversion = visits > 0 ? Math.round((orders.length / visits) * 100) : 0;

    // Set stat UI elements
    const visitsEl = document.getElementById("stat-visits");
    const ordersEl = document.getElementById("stat-orders");
    const revenueEl = document.getElementById("stat-revenue");
    const conversionEl = document.getElementById("stat-conversion");

    if (visitsEl) visitsEl.textContent = visits;
    if (ordersEl) ordersEl.textContent = orders.length;
    if (revenueEl) revenueEl.textContent = `${revenue.toFixed(2)} ر.س`;
    if (conversionEl) conversionEl.textContent = `${conversion}%`;

    // Render Alerts Feed
    const alertsFeed = document.getElementById("admin-alerts-feed");
    if (alertsFeed) {
        alertsFeed.innerHTML = "";
        if (alerts.length === 0) {
            alertsFeed.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">لا توجد أي أنشطة مسجلة حالياً.</div>`;
        } else {
            alerts.forEach(alert => {
                const item = document.createElement("div");
                item.style.padding = "8px 12px";
                item.style.background = "#fff";
                item.style.borderRadius = "6px";
                item.style.borderRight = "4px solid var(--primary)";
                item.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.fontSize = "0.85rem";
                
                item.innerHTML = `
                    <span style="color: var(--text-dark);">${alert.message}</span>
                    <span style="color: var(--text-muted); font-size: 0.72rem; font-family: monospace;">${alert.time}</span>
                `;
                alertsFeed.appendChild(item);
            });
        }
    }

    // Render Customer Directory CRM list
    const customersList = document.getElementById("admin-customers-list");
    if (customersList) {
        customersList.innerHTML = "";
        const customerKeys = Object.keys(customers);
        if (customerKeys.length === 0) {
            customersList.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">لا يوجد أي عملاء مسجلين حالياً.</td></tr>`;
        } else {
            customerKeys.forEach(key => {
                const cust = customers[key];
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
                tr.style.fontSize = "0.85rem";
                
                tr.innerHTML = `
                    <td style="padding: 10px 5px; font-weight: bold; color: var(--text-dark);">${cust.name}</td>
                    <td style="padding: 10px 5px; font-family: monospace;">${cust.phone}</td>
                    <td style="padding: 10px 5px; color: var(--text-muted);">${cust.city}، ${cust.address}</td>
                    <td style="padding: 10px 5px; color: var(--text-gold); font-weight: bold;">${cust.spent.toFixed(2)} ر.س</td>
                    <td style="padding: 10px 5px; text-align: center;">
                        <a href="https://wa.me/966${cust.phone.substring(1)}" target="_blank" class="btn" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; border-color: #25d366; color: #fff; display: inline-flex; align-items: center; gap: 4px; border-radius: 4px;">
                            <i class="fa-brands fa-whatsapp"></i> راسل واتساب
                        </a>
                    </td>
                `;
                customersList.appendChild(tr);
            });
        }
    }

    // Render Orders list
    const ordersList = document.getElementById("admin-orders-list");
    if (ordersList) {
        ordersList.innerHTML = "";
        if (orders.length === 0) {
            ordersList.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">لا توجد أي طلبات مسجلة حالياً.</td></tr>`;
        } else {
            orders.forEach(order => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
                tr.style.fontSize = "0.85rem";
                
                const itemsText = order.items && order.items.length > 0 ? order.items.map(i => `${i.name} (x${i.quantity})`).join('، ') : "الطلب مسجل بنجاح";

                tr.innerHTML = `
                    <td style="padding: 10px 5px; font-weight: bold; color: var(--primary); font-family: monospace;">${order.orderId}</td>
                    <td style="padding: 10px 5px;">
                        <div style="font-weight: bold;">${order.name}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${order.phone}</div>
                    </td>
                    <td style="padding: 10px 5px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsText}">${itemsText}</td>
                    <td style="padding: 10px 5px; font-size: 0.75rem; color: var(--text-muted);">
                        <div>${order.paymentMethod}</div>
                        <div style="font-size: 0.7rem; color: var(--text-gold);">${order.address.startsWith("استلام") ? "استلام فرع" : "شحن توصيل"}</div>
                    </td>
                    <td style="padding: 10px 5px; font-weight: bold; color: var(--text-dark);">${order.total.toFixed(2)} ر.س</td>
                    <td style="padding: 10px 5px; text-align: center;">
                        <span style="background: rgba(37,211,102,0.1); color: #25d366; padding: 3px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">مكتمل</span>
                    </td>
                `;
                ordersList.appendChild(tr);
            });
        }
    }

    // Render Products Table (Tab 2)
    renderAdminProductsTable();

    // Render Categories Table (Tab 3)
    renderAdminCategoriesTable();

    // Pre-fill Identity (Tab 3) & Settings (Tab 4) Form Fields
    const storeNameInput = document.getElementById("settings-store-name");
    const storeLogoInput = document.getElementById("settings-store-logo");
    const moyasarKeyInput = document.getElementById("settings-moyasar-key");
    const testModeCheckbox = document.getElementById("settings-test-mode");
    const shippingCostInput = document.getElementById("settings-shipping-cost");
    const pickupEnabledCheckbox = document.getElementById("settings-pickup-enabled");

    if (storeNameInput) storeNameInput.value = storeSettings.name || "";
    if (storeLogoInput) storeLogoInput.value = storeSettings.logo || "";
    const logoPreview = document.getElementById("settings-store-logo-preview");
    if (logoPreview) resolveImage(storeSettings.logo, logoPreview);
    if (moyasarKeyInput) moyasarKeyInput.value = storeSettings.moyasarKey || "";
    if (testModeCheckbox) testModeCheckbox.checked = storeSettings.testMode;
    if (shippingCostInput) shippingCostInput.value = storeSettings.shippingCost || 0;
    if (pickupEnabledCheckbox) pickupEnabledCheckbox.checked = storeSettings.pickupEnabled;

    // Load Gateway specific configuration fields
    const activeGatewaySelect = document.getElementById("settings-active-gateway");
    const tapKeyInput = document.getElementById("settings-tap-key");
    const paylinkKeyInput = document.getElementById("settings-paylink-key");
    if (activeGatewaySelect) activeGatewaySelect.value = storeSettings.activeGateway || "paylink";
    if (tapKeyInput) tapKeyInput.value = storeSettings.tapKey || "";
    if (paylinkKeyInput) paylinkKeyInput.value = storeSettings.paylinkKey || "";
    
    toggleGatewayFields();
}

// Toggle UI inputs dynamically on settings tab depending on active gateway
function toggleGatewayFields() {
    const select = document.getElementById("settings-active-gateway");
    const paylinkWrapper = document.getElementById("paylink-fields-wrapper");
    const moyasarWrapper = document.getElementById("moyasar-fields-wrapper");
    const tapWrapper = document.getElementById("tap-fields-wrapper");
    if (!select) return;

    if (paylinkWrapper) paylinkWrapper.style.display = select.value === 'paylink' ? 'block' : 'none';
    if (moyasarWrapper) moyasarWrapper.style.display = select.value === 'moyasar' ? 'block' : 'none';
    if (tapWrapper) tapWrapper.style.display = select.value === 'tap' ? 'block' : 'none';
}

// Switch between dashboard sections
function switchDashTab(tabName) {
    const sections = document.querySelectorAll(".dash-section");
    sections.forEach(sec => sec.style.display = "none");

    const target = document.getElementById(`dash-sec-${tabName}`);
    if (target) target.style.display = "block";

    const buttons = document.querySelectorAll(".dash-tab-btn");
    buttons.forEach(btn => {
        btn.classList.remove("active");
        btn.style.color = "var(--text-muted)";
        btn.style.borderBottom = "none";
    });

    const activeBtn = document.getElementById(`btn-tab-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.style.color = "var(--primary)";
        activeBtn.style.borderBottom = "3px solid var(--primary)";
    }
}

// Render Products list inside admin tab table
function renderAdminProductsTable() {
    const tableBody = document.getElementById("admin-products-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">لا توجد منتجات مسجلة حالياً.</td></tr>`;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
        tr.style.fontSize = "0.85rem";

        const imgId = `admin-prod-img-${p.id}`;
        tr.innerHTML = `
            <td style="padding: 8px 5px;"><img id="${imgId}" alt="${p.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(0,0,0,0.05);"></td>
            <td style="padding: 8px 5px; font-weight: bold; color: var(--text-dark);">${p.name}</td>
            <td style="padding: 8px 5px; color: var(--text-muted);">${getCategoryName(p.category)}</td>
            <td style="padding: 8px 5px; font-weight: bold; color: var(--text-gold);">${p.price} ر.س</td>
            <td style="padding: 8px 5px;">
                <span style="background: ${p.isOutOfStock ? 'rgba(255,51,51,0.1)' : 'rgba(37,211,102,0.1)'}; color: ${p.isOutOfStock ? '#ff3333' : '#25d366'}; padding: 3px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: bold;">
                    ${p.isOutOfStock ? 'نفذت الكمية' : 'متوفر'}
                </span>
            </td>
            <td style="padding: 8px 5px; text-align: center; display: flex; gap: 8px; justify-content: center; align-items: center; height: 60px;">
                <button class="btn btn-secondary" onclick="openProductFormModal(${p.id})" style="padding: 4px 10px; font-size: 0.75rem; margin: 0;"><i class="fa-regular fa-pen-to-square"></i> تعديل</button>
                <button class="btn" onclick="deleteProduct(${p.id})" style="padding: 4px 10px; font-size: 0.75rem; background: #ff3333; border-color: #ff3333; color: white; margin: 0;"><i class="fa-regular fa-trash-can"></i> حذف</button>
            </td>
        `;
        tableBody.appendChild(tr);
        resolveImage(p.image, document.getElementById(imgId));
    });
}

// Render Categories management table
function renderAdminCategoriesTable() {
    const tableBody = document.getElementById("admin-categories-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (storeSettings.categories.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">لا توجد أقسام مسجلة.</td></tr>`;
        return;
    }

    storeSettings.categories.forEach(cat => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
        tr.style.fontSize = "0.85rem";

        tr.innerHTML = `
            <td style="padding: 8px 5px; font-family: monospace;">${cat.id}</td>
            <td style="padding: 8px 5px; font-weight: bold; color: var(--text-dark);">${cat.name}</td>
            <td style="padding: 8px 5px; text-align: center; display: flex; gap: 8px; justify-content: center; align-items: center; height: 50px;">
                <button class="btn btn-secondary" onclick="editCategory('${cat.id}')" style="padding: 4px 10px; font-size: 0.72rem; margin: 0;"><i class="fa-regular fa-pen-to-square"></i> تعديل</button>
                <button class="btn" onclick="deleteCategory('${cat.id}')" style="padding: 4px 10px; font-size: 0.72rem; background: #ff3333; border-color: #ff3333; color: white; margin: 0;"><i class="fa-regular fa-trash-can"></i> حذف</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Product add/edit form popup controls
function openProductFormModal(productId = null) {
    const catSelect = document.getElementById("prod-category");
    if (catSelect) {
        catSelect.innerHTML = storeSettings.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const modal = document.getElementById("product-form-modal");
    const title = document.getElementById("product-form-title");
    const form = document.getElementById("product-edit-form");

    form.reset();
    document.getElementById("edit-product-id").value = "";
    
    // Clear image files & previews
    document.getElementById("prod-image-file").value = "";
    document.getElementById("prod-images-extra-file").value = "";
    document.getElementById("prod-image-preview").src = "";
    document.getElementById("prod-extra-previews").innerHTML = "";

    if (productId !== null) {
        const p = products.find(prod => prod.id === productId);
        if (p) {
            title.textContent = "تعديل بيانات المنتج";
            document.getElementById("edit-product-id").value = p.id;
            document.getElementById("prod-name").value = p.name || "";
            document.getElementById("prod-price").value = p.price || "";
            document.getElementById("prod-category").value = p.category || "";
            document.getElementById("prod-desc").value = p.description || "";
            document.getElementById("prod-image").value = p.image || "";
            resolveImage(p.image, document.getElementById("prod-image-preview"));
            document.getElementById("prod-purchase-count").value = p.purchaseCount || 0;
            document.getElementById("prod-images-extra").value = p.images ? p.images.slice(1).join(', ') : "";
            document.getElementById("prod-options").value = p.options ? p.options.join(', ') : "";
            document.getElementById("prod-outofstock").checked = p.isOutOfStock || false;

            // Populate extra previews
            const extraContainer = document.getElementById("prod-extra-previews");
            if (extraContainer && p.images && p.images.length > 1) {
                p.images.slice(1).forEach(img => {
                    const previewImg = document.createElement("img");
                    previewImg.style.width = "40px";
                    previewImg.style.height = "40px";
                    previewImg.style.objectFit = "cover";
                    previewImg.style.borderRadius = "4px";
                    previewImg.style.border = "1px solid rgba(0,0,0,0.08)";
                    extraContainer.appendChild(previewImg);
                    resolveImage(img, previewImg);
                });
            }
        }
    } else {
        title.textContent = "إضافة منتج جديد";
        document.getElementById("prod-purchase-count").value = Math.floor(50 + Math.random() * 150); // elegant starter count
    }

    if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
            modal.style.opacity = "1";
            modal.querySelector(".moyasar-modal-content").style.transform = "scale(1)";
        }, 10);
    }
}

function closeProductFormModal() {
    const modal = document.getElementById("product-form-modal");
    if (modal) {
        modal.style.opacity = "0";
        modal.querySelector(".moyasar-modal-content").style.transform = "scale(0.9)";
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }
}

// Product creation/edit submission
async function handleProductFormSubmit(e) {
    e.preventDefault();

    const idVal = document.getElementById("edit-product-id").value;
    const name = document.getElementById("prod-name").value;
    const price = parseFloat(document.getElementById("prod-price").value);
    const category = document.getElementById("prod-category").value;
    const desc = document.getElementById("prod-desc").value;
    const image = document.getElementById("prod-image").value;
    const imagesExtraVal = document.getElementById("prod-images-extra").value;
    const optionsVal = document.getElementById("prod-options").value;
    const purchaseCount = parseInt(document.getElementById("prod-purchase-count").value || "0");
    const isOutOfStock = document.getElementById("prod-outofstock").checked;

    const targetId = idVal !== "" ? parseInt(idVal) : (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1);

    let finalImage = image;
    let finalExtraImages = [];

    // Save main image to individual cloud key if it is Base64
    if (image.startsWith("data:")) {
        const imgKey = "prod_img_" + targetId;
        await dbSave(imgKey, image);
        localStorage.setItem("local_cache_img_" + targetId, image);
        finalImage = "db_img:" + targetId;
    }

    // Save extra images to individual cloud keys if they are Base64
    if (imagesExtraVal.trim() !== "") {
        const extraList = imagesExtraVal.split(',').map(s => s.trim());
        for (let idx = 0; idx < extraList.length; idx++) {
            const extImg = extraList[idx];
            if (extImg.startsWith("data:")) {
                const imgKey = `prod_img_${targetId}_ext_${idx}`;
                await dbSave(imgKey, extImg);
                localStorage.setItem(`local_cache_img_${targetId}_ext_${idx}`, extImg);
                finalExtraImages.push(`db_img:${targetId}_ext_${idx}`);
            } else {
                finalExtraImages.push(extImg);
            }
        }
    }

    const images = [finalImage, ...finalExtraImages];
    const options = optionsVal.trim() !== "" ? optionsVal.split(',').map(s => s.trim()) : null;

    if (idVal !== "") {
        const index = products.findIndex(p => p.id === targetId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                price,
                category,
                description: desc,
                image: finalImage,
                images,
                options,
                purchaseCount,
                isOutOfStock
            };
        }
    } else {
        products.push({
            id: targetId,
            name,
            price,
            category,
            description: desc,
            image: finalImage,
            images,
            options,
            purchaseCount,
            isOutOfStock
        });
    }

    await dbSave('products', products);

    renderProducts();
    renderAdminProductsTable();
    closeProductFormModal();
    showToast("تم حفظ بيانات المنتج بنجاح!");
}

// Delete product
async function deleteProduct(productId) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟")) {
        products = products.filter(p => p.id !== productId);
        await dbSave('products', products);
        renderProducts();
        renderAdminProductsTable();
        showToast("تم حذف المنتج بنجاح!");
    }
}

// Save Brand / Identity Settings
async function saveIdentitySettings() {
    const storeName = document.getElementById("settings-store-name").value;
    let storeLogo = document.getElementById("settings-store-logo").value;

    if (!storeName || !storeLogo) {
        showToast("يرجى ملء جميع الحقول المطلوبة.");
        return;
    }

    if (storeLogo.startsWith("data:")) {
        const imgKey = "store_logo";
        await dbSave(imgKey, storeLogo);
        localStorage.setItem("local_cache_img_logo", storeLogo);
        storeLogo = "db_img:logo";
    }

    storeSettings.name = storeName;
    storeSettings.logo = storeLogo;

    await dbSave('settings', storeSettings);
    applyStoreSettings();
    showToast("تم تحديث وحفظ هوية المتجر بنجاح!");
}

// Add custom Category
async function addCategory() {
    const catId = document.getElementById("new-cat-id").value.trim().toLowerCase();
    const catName = document.getElementById("new-cat-name").value.trim();

    if (!catId || !catName) {
        showToast("يرجى إدخال رمز القسم واسمه بالعربية.");
        return;
    }

    if (storeSettings.categories.some(c => c.id === catId)) {
        showToast("رمز هذا القسم موجود بالفعل!");
        return;
    }

    storeSettings.categories.push({ id: catId, name: catName });
    await dbSave('settings', storeSettings);
    applyStoreSettings();
    renderAdminCategoriesTable();

    document.getElementById("new-cat-id").value = "";
    document.getElementById("new-cat-name").value = "";
    showToast("تمت إضافة التصنيف الجديد بنجاح!");
}

// Delete Category
async function deleteCategory(catId) {
    if (confirm("هل أنت متأكد من حذف هذا التصنيف؟ سيتم إزالته من القائمة العلوية.")) {
        storeSettings.categories = storeSettings.categories.filter(c => c.id !== catId);
        await dbSave('settings', storeSettings);
        applyStoreSettings();
        renderAdminCategoriesTable();
        showToast("تم حذف التصنيف بنجاح!");
    }
}

// Save Payments Settings (Paylink, Tap, Moyasar, and Tamara)
function savePaymentSettings() {
    const key = document.getElementById("settings-moyasar-key").value.trim();
    const tapKey = document.getElementById("settings-tap-key").value.trim();
    const paylinkKey = document.getElementById("settings-paylink-key") ? document.getElementById("settings-paylink-key").value.trim() : "";
    const tamaraKey = document.getElementById("settings-tamara-key") ? document.getElementById("settings-tamara-key").value.trim() : "038760f6-0cb9-44fd-b61c-4615a63a9472";
    const activeGateway = document.getElementById("settings-active-gateway").value;
    const testMode = document.getElementById("settings-test-mode").checked;

    storeSettings.moyasarKey = key;
    storeSettings.tapKey = tapKey;
    storeSettings.paylinkKey = paylinkKey;
    storeSettings.tamaraKey = tamaraKey;
    storeSettings.activeGateway = activeGateway;
    storeSettings.testMode = testMode;

    dbSave('settings', storeSettings);
    showToast("تم حفظ إعدادات بوابات الدفع الإلكتروني وتقسيط تمارا بنجاح!");
}

// Save Shipping settings
async function saveShippingSettings() {
    const shippingCost = parseFloat(document.getElementById("settings-shipping-cost").value);
    const pickupEnabled = document.getElementById("settings-pickup-enabled").checked;

    storeSettings.shippingCost = shippingCost;
    storeSettings.pickupEnabled = pickupEnabled;

    await dbSave('settings', storeSettings);
    applyStoreSettings();
    showToast("تم حفظ إعدادات الشحن والتوصيل!");
}

// Reset all store data & settings to default
function resetAllDataToDefault() {
    if (confirm("هل أنت متأكد من إعادة تعيين جميع المنتجات والإعدادات للافتراضي الأصلي؟ سيمحى أي تعديل محلي.")) {
        localStorage.removeItem('local_db_products');
        localStorage.removeItem('local_db_settings');
        localStorage.removeItem('local_db_store_reviews');
        location.reload();
    }
}

// Simulator: Simulate new store visit
function simulateAdminVisit() {
    let visits = parseInt(localStorage.getItem('belami_visits') || '0');
    localStorage.setItem('belami_visits', (visits + 1).toString());
    logAdminAlert(`👀 زائر جديد تصفح المتجر الآن`);
    localStorage.setItem('belami_alerts', localStorage.getItem('belami_alerts'));
    renderAdminDashboard();
    showToast("تمت محاكاة زيارة عميل جديدة!");
}

// Simulator: Simulate cart addition
function simulateAdminCartAdd() {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomQty = Math.floor(Math.random() * 3) + 1;
    logAdminAlert(`🛒 أضاف عميل منتج [${randomProduct.name}] للسلة (الكمية: ${randomQty})`);
    localStorage.setItem('belami_alerts', localStorage.getItem('belami_alerts'));
    renderAdminDashboard();
    showToast("تمت محاكاة إضافة منتج للسلة!");
}

// Clear admin dashboard storage logs
function clearAdminLogs() {
    if (confirm("هل أنت متأكد من مسح جميع بيانات لوحة التحكم والمبيعات والمحاكاة؟")) {
        localStorage.removeItem('belami_visits');
        localStorage.removeItem('belami_orders');
        localStorage.removeItem('belami_customers');
        localStorage.removeItem('belami_alerts');
        renderAdminDashboard();
        showToast("تم مسح بيانات لوحة التحكم بالكامل!");
    }
}

// Cross-tab real-time sync listener
window.addEventListener('storage', (e) => {
    if (e.key === 'belami_new_order_trigger') {
        playNotificationSound();
        renderAdminDashboard();
    }
    if (e.key === 'belami_cart_add_trigger' || e.key === 'belami_alerts') {
        renderAdminDashboard();
    }
});

// Image compression helper using Canvas
function compressImage(file, maxWidth, maxHeight, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = err => reject(err);
        };
        reader.onerror = err => reject(err);
    });
}

// Logo upload handler
async function handleLogoUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    try {
        showToast("جاري معالجة وضغط الشعار...");
        const base64 = await compressImage(file, 250, 150, 0.8);
        document.getElementById("settings-store-logo-preview").src = base64;
        document.getElementById("settings-store-logo").value = base64;
        showToast("تم رفع الشعار بنجاح! اضغط 'حفظ إعدادات الهوية' لحفظ التعديلات.");
    } catch (e) {
        console.error(e);
        showToast("فشل معالجة الشعار!");
    }
}

// Product image upload handler
async function handleProductImageUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    try {
        showToast("جاري معالجة وضغط الصورة...");
        const base64 = await compressImage(file, 500, 500, 0.75);
        document.getElementById("prod-image-preview").src = base64;
        document.getElementById("prod-image").value = base64;
        showToast("تم رفع الصورة الرئيسية بنجاح!");
    } catch (e) {
        console.error(e);
        showToast("فشل معالجة الصورة!");
    }
}

// Product extra images upload handler
async function handleExtraImagesUpload(input) {
    if (!input.files || input.files.length === 0) return;
    
    const extraContainer = document.getElementById("prod-extra-previews");
    if (extraContainer) extraContainer.innerHTML = "";
    
    const base64s = [];
    showToast("جاري معالجة وصور المعرض...");
    
    try {
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const base64 = await compressImage(file, 400, 400, 0.7);
            base64s.push(base64);
            
            if (extraContainer) {
                const previewImg = document.createElement("img");
                previewImg.src = base64;
                previewImg.style.width = "40px";
                previewImg.style.height = "40px";
                previewImg.style.objectFit = "cover";
                previewImg.style.borderRadius = "4px";
                previewImg.style.border = "1px solid rgba(0,0,0,0.08)";
                extraContainer.appendChild(previewImg);
            }
        }
        
        document.getElementById("prod-images-extra").value = base64s.join(', ');
        showToast("تم رفع وصور المعرض بنجاح!");
    } catch (e) {
        console.error(e);
        showToast("فشل معالجة بعض الصور!");
    }
}

// Category editing state & helpers
let editingCatId = null;

function editCategory(catId) {
    const cat = storeSettings.categories.find(c => c.id === catId);
    if (!cat) return;
    
    editingCatId = catId;
    document.getElementById("new-cat-id").value = cat.id;
    document.getElementById("new-cat-id").disabled = true; // disable key edits to prevent reference breakdown
    document.getElementById("new-cat-name").value = cat.name;

    const actions = document.getElementById("cat-form-actions");
    if (actions) {
        actions.innerHTML = `
            <button class="btn" onclick="saveCategoryEdit()" style="padding: 10px 20px; font-size: 0.9rem; margin: 0;">حفظ التعديل</button>
            <button class="btn btn-secondary" onclick="cancelCategoryEdit()" style="padding: 10px 20px; font-size: 0.9rem; margin: 0;">إلغاء</button>
        `;
    }
}

async function saveCategoryEdit() {
    const catName = document.getElementById("new-cat-name").value.trim();
    if (!catName) {
        showToast("يرجى إدخال اسم القسم بالعربية.");
        return;
    }

    const catIndex = storeSettings.categories.findIndex(c => c.id === editingCatId);
    if (catIndex !== -1) {
        storeSettings.categories[catIndex].name = catName;
        await dbSave('settings', storeSettings);
        applyStoreSettings();
        renderAdminCategoriesTable();
        cancelCategoryEdit();
        showToast("تم تعديل القسم بنجاح!");
    }
}

function cancelCategoryEdit() {
    editingCatId = null;
    document.getElementById("new-cat-id").value = "";
    document.getElementById("new-cat-id").disabled = false;
    document.getElementById("new-cat-name").value = "";

    const actions = document.getElementById("cat-form-actions");
    if (actions) {
        actions.innerHTML = `<button id="btn-save-cat" class="btn" onclick="addCategory()" style="padding: 10px 20px; font-size: 0.9rem; margin: 0;">أضف قسم</button>`;
    }
}

// Generate JSON-LD schema markup dynamically for Google SEO indexing
function generateProductSchemaMarkup() {
    // Remove existing dynamic script elements if any
    const existing = document.querySelectorAll(".dynamic-product-schema");
    existing.forEach(el => el.remove());

    products.forEach(p => {
        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": p.name,
            "image": [
                p.image.startsWith("data:") ? p.image : (window.location.origin + window.location.pathname.replace(/\/$/, '') + "/" + p.image.replace(/^\//, ''))
            ],
            "description": p.description,
            "sku": `BEL-${p.id}`,
            "mpn": `BELAMI-${p.id}`,
            "brand": {
                "@type": "Brand",
                "name": storeSettings.name || "بيلامي شوكليت"
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.origin + window.location.pathname + `#product-${p.id}`,
                "priceCurrency": "SAR",
                "price": p.price,
                "priceValidUntil": "2030-12-31",
                "availability": p.isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {
                    "@type": "Organization",
                    "name": storeSettings.name || "بيلامي شوكليت"
                }
            }
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.className = "dynamic-product-schema";
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);
    });
}

// Reset products database to clean original defaults
async function resetProductsToDefault() {
    if (confirm("هل أنت متأكد من إعادة ضبط المصنع لجميع المنتجات؟ سيتم استعادة الصور والبيانات الافتراضية الأصلية ومسح أي تعديلات قمت بها على المنتجات.")) {
        products = JSON.parse(JSON.stringify(defaultProducts));
        await dbSave('products', products);
        renderProducts();
        renderAdminProductsTable();
        generateProductSchemaMarkup();
        showToast("تمت إعادة ضبط المنتجات الافتراضية بنجاح!");
    }
}

// Progressive Image Loader & Cloud Cache Resolver
async function resolveImage(imgSrc, imgElement) {
    if (!imgElement) return;
    if (!imgSrc) {
        imgElement.src = "assets/logo.png";
        return;
    }
    
    // If it's a standard path or base64 data URL, load it directly
    if (!imgSrc.startsWith("db_img:")) {
        imgElement.src = imgSrc;
        return;
    }

    const keySuffix = imgSrc.replace("db_img:", "");
    const cacheKey = "local_cache_img_" + keySuffix;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        imgElement.src = cached;
        return;
    }

    // Show a temporary shimmer or loading placeholder
    imgElement.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'100' height%3D'100' viewBox%3D'0 0 100 100'%3E%3Crect width%3D'100%25' height%3D'100%25' fill%3D'%23f2f2f2'%2F%3E%3C%2Fsvg%3E";

    try {
        const cloudData = await dbFetch("prod_img_" + keySuffix, "");
        if (cloudData) {
            localStorage.setItem(cacheKey, cloudData);
            imgElement.src = cloudData;
        } else {
            // fallback if not found
            imgElement.src = "assets/logo.png";
        }
    } catch (e) {
        console.error("Error resolving image " + keySuffix + ":", e);
        imgElement.src = "assets/logo.png";
    }
}

// Render dynamic customer reviews (without image avatars)
function renderReviews() {
    const grid = document.getElementById("reviews-grid");
    if (!grid) return;

    grid.innerHTML = "";
    if (reviewsList.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-muted);">لا توجد تقييمات مسجلة حالياً. كن أول من يقيمنا!</div>`;
        return;
    }

    reviewsList.forEach(r => {
        const card = document.createElement("div");
        card.className = "review-card";
        
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= r.stars) {
                starsHtml += `<i class="fa-solid fa-star"></i>`;
            } else {
                starsHtml += `<i class="fa-regular fa-star"></i>`;
            }
        }

        card.innerHTML = `
            <div class="quote-icon"><i class="fa-solid fa-quote-right"></i></div>
            <p class="review-text">${r.text}</p>
            <div class="review-stars">${starsHtml}</div>
            <div class="review-author">
                <div>
                    <h5>${r.name}</h5>
                    <span>${r.date || 'عميل موثوق'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Review Form Modal Popup controls
function openReviewModal() {
    const modal = document.getElementById("review-modal");
    if (modal) {
        modal.classList.add("active");
        modal.querySelector(".product-modal-content").classList.add("active");
        setReviewStars(5);
        document.getElementById("store-review-form").reset();
    }
}

function closeReviewModal() {
    const modal = document.getElementById("review-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.querySelector(".product-modal-content").classList.remove("active");
    }
}

function setReviewStars(rating) {
    document.getElementById("review-stars-val").value = rating;
    const stars = document.querySelectorAll(".star-rating-selector i");
    stars.forEach(star => {
        const val = parseInt(star.getAttribute("data-star"), 10);
        if (val <= rating) {
            star.style.color = "var(--text-gold)";
        } else {
            star.style.color = "#ccc";
        }
    });
}

async function submitStoreReview(e) {
    e.preventDefault();
    const name = document.getElementById("review-author-name").value.trim();
    const text = document.getElementById("review-author-text").value.trim();
    const stars = parseInt(document.getElementById("review-stars-val").value, 10);
    
    if (!name || !text) return;

    const newReview = {
        name,
        text,
        stars,
        date: "عميل موثوق"
    };

    reviewsList.unshift(newReview);
    
    // Save to local & cloud DB
    await dbSave('store_reviews', reviewsList);
    
    // Set validation flag
    localStorage.setItem('belami_has_reviewed', 'true');
    
    // Re-render
    renderReviews();
    closeReviewModal();

    // Open Reward promo modal
    openPromoRewardModal();
}

function openPromoRewardModal() {
    const modal = document.getElementById("promo-reward-modal");
    if (modal) {
        modal.classList.add("active");
        modal.querySelector(".product-modal-content").classList.add("active");
    }
}

function closePromoRewardModal() {
    const modal = document.getElementById("promo-reward-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.querySelector(".product-modal-content").classList.remove("active");
    }
}

// Policies & Terms modals
function openPolicyModal(type) {
    const modal = document.getElementById("policy-modal");
    const title = document.getElementById("policy-modal-title");
    const body = document.getElementById("policy-modal-body");
    if (!modal || !title || !body) return;

    modal.classList.add("active");
    modal.querySelector(".product-modal-content").classList.add("active");

    if (type === 'shipping') {
        title.innerHTML = `<i class="fa-solid fa-truck-ramp-box"></i> آلية الطلب والشحن والتوصيل`;
        body.innerHTML = `
            <div style="line-height: 1.8; color: var(--text-dark); font-size: 0.95rem; text-align: justify; font-family: 'Tajawal', sans-serif;">
                <p><strong>عزيزنا عميل متجر بيلامي للشوكولاتة، نسعى لتقديم خدمة شحن وتوصيل متميزة تضمن وصول طلباتكم بأعلى معايير الجودة والفخامة:</strong></p>
                <ul style="padding-right: 20px; list-style-type: square; margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <li><strong>التوصيل المبرد في نفس اليوم:</strong> نضمن لكم توصيل الطلب في نفس اليوم داخل مدينة الرياض لأي طلب يتم تأكيده ودفع قيمته <strong>قبل الساعة 7:00 مساءً</strong>.</li>
                    <li><strong>الطلبات بعد الساعة 7:00 مساءً:</strong> سيتم شحن وتوصيل الطلبات التي تتم بعد الساعة السابعة مساءً في صباح اليوم التالي مباشرة، أو في نفس الليلة <strong>حسب توفر المندوبين المتنقلين لدينا</strong>.</li>
                    <li><strong>أسطول السيارات المبردة:</strong> حفاظاً على جودة وحالة الشوكولاتة الفاخرة وحرصاً على عدم تعرضها للذوبان، يتم شحن جميع الطلبات عبر سيارات شحن مبردة مخصصة ومجهزة للحرارة العالية.</li>
                    <li><strong>الاستلام من الفرع:</strong> يتاح لكم خيار استلام الطلب مجاناً من فرعنا بالرياض (حي الشفا) خلال أوقات العمل الرسمية بعد التنسيق المسبق وتأكيد جاهزية الطلب.</li>
                </ul>
            </div>
        `;
    } else if (type === 'privacy') {
        title.innerHTML = `<i class="fa-solid fa-user-shield"></i> سياسة الخصوصية وسرية المعلومات`;
        body.innerHTML = `
            <div style="line-height: 1.8; color: var(--text-dark); font-size: 0.95rem; text-align: justify; font-family: 'Tajawal', sans-serif;">
                <p>يرحب بكم متجر بيلامي، ويوضح لكم سياسة الخصوصية المعتمدة لحماية البيانات الشخصية لعملائنا الكرام تماشياً مع الأنظمة والقوانين المعمول بها في المملكة العربية السعودية:</p>
                
                <h4 style="color: var(--text-gold); margin-top: 15px; margin-bottom: 8px;">1. جمع ومعالجة البيانات الشخصية</h4>
                <p>نقوم بجمع البيانات الشخصية المحدودة والضرورية لإتمام ومعالجة طلباتكم وتأكيد التوصيل، وتشمل: (الاسم الكامل، رقم الجوال، عنوان التوصيل، والبريد الإلكتروني).</p>

                <h4 style="color: var(--text-gold); margin-top: 15px; margin-bottom: 8px;">2. سرية وأمان البيانات البنكية</h4>
                <p>جميع عمليات الدفع الإلكتروني بالبطاقات البنكية وأبل باي يتم معالجتها وتشفيرها بالكامل عبر بوابة الدفع السعودية الرسمية <strong>ميسر (Moyasar)</strong> المرخصة والمعتمدة من البنك المركزي السعودي (SAMA). لا يقوم متجر بيلامي بحفظ أو الاطلاع على أي بيانات خاصة ببطاقاتكم الائتمانية.</p>

                <h4 style="color: var(--text-gold); margin-top: 15px; margin-bottom: 8px;">3. مشاركة البيانات مع أطراف ثالثة</h4>
                <p>لا يتم إفشاء أو بيع بياناتكم لأي جهة تسويقية أو أطراف خارجية، ويتم مشاركة العنوان ورقم الهاتف فقط مع مندوبي التوصيل التابعين لمتجرنا لتسليم الطلبات.</p>

                <h4 style="color: var(--text-gold); margin-top: 15px; margin-bottom: 8px;">4. ملفات تعريف الارتباط (Cookies)</h4>
                <p>يستخدم الموقع ملفات تعريف الارتباط والذاكرة المحلية للمتصفح لحفظ حالة سلة المشتريات ولتسهيل تجربة التصفح والطلب السريع في الزيارات القادمة.</p>
            </div>
        `;
    } else if (type === 'terms') {
        title.innerHTML = `<i class="fa-solid fa-file-contract"></i> الشروط والأحكام`;
        body.innerHTML = `
            <div style="line-height: 1.8; color: var(--text-dark); font-size: 0.95rem; text-align: justify; font-family: 'Tajawal', sans-serif;">
                <p>يسري استخدامكم لمتجر بيلامي وفقاً للشروط والأحكام التالية التي تنظم العلاقة التجارية بين المتجر والعميل:</p>
                <ul style="padding-right: 20px; list-style-type: square; margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <li><strong>تعديل أو إلغاء الطلب:</strong> نظراً لأن منتجاتنا تُحضر طازجة وبشكل خاص، لا يمكن إلغاء أو تعديل الطلب بعد دخوله مرحلة التجهيز والتحضير (خاصة الطلبات التي تتضمن طباعة عبارات أو منتجات النكهات الخاصة).</li>
                    <li><strong>مواعيد التجهيز المخصصة:</strong> بعض المنتجات الخاصة الخالية من السكر أو النكهات الخاصة بالطلب تتطلب مهلة عمل وتجهيز لا تقل عن 3 أيام عمل كما هو موضح بصفحة المنتج قبل شحنها.</li>
                    <li><strong>توصيل واستلام الصواني:</strong> في حال اختيار خدمة تعبئة الصواني الخاصة، يلتزم العميل بإيصال صينيته الخاصة إلى فرعنا قبل الموعد بـ 24 ساعة على الأقل.</li>
                    <li><strong>الأسعار والضريبة:</strong> جميع الأسعار المدرجة بالمتجر نهائية بالريال السعودي وتشمل التغليف الفاخر وبطاقة الإهداء مجاناً.</li>
                </ul>
            </div>
        `;
    }
}

function closePolicyModal() {
    const modal = document.getElementById("policy-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.querySelector(".product-modal-content").classList.remove("active");
    }
}

// Promo discount code operations
function applyCoupon() {
    const input = document.getElementById("coupon-code");
    const msg = document.getElementById("coupon-message");
    if (!input || !msg) return;

    const val = input.value.trim().toUpperCase();

    // Check if 10% discount coupon is disabled by merchant
    const coupon10Disabled = localStorage.getItem('belami_disable_coupon_10') === 'true';

    if (val === "BELAMI10" || val === "OFF10" || val === "10" || val === "خصم10") {
        if (coupon10Disabled) {
            msg.style.display = "block";
            msg.style.color = "#ff3333";
            msg.textContent = "عذراً، انتهى العرض وكوبون الخصم 10% غير مفعّل حالياً! ⚠️";
            showToast("كوبون الخصم 10% موقوف!");
            return;
        }
        activeDiscountPercent = 10;
        appliedCouponCode = val;
        msg.style.display = "block";
        msg.style.color = "#25d366";
        msg.textContent = "تم تطبيق خصم 10% بنجاح! 🎉";
        showToast("تم تطبيق خصم 10%!");
        renderCheckoutSummary();
    } else if (val === "BELAMI5") {
        const hasReviewed = localStorage.getItem('belami_has_reviewed') === 'true';
        if (!hasReviewed) {
            msg.style.display = "block";
            msg.style.color = "#ff3333";
            msg.textContent = "عذراً، هذا الكوبون مخصص فقط للعملاء الذين قيموا المتجر. يرجى التقييم للحصول على الخصم! ⚠️";
            showToast("يرجى تقييم المتجر أولاً!");
            return;
        }
        activeDiscountPercent = 5;
        appliedCouponCode = "BELAMI5";
        msg.style.display = "block";
        msg.style.color = "#25d366";
        msg.textContent = "تم تطبيق خصم 5% بنجاح! 🎉";
        showToast("تم تطبيق كود الخصم 5%!");
        renderCheckoutSummary();
    } else if (val === "") {
        activeDiscountPercent = 0;
        appliedCouponCode = "";
        msg.style.display = "none";
        renderCheckoutSummary();
    } else {
        msg.style.display = "block";
        msg.style.color = "#ff3333";
        msg.textContent = "كود الخصم غير صحيح أو منتهي الصلاحية! ❌";
        showToast("كوبون غير صحيح!");
    }
}

function getTotalPrice() {
    const subtotal = getSubtotal();
    const discount = subtotal * (activeDiscountPercent / 100);
    return subtotal + currentShippingCost - discount;
}

// In-Site Paylink Modal Handlers
function openPaylinkCheckoutModal(url) {
    const modal = document.getElementById("paylink-modal");
    const frame = document.getElementById("paylink-checkout-frame");
    if (modal && frame) {
        frame.src = url;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function closePaylinkModal() {
    const modal = document.getElementById("paylink-modal");
    const frame = document.getElementById("paylink-checkout-frame");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
    if (frame) {
        frame.src = "about:blank";
    }
}

// Convert Arabic numerals to English numerals automatically
document.addEventListener('input', function(e) {
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        let val = e.target.value;
        let original = val;
        for(let i=0; i<10; i++) {
            val = val.split(ar[i]).join(i.toString());
        }
        if(val !== original) {
            e.target.value = val;
            e.target.dispatchEvent(new Event('input', {bubbles: true})); // re-trigger for frameworks/handlers
        }
    }
});



