// ========================================
// ANTALYA SHAWARMA UK - COMPLETE SYSTEM
// VERSION: 3.0.0 - FULLY FEATURED UK SYSTEM
// All 163 Features + Complete Menu
// ========================================

// ========================================
// UK DELIVERY CONFIGURATION
// ========================================

const UK_CONFIG = {
    restaurant: {
        name: 'Antalya Shawarma',
        address: '181 Market St, Hyde SK14 1HF',
        phone: '+44 161 536 1862',
        lat: 53.447830,
        lng: -2.076047,
        openTime: 11, // 11:00 AM
        closeTime: 23, // 11:00 PM
        lastOrderTime: 22.5 // 10:30 PM (22:30)
    },
    deliveryZones: {
        free: { max: 1, price: 0 },
        zone1: { min: 1, max: 3, price: 3.99 },
        zone2: { min: 3, max: 6, price: 5.99 }
    },
    maxDeliveryDistance: 6,
    currency: '£'
};


// Security: Input Sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
}

// Get UK time (handles BST/GMT automatically)
function getUKTime() {
    const now = new Date();
    // Convert to UK timezone
    const ukTime = new Date(now.toLocaleString('en-GB', { timeZone: 'Europe/London' }));
    return ukTime;
}

function getUKHour() {
    const ukTime = getUKTime();
    return ukTime.getHours() + (ukTime.getMinutes() / 60);
}

// Check if restaurant is open for orders (UK TIME)
function isRestaurantOpen() {
    const currentHour = getUKHour();
    return currentHour >= UK_CONFIG.restaurant.openTime && currentHour < UK_CONFIG.restaurant.lastOrderTime;
}

function getRestaurantStatus() {
    const currentHour = getUKHour();
    const ukTime = getUKTime();
    const timeStr = ukTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    if (currentHour < UK_CONFIG.restaurant.openTime) {
        return { open: false, message: `Opens at 11:00 (UK time: ${timeStr})` };
    } else if (currentHour >= UK_CONFIG.restaurant.closeTime) {
        return { open: false, message: `Closed for today (UK time: ${timeStr})` };
    } else if (currentHour >= UK_CONFIG.restaurant.lastOrderTime) {
        return { open: false, message: `Kitchen closed - Last orders at 22:30 (UK time: ${timeStr})` };
    }
    return { open: true, message: 'Open for orders' };
}

// Show reset options modal
function showResetOptions() {
    const modal = document.getElementById('resetOptionsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Reset specific data based on selection
function resetSelectedData() {
    const resetUsers = document.getElementById('resetUsers')?.checked;
    const resetOrders = document.getElementById('resetOrders')?.checked;
    const resetDrivers = document.getElementById('resetDrivers')?.checked;
    const resetFavorites = document.getElementById('resetFavorites')?.checked;
    const resetMenu = document.getElementById('resetMenu')?.checked;
    
    if (!resetUsers && !resetOrders && !resetDrivers && !resetFavorites && !resetMenu) {
        alert('⚠️ Please select at least one option to reset');
        return;
    }
    
    let message = 'This will reset:\n';
    if (resetUsers) message += '• All user accounts & reviews\n';
    if (resetOrders) message += '• All order history\n';
    if (resetDrivers) message += '• All driver data\n';
    if (resetFavorites) message += '• All favorites & notifications\n';
    if (resetMenu) message += '• Menu to default\n';
    message += '\nThis cannot be undone!';
    
    if (!confirm('⚠️ ' + message)) return;
    
    // Reset selected items
    if (resetUsers) {
        localStorage.removeItem('restaurantUsers');
        localStorage.removeItem('currentUser');
        userDatabase = [];
        currentUser = null;
        
        // Also delete all reviews since users are deleted
        localStorage.removeItem('restaurantReviews');
        restaurantReviews = [];
    }
    
    if (resetOrders) {
        localStorage.removeItem('orderHistory');
        localStorage.removeItem('pendingOrders');
        orderHistory = [];
        pendingOrders = [];
    }
    
    if (resetDrivers) {
        localStorage.removeItem('drivers');
        localStorage.removeItem('driverLiveLocations');
        if (window.driverSystem) {
            window.driverSystem.drivers = {};
        }
    }
    
    if (resetFavorites) {
        localStorage.removeItem('userFavorites');
        localStorage.removeItem('userNotifications');
        userFavorites = {};
        userNotifications = {};
    }
    
    if (resetMenu) {
        localStorage.removeItem('menuData');
        localStorage.removeItem('categories');
        loadMenuData(); // Reload defaults
    }
    
    closeModal('resetOptionsModal');
    alert('✅ Selected data has been reset!');
    location.reload();
}

function resetAllData() {
    // Deprecated - use showResetOptions() directly
    console.warn('resetAllData() is deprecated. Use showResetOptions() instead.');
}

// ========================================
// CREDENTIALS
// ========================================
let googleMap = null;
let deliveryMarker = null;
let selectedLocation = null;

const OWNER_CREDENTIALS = {
    email: 'admin@antalyashawarma.com',
    password: 'admin2024',
    pin: '1234'
};



const RESTAURANT_CREDENTIALS = {
    email: 'staff@antalyashawarma.com',
    password: 'staff2024'
};

// Session Protection
// Generate session token
const SESSION_TOKEN = 'ast_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
localStorage.setItem('sessionToken', SESSION_TOKEN);

// Validate session before sensitive operations
function validateSession() {
    return localStorage.getItem('sessionToken') === SESSION_TOKEN;
}

// Password Strength Validation
function isStrongPassword(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return strongRegex.test(password);
}

// ========================================
// REAL ANTALYA SHAWARMA MENU DATA
// From: Antalya Shawarma Hyde - Uber Eats
// ========================================
let menuData = {
    // GRILL WRAPS
    grill_wraps: [
        { id: 101, name: 'Mix Grill Wrap', price: 9.00, icon: '🌯', image: '', available: true, desc: 'Served with salad and sauce', popular: true, options: [
            { name: 'Extra Meat', price: 2.00 },
            { name: 'Extra Cheese', price: 1.00 },
            { name: 'Spicy Sauce', price: 0.50 }
        ]},
        { id: 102, name: 'Chicken Grill Wrap', price: 7.50, icon: '🌯', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Chicken', price: 2.00 },
            { name: 'Extra Cheese', price: 1.00 }
        ]},
        { id: 103, name: 'Lamb Grill Wrap', price: 9.50, icon: '🌯', image: '', available: true, desc: 'Served with salad and sauce & naan. LAMB BACK STRAP FILLET', options: [
            { name: 'Extra Lamb', price: 2.50 },
            { name: 'Extra Cheese', price: 1.00 }
        ]}
    ],
    
    // GRILL PORTIONS (Boneless pieces)
    grill_portions: [
        { id: 201, name: 'Grill Mix Chicken & Lamb Portion', price: 11.90, icon: '🍖', image: '', available: true, desc: 'Boneless pieces served with salad, sauce & naan', popular: true, options: [
            { name: 'Extra Naan', price: 1.00 },
            { name: 'Extra Salad', price: 1.50 }
        ]},
        { id: 202, name: 'Grill Chicken Portion', price: 10.00, icon: '🍖', image: '', available: true, desc: 'Boneless pieces served with salad, sauce & naan', options: [
            { name: 'Extra Naan', price: 1.00 },
            { name: 'Extra Chicken', price: 2.00 }
        ]},
        { id: 203, name: 'Grill Lamb Portion', price: 12.50, icon: '🍖', image: '', available: true, desc: 'Boneless pieces served with salad, sauce & naan. LAMB BACK STRAP FILLET', options: [
            { name: 'Extra Naan', price: 1.00 },
            { name: 'Extra Lamb', price: 3.00 }
        ]}
    ],
    
    // SHAWARMA WITH CHIPS
    shawarma_chips: [
        { id: 301, name: 'Mix Shawarma Portions Chips', price: 8.90, icon: '🍟', image: '', available: true, desc: 'Served with sauce, salad and chips', options: [
            { name: 'Large Chips', price: 1.50 },
            { name: 'Cheese on Chips', price: 1.00 }
        ]},
        { id: 302, name: 'Chicken Shawarma Portions Chips', price: 8.50, icon: '🍟', image: '', available: true, desc: 'Served with sauce, salad and chips', popular: true, options: [
            { name: 'Large Chips', price: 1.50 },
            { name: 'Cheese on Chips', price: 1.00 }
        ]},
        { id: 303, name: 'Lamb Shawarma Portions Chips', price: 9.50, icon: '🍟', image: '', available: true, desc: 'Served with sauce, salad and chips', options: [
            { name: 'Large Chips', price: 1.50 },
            { name: 'Cheese on Chips', price: 1.00 }
        ]}
    ],
    
    // SHAWARMA WITH RICE
    shawarma_rice: [
        { id: 401, name: 'Chicken Shawarma Portions Rice', price: 8.50, icon: '🍚', image: '', available: true, desc: 'Served with sauce, salad and rice', popular: true, options: [
            { name: 'Extra Rice', price: 1.50 },
            { name: 'Extra Meat', price: 2.00 }
        ]},
        { id: 402, name: 'Mix Shawarma Portions Rice', price: 8.90, icon: '🍚', image: '', available: true, desc: 'Served with sauce, salad and rice', options: [
            { name: 'Extra Rice', price: 1.50 }
        ]},
        { id: 403, name: 'Lamb Shawarma Portions Rice', price: 9.50, icon: '🍚', image: '', available: true, desc: 'Served with sauce, salad and rice', options: [
            { name: 'Extra Rice', price: 1.50 }
        ]}
    ],
    
    // SHAWARMA WITH NAAN
    shawarma_naan: [
        { id: 501, name: 'Chicken Shawarma Portions with Naan', price: 8.00, icon: '🫓', image: '', available: true, desc: 'Served with salad and sauce', popular: true, options: [
            { name: 'Extra Naan', price: 1.00 },
            { name: 'Extra Chicken', price: 2.00 }
        ]},
        { id: 502, name: 'Mix Shawarma Portions with Naan', price: 8.80, icon: '🫓', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Naan', price: 1.00 }
        ]},
        { id: 503, name: 'Lamb Shawarma Portions with Naan', price: 9.00, icon: '🫓', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Naan', price: 1.00 }
        ]}
    ],
    
    // SHAWARMA WITH TURKISH BREAD
    shawarma_turkish: [
        { id: 601, name: 'Chicken Shawarma with Turkish Bread', price: 8.00, icon: '🥖', image: '', available: true, desc: 'Served with salad and sauce', popular: true, options: [
            { name: 'Extra Bread', price: 1.00 },
            { name: 'Extra Chicken', price: 2.00 }
        ]},
        { id: 602, name: 'Mix Shawarma with Turkish Bread', price: 8.80, icon: '🥖', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Bread', price: 1.00 }
        ]},
        { id: 603, name: 'Lamb Shawarma with Turkish Bread', price: 9.00, icon: '🥖', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Bread', price: 1.00 }
        ]}
    ],
    
    // FALAFEL
    falafel: [
        { id: 701, name: '6 Falafel Portions', price: 6.00, icon: '🧆', image: '', available: true, desc: 'Served with mix salad and yoghurt sauce', options: [
            { name: 'Extra Falafel (3)', price: 2.00 },
            { name: 'Hummus', price: 1.50 }
        ]},
        { id: 702, name: 'Falafel Wrap', price: 5.80, icon: '🌯', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Falafel', price: 1.50 }
        ]},
        { id: 703, name: 'Falafel Sandwich', price: 5.80, icon: '🥪', image: '', available: true, desc: 'Served with salad and sauce', options: [
            { name: 'Extra Falafel', price: 1.50 }
        ]},
        { id: 704, name: 'Portion Halloumi With Salad', price: 6.50, icon: '🧀', image: '', available: true, desc: '4 large grill halloumi', options: [
            { name: 'Extra Halloumi (2)', price: 2.00 }
        ]}
    ],
    
    // SHAWARMA WRAPS
    shawarma_wraps: [
        { id: 801, name: 'Chicken Shawarma Wrap', price: 6.50, icon: '🌯', image: '', available: true, desc: 'Served with salad, sauce, and naan bread', options: [
            { name: 'Extra Chicken', price: 2.00 },
            { name: 'Cheese', price: 1.00 }
        ]},
        { id: 802, name: 'Lamb Shawarma Wrap', price: 7.00, icon: '🌯', image: '', available: true, desc: 'Served with salad, sauce, and naan bread', options: [
            { name: 'Extra Lamb', price: 2.50 },
            { name: 'Cheese', price: 1.00 }
        ]},
        { id: 803, name: 'Mix Shawarma Wrap', price: 6.80, icon: '🌯', image: '', available: true, desc: 'Served with salad, sauce, and naan bread', options: [
            { name: 'Extra Meat', price: 2.00 }
        ]}
    ],
    
    // SHAWARMA SANDWICH
    shawarma_sandwich: [
        { id: 901, name: 'Chicken Shawarma Sandwich', price: 6.50, icon: '🥪', image: '', available: true, desc: 'Served with salad, sauce and Turkish bread', options: [
            { name: 'Extra Chicken', price: 2.00 },
            { name: 'Cheese', price: 1.00 }
        ]},
        { id: 902, name: 'Mix Shawarma Sandwich', price: 6.80, icon: '🥪', image: '', available: true, desc: 'Served with salad, sauce and Turkish bread', options: [
            { name: 'Extra Meat', price: 2.00 }
        ]},
        { id: 903, name: 'Lamb Shawarma Sandwich', price: 7.00, icon: '🥪', image: '', available: true, desc: 'Served with salad, sauce and Turkish bread', options: [
            { name: 'Extra Lamb', price: 2.50 }
        ]}
    ],
    
    // PIZZA
    pizza: [
        { id: 1001, name: 'Cheese and Tomato', price: 5.50, icon: '🍕', image: '', available: true, desc: 'Fresh cheese and tomato on a delicious base', options: [
            { name: 'Extra Cheese', price: 1.00 }
        ]},
        { id: 1002, name: 'Cheese and Tomato with 2 Toppings', price: 6.50, icon: '🍕', image: '', available: true, desc: 'Melted cheese and fresh tomato with your choice of two toppings', options: [
            { name: 'Extra Topping', price: 1.00 }
        ]},
        { id: 1003, name: 'Cheese and Tomato with 3 Toppings', price: 7.00, icon: '🍕', image: '', available: true, desc: 'Melted cheese and fresh tomato with your choice of three toppings', options: [
            { name: 'Extra Topping', price: 1.00 }
        ]},
        { id: 1004, name: 'Antalya Special Pizza', price: 8.00, icon: '🍕', image: '', available: true, desc: 'A bit of everything - various ingredients combined', popular: true },
        { id: 1005, name: 'Mediterranean Pizza', price: 7.00, icon: '🍕', image: '', available: true, desc: 'JalapeÃ±o, fresh tomato, onion, green pepper, olives' },
        { id: 1006, name: 'Tuna Sweet Corn Pizza', price: 6.50, icon: '🍕', image: '', available: true, desc: 'Tuna and sweet corn pizza topping' }
    ],
    
    // FATAYER PIE
    fatayer: [
        { id: 1101, name: 'Chicken Cheese Fatayer', price: 6.00, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad', options: [
            { name: 'Extra Cheese', price: 1.00 }
        ]},
        { id: 1102, name: 'Spicy Lamb Cheese Fatayer', price: 6.00, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad' },
        { id: 1103, name: 'Spicy Lamb and Chicken Cheese Fatayer', price: 6.50, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad' },
        { id: 1104, name: 'Antalya Special Fatayer', price: 7.00, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad', popular: true },
        { id: 1105, name: 'Spinach And Lamb Fatayer', price: 6.50, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad' },
        { id: 1106, name: 'Cheese Fatayer', price: 5.50, icon: '🥟', image: '', available: true, desc: 'Folded pizza with cheese. Served with salad' },
        { id: 1107, name: 'Chicken Spinach Cheese Fatayer', price: 6.50, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad' },
        { id: 1108, name: 'Spinach Cheese Fatayer', price: 6.00, icon: '🥟', image: '', available: true, desc: 'Folded pizza topped with cheese. Served with salad' },
        { id: 1109, name: 'Tuna Cheese Fatayer', price: 6.00, icon: '🥟', image: '', available: true, desc: 'Tuna and cheese filled pastry' }
    ],
    
    // MEZZE STARTER / SIDES
    mezze: [
        { id: 1201, name: 'Peri-Peri Chips Salt', price: 3.00, icon: '🍟', image: '', available: true, desc: 'Spicy flavoured chips seasoned with peri-peri salt', popular: true, options: [
            { name: 'Cheese', price: 1.00 }
        ]},
        { id: 1202, name: 'Garlic Bread with Cheese', price: 5.50, icon: '🧄', image: '', available: true, desc: 'Freshly baked bread infused with garlic and melted cheese' },
        { id: 1203, name: 'Chips', price: 3.00, icon: '🍟', image: '', available: true, desc: 'Crispy fried potato strips served as a side dish', options: [
            { name: 'Cheese', price: 1.00 },
            { name: 'Peri-Peri Salt', price: 0.50 }
        ]},
        { id: 1204, name: 'Cheese Chips', price: 4.00, icon: '🍟', image: '', available: true, desc: 'Crispy chips smothered in melted cheese' },
        { id: 1205, name: 'Spicy Potatoes', price: 4.00, icon: '🥝', image: '', available: true, desc: 'Crunchy potatoes with a spicy kick' },
        { id: 1206, name: 'Garlic Bread', price: 4.50, icon: '🧄', image: '', available: true, desc: 'Freshly baked bread infused with aromatic garlic' },
        { id: 1207, name: 'Turkish Mix Salad', price: 4.50, icon: '🥗', image: '', available: true, desc: 'A mix of fresh vegetables and herbs with Turkish flair' },
        { id: 1208, name: 'Hummus', price: 4.00, icon: '🫜', image: '', available: true, desc: 'Traditional Middle Eastern dip made from chickpeas' },
        { id: 1209, name: 'Salsa Salad', price: 4.00, icon: '🥗', image: '', available: true, desc: 'Fresh salsa style salad portion' },
        { id: 1210, name: 'Tzatziki (Cacik)', price: 4.00, icon: '🥻', image: '', available: true, desc: 'Diced cucumbers, garlic, mint in yogurt' },
        { id: 1211, name: 'Rice', price: 4.00, icon: '🍚', image: '', available: true, desc: 'Plain white rice' },
        { id: 1212, name: 'Red Cabbage', price: 3.00, icon: '🥬', image: '', available: true, desc: 'Crisp red cabbage, a light mezze accompaniment' },
        { id: 1213, name: 'Jalapeno', price: 3.00, icon: '🌶️', image: '', available: true, desc: 'Jalapeno chilli pepper with a spicy kick' },
        { id: 1214, name: 'Lettuce', price: 3.00, icon: '🥬', image: '', available: true, desc: 'Crisp lettuce leaves, a light mezze starter' }
    ],
    
    // KIDS
    kids: [
        { id: 1301, name: '6 Chicken Nuggets', price: 6.00, icon: '🍗', image: '', available: true, desc: 'Served with chips and side drink', options: [
            { name: 'Extra Nuggets (3)', price: 2.00 }
        ]}
    ],
    
    // EXTRAS / SAUCES
    extras: [
        { id: 1401, name: 'Turkish Bread with Sesame Seeds (Samoon)', price: 1.00, icon: '🥖', image: '', available: true, desc: 'Soft, crusty bread topped with sesame seeds' },
        { id: 1402, name: 'Amba Sauce', price: 0.45, icon: '🥫', image: '', available: true, desc: 'Tangy and sweet mango pickle sauce' },
        { id: 1403, name: 'Sweet Chilli', price: 0.45, icon: '🌶️', image: '', available: true, desc: 'Sweet Chilli Dipping Sauce - rich blend of red chillies and garlic' },
        { id: 1404, name: 'Sriracha Mayonnaise', price: 0.50, icon: '🥫', image: '', available: true, desc: 'Spicy mayo blending heat of chillies with coolness of mayo. Vegan & Gluten Free' },
        { id: 1405, name: 'Garlic Mayo', price: 0.45, icon: '🧄', image: '', available: true, desc: 'Rich and creamy mayonnaise infused with garlic' },
        { id: 1406, name: 'Chilli Sauce', price: 0.45, icon: '🌶️', image: '', available: true, desc: 'Spicy condiment to add flavour to your meal' },
        { id: 1407, name: 'Yoghurt Sauce', price: 0.45, icon: '🥻', image: '', available: true, desc: 'Tangy and creamy accompaniment to your meal' },
        { id: 1408, name: 'Naan', price: 1.00, icon: '🫓', image: '', available: true, desc: 'Soft, lightly leavened Indian flatbread' },
        { id: 1409, name: 'Fresh Green Chilli with Garlic', price: 0.45, icon: '🌶️', image: '', available: true, desc: 'Fresh green chilli infused with garlic' },
        { id: 1410, name: 'BBQ Sauce', price: 0.45, icon: '🥫', image: '', available: true, desc: 'Sweet and tangy condiment to enhance your meal' }
    ],
    
    // DRINKS
    drinks: [
        { id: 1501, name: 'Coca-Cola', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Classic cola beverage' },
        { id: 1502, name: 'Rio', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Freshly brewed tropical drink' },
        { id: 1503, name: 'Rubicon Mango', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Fresh mango drink with a sweet and tangy twist' },
        { id: 1504, name: 'Pepsi Max', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Crisp, refreshing cola with zero sugar' },
        { id: 1505, name: 'Fanta', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Fizzy orange flavoured soft drink' },
        { id: 1506, name: 'Pepsi', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Refreshing fizzy drink' },
        { id: 1507, name: 'Water', price: 1.00, icon: '💧', image: '', available: true, desc: 'Refreshing and thirst-quenching' },
        { id: 1508, name: 'Sprite', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Lemon-lime soft drink' },
        { id: 1509, name: 'Fruitshoot (Apple & Blackcurrant)', price: 1.00, icon: '🧃', image: '', available: true, desc: 'Refreshing drink blending apple and blackcurrant flavours' },
        { id: 1510, name: 'Irn Bru', price: 1.70, icon: '🥤', image: '', available: true, desc: 'Scottish soft drink' }
    ]
};

// ========================================
// CATEGORY NAMES & ICONS
// ========================================
let categories = {
    grill_wraps: { name: 'Grill Wraps', icon: '🌯', image: '' },
    grill_portions: { name: 'Grill Portions (Boneless)', icon: '🍖', image: '' },
    shawarma_chips: { name: 'Shawarma with Chips', icon: '🍟', image: '' },
    shawarma_rice: { name: 'Shawarma with Rice', icon: '🍚', image: '' },
    shawarma_naan: { name: 'Shawarma with Naan', icon: '🫓', image: '' },
    shawarma_turkish: { name: 'Shawarma Turkish Bread', icon: '🥖', image: '' },
    falafel: { name: 'Falafel', icon: '🧆', image: '' },
    shawarma_wraps: { name: 'Shawarma Wraps', icon: '🌯', image: '' },
    shawarma_sandwich: { name: 'Shawarma Sandwich', icon: '🥪', image: '' },
    pizza: { name: 'Pizza', icon: '🍕', image: '' },
    fatayer: { name: 'Fatayer Pie', icon: '🥟', image: '' },
    mezze: { name: 'Mezze Starter', icon: '🥗', image: '' },
    kids: { name: 'Kids', icon: '🍗', image: '' },
    extras: { name: 'Extras', icon: '🧄', image: '' },
    drinks: { name: 'Drinks', icon: '🥤', image: '' }
};

// Load saved menu data from localStorage
function loadMenuData() {
    const savedMenu = localStorage.getItem('menuData');
    const savedCategories = localStorage.getItem('categories');
    if (savedMenu) {
        try {
            const parsed = JSON.parse(savedMenu);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                // Merge with default menu to preserve structure
                Object.keys(parsed).forEach(key => {
                    if (menuData[key] && Array.isArray(parsed[key])) {
                        menuData[key] = parsed[key];
                    }
                });
            }
        } catch(e) { console.log('Error loading menu data'); }
    }
if (savedCategories) {
    try {
        const parsed = JSON.parse(savedCategories);
        Object.keys(parsed).forEach(key => {
            if (categories[key]) {
                categories[key] = { ...categories[key], ...parsed[key] };
            }
        });
    } catch (e) {
        console.warn('⚠️ Bad category data, resetting...');
        localStorage.removeItem('categories');
    }
}

    // Ensure we have valid data - if menuData is empty, reload page without cache
    const totalItems = Object.values(menuData).flat().length;
    if (totalItems === 0) {
        localStorage.removeItem('menuData');
        localStorage.removeItem('categories');
    }
}

function saveMenuData() {
    localStorage.setItem('menuData', JSON.stringify(menuData));
    localStorage.setItem('categories', JSON.stringify(categories));
}

// ========================================
// GLOBAL STATE
// ========================================
let cart = [];
let currentUser = null;
let selectedFood = null;
let selectedCustomizations = [];
let quantity = 1;
let isSignUpMode = false;
let currentCategory = 'grill_wraps';
let userDatabase = [];
let orderHistory = [];
let userFavorites = {};
let userNotifications = {};
let mapMarker = null;
let isEditingLocation = false;
let pendingOrders = [];
let isOwnerLoggedIn = false;
let isRestaurantLoggedIn = false;
let pendingVerification = null;
let drivers = [];
let currentDriver = null;

// Reviews System
let restaurantReviews = [];
let currentReviewId = null;
let selectedRating = 0;

let ownerBankDetails = {
    bankName: 'Barclays Bank UK',
    accountNumber: '12345678',
    sortCode: '20-00-00',
    iban: 'GB29 NWBK 6016 1331 9268 19',
    cardNumber: '4532 **** **** 1234'
};

// ========================================
// DRIVER SYSTEM
// ========================================
window.driverSystem = {
    drivers: {
        'driver-001': {
            id: 'driver-001',
            name: 'Mohammed Ali',
            email: 'mohammed@antalya.com',
            phone: '+44 7700 900123',
            password: 'driver123',
            dob: '1990-05-15',
            gender: 'male',
            secretCode: 'DRV-001-MA',
            deliveries: 247,
            rating: 4.9,
            active: true,      // Can login
            available: true,   // Can receive orders
            profilePicture: null,
            currentLocation: null
        },
        'driver-002': {
            id: 'driver-002',
            name: 'Ahmed Hassan',
            email: 'ahmed@antalya.com',
            phone: '+44 7700 900124',
            password: 'driver123',
            dob: '1988-08-20',
            gender: 'male',
            secretCode: 'DRV-002-AH',
            deliveries: 189,
            rating: 4.8,
            active: true,
            available: true,
            profilePicture: null,
            currentLocation: null
        },
        'driver-003': {
            id: 'driver-003',
            name: 'Fatima Khan',
            email: 'fatima@antalya.com',
            phone: '+44 7700 900125',
            password: 'driver123',
            dob: '1992-12-10',
            gender: 'female',
            secretCode: 'DRV-003-FK',
            deliveries: 156,
            rating: 4.95,
            active: true,
            available: true,
            profilePicture: null,
            currentLocation: null
        }
    },
    get: function(id) {
        return this.drivers[id] || null;
    },
    getByCode: function(code) {
        return Object.values(this.drivers).find(d => d.secretCode === code.toUpperCase());
    },
    getByEmail: function(email) {
        return Object.values(this.drivers).find(d => d.email === email);
    },
    getAll: function() {
        return Object.values(this.drivers);
    },
    getActive: function() {
        return Object.values(this.drivers).filter(d => d.active);
    },
    getAvailable: function() {
        return Object.values(this.drivers).filter(d => d.active && d.available);
    },
    add: function(driver) {
        this.drivers[driver.id] = driver;
        this.save();
    },
    update: function(id, data) {
        if (this.drivers[id]) {
            Object.assign(this.drivers[id], data);
            this.save();
        }
    },
    delete: function(id) {
        delete this.drivers[id];
        this.save();
    },
    save: function() {
        localStorage.setItem('driverSystem', JSON.stringify(this.drivers));
    },
    load: function() {
        const saved = localStorage.getItem('driverSystem');
        if (saved) {
            this.drivers = JSON.parse(saved);
        }
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Calculate distance in miles (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate estimated delivery time
function calculateTime(distanceMiles) {
    const avgSpeed = 30; // mph
    return Math.ceil((distanceMiles / avgSpeed) * 60); // minutes
}

// Display distance info on map
function updateDistanceInfo() {
    if (!selectedLocation) return;
    
    const distance = calculateDistance(
        UK_CONFIG.restaurant.lat,
        UK_CONFIG.restaurant.lng,
        selectedLocation.lat,
        selectedLocation.lng
    );
    
    const time = calculateTime(distance);
    
    let distanceInfo = document.getElementById('mapDistanceInfo');
    if (!distanceInfo) {
        distanceInfo = document.createElement('div');
        distanceInfo.id = 'mapDistanceInfo';
        distanceInfo.style.cssText = `
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 10, 10, 0.95);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.95rem;
            z-index: 1000;
            border: 2px solid rgba(230, 57, 70, 0.5);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        `;
        document.getElementById('map').parentElement.appendChild(distanceInfo);
    }
    
    if (distance > 6) {
        distanceInfo.innerHTML = `⚠️ ${distance.toFixed(1)} miles - TOO FAR FOR DELIVERY`;
        distanceInfo.style.borderColor = '#ef4444';
        distanceInfo.style.background = 'rgba(239, 68, 68, 0.2)';
    } else {
        distanceInfo.innerHTML = `📍 ${distance.toFixed(1)} miles away  ⏱️ ${time} min delivery`;
        distanceInfo.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        distanceInfo.style.background = 'rgba(10, 10, 10, 0.95)';
    }
    
    distanceInfo.style.display = 'block';
}

// Format price in GBP
function formatPrice(amount) {
    return UK_CONFIG.currency + parseFloat(amount).toFixed(2);
}

// Email Verification System
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
let otpTimers = {}; // Track OTP timers per email

async function sendVerificationEmail(email, code, type = 'verification') {
    const now = Date.now();
    const lastSent = otpTimers[email]?.lastSent || 0;
    const timeSinceLastSend = now - lastSent;
    
    if (timeSinceLastSend < 90000) {
        const waitTime = Math.ceil((90000 - timeSinceLastSend) / 1000);
        alert(`⏱️ Please wait ${waitTime} seconds before requesting a new code.`);
        return false;
    }
    
    try {
        let templateParams = {
            to_email: email,
            code: code,
            from_name: "Antalya Shawarma Hyde",
            title: type === 'password_reset' ? "Password Reset Code" : "Email Verification",
            name: "Customer"
        };
        
           await emailjs.send(
              "service_33hew7v",
             "template_ca0ft4s",
             templateParams
        );
        
        otpTimers[email] = {
            lastSent: now,
            expiresAt: now + 600000,
            canResendAt: now + 90000
        };
        
        startOTPCountdown(email);
        console.log('✅ Verification email sent successfully');
        alert('📧 Code sent! Check your email.\n\n⏰ May take 1-3 minutes to arrive.\n\nCheck spam folder if needed.'); // ADD THIS
        return true;
    } catch (error) {
        console.error('❌ EmailJS Error:', error);
        alert('❌ Failed to send verification email. Please try again.');
        return false;
    }
}

function startOTPCountdown(email) {
    const timer = otpTimers[email];
    if (!timer) return;
    
    const countdownElement = document.getElementById('otpCountdown');
    const resendBtn = document.getElementById('resendCodeBtn');
    
    if (!countdownElement) return;
    
    const updateCountdown = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((timer.canResendAt - now) / 1000));
        
        if (timeLeft > 0) {
            countdownElement.textContent = `Resend code in ${timeLeft}s`;
            if (resendBtn) resendBtn.disabled = true;
        } else {
            countdownElement.textContent = 'You can now request a new code';
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.textContent = '📧 Resend Code';
            }
            clearInterval(timer.interval);
        }
    };
    
    updateCountdown();
    timer.interval = setInterval(updateCountdown, 1000);
}

function canResendOTP(email) {
    const timer = otpTimers[email];
    if (!timer) return true;
    return Date.now() >= timer.canResendAt;
}

function canSendCode() {
    const last = localStorage.getItem("lastCodeTime");
    if (!last) return true;

    const diff = Date.now() - Number(last);
    return diff > 60 * 1000; // 1 minute
}





// Validation functions
function isValidEmail(email) {
    email = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
        return { valid: false, message: '❌ Invalid email format' };
    }
    
    if (email.endsWith('@gmail.com')) {
        return { valid: true, provider: 'Gmail' };
    } else if (email.endsWith('@icloud.com')) {
        return { valid: true, provider: 'iCloud' };
    } else {
        return { valid: true, provider: 'Other' };
    }
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const ukPhoneRegex = /^(\+44|44|0)?[1-9]\d{9,10}$/;
    return ukPhoneRegex.test(cleanPhone);
}

function isValidCardNumber(cardNumber) {
    cardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) return false;
    
    let sum = 0, isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return (sum % 10) === 0;
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function isValidExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    return true;
}

function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
      
    }
}

// ========================================
// STORAGE FUNCTIONS
// ========================================
function saveData() {
    localStorage.setItem('restaurantUsers', JSON.stringify(userDatabase));
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    localStorage.setItem('ownerBankDetails', JSON.stringify(ownerBankDetails));
    localStorage.setItem('drivers', JSON.stringify(drivers));
}

function loadData() {
    const savedUsers = localStorage.getItem('restaurantUsers');
    if (savedUsers) userDatabase = JSON.parse(savedUsers);
    
    const savedOrders = localStorage.getItem('orderHistory');
    if (savedOrders) orderHistory = JSON.parse(savedOrders);
    
    const savedPending = localStorage.getItem('pendingOrders');
    if (savedPending) pendingOrders = JSON.parse(savedPending);
    
    const savedFavorites = localStorage.getItem('userFavorites');
    if (savedFavorites) userFavorites = JSON.parse(savedFavorites);
    
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) userNotifications = JSON.parse(savedNotifications);
    
    const savedBankDetails = localStorage.getItem('ownerBankDetails');
    if (savedBankDetails) ownerBankDetails = JSON.parse(savedBankDetails);
    
    const savedDrivers = localStorage.getItem('drivers');
    if (savedDrivers) drivers = JSON.parse(savedDrivers);
    
    const savedCurrentUser = localStorage.getItem('currentUser');
    if (savedCurrentUser) {
        currentUser = JSON.parse(savedCurrentUser);
        updateHeaderForLoggedInUser();
        
        // Restore selectedLocation from user's saved location
        if (currentUser.location) {
            selectedLocation = currentUser.location;
        }
        
        const savedCart = localStorage.getItem('cart_' + currentUser.email);
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartBadge();
        }
        updateFavoritesBadge();
        updateNotificationBadge();
        updateOrdersBadge();
    }
    
    window.driverSystem.load();
    updateOwnerButtonVisibility();
}

function saveCart() {
    if (currentUser) {
        localStorage.setItem('cart_' + currentUser.email, JSON.stringify(cart));
    }
}

function saveDrivers() {
    localStorage.setItem('drivers', JSON.stringify(drivers));
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const mobileBadge = document.getElementById('mobileCartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (mobileBadge) {
        mobileBadge.textContent = totalItems;
        mobileBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateFavoritesBadge() {
    const badge = document.getElementById('favoritesBadge');
    const mobileBadge = document.getElementById('mobileFavBadge');
    let count = 0;
    
    if (currentUser && userFavorites[currentUser.email]) {
        count = userFavorites[currentUser.email].length;
    }
    
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
    if (mobileBadge) {
        mobileBadge.textContent = count;
        mobileBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const mobileBadge = document.getElementById('mobileNotifyBadge');
    let unread = 0;
    
    if (currentUser && userNotifications[currentUser.email]) {
        unread = userNotifications[currentUser.email].filter(n => !n.read).length;
    }
    
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (mobileBadge) {
        mobileBadge.textContent = unread;
        mobileBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

function updateHeaderForLoggedInUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    if (currentUser) {
        loginBtn.textContent = currentUser.name.split(' ')[0];
        loginBtn.style.background = 'rgba(255, 107, 107, 0.2)';
        loginBtn.style.border = '2px solid #ff6b6b';
        loginBtn.onclick = showAccount;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a6f)';
        loginBtn.style.border = 'none';
        loginBtn.onclick = showLogin;
    }
}

// ========================================
// MENU DISPLAY FUNCTIONS
// ========================================
function displayMenu(category) {
    currentCategory = category;
    const menuGrid = document.getElementById('menuGrid');
    const menuTitle = document.getElementById('menuTitle');
    
    if (!menuGrid) return;
    
    const catInfo = categories[category] || { name: category, icon: '🍽️' };
    if (menuTitle) menuTitle.textContent = catInfo.name;
    
    menuGrid.innerHTML = '';
    menuGrid.className = 'menu-list-container';
    
    const items = menuData[category] || [];
    const isMobile = window.innerWidth <= 768;
    
    // Container styling
    if (isMobile) {
        menuGrid.style.cssText = 'display: flex; flex-direction: column; gap: 0; padding: 0 1rem;';
    } else {
        menuGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; padding: 1rem;';
    }
    
    items.forEach(item => {
        // Show ALL items including unavailable ones
        const isFavorite = currentUser && userFavorites[currentUser.email]?.includes(item.id);
        const unavailable = item.available === false;
        
        // Get category image/icon for fallback
        const categoryIcon = catInfo.icon || '🍽️';
        const categoryImage = catInfo.image || '';
        
        // Image display - use item image, then category image, then icon
        let imageDisplay;
        if (item.image) {
            imageDisplay = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (categoryImage) {
            imageDisplay = `<img src="${categoryImage}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            imageDisplay = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">${item.icon || categoryIcon}</div>`;
        }
        
        const row = document.createElement('div');
        
        if (isMobile) {
            // Mobile: Full width list items
            row.style.cssText = `display: flex; gap: 1rem; padding: 1.2rem 0; border-bottom: 1px solid rgba(230, 57, 70, 0.15); ${unavailable ? 'opacity: 0.6;' : ''}`;
            row.innerHTML = `
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
                    <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem; color: ${unavailable ? '#888' : '#fff'}; ${unavailable ? 'text-decoration: line-through;' : ''}">${item.name}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-bottom: 0.8rem; line-height: 1.4; flex: 1;">${item.desc}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; font-size: 1.05rem; color: ${unavailable ? '#888' : '#fff'};">${formatPrice(item.price)}</span>
                        ${unavailable ? '<span style="color: #ef4444; font-size: 0.7rem; font-weight: 600; background: rgba(239,68,68,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">NOT AVAILABLE</span>' : ''}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <div style="width: 110px; height: 110px; background: #f5f5f5; border-radius: 12px; overflow: hidden; position: relative; ${unavailable ? 'filter: grayscale(50%);' : ''}">
                        ${imageDisplay}
                        <button onclick="toggleFavorite(${item.id}, event)" style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); border: none; width: 30px; height: 30px; min-width: 30px; min-height: 30px; max-width: 30px; max-height: 30px; border-radius: 50%; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; aspect-ratio: 1/1; box-sizing: border-box;">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                    ${!unavailable ? `
                        <button onclick="openFoodModal(${item.id})" style="background: rgba(255, 220, 220, 0.95); color: #e63946; border: 2px solid rgba(230, 57, 70, 0.2); padding: 0.5rem 1.8rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem;">Add</button>
                    ` : '<span style="color: #666; font-size: 0.8rem; font-weight: 500;">•</span>'}
                </div>
            `;
        } else {
            // Desktop: Card style but with same list appearance
            row.style.cssText = `display: flex; gap: 1rem; padding: 1.2rem; background: rgba(20, 20, 20, 0.8); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); ${unavailable ? 'opacity: 0.6;' : ''}`;
            row.innerHTML = `
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
                    <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem; color: ${unavailable ? '#888' : '#fff'}; ${unavailable ? 'text-decoration: line-through;' : ''}">${item.name}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-bottom: 0.8rem; line-height: 1.4; flex: 1;">${item.desc}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; font-size: 1.05rem; color: ${unavailable ? '#888' : '#fff'};">${formatPrice(item.price)}</span>
                        ${unavailable ? '<span style="color: #ef4444; font-size: 0.7rem; font-weight: 600; background: rgba(239,68,68,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">NOT AVAILABLE</span>' : ''}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <div style="width: 120px; height: 120px; background: #f5f5f5; border-radius: 12px; overflow: hidden; position: relative; ${unavailable ? 'filter: grayscale(50%);' : ''}">
                        ${imageDisplay}
                        <button onclick="toggleFavorite(${item.id}, event)" style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); border: none; width: 30px; height: 30px; min-width: 30px; min-height: 30px; max-width: 30px; max-height: 30px; border-radius: 50%; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; aspect-ratio: 1/1; box-sizing: border-box;">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                    ${!unavailable ? `
                        <button onclick="openFoodModal(${item.id})" style="background: rgba(255, 220, 220, 0.95); color: #e63946; border: 2px solid rgba(230, 57, 70, 0.2); padding: 0.5rem 1.8rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.background='#e63946'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 220, 220, 0.95)'; this.style.color='#e63946';">Add</button>
                    ` : '<span style="color: #666; font-size: 0.8rem; font-weight: 500;">•</span>'}
                </div>
            `;
        }
        menuGrid.appendChild(row);
    });
}

// Handle window resize for menu display
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentCategory) {
            displayMenu(currentCategory);
        }
    }, 150);
});

function filterCategory(category) {
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) {
        const catItem = event.target.closest('.category-item');
        if (catItem) catItem.classList.add('active');
    }
    displayMenu(category);
}

function renderCategories() {
    const categoriesContainer = document.querySelector('.categories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    Object.entries(categories).forEach(([key, cat], index) => {
        // Only show categories that have items
        if (!menuData[key] || menuData[key].length === 0) return;
        
        // Determine category image display
        const catImageDisplay = cat.image 
            ? `<img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` 
            : cat.icon;
        
        const catEl = document.createElement('div');
        catEl.className = `category-item ${index === 0 ? 'active' : ''}`;
        catEl.onclick = () => filterCategory(key);
        catEl.innerHTML = `
            <div class="category-icon">${catImageDisplay}</div>
            <div class="category-name">${cat.name}</div>
        `;
        categoriesContainer.appendChild(catEl);
    });
}

// ========================================
// FOOD MODAL FUNCTIONS
// ========================================
function findFood(foodId) {
    for (let cat of Object.keys(menuData)) {
        const found = menuData[cat].find(item => item.id === foodId);
        if (found) return found;
    }
    return null;
}

function openFoodModal(foodId) {
    selectedFood = findFood(foodId);
    if (!selectedFood) return;
    
    // Check if food is available
    if (selectedFood.available === false) {
        alert('❌ Sorry, this item is currently not available.');
        return;
    }
    
    quantity = 1;
    selectedCustomizations = [];
    
    document.getElementById('modalFoodName').textContent = selectedFood.name;
    
    // Show image or icon
    const iconContainer = document.getElementById('modalFoodIcon');
    if (selectedFood.image) {
        iconContainer.innerHTML = `<img src="${selectedFood.image}" alt="${selectedFood.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        iconContainer.innerHTML = `<span style="font-size: 4rem;">${selectedFood.icon}</span>`;
    }
    
    document.getElementById('modalFoodDesc').textContent = selectedFood.desc;
    document.getElementById('modalFoodPrice').textContent = formatPrice(selectedFood.price);
    document.getElementById('quantity').textContent = '1';
    document.getElementById('specialInstructions').value = '';
    
    // Customization options with circular checkboxes
    const customSection = document.getElementById('customizationSection');
    const customOptions = document.getElementById('customOptions');
    
    if (selectedFood.options && selectedFood.options.length > 0) {
        customSection.style.display = 'block';
        customOptions.innerHTML = selectedFood.options.map((opt, i) => `
            <div onclick="toggleCustomizationCircle(${i})" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <span style="font-size: 0.95rem;">${opt.name}</span>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                        ${opt.price > 0 ? '+' + formatPrice(opt.price) : 'FREE'}
                    </span>
                    <div id="optCircle_${i}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(230,57,70,0.5); display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    </div>
                </div>
                <input type="checkbox" id="opt_${i}" style="display: none;">
            </div>
        `).join('');
    } else {
        customSection.style.display = 'none';
    }
    
    updateTotalPrice();
    openModal('foodModal');
}

function toggleCustomizationCircle(index) {
    const checkbox = document.getElementById('opt_' + index);
    const circle = document.getElementById('optCircle_' + index);
    
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        circle.style.background = '#e63946';
        circle.style.borderColor = '#e63946';
        circle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        if (!selectedCustomizations.includes(index)) {
            selectedCustomizations.push(index);
        }
    } else {
        circle.style.background = 'transparent';
        circle.style.borderColor = 'rgba(230,57,70,0.5)';
        circle.innerHTML = '';
        selectedCustomizations = selectedCustomizations.filter(i => i !== index);
    }
    updateTotalPrice();
}

// Backwards compatible alias
function toggleCustomization(index) {
    toggleCustomizationCircle(index);
}

function changeQuantity(delta) {
    quantity = Math.max(1, Math.min(20, quantity + delta));
    document.getElementById('quantity').textContent = quantity;
    updateTotalPrice();
}

function updateTotalPrice() {
    if (!selectedFood) return;
    
    let total = selectedFood.price;
    
    if (selectedFood.options) {
        selectedCustomizations.forEach(i => {
            if (selectedFood.options[i]) {
                total += selectedFood.options[i].price;
            }
        });
    }
    
    total *= quantity;
    document.getElementById('totalPrice').textContent = formatPrice(total);
}

function addToCart() {
    if (!currentUser) {
        alert('⚠️ Please login to add items to cart');
        showLogin();
        return;
    }
    
    if (!selectedFood) return;
    
    let itemPrice = selectedFood.price;
    const extras = [];
    
    if (selectedFood.options) {
        selectedCustomizations.forEach(i => {
            if (selectedFood.options[i]) {
                extras.push(selectedFood.options[i].name);
                itemPrice += selectedFood.options[i].price;
            }
        });
    }
    
    const cartItem = {
        id: selectedFood.id,
        name: selectedFood.name,
        icon: selectedFood.icon,
        basePrice: selectedFood.price,
        extras: extras,
        finalPrice: itemPrice,
        quantity: quantity,
        instructions: document.getElementById('specialInstructions').value,
        addedAt: new Date().toISOString()
    };
    
    // Check if similar item exists
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        JSON.stringify(item.extras) === JSON.stringify(cartItem.extras) &&
        item.instructions === cartItem.instructions
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    saveCart();
    updateCartBadge();
    closeModal('foodModal');
    
    playNotificationSound();
    alert(`✅ Added to cart!\n\n${quantity}x ${selectedFood.name}\n${extras.length > 0 ? 'Extras: ' + extras.join(', ') : ''}`);
}

// ========================================
// FAVORITES FUNCTIONS
// ========================================
function toggleFavorite(foodId, event) {
    event.stopPropagation();
    
    if (!currentUser) {
        alert('⚠️ Please login to add favorites');
        showLogin();
        return;
    }
    
    if (!userFavorites[currentUser.email]) {
        userFavorites[currentUser.email] = [];
    }
    
    const favorites = userFavorites[currentUser.email];
    const index = favorites.indexOf(foodId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        event.target.innerHTML = '🤍';
        event.target.classList.remove('active');
    } else {
        favorites.push(foodId);
        event.target.innerHTML = '❤️';
        event.target.classList.add('active');
    }
    
    localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    updateFavoritesBadge();
}

function showFavorites() {
    if (!currentUser) {
        alert('⚠️ Please login to view favorites');
        showLogin();
        return;
    }
    
    const modal = document.getElementById('favoritesModal');
    const content = document.getElementById('favoritesContent');
    
    if (!modal || !content) return;
    
    const favIds = userFavorites[currentUser.email] || [];
    
    // Get existing items only (clean up deleted ones)
    const favItems = [];
    const validIds = [];
    for (let cat of Object.keys(menuData)) {
        menuData[cat].forEach(item => {
            if (favIds.includes(item.id)) {
                favItems.push(item);
                validIds.push(item.id);
            }
        });
    }
    
    // Clean up favorites if items were deleted
    if (validIds.length !== favIds.length) {
        userFavorites[currentUser.email] = validIds;
        localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
        updateFavoritesBadge();
    }
    
    if (favItems.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">
                <div style="font-size: 4rem;">💝</div>
                <p>No favorites yet</p>
                <p style="font-size: 0.9rem;">Tap ❤️ on items to add them here</p>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                ${favItems.map(item => {
                    const isUnavailable = item.available === false;
                    const imageDisplay = item.image 
                        ? `<img src="${item.image}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 10px;">` 
                        : `<span style="font-size: 2rem;">${item.icon}</span>`;
                    
                    return `
                    <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); ${isUnavailable ? 'opacity: 0.5;' : ''}">
                        <div style="width: 55px; height: 55px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${imageDisplay}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 0.95rem; ${isUnavailable ? 'text-decoration: line-through;' : ''}">${item.name}</div>
                            <div style="color: #e63946; font-weight: 700; font-size: 1rem;">${formatPrice(item.price)}</div>
                            ${isUnavailable ? '<div style="color: #ef4444; font-size: 0.7rem; font-weight: 600;">NOT AVAILABLE</div>' : ''}
                        </div>
                        ${isUnavailable 
                            ? '<span style="color: #ef4444; font-size: 0.75rem; padding: 0.4rem 0.8rem;">N/A</span>'
                            : `<button onclick="openFoodModal(${item.id}); closeModal('favoritesModal');" style="background: linear-gradient(135deg, #e63946, #c1121f); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; white-space: nowrap; flex-shrink: 0;">Add</button>`
                        }
                    </div>
                `}).join('')}
            </div>
        `;
    }
    
    openModal('favoritesModal');
}

// ========================================
// CART FUNCTIONS
// ========================================
function showCart() {
    if (!currentUser) {
        alert('⚠️ Please login to view cart');
        showLogin();
        return;
    }
    
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!modal || !cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">
                <div style="font-size: 4rem;">🛒</div>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem;">Add some delicious items!</p>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '£0.00';
    } else {
        let total = 0;
        cartItems.innerHTML = cart.map((item, index) => {
            const itemTotal = item.finalPrice * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <span>${item.icon} ${item.name} x${item.quantity}</span>
                        <span style="color: #ff6b6b;">${formatPrice(itemTotal)}</span>
                    </div>
                    ${item.extras.length > 0 ? `<div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem;">+ ${item.extras.join(', ')}</div>` : ''}
                    ${item.instructions ? `<div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); font-style: italic;">Note: ${item.instructions}</div>` : ''}
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.8rem;">
                        <button onclick="updateCartItem(${index}, -1)" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer;">-</button>
                        <button onclick="updateCartItem(${index}, 1)" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer;">+</button>
                        <button onclick="removeCartItem(${index})" style="background: rgba(239,68,68,0.2); border: none; color: #ef4444; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer; margin-left: auto;">🗑️ Remove</button>
                    </div>
                </div>
            `;
        }).join('');
        
        if (cartTotal) cartTotal.textContent = formatPrice(total);
    }
    
    openModal('cartModal');
}

function updateCartItem(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartBadge();
        showCart();
    }
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    showCart();
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('❌ Your cart is empty!');
        return;
    }
    
    // Check if restaurant is open
    const status = getRestaurantStatus();
    if (!status.open) {
        alert(`⚠️ Sorry, we're not accepting orders right now.\n\n${status.message}\n\nOpening hours: 11:00 - 23:00\nLast orders: 22:30`);
        return;
    }
    
    if (!currentUser) {
        alert('❌ Please login first');
        showLogin();
        return;
    }
    
    // Check if user has an active order
    const activeOrder = pendingOrders.find(o => 
        o.userId === currentUser.email && 
        ['pending', 'accepted', 'waiting_driver', 'out_for_delivery'].includes(o.status)
    );
    
    if (activeOrder) {
        alert(`⚠️ You already have an active order!\n\nOrder #${activeOrder.id}\nStatus: ${activeOrder.status.replace('_', ' ').toUpperCase()}\n\nPlease wait until your current order is delivered before placing a new one.`);
        return;
    }
    
    if (!currentUser.address && !selectedLocation) {
        alert('❌ Please set your delivery address first');
        pickLocation();
        return;
    }
    
    closeModal('cartModal');
    
    // Show location confirmation modal first
    showLocationConfirmation();
}

// Check if user can order (no active orders)
function userCanOrder() {
    if (!currentUser) return false;
    
    const activeOrder = pendingOrders.find(o => 
        o.userId === currentUser.email && 
        ['pending', 'accepted', 'waiting_driver', 'out_for_delivery'].includes(o.status)
    );
    
    return !activeOrder;
}

function showLocationConfirmation() {
    const modal = document.getElementById('locationConfirmModal');
    const addressDisplay = document.getElementById('confirmLocationAddress');
    
    if (modal && addressDisplay) {
        const currentAddress = selectedLocation?.address || currentUser.address || 'No address set';
        addressDisplay.textContent = currentAddress;
        openModal('locationConfirmModal');
    }
}

function confirmCurrentLocation() {
    closeModal('locationConfirmModal');
    openCheckoutModal();
}

function changeDeliveryLocation() {
    closeModal('locationConfirmModal');
    pickLocation();
}

function openCheckoutModal() {
    // Calculate totals
    let subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    let deliveryFee = 0;
    
    if (selectedLocation) {
        const distance = calculateDistance(
            UK_CONFIG.restaurant.lat,
            UK_CONFIG.restaurant.lng,
            selectedLocation.lat,
            selectedLocation.lng
        );
        const deliveryInfo = getDeliveryCost(distance);
        if (!deliveryInfo.available) {
            alert(deliveryInfo.message);
            return;
        }
        deliveryFee = deliveryInfo.cost;
    }
    
    const total = subtotal + deliveryFee;
    
    // Populate checkout modal
    const checkoutAddress = document.getElementById('checkoutAddress');
    const checkoutItems = document.getElementById('checkoutItems');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (checkoutAddress) {
        checkoutAddress.textContent = selectedLocation?.address || currentUser.address || 'No address set';
    }
    
    if (checkoutItems) {
        checkoutItems.innerHTML = `
            ${cart.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${item.icon} ${item.name} x${item.quantity}</span>
                    <span>${formatPrice(item.finalPrice * item.quantity)}</span>
                </div>
            `).join('')}
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Subtotal</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Delivery</span>
                    <span>${deliveryFee > 0 ? formatPrice(deliveryFee) : 'FREE'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem; margin-top: 0.5rem; color: #ff6b6b;">
                    <span>Total</span>
                    <span>${formatPrice(total)}</span>
                </div>
            </div>
        `;
    }
    
    if (paymentTotal) {
        paymentTotal.textContent = formatPrice(total);
    }
    
    openModal('checkoutModal');
}

function handlePayment(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!paymentMethod) {
        alert('❌ Please select a payment method');
        return false;
    }
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('paymentCardNumber').value;
        const cardName = document.getElementById('paymentCardName').value;
        const expiry = document.getElementById('paymentExpiry').value;
        const cvv = document.getElementById('paymentCVV').value;
        
        if (!isValidCardNumber(cardNumber)) {
            alert('❌ Invalid card number');
            return false;
        }
        if (!cardName || cardName.length < 2) {
            alert('❌ Please enter name on card');
            return false;
        }
        if (!isValidExpiry(expiry)) {
            alert('❌ Invalid expiry date');
            return false;
        }
        if (!isValidCVV(cvv)) {
            alert('❌ Invalid CVV');
            return false;
        }
    }
    
    // Create order
    const orderId = 'ORD-' + Date.now();
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    let deliveryFee = 0;
    
    // Calculate distance
    let distance = 0;
    if (selectedLocation) {
        distance = calculateDistance(
            UK_CONFIG.restaurant.lat,
            UK_CONFIG.restaurant.lng,
            selectedLocation.lat,
            selectedLocation.lng
        );
        deliveryFee = getDeliveryCost(distance).cost;
    }
    
    const order = {
        id: orderId,
        userId: currentUser.email,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        items: [...cart],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: subtotal + deliveryFee,
        address: selectedLocation?.address || currentUser.address,
        deliveryLocation: selectedLocation, // Save location for distance calculation
        distance: distance, // Save distance in miles
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save order
    orderHistory.push(order);
    pendingOrders.push(order);
    
    // Add notification
    addNotification(currentUser.email, {
        type: 'order_placed',
        title: '📦 Order Placed!',
        message: `Your order #${orderId} has been placed successfully.`,
        orderId: orderId
    });
    
    saveData();
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    updateOrdersBadge();
    
    // Force close checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
        checkoutModal.classList.remove('active');
    }
    
    playNotificationSound();
    
    alert(`✅ Order Placed Successfully!\n\nOrder ID: ${orderId}\nTotal: ${formatPrice(order.total)}\n\nYou will receive updates on your order status.`);
    
    return false;
}

// ========================================
// NOTIFICATION FUNCTIONS
// ========================================
function addNotification(userId, notification) {
    if (!userNotifications[userId]) {
        userNotifications[userId] = [];
    }
    
    userNotifications[userId].unshift({
        ...notification,
        id: 'NOTIF-' + Date.now(),
        read: false,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    updateNotificationBadge();
}

function showNotifications() {
    if (!currentUser) {
        alert('⚠️ Please login to view notifications');
        showLogin();
        return;
    }
    
    const modal = document.getElementById('notificationsModal');
    const content = document.getElementById('notificationsContent');
    
    if (!modal || !content) return;
    
    const notifications = userNotifications[currentUser.email] || [];
    
    // Mark all as read
    notifications.forEach(n => n.read = true);
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    updateNotificationBadge();
    
    if (notifications.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">
                <div style="font-size: 4rem;">🔔</div>
                <p>No notifications yet</p>
            </div>
        `;
    } else {
        content.innerHTML = notifications.map(n => {
            // Check if order still exists and its current status
            const order = pendingOrders.find(o => o.id === n.orderId) || orderHistory.find(o => o.id === n.orderId);
            const isStillDelivering = order && order.status === 'out_for_delivery';
            const isAlreadyRated = order && order.driverRated === true;
            
            // Driver on way notification - only show track if still delivering
            if (n.type === 'driver_on_way') {
                if (!isStillDelivering) {
                    // Order already delivered - show simple completed message
                    return `
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; margin-bottom: 0.8rem; border-left: 3px solid #10b981;">
                            <div style="font-weight: 600; margin-bottom: 0.3rem;">✅ Order Delivered</div>
                            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Your order #${n.orderId} has been delivered.</div>
                            <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.5rem;">${new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                    `;
                }
                return `
                    <div style="background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2)); padding: 1.2rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid rgba(16,185,129,0.4);">
                        <div style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; color: #10b981;">${n.title}</div>
                        <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem;">
                            <div style="margin-bottom: 0.5rem;">🚗 <strong>${n.driverName || 'Driver'}</strong></div>
                            ${n.driverPhone ? `<div style="margin-bottom: 0.5rem;">📞 <a href="tel:${n.driverPhone}" style="color: #3b82f6;">${n.driverPhone}</a></div>` : ''}
                            ${n.estimatedTime ? `<div style="color: #f59e0b; font-weight: 600; font-size: 1.1rem;">⏱️ Arriving in ~${n.estimatedTime} minutes</div>` : ''}
                        </div>
                        <button onclick="trackDriver('${n.orderId}'); closeModal('notificationsModal');" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.5rem;">
                            📍 Track Driver Live
                        </button>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.5rem;">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                `;
            }
            
            // Order completed notification - only show rate button if not already rated
            if (n.type === 'order_completed') {
                return `
                    <div style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2)); padding: 1.2rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid rgba(59,130,246,0.4);">
                        <div style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; color: #3b82f6;">${n.title}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">${n.message}</div>
                        ${isAlreadyRated ? `<div style="color: #f59e0b; font-size: 0.85rem;">⭐ You rated this delivery ${order.driverRating}/5</div>` : ''}
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.5rem;">${new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                `;
            }
            
            // Default notification style
            const borderColor = n.type === 'order_accepted' ? '#10b981' : 
                               n.type === 'order_rejected' ? '#ef4444' : 
                               n.type === 'order_completed' ? '#3b82f6' : '#ff6b6b';
            
            return `
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; margin-bottom: 0.8rem; border-left: 3px solid ${borderColor};">
                    <div style="font-weight: 600; margin-bottom: 0.3rem;">${n.title}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; white-space: pre-line;">${n.message}</div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.5rem;">${new Date(n.createdAt).toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }
    
    openModal('notificationsModal');
}

// ========================================
// ACCOUNT FUNCTIONS
// ========================================
function showAccount() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const modal = document.getElementById('accountModal');
    const content = document.getElementById('accountContent');
    
    if (!modal || !content) return;
    
    const userOrders = orderHistory.filter(o => o.userId === currentUser.email);
    const activeOrders = pendingOrders.filter(o => o.userId === currentUser.email && o.status === 'out_for_delivery');
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Profile picture display
    const profilePic = currentUser.profilePicture 
        ? `<img src="${currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">`
        : '👤';
    
    content.innerHTML = `
        <div style="background: linear-gradient(135deg, #e63946, #c1121f); padding: 1.5rem; border-radius: 15px; text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 90px; height: 90px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 0.8rem; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; overflow: hidden; border: 3px solid rgba(255,255,255,0.3);">
                ${profilePic}
            </div>
            <h3 style="margin: 0; color: white; font-size: 1.2rem;">${currentUser.name}</h3>
            <p style="margin: 0.3rem 0 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">${currentUser.email}</p>
            ${currentUser.dob ? `<p style="margin: 0.2rem 0 0; color: rgba(255,255,255,0.7); font-size: 0.85rem;">DOB: ${new Date(currentUser.dob).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem;">
            <div style="background: rgba(42,157,143,0.15); padding: 0.8rem; border-radius: 10px; text-align: center; border: 1px solid rgba(42,157,143,0.3);">
                <div style="font-size: 1.3rem; font-weight: 700; color: #2a9d8f;">${userOrders.length}</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">Orders</div>
            </div>
            <div style="background: rgba(230,57,70,0.15); padding: 0.8rem; border-radius: 10px; text-align: center; border: 1px solid rgba(230,57,70,0.3);">
                <div style="font-size: 1.3rem; font-weight: 700; color: #e63946;">${formatPrice(totalSpent)}</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">Total Spent</div>
            </div>
        </div>
        
        <!-- User Details -->
        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; margin-bottom: 1.2rem; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                <span style="color: rgba(255,255,255,0.6);">📞 Phone</span>
                <span>${currentUser.phone || 'Not set'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                <span style="color: rgba(255,255,255,0.6);">📍 Address</span>
                <span style="text-align: right; max-width: 60%;">${currentUser.address || 'Not set'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span style="color: rgba(255,255,255,0.6);">📦 Member</span>
                <span>${currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
        
        <!-- Active Deliveries -->
        ${activeOrders.length > 0 ? `
            <div style="background: linear-gradient(135deg, rgba(42,157,143,0.2), rgba(42,157,143,0.1)); padding: 1rem; border-radius: 12px; margin-bottom: 1.2rem; border: 2px solid rgba(42,157,143,0.4);">
                <h4 style="margin: 0 0 0.8rem 0; color: #2a9d8f; font-size: 0.95rem;">🚗 Active Delivery</h4>
                ${activeOrders.map(o => `
                    <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; margin-bottom: 0.5rem;">
                        <div style="font-weight: 600; margin-bottom: 0.3rem;">#${o.id}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Driver: ${o.driverName || 'Assigned'}</div>
                        ${o.estimatedTime ? `<div style="font-size: 0.85rem; color: #f4a261;">ETA: ~${o.estimatedTime} mins</div>` : ''}
                    </div>
                    <button onclick="trackDriver('${o.id}')" style="background: linear-gradient(45deg, #2a9d8f, #218373); color: white; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; font-size: 0.9rem;">
                        📍 Track Driver Live
                    </button>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div style="display: grid; gap: 0.6rem;">
            <button onclick="openEditProfile()" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.9rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
                ✏️ Edit Profile
            </button>
            <button onclick="openChangeEmail()" style="background: linear-gradient(45deg, #f4a261, #e76f51); color: white; border: none; padding: 0.9rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
                📧 Change Email
            </button>
            <button onclick="openChangePassword()" style="background: linear-gradient(45deg, #ef4444, #dc2626); color: white; border: none; padding: 0.9rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
                🔙 Change Password
            </button>
        </div>
        
        <button onclick="logout()" style="background: rgba(239,68,68,0.1); color: #ef4444; border: 2px solid #ef4444; padding: 0.9rem; border-radius: 10px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 1rem; font-size: 0.95rem;">
            🚪 Logout
        </button>
        
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; text-align: center; margin-bottom: 0.8rem;">Danger Zone</p>
            <button onclick="confirmDeleteAccount()" style="background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 0.7rem; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%; font-size: 0.85rem;">
                🗑️ Delete My Account
            </button>
        </div>
    `;
    
    openModal('accountModal');
}

// ========================================
// ========================================
// ORDER HISTORY (Separate from Account)
// ========================================
function showOrderHistory() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const modal = document.getElementById('orderHistoryModal');
    const content = document.getElementById('orderHistoryContent');
    
    if (!modal || !content) return;
    
    const userOrders = [...orderHistory.filter(o => o.userId === currentUser.email)];
    const pendingUserOrders = pendingOrders.filter(o => o.userId === currentUser.email);
    const allOrders = [...pendingUserOrders, ...userOrders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    if (allOrders.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <p>No orders yet</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Your order history will appear here</p>
            </div>
        `;
    } else {
        content.innerHTML = allOrders.map(o => {
            const statusColor = o.status === 'completed' ? '#2a9d8f' : 
                               o.status === 'pending' ? '#f4a261' : 
                               o.status === 'out_for_delivery' ? '#3b82f6' : 
                               o.status === 'accepted' || o.status === 'waiting_driver' ? '#2a9d8f' : '#ef4444';
            
            const statusText = o.status.replace(/_/g, ' ').toUpperCase();
            const paymentIcon = o.paymentMethod === 'cash' ? '💷' : o.paymentMethod === 'applepay' ? '🍽' : '💳';
            
            // Get driver info for active deliveries only
            const driver = o.status === 'out_for_delivery' && o.driverId ? window.driverSystem.get(o.driverId) : null;
            
            return `
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 0.8rem; border-left: 3px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                        <span style="font-weight: 700; font-size: 0.95rem;">#${o.id}</span>
                        <span style="color: ${statusColor}; font-size: 0.75rem; font-weight: 600; background: ${statusColor}20; padding: 0.2rem 0.6rem; border-radius: 10px;">${statusText}</span>
                    </div>
                    
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem;">
                        ${o.items.map(i => `${i.name}`).join(', ')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${o.items.length} items</span>
                        <span style="font-weight: 700; color: #2a9d8f;">${formatPrice(o.total)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${new Date(o.createdAt).toLocaleString()}</span>
                        <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${paymentIcon} ${o.paymentMethod || 'N/A'}</span>
                    </div>
                    
                    ${o.driverRated ? `<div style="font-size: 0.75rem; color: #f4a261; margin-top: 0.4rem;">⭐ Rated ${o.driverRating}/5 ${o.driverRatingComment ? '- "' + o.driverRatingComment + '"' : ''}</div>` : ''}
                    
                    ${o.status === 'out_for_delivery' && driver ? `
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-top: 0.8rem; padding: 0.8rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
                            ${driver.profilePic ? `<img src="${driver.profilePic}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">` : '<div style="width: 45px; height: 45px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🚗</div>'}
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 0.9rem;">${driver.name || o.driverName || 'Driver'}</div>
                                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">On the way to you</div>
                            </div>
                        </div>
                        <button onclick="trackDriver('${o.id}'); closeModal('orderHistoryModal');" style="background: linear-gradient(45deg, #2a9d8f, #218373); color: white; border: none; padding: 0.7rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.5rem; font-size: 0.9rem;">
                            📍 Track Driver Live
                        </button>
                    ` : ''}
                    
                    ${o.status === 'completed' && o.driverId && !o.driverRated ? `
                        <button onclick="openDriverRating('${o.id}', '${o.driverId}', '${o.driverName || 'Driver'}'); closeModal('orderHistoryModal');" style="background: linear-gradient(45deg, #f4a261, #e76f51); color: white; border: none; padding: 0.7rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.8rem; font-size: 0.9rem;">
                            ⭐ Rate Driver
                        </button>
                    ` : ''}
                    
                    <button onclick="reorderFromHistory('${o.id}'); closeModal('orderHistoryModal');" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.6rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.5rem; font-size: 0.85rem;">
                        🔞 Reorder
                    </button>
                </div>
            `;
        }).join('');
    }
    
    openModal('orderHistoryModal');
}

function updateOrdersBadge() {
    const badge = document.getElementById('ordersBadge');
    if (badge && currentUser) {
        const activeOrders = pendingOrders.filter(o => 
            o.userId === currentUser.email && 
            ['pending', 'accepted', 'waiting_driver', 'out_for_delivery'].includes(o.status)
        ).length;
        badge.textContent = activeOrders;
        badge.style.display = activeOrders > 0 ? 'flex' : 'none';
    }
}

// ========================================
// REORDER FUNCTIONS
// ========================================
let reorderData = null;

function reorderFromHistory(orderId) {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) {
        alert('❌ Order not found');
        return;
    }
    
    reorderData = order;
    
    // Show reorder modal
    const modal = document.getElementById('reorderModal');
    const itemsList = document.getElementById('reorderItemsList');
    const totalDisplay = document.getElementById('reorderTotal');
    
    if (modal && itemsList && totalDisplay) {
        itemsList.innerHTML = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span>${item.icon} ${item.name} x${item.quantity}</span>
                <span>${formatPrice(item.finalPrice * item.quantity)}</span>
            </div>
        `).join('');
        
        totalDisplay.querySelector('span:last-child').textContent = formatPrice(order.total);
        
        closeModal('accountModal');
        openModal('reorderModal');
    }
}

function confirmReorder() {
    if (!reorderData) return;
    
    // Check if any items are unavailable
    const unavailableItems = [];
    reorderData.items.forEach(item => {
        const currentItem = findFood(item.id);
        if (!currentItem || currentItem.available === false) {
            unavailableItems.push(item.name);
        }
    });
    
    if (unavailableItems.length > 0) {
        alert(`❌ Some items are no longer available:\n\n${unavailableItems.join('\n')}\n\nPlease order from the menu.`);
        closeModal('reorderModal');
        return;
    }
    
    // Clear current cart
    cart = [];
    
    // Add all items from the order to cart
    reorderData.items.forEach(item => {
        cart.push({
            ...item,
            addedAt: new Date().toISOString()
        });
    });
    
    // Save cart
    if (currentUser) {
        localStorage.setItem('cart_' + currentUser.email, JSON.stringify(cart));
    }
    
    updateCartBadge();
    
    closeModal('reorderModal');
    
    // Show location confirmation
    showLocationConfirmation();
}

// ========================================
// PROFILE EDITING FUNCTIONS
// ========================================
function openEditProfile() {
    closeModal('accountModal');
    
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    
    // Pre-fill form with current data
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editDOB').value = currentUser.dob || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editAddress').value = currentUser.address || '';
    
    // Show profile picture
    const preview = document.getElementById('profilePicPreview');
    if (currentUser.profilePicture) {
        preview.innerHTML = `<img src="${currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        preview.innerHTML = '👤';
    }
    
    openModal('editProfileModal');
}

function previewProfilePic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('profilePicPreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            // Store temporarily
            preview.dataset.newPic = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProfileChanges(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const name = document.getElementById('editName').value.trim();
    const dob = document.getElementById('editDOB').value;
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const preview = document.getElementById('profilePicPreview');
    const newPic = preview.dataset.newPic;
    
    if (!name) {
        alert('❌ Name is required');
        return false;
    }
    
    // Update current user
    currentUser.name = name;
    currentUser.dob = dob || null;
    currentUser.phone = phone;
    currentUser.address = address || (selectedLocation ? selectedLocation.address : currentUser.address);
    
    // Update location if selected
    if (selectedLocation) {
        currentUser.location = selectedLocation;
    }
    
    if (newPic) {
        currentUser.profilePicture = newPic;
    }
    
    // Update in database
    const userIndex = userDatabase.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        userDatabase[userIndex] = { ...userDatabase[userIndex], ...currentUser };
    }
    
    // Save
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    saveData();
    
    // Force close modal
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    
    // Show success and refresh account
    alert('✅ Profile updated successfully!');
    showAccount();
    
    return false;
}

function openChangeEmail() {
    closeModal('accountModal');
    
    const modal = document.getElementById('changeEmailModal');
    if (modal) {
        // Clear form
        document.getElementById('emailCurrentPassword').value = '';
        document.getElementById('newEmail').value = '';
        document.getElementById('confirmNewEmail').value = '';
        
        openModal('changeEmailModal');
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    closeModal('editProfileModal');
    
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        // Clear form
        document.getElementById('cpCurrentPassword').value = '';
        document.getElementById('cpNewPassword').value = '';
        document.getElementById('cpConfirmPassword').value = '';
        
        openModal('changePasswordModal');
    }
}

function handleChangePassword(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert('❌ Please login first');
        return;
    }
    
    const currentPassword = document.getElementById('cpCurrentPassword').value;
    const newPassword = document.getElementById('cpNewPassword').value;
    const confirmPassword = document.getElementById('cpConfirmPassword').value;
    
    // Verify current password
    if (currentPassword !== currentUser.password) {
        alert('❌ Current password is incorrect');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        alert('❌ New password must be at least 6 characters');
        return;
    }
    
    // Check match
    if (newPassword !== confirmPassword) {
        alert('❌ New passwords do not match');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    
    // Update in database
    const userIndex = userDatabase.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        userDatabase[userIndex].password = newPassword;
    }
    
    // Save
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    saveData();
    
    closeModal('changePasswordModal');
    alert('✅ Password changed successfully!');
}

// Open forgot password from change password modal
function openForgotPasswordFromChangePassword() {
    closeModal('changePasswordModal');
    
    // Pre-fill email if user is logged in
    const forgotEmailInput = document.getElementById('forgotPasswordEmail');
    if (forgotEmailInput && currentUser) {
        forgotEmailInput.value = currentUser.email;
    }
    
    // Show login modal with forgot password section
    openModal('loginModal');
    showForgotPasswordSection(true);
}

function verifyAndChangeEmail(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('emailCurrentPassword').value;
    const newEmail = document.getElementById('newEmail').value.trim();
    const confirmEmail = document.getElementById('confirmNewEmail').value.trim();
    
    // Verify current password
    if (currentPassword !== currentUser.password) {
        alert('❌ Current password is incorrect');
        return;
    }
    
    // Check email match
    if (newEmail !== confirmEmail) {
        alert('❌ Emails do not match');
        return;
    }
    
    // Check if email already exists
    if (userDatabase.some(u => u.email === newEmail && u.email !== currentUser.email)) {
        alert('❌ This email is already registered');
        return;
    }
    
    // Update email
    const oldEmail = currentUser.email;
    
    // Update in database
    const userIndex = userDatabase.findIndex(u => u.email === oldEmail);
    if (userIndex !== -1) {
        userDatabase[userIndex].email = newEmail;
    }
    
    // Update current user
    currentUser.email = newEmail;
    
    // Update related data (favorites, notifications, cart)
    if (userFavorites[oldEmail]) {
        userFavorites[newEmail] = userFavorites[oldEmail];
        delete userFavorites[oldEmail];
    }
    
    if (userNotifications[oldEmail]) {
        userNotifications[newEmail] = userNotifications[oldEmail];
        delete userNotifications[oldEmail];
    }
    
    const oldCart = localStorage.getItem('cart_' + oldEmail);
    if (oldCart) {
        localStorage.setItem('cart_' + newEmail, oldCart);
        localStorage.removeItem('cart_' + oldEmail);
    }
    
    // Save all changes
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    saveData();
    
    closeModal('changeEmailModal');
    showAccount();
    
    alert('✅ Email changed successfully to: ' + newEmail);
}

function openChangePassword() {
    closeModal('accountModal');
    
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
        openModal('changePasswordModal');
    }
}

function verifyAndChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Verify current password
    if (currentPassword !== currentUser.password) {
        alert('❌ Current password is incorrect');
        return;
    }
    
    // Check password length
    if (newPassword.length < 6) {
        alert('❌ New password must be at least 6 characters');
        return;
    }
    
    // Check password match
    if (newPassword !== confirmPassword) {
        alert('❌ New passwords do not match');
        return;
    }
    
    // Check if new password is same as old
    if (newPassword === currentPassword) {
        alert('❌ New password must be different from current password');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    
    // Update in database
    const userIndex = userDatabase.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        userDatabase[userIndex].password = newPassword;
    }
    
    // Save
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    saveData();
    
    closeModal('changePasswordModal');
    showAccount();
    
    alert('✅ Password changed successfully!');
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    currentUser = null;
    cart = [];
    localStorage.removeItem('currentUser');
    updateHeaderForLoggedInUser();
    updateCartBadge();
    updateFavoritesBadge();
    updateNotificationBadge();
    closeModal('accountModal');
    
    alert('✅ Logged out successfully');
}

// ========================================
// AUTH FUNCTIONS
// ========================================
function showLogin() {
    if (isSignUpMode) toggleAuthMode();
    openModal('loginModal');
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    
    const title = document.getElementById('authTitle');
    const nameGroup = document.getElementById('nameGroup');
    const phoneGroup = document.getElementById('phoneGroup');
    const ageGroup = document.getElementById('ageGroup');
    const addressGroup = document.getElementById('addressGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const forgotLink = document.getElementById('forgotPasswordLink');
    
    if (isSignUpMode) {
        if (title) title.textContent = '📝 Create Account';
        if (nameGroup) nameGroup.style.display = 'block';
        if (phoneGroup) phoneGroup.style.display = 'block';
        if (ageGroup) ageGroup.style.display = 'block';
        if (addressGroup) addressGroup.style.display = 'block';
        if (submitBtn) submitBtn.textContent = 'Sign Up';
        if (toggleText) toggleText.textContent = 'Already have an account?';
        if (forgotLink) forgotLink.style.display = 'none';
    } else {
        if (title) title.textContent = '🔐 Login';
        if (nameGroup) nameGroup.style.display = 'none';
        if (phoneGroup) phoneGroup.style.display = 'none';
        if (ageGroup) ageGroup.style.display = 'none';
        if (addressGroup) addressGroup.style.display = 'none';
        if (submitBtn) submitBtn.textContent = 'Login';
        if (toggleText) toggleText.textContent = "Don't have an account?";
        if (forgotLink) forgotLink.style.display = 'block';
    }
}

// Forgot Password Functions
function showForgotPasswordSection(show) {
    const authSection = document.getElementById('authFormSection');
    const forgotSection = document.getElementById('forgotPasswordSection');
    const title = document.getElementById('authTitle');
    
    if (show) {
        if (authSection) authSection.style.display = 'none';
        if (forgotSection) forgotSection.style.display = 'block';
        if (title) title.textContent = '🔄 Reset Password';
    } else {
        if (authSection) authSection.style.display = 'block';
        if (forgotSection) forgotSection.style.display = 'none';
        if (title) title.textContent = '🔐 Login';
    }
}

function sendPasswordResetCode() {
    const email = document.getElementById('forgotPasswordEmail').value.trim();
    
    if (!email) {
        alert('❌ Please enter your email');
        return;
    }
    
    const user = userDatabase.find(u => u.email === email);
    if (!user) {
        alert('❌ No account found with this email');
        return;
    }
    
    
    // Generate reset code
    const resetCode = generateVerificationCode();
    pendingVerification = {
        email: email,
        code: resetCode,
        type: 'password_reset'
    };
    
    // Show code in console and alert (in real app, send email)
    alert(`📧 Password reset Verification code sent to your email!`);
    
    // Show code entry
    document.getElementById('forgotPasswordSection').innerHTML = `
        <div style="background: rgba(245,158,11,0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
            <h3 style="color: #f59e0b;">🔑 Enter Reset Code</h3>
            <p style="color: rgba(255,255,255,0.8);">Code sent to <strong>${email}</strong></p>
        </div>
        <div class="form-group">
            <label>Reset Code</label>
            <input type="text" id="passwordResetCode" placeholder="Enter 6-digit code" maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.3rem;">
        </div>
        <div class="form-group">
            <label>New Password *</label>
            <input type="password" id="newPasswordReset" placeholder="Min 6 characters">
        </div>
        <div class="form-group">
            <label>Confirm Password *</label>
            <input type="password" id="confirmPasswordReset" placeholder="Confirm new password">
        </div>
        <button class="submit-btn" onclick="resetPassword()">🔐 Reset Password</button>
        <p style="text-align: center; margin-top: 1rem;">
            <a href="#" onclick="location.reload(); return false;" style="color: #ff6b6b;">← Back to Login</a>
        </p>
    `;
}

function resetPassword() {
    const code = document.getElementById('passwordResetCode').value.trim();
    const newPassword = document.getElementById('newPasswordReset').value;
    const confirmPassword = document.getElementById('confirmPasswordReset').value;
    
    if (!pendingVerification || pendingVerification.type !== 'password_reset') {
        alert('❌ Invalid reset session. Please try again.');
        return;
    }
    
    if (code !== pendingVerification.code) {
        alert('❌ Invalid code. Please check and try again.');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('❌ Password must be at least 6 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('❌ Passwords do not match');
        return;
    }
    
    // Update user password
    const user = userDatabase.find(u => u.email === pendingVerification.email);
    if (user) {
        user.password = newPassword;
        saveData();
        pendingVerification = null;
        
        alert('✅ Password reset successfully!\n\nYou can now login with your new password.');
        location.reload();
    }
}

async function handleEmailAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName')?.value.trim();
    const phone = document.getElementById('authPhone')?.value.trim();
    const dob = document.getElementById('authDOB')?.value;
    
    // Validate email
    const emailValidation = isValidEmail(email);
    if (!emailValidation.valid) {
        alert(emailValidation.message);
        return;
    }
    
    // Strong password validation
    if (password.length < 8) {
        alert('❌ Password must be at least 8 characters');
        return;
    }
    
    // Check password strength for new accounts
    if (isSignUpMode && !isStrongPassword(password)) {
        alert('❌ Password must contain:\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special character (@$!%*?&#)');
        return;
    }
    
    // Check for OWNER credentials - ONLY show if correct email
    if (email === OWNER_CREDENTIALS.email) {
        if (password === OWNER_CREDENTIALS.password) {
            closeModal('loginModal');
            showOwnerPinEntry();
            return;
        } else {
            alert('❌ Invalid credentials');
            return;
        }
    }
    
    // Check for RESTAURANT STAFF credentials
    if (email === RESTAURANT_CREDENTIALS.email && password === RESTAURANT_CREDENTIALS.password) {
        closeModal('loginModal');
        isRestaurantLoggedIn = true;
        showRestaurantDashboard();
        return;
    }
    
    // Check for DRIVER credentials
    const driver = window.driverSystem.getByEmail(email);
    if (driver && driver.password === password) {
        closeModal('loginModal');
        window.driverSystem.currentDriver = driver;
        window.driverSystem.showDriverDashboard(driver);
        return;
    }
    
    if (isSignUpMode) {
        // SIGN UP MODE
        if (!name || name.length < 2) {
            alert('❌ Please enter your full name');
            return;
        }
        
        if (phone && !isValidPhone(phone)) {
            alert('❌ Invalid UK phone number');
            return;
        }
        
        // Check if user exists
        const existingUser = userDatabase.find(u => u.email === email);
        if (existingUser) {
            alert('❌ An account with this email already exists');
            return;
        }
        
        // Generate verification code
        const verificationCode = generateVerificationCode();
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationCode, 'verification');
        
        if (!emailSent) {
            return; // Error already shown
        }
        
        // Store pending registration
        pendingVerification = {
            email: email,
            password: password,
            name: name,
            phone: phone || null,
            dob: dob || null,
            code: verificationCode,
            type: 'registration',
            expiresAt: Date.now() + 600000 // 10 minutes
        };
        
        // Show verification modal
        showVerificationModal(email, 'registration');
        
    } else {
        // LOGIN MODE
        const user = userDatabase.find(u => u.email === email);
        
        if (!user) {
            alert('❌ No account found with this email');
            return;
        }
        
        if (user.password !== password) {
            alert('❌ Incorrect password');
            return;
        }
        
        // Generate 2FA code
        const verificationCode = generateVerificationCode();
        
        // Send 2FA email
        const emailSent = await sendVerificationEmail(email, verificationCode, '2fa');
        
        if (!emailSent) {
            return;
        }
        
        // Store pending login
        pendingVerification = {
            email: email,
            code: verificationCode,
            type: 'login',
            user: user,
            expiresAt: Date.now() + 600000
        };
        
        // Show verification modal
        showVerificationModal(email, 'login');
    }
}

// New function to show verification modal
function showVerificationModal(email, type) {
    closeModal('loginModal');
    
    const modal = document.createElement('div');
    modal.id = 'verificationModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const typeText = type === 'registration' ? 'Registration' : 'Login';
    const messageText = type === 'registration' ? 'Complete your registration' : 'Complete your login';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="closeModal('verificationModal')">&times;</button>
            <h2>🔐 Email Verification</h2>
            <div style="background: rgba(230,57,70,0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <p style="color: rgba(255,255,255,0.9);">📧 Verification code sent to:</p>
                <p style="color: #ff6b6b; font-weight: 600; margin-top: 0.5rem;">${email}</p>
                <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 1rem;">${messageText}</p>
            </div>
            <div class="form-group">
                <label>Enter 6-Digit Code *</label>
                <input type="text" id="verificationCodeInput" placeholder="000000" maxlength="6" 
                    style="text-align: center; font-size: 1.8rem; letter-spacing: 0.5rem; font-weight: 600;"
                    autocomplete="off">
            </div>
            <div style="text-align: center; margin: 1rem 0; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                <div id="otpCountdown">Initializing...</div>
            </div>
            <button class="submit-btn" onclick="verifyEmailCode()">✅ Verify Code</button>
            <button class="submit-btn" id="resendCodeBtn" onclick="resendVerificationCode()" 
                style="background: rgba(255,255,255,0.1); margin-top: 0.5rem;">
                📧 Resend Code
            </button>
            <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                Code expires in 10 minutes
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Start countdown
    setTimeout(() => startOTPCountdown(email), 100);
    
    // Auto-focus input
    setTimeout(() => {
        const input = document.getElementById('verificationCodeInput');
        if (input) input.focus();
    }, 300);
}

// Verify email code
function verifyEmailCode() {
    const codeInput = document.getElementById('verificationCodeInput');
    const enteredCode = codeInput.value.trim();
    
    if (!pendingVerification) {
        alert('❌ No verification session found. Please try again.');
        closeModal('verificationModal');
        return;
    }
    
    // Check expiration
    if (Date.now() > pendingVerification.expiresAt) {
        alert('❌ Verification code expired. Please request a new one.');
        closeModal('verificationModal');
        pendingVerification = null;
        return;
    }
    
    if (enteredCode !== pendingVerification.code) {
        alert('❌ Invalid code. Please check and try again.');
        codeInput.value = '';
        codeInput.focus();
        return;
    }
    
    // Code is correct!
    if (pendingVerification.type === 'registration') {
        // Complete registration
        const newUser = {
            id: Date.now(),
            email: pendingVerification.email,
            password: pendingVerification.password,
            name: pendingVerification.name,
            phone: pendingVerification.phone,
            dob: pendingVerification.dob,
            address: null,
            joinedDate: new Date().toLocaleDateString('en-GB'),
            orders: [],
            verified: true
        };
        
        userDatabase.push(newUser);
        currentUser = newUser;
        saveData();
        
        closeModal('verificationModal');
        alert('✅ Account created successfully!\n\nWelcome to Antalya Shawarma! 🏉');
        updateAuthUI();
        
    } else if (pendingVerification.type === 'login') {
        // Complete login
    currentUser = pendingVerification.user;
saveData();

closeModal('verificationModal');
alert('✅ Login successful!\n\nWelcome back! 👋');
updateAuthUI();
updateOwnerButtonVisibility(); // ADD THIS LINE

    }
    
    pendingVerification = null;
}

// Resend verification code
async function resendVerificationCode() {
    if (!pendingVerification) {
        alert('❌ No active verification session');
        return;
    }
    
    const email = pendingVerification.email;
    
    if (!canResendOTP(email)) {
        const timer = otpTimers[email];
        const waitTime = Math.ceil((timer.canResendAt - Date.now()) / 1000);
        alert(`⏱️ Please wait ${waitTime} seconds before resending`);
        return;
    }
    
    // Generate new code
    const newCode = generateVerificationCode();
    const type = pendingVerification.type === 'registration' ? 'verification' : '2fa';
    
    // Send email
    const sent = await sendVerificationEmail(email, newCode, type);
    
    if (sent) {
        // Update pending verification
        pendingVerification.code = newCode;
        pendingVerification.expiresAt = Date.now() + 600000;
        
        alert('📧 New verification code sent!');
    }
}

// Show owner PIN entry modal
function showOwnerPinEntry() {
    const modal = document.getElementById('ownerModal');
    if (modal) {
        modal.style.display = 'flex';
        // Clear previous PIN input
        const pinInput = document.getElementById('ownerPin');
        if (pinInput) pinInput.value = '';
    }
}

function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;
    
    if (!pendingVerification) {
        alert('❌ No verification pending');
        return;
    }
    
    if (enteredCode !== pendingVerification.code) {
        alert('❌ Invalid verification code');
        return;
    }
    
    if (pendingVerification.type === 'signup') {
        // Create new user
        const newUser = {
            name: pendingVerification.name,
            email: pendingVerification.email,
            password: pendingVerification.password,
            phone: pendingVerification.phone,
            dob: pendingVerification.dob,
            address: selectedLocation?.address || null,
            location: selectedLocation,
            verified: true,
            createdAt: new Date().toISOString()
        };
        
        userDatabase.push(newUser);
        currentUser = newUser;
        
    } else if (pendingVerification.type === 'login') {
        currentUser = pendingVerification.user;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('restaurantUsers', JSON.stringify(userDatabase));
    
    pendingVerification = null;
    
    // Reset form
    document.getElementById('authFormSection').style.display = 'block';
    document.getElementById('emailVerificationSection').style.display = 'none';
    document.getElementById('verificationCode').value = '';
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    if (document.getElementById('authName')) document.getElementById('authName').value = '';
    if (document.getElementById('authPhone')) document.getElementById('authPhone').value = '';
    
    updateHeaderForLoggedInUser();
    updateFavoritesBadge();
    updateNotificationBadge();
    
    closeModal('loginModal');
    
    alert(`✅ Welcome${currentUser.name ? ', ' + currentUser.name : ''}!\n\nYou are now logged in.`);
}

function resendCode() {
    if (!pendingVerification) return;
    
    const newCode = generateVerificationCode();
    pendingVerification.code = newCode;
    
    const email = pendingVerification.email || pendingVerification.user?.email;
    sendVerificationEmail(email, newCode);
}

function loginWithGoogle() {
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    try {
        google.accounts.id.initialize({
            client_id: '888032224287-20qgalf8pvpg7s7589il4f025cva4944.apps.googleusercontent.com',
            callback: handleGoogleCallback,
            ux_mode: isMobile ? 'redirect' : 'popup',
            redirect_uri: window.location.origin
        });
        
      if (isMobile) {
      // Mobile: Direct prompt
    google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap not available');
            // Show clearer message
               alert('⚠️ Google Sign-In not available\n\nPlease use Email/Password login instead.');
           }
       });
        } else {
            // Desktop: Use popup
            google.accounts.id.prompt();
        }
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        alert('❌ Google login unavailable. Please use email login.');
    }
}

function handleGoogleCallback(response) {

        if (!response || !response.credential) {
        console.error('Google login failed:', response);
        alert('❌ Google login failed. Please try again or use email login.');
        return;
    }

    // Decode the JWT token
     const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
    const googleUser = {
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified,
        provider: 'google'
    };
    
    // Check if user exists in database
    let existingUser = userDatabase.find(u => u.email === googleUser.email);
    
    if (!existingUser) {
        // Create new user
        const newUser = {
            name: googleUser.name,
            email: googleUser.email,
            password: 'GOOGLE_AUTH_' + Date.now(), // OAuth users don't need password
            phone: '',
            profilePicture: googleUser.profilePicture,
            provider: 'google',
            verified: true,
            createdAt: new Date().toISOString()
        };
        
        userDatabase.push(newUser);
        currentUser = newUser;
    } else {
        // Login existing user
        currentUser = existingUser;
    }
    
    
    // Save and update UI
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('restaurantUsers', JSON.stringify(userDatabase));
    updateHeaderForLoggedInUser();
    closeModal('loginModal');
    
    alert(`✅ Welcome${currentUser.name ? ', ' + currentUser.name : ''}!\n\nYou are now logged in with Google.`);
}

function loginWithApple() {
    alert(`🍽 Apple Sign-In\n\nApple authentication would be configured here.\n\nFor demo, use email signup with iCloud.`);
}

// ========================================
// DELIVERY COST CALCULATOR
// ========================================
function getDeliveryCost(distanceMiles) {
    if (distanceMiles > 6) {
        return {
            available: false,
            cost: 0,
            message: '⚠️ Location is outside delivery range (max 6 miles)'
        };
    }
    
    if (distanceMiles <= 1) {
        return {
            available: true,
            cost: 0,
            message: '✅ FREE delivery'
        };
    } else if (distanceMiles <= 3) {
        return {
            available: true,
            cost: 3.99,
            message: `✅ ${formatPrice(3.99)} delivery • ${calculateTime(distanceMiles)} mins`
        };
    } else {
        return {
            available: true,
            cost: 5.99,
            message: `✅ ${formatPrice(5.99)} delivery • ${calculateTime(distanceMiles)} mins`
        };
    }
}

// ========================================
// LOCATION FUNCTIONS
// ========================================
function pickLocation() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'block';
    }
    setTimeout(() => initMap(), 100);
}

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !window.google) return;
    
    // If map exists and has marker, restore it
    if (googleMap) {
        if (deliveryMarker) {
            deliveryMarker.setMap(googleMap);
        }
        if (selectedLocation) {
            googleMap.setCenter(selectedLocation);
            updateDistanceInfo();
        }
        return;
    }
    
    const center = { lat: UK_CONFIG.restaurant.lat, lng: UK_CONFIG.restaurant.lng };
    const restaurantLocation = { lat: 53.447830, lng: -2.076047 };

    googleMap = new google.maps.Map(mapContainer, {
        center: restaurantLocation,
        zoom: 15,
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        gestureHandling: 'greedy',
        zoomControl: true,
        fullscreenControl: false,
        streetViewControl: false
    });
    
    // Restaurant marker
    new google.maps.Marker({
        position: center,
        map: googleMap,
        title: 'Antalya Shawarma',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#e63946" stroke="#fff" stroke-width="3"/>
                    <text x="20" y="26" font-size="18" text-anchor="middle" fill="#fff">🌯</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    // Click to set delivery location
    google.maps.event.clearListeners(googleMap, 'click');
    googleMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        if (deliveryMarker) {
            deliveryMarker.setPosition(e.latLng);
        } else {
            deliveryMarker = new google.maps.Marker({
                position: e.latLng,
                map: googleMap,
                title: 'Delivery Location',
                draggable: true,
                animation: google.maps.Animation.DROP
            });
        }
        
        selectedLocation = { lat, lng };
        updateDistanceInfo();
        googleMap.panTo(e.latLng);
        
        console.log('Location selected:', lat, lng);
    });
}

// Variable to track if picking for profile
let pickingForProfile = false;

function pickLocationForProfile() {
    pickingForProfile = true;
    closeModal('editProfileModal');
    
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'block';
    }
    setTimeout(() => initMap(), 100);
    google.maps.event.clearListeners(googleMap, 'click');
}

function addMarker(location) {
    if (mapMarker) mapMarker.setMap(null);
    
    mapMarker = new google.maps.Marker({
        position: location,
        map: googleMap,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#2a9d8f" stroke="#fff" stroke-width="3"/>
                    <text x="20" y="26" font-size="18" text-anchor="middle" fill="#fff">📍</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    selectedLocation = {
        lat: location.lat(),
        lng: location.lng()
    };
    
    // Try to get address via geocoding
    if (window.google && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                selectedLocation.address = results[0].formatted_address;
                
                // Update location display
                document.getElementById('selectedLocationText').innerHTML = `
                    📍 ${selectedLocation.address}<br>
                    <span style="color: ${deliveryInfo.available ? '#2a9d8f' : '#ef4444'};">${deliveryInfo.message}</span>
                `;
                
                // Also update edit profile address field if it exists
                const editAddressField = document.getElementById('editAddress');
                if (editAddressField) {
                    editAddressField.value = selectedLocation.address;
                }
                
                // Update auth address field if it exists
                const authAddressField = document.getElementById('authAddress');
                if (authAddressField) {
                    authAddressField.value = selectedLocation.address;
                }
            }
        });
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('❌ Geolocation not supported');
        return;
    }
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            if (googleMap) {
                googleMap.setCenter(location);
                googleMap.setZoom(16);
            }
            
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('✅ Location found!');
        },
        (error) => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('❌ Could not get location');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function confirmLocation() {
    if (!selectedLocation) {
        alert('Please select a location on the map');
        return;
    }
    
    // CHECK 6-MILE LIMIT
    const distance = calculateDistance(
        UK_CONFIG.restaurant.lat,
        UK_CONFIG.restaurant.lng,
        selectedLocation.lat,
        selectedLocation.lng
    );
    
    if (distance > 6) {
        alert('⚠️ Sorry! You are ' + distance.toFixed(1) + ' miles away. We only deliver within 6 miles of the restaurant.');
        return;
    }

    const deliveryInfo = getDeliveryCost(distance);
    
    if (!deliveryInfo.available) {
        alert(deliveryInfo.message);
        return;
    }
    
    // Generate fallback address if geocoding hasn't completed
    if (!selectedLocation.address) {
        selectedLocation.address = `Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)} (${distance.toFixed(1)} miles)`;
    }
    
    if (currentUser) {
        currentUser.location = selectedLocation;
        currentUser.address = selectedLocation.address;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also update in userDatabase
        const userIndex = userDatabase.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            userDatabase[userIndex].location = selectedLocation;
            userDatabase[userIndex].address = selectedLocation.address;
            saveData();
        }
    }
    
    // Close map modal
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        mapModal.style.display = 'none';
    }
    
    // If we were picking for profile, reopen edit profile modal
    if (pickingForProfile) {
        pickingForProfile = false;
        
        // Update the edit address field
        const editAddressField = document.getElementById('editAddress');
        if (editAddressField && selectedLocation.address) {
            editAddressField.value = selectedLocation.address;
        }
        
        openEditProfile();
        alert(`✅ Location set!\n\n${selectedLocation.address || 'Location confirmed'}`);
    } else {
        alert(`✅ Location confirmed!\n\n${selectedLocation.address || 'Location set'}\n${deliveryInfo.message}`);
    }
}

// ========================================
// MODAL & UTILITY FUNCTIONS
// ========================================

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Hide modal - both class and inline style for consistency
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Reset specific modal states
        if (modalId === 'loginModal') {
            const authForm = document.getElementById('authFormSection');
            const verifySection = document.getElementById('emailVerificationSection');
            if (authForm) authForm.style.display = 'block';
            if (verifySection) verifySection.style.display = 'none';
        }
        
        if (modalId === 'driverLoginModal') {
            const codeLogin = document.getElementById('driverCodeLogin');
            const emailLogin = document.getElementById('driverEmailLogin');
            if (codeLogin) codeLogin.style.display = 'block';
            if (emailLogin) emailLogin.style.display = 'none';
        }
        
        // Stop tracking updates when closing tracking modal
        if (modalId === 'driverTrackingModal') {
            if (trackingInterval) {
                clearInterval(trackingInterval);
                trackingInterval = null;
            }
            trackingOrderId = null;
        }
        
        // Re-enable body scrolling
        document.body.style.overflow = '';
        
        // SHOW NAVIGATION (if no other modals open)
        setTimeout(showNavigation, 50);
    } catch (e) {
        console.error('Error closing modal:', e);
    }
}

function openModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Show modal - both class and inline style for consistency  
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // HIDE NAVIGATION
        hideNavigation();
    } catch (e) {
        console.error('Error opening modal:', e);
    }
}

// Helper function to hide navigation
function hideNavigation() {
    document.body.classList.add('modal-open');
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    const header = document.querySelector('.header');
    if (mobileNav) {
        mobileNav.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    }
    if (header) {
        header.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    }
}

// Helper function to show navigation
function showNavigation() {
    // Check if any modal is still open
    let anyModalOpen = false;
    document.querySelectorAll('.modal').forEach(m => {
        const style = window.getComputedStyle(m);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            anyModalOpen = true;
        }
    });
    
    // Also check dashboards
    const ownerDash = document.getElementById('ownerDashboard');
    const restDash = document.getElementById('restaurantDashboard');
    if (ownerDash && ownerDash.style.display !== 'none') anyModalOpen = true;
    if (restDash && restDash.style.display !== 'none') anyModalOpen = true;
    
    if (!anyModalOpen) {
        document.body.classList.remove('modal-open');
        const mobileNav = document.querySelector('.mobile-bottom-nav');
        const header = document.querySelector('.header');
        if (mobileNav) {
            mobileNav.style.cssText = '';
        }
        if (header) {
            header.style.cssText = '';
        }
    }
}

function scrollToMenu() {
    document.querySelector('.main-content')?.scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const nav = document.getElementById('navButtons');
    const btn = document.getElementById('mobileMenuBtn');
    if (!nav || !btn) return;
    nav.classList.toggle('active');
    btn.classList.toggle('active');
    btn.textContent = nav.classList.contains('active') ? '✔' : '☰';
}

// ========================================
// INITIALIZATION
// ========================================
// ========================================
// MOBILE OWNER BUTTON FIX
// ========================================



// Call this after successful owner login
function handleOwnerLogin() {
    const email = document.getElementById('devEmail').value.trim();
    const password = document.getElementById('devPassword').value;
    const pin = document.getElementById('devPin').value;
    
    if (email !== OWNER_CREDENTIALS.email || 
        password !== OWNER_CREDENTIALS.password || 
        pin !== OWNER_CREDENTIALS.pin) {
        alert('❌ Invalid credentials');
        return;
    }
    
    isOwnerLoggedIn = true;
    
    // Re-render reviews to show "Reply as Owner" buttons
    displayReviews();

    closeModal('ownerModal');
    document.getElementById('ownerDashboard').style.display = 'block';
    hideNavigation(); // Hide navigation when dashboard opens
    updateOwnerStats();
    
    alert('✅ Owner access granted!');
}


document.addEventListener('DOMContentLoaded', function() {
    updateOwnerButtonVisibility(); // Ensure owner button is hidden on load    

    // Load data
    loadData();
    loadBankDetails();
    loadMenuData(); // Load custom menu data from owner
    
    // Debug: Check if data loaded correctly
    console.log('📦 Categories:', Object.keys(categories).length);
    console.log('🍽️ Menu items:', Object.values(menuData).flat().length);
    
    // Render categories FIRST
    renderCategories();
    
    // Display initial menu - use first available category
    const firstCategory = Object.keys(menuData).find(key => menuData[key] && menuData[key].length > 0) || 'grill_wraps';
    displayMenu(firstCategory);
    
    // Load reviews AFTER categories (isolated in try-catch)
    try {
        loadReviews();
    } catch(e) {
        console.error('Error loading reviews:', e);
    }
    
    // Update badges
    updateCartBadge();
    updateFavoritesBadge();
    updateNotificationBadge();
    
    // Restore driver session
    const driverId = sessionStorage.getItem('loggedInDriver');
    const driverName = sessionStorage.getItem('driverName');
    if (driverId && driverName) {
        updateDriverLoginUI(driverName);
    }
    
    // Setup mobile bottom navigation
    setupMobileNavigation();
    
    // Auto-format card inputs
    const cardInput = document.getElementById('paymentCardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('paymentExpiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
 
});

// Setup mobile bottom navigation with proper event listeners
function setupMobileNavigation() {
    const mobileNav = document.getElementById('mobileBottomNav');
    if (!mobileNav) return;
    
    // Get all visible nav buttons (excluding hidden owner button)
    const allButtons = mobileNav.querySelectorAll('.mobile-nav-item');
    const buttons = Array.from(allButtons).filter(btn => {
        return !btn.classList.contains('mobile-owner-btn');
    });
    
    // Action functions in order
    const actions = [showNotifications, showFavorites, showOrderHistory, showCart, showAccount];
    
    buttons.forEach((btn, index) => {
        if (actions[index]) {
            // Clone to remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add click listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile nav clicked:', index);
                actions[index]();
            });
            
            // Add touchstart for Safari
            newBtn.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
        }
    });
}

// Make functions globally available
window.showLogin = showLogin;
window.showAccount = showAccount;
window.showCart = showCart;
window.showFavorites = showFavorites;
window.showNotifications = showNotifications;
window.showRestaurantLogin = showRestaurantLogin;
window.showOwnerLogin = showOwnerLogin;
window.showDriverLogin = showDriverLogin;
window.closeModal = closeModal;
window.filterCategory = filterCategory;
window.openFoodModal = openFoodModal;
window.toggleFavorite = toggleFavorite;
window.toggleCustomization = toggleCustomization;
window.toggleCustomizationCircle = toggleCustomizationCircle;
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;
window.proceedToCheckout = proceedToCheckout;
window.handlePayment = handlePayment;
window.updateCartItem = updateCartItem;
window.removeCartItem = removeCartItem;
window.scrollToMenu = scrollToMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.handleEmailAuth = handleEmailAuth;
window.verifyCode = verifyCode;
window.resendCode = resendCode;
window.toggleAuthMode = toggleAuthMode;
window.loginWithGoogle = loginWithGoogle;
window.loginWithApple = loginWithApple;
window.handleRestaurantLogin = handleRestaurantLogin;
window.handleOwnerLogin = handleOwnerLogin;
window.pickLocation = pickLocation;
window.getCurrentLocation = getCurrentLocation;
window.confirmLocation = confirmLocation;
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.assignDriver = assignDriver;
window.completeOrder = completeOrder;
window.closeRestaurantDashboard = closeRestaurantDashboard;
window.showDriverManagementModal = showDriverManagementModal;
window.addNewDriver = addNewDriver;
window.deleteDriver = deleteDriver;
window.showBankSettingsModal = showBankSettingsModal;
window.saveBankSettings = saveBankSettings;
window.logout = logout;
window.logoutDriver = logoutDriver;
window.openEditProfile = openEditProfile;
window.previewProfilePic = previewProfilePic;
window.saveProfileChanges = saveProfileChanges;
window.openChangeEmail = openChangeEmail;
window.verifyAndChangeEmail = verifyAndChangeEmail;
window.openChangePasswordModal = openChangePasswordModal;
window.handleChangePassword = handleChangePassword;
window.showOwnerPinEntry = showOwnerPinEntry;

// New driver functions
window.showDriverCodeLogin = showDriverCodeLogin;
window.showDriverEmailLogin = showDriverEmailLogin;
window.handleDriverCodeLogin = handleDriverCodeLogin;
window.handleDriverEmailPasswordLogin = handleDriverEmailPasswordLogin;
window.showDriverDashboard = showDriverDashboard;
window.toggleDriverAvailability = toggleDriverAvailability;
window.updateDriverLocation = updateDriverLocation;
window.openDirections = openDirections;
window.markOrderDelivered = markOrderDelivered;

// Driver management functions
window.editDriver = editDriver;
window.previewDriverPic = previewDriverPic;
window.previewEditDriverPic = previewEditDriverPic;
window.saveDriverChanges = saveDriverChanges;
window.toggleDriverStatus = toggleDriverStatus;
window.notifyAllAvailableDrivers = notifyAllAvailableDrivers;

// Driver order functions
window.driverAcceptOrder = driverAcceptOrder;
window.callCustomer = callCustomer;
window.confirmLogoutDriver = confirmLogoutDriver;
window.calculateDeliveryTime = calculateDeliveryTime;
window.getDistanceFromLatLng = getDistanceFromLatLng;

// Driver tracking functions
window.trackDriver = trackDriver;
window.refreshDriverLocation = refreshDriverLocation;
window.closeTrackingModal = closeTrackingModal;
window.startDriverLocationTracking = startDriverLocationTracking;

// Driver rating functions
window.openDriverRating = openDriverRating;
window.setReviewRating = setReviewRating;
window.previewRating = previewRating;
window.resetPreview = resetPreview;
window.submitDriverRating = submitDriverRating;
window.showDeliveryRatingPopup = showDeliveryRatingPopup;

// Order functions
window.userCanOrder = userCanOrder;
window.showOrderHistory = showOrderHistory;
window.updateOrdersBadge = updateOrdersBadge;

// Restaurant status functions
window.isRestaurantOpen = isRestaurantOpen;
window.getRestaurantStatus = getRestaurantStatus;
window.getUKTime = getUKTime;
window.getUKHour = getUKHour;
window.resetAllData = resetAllData;
window.showResetOptions = showResetOptions;
window.resetSelectedData = resetSelectedData;

// Location functions
window.pickLocationForProfile = pickLocationForProfile;

// Reorder functions
window.reorderFromHistory = reorderFromHistory;
window.confirmReorder = confirmReorder;

// Location confirmation functions
window.showLocationConfirmation = showLocationConfirmation;
window.confirmCurrentLocation = confirmCurrentLocation;
window.changeDeliveryLocation = changeDeliveryLocation;
window.openCheckoutModal = openCheckoutModal;

// Forgot password functions
window.showForgotPasswordSection = showForgotPasswordSection;
window.sendPasswordResetCode = sendPasswordResetCode;
window.resetPassword = resetPassword;

// Menu management functions (Owner)
window.openMenuManager = openMenuManager;
window.renderMenuManagerList = renderMenuManagerList;
window.toggleFoodAvailability = toggleFoodAvailability;
window.openAddFood = openAddFood;
window.openEditFood = openEditFood;
window.saveFoodItem = saveFoodItem;
window.deleteFood = deleteFood;
window.closeFoodEditor = closeFoodEditor;
window.openAddCategory = openAddCategory;
window.openEditCategory = openEditCategory;
window.saveCategory = saveCategory;
window.closeCategoryEditor = closeCategoryEditor;
window.deleteCategory = deleteCategory;
window.previewFoodImage = previewFoodImage;
window.previewCategoryImage = previewCategoryImage;
window.handleFoodImageUpload = handleFoodImageUpload;
window.handleCategoryImageUpload = handleCategoryImageUpload;
window.saveMenuData = saveMenuData;
window.loadMenuData = loadMenuData;
window.moveCategoryUp = moveCategoryUp;
window.moveCategoryDown = moveCategoryDown;

// Modal functions
window.openModal = openModal;
window.closeModal = closeModal;

// ========================================
// REVIEWS SYSTEM
// ========================================

let showingAllReviews = false;

// Load reviews from localStorage
function loadReviews() {
    const saved = localStorage.getItem('restaurantReviews');
    if (saved) {
        try {
            restaurantReviews = JSON.parse(saved);
        } catch(e) {
            restaurantReviews = [];
        }
    }
    displayReviews();
}

// Save reviews to localStorage
function saveReviews() {
    localStorage.setItem('restaurantReviews', JSON.stringify(restaurantReviews));
}

// Open write review modal
function openWriteReview() {
    if (!currentUser) {
        alert('⚠️ Please login to write a review');
        showLogin();
        return;
    }
    
    // Check if user already has a review
    const existingReview = restaurantReviews.find(r => r.userId === currentUser.email);
    if (existingReview) {
        alert('⚠️ You have already submitted a review. Each customer can only submit one review.');
        return;
    }
    
    // Reset form
    selectedRating = 0;
    updateStarDisplay();
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewRating').value = '0';
    
    openModal('writeReviewModal');
}

// Set star rating
function setReviewRating(rating) {
    selectedRating = rating;
    document.getElementById('reviewRating').value = rating;
    updateStarDisplay();
}

// Update star display
function updateStarDisplay() {
    const stars = document.querySelectorAll('#starRating span');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.textContent = '⭐';
            star.style.transform = 'scale(1.1)';
        } else {
            star.textContent = '☆';
            star.style.transform = 'scale(1)';
        }
    });
}

// Submit review
function submitReview(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert('❌ Please login first');
        return;
    }
    
    // Check if user already has a review
    const existingReview = restaurantReviews.find(r => r.userId === currentUser.email);
    if (existingReview) {
        alert('⚠️ You have already submitted a review.');
        closeModal('writeReviewModal');
        return;
    }
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value.trim();
    
    if (rating < 1 || rating > 5) {
        alert('❌ Please select a rating (1-5 stars)');
        return;
    }
    
    if (text.length < 10) {
        alert('❌ Please write at least 10 characters');
        return;
    }
    
    const review = {
        id: Date.now(),
        userId: currentUser.email,
        userName: currentUser.name,
        userPic: currentUser.profilePicture || null,
        rating: rating,
        text: text,
        date: new Date().toISOString(),
        replies: []
    };
    
    restaurantReviews.unshift(review);
    saveReviews();
    displayReviews();
    
    closeModal('writeReviewModal');
    alert('✅ Thank you for your review!');
}

// Display reviews
function displayReviews() {
    const container = document.getElementById('reviewsList');
    const noReviewsMsg = document.getElementById('noReviewsMessage');
    const avgDisplay = document.getElementById('averageRatingDisplay');
    const showMoreContainer = document.getElementById('showMoreReviewsContainer');
    
    if (!container) return;
    
    if (restaurantReviews.length === 0) {
        container.innerHTML = '';
        if (noReviewsMsg) noReviewsMsg.style.display = 'block';
        if (showMoreContainer) showMoreContainer.style.display = 'none';
        return;
    }
    
    if (noReviewsMsg) noReviewsMsg.style.display = 'none';
    
    // Calculate average rating (with null safety)
    const avgRating = restaurantReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurantReviews.length;
    if (avgDisplay) {
        avgDisplay.innerHTML = `
            <span style="font-size: 1.5rem;">⭐</span>
            <span style="font-size: 1.3rem; font-weight: 700; color: #f59e0b;">${avgRating.toFixed(1)}</span>
            <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">(${restaurantReviews.length} reviews)</span>
        `;
    }
    
    // Show more/less logic
    const reviewsToShow = showingAllReviews ? restaurantReviews : restaurantReviews.slice(0, 3);
    
    if (showMoreContainer) {
        if (restaurantReviews.length > 3) {
            showMoreContainer.style.display = 'block';
            const btn = document.getElementById('showMoreReviewsBtn');
            if (btn) {
                btn.textContent = showingAllReviews ? 'Show less ↑' : `Show more reviews (${restaurantReviews.length - 3} more) ↓`;
            }
        } else {
            showMoreContainer.style.display = 'none';
        }
    }
    
    container.innerHTML = reviewsToShow.map(review => {
        const stars = '⭐'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0));
        const timeAgo = getTimeAgo(new Date(review.date || Date.now()));
        const isOwn = currentUser && review.userId === currentUser.email;
        const canDelete = isOwn || isOwnerLoggedIn;
        const safeName = review.userName || 'Anonymous';
        
        const userAvatar = review.userPic 
            ? `<img src="${review.userPic}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<span style="font-size: 1.5rem;">${safeName.charAt(0).toUpperCase()}</span>`;
        
        return `
            <div class="review-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.2rem;">
                <div style="display: flex; gap: 1rem; margin-bottom: 0.8rem;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: white; font-weight: bold;">
                        ${userAvatar}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                            <span style="font-weight: 700; color: #fff;">${safeName}</span>
                            ${isOwn ? '<span style="background: rgba(230,57,70,0.2); color: #e63946; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem;">You</span>' : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.2rem;">
                            <span style="font-size: 0.85rem;">${stars}</span>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">• ${timeAgo}</span>
                        </div>
                    </div>
                    ${canDelete ? `<button onclick="deleteReview(${review.id})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;" title="Delete">🗑️</button>` : ''}
                </div>
                
                <p style="color: rgba(255,255,255,0.85); line-height: 1.5; margin: 0 0 1rem 0;">${review.text || ''}</p>
                
                ${review.replies && review.replies.length > 0 ? `
                    <div style="margin-top: 0.5rem;">
                        <button onclick="openReplies(${review.id})" style="background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.3); color: #e63946; padding: 0.4rem 0.8rem; border-radius: 20px; cursor: pointer; font-size: 0.85rem;">
                            Show replies (${review.replies.length}) ↓
                        </button>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08);">
                        <div style="background: rgba(230,57,70,0.05); padding: 0.8rem; border-radius: 8px; border-left: 3px solid #e63946;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                <img src="logo.png" alt="Restaurant" style="height: 20px; width: auto;">
                                <span style="font-weight: 700; font-size: 0.85rem; color: #f59e0b;">RESTAURANT OWNER</span>
                            </div>
                            <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${(review.replies[review.replies.length - 1] || {}).text || ''}</div>
                        </div>
                    </div>
                ` : `
                    ${isOwnerLoggedIn ? `
                        <div style="margin-top: 0.5rem;">
                            <button onclick="openReplies(${review.id})" style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); color: #8b5cf6; padding: 0.4rem 0.8rem; border-radius: 20px; cursor: pointer; font-size: 0.85rem;">
                                Reply as Owner
                            </button>
                        </div>
                    ` : ''}
                `}
            </div>
        `;
    }).join('');
}

// Toggle show more reviews
function toggleShowMoreReviews() {
    showingAllReviews = !showingAllReviews;
    displayReviews();
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    if (seconds < 2592000) return Math.floor(seconds / 604800) + ' weeks ago';
    return Math.floor(seconds / 2592000) + ' months ago';
}

// Open replies modal
function openReplies(reviewId) {
    currentReviewId = reviewId;
    const review = restaurantReviews.find(r => r.id === reviewId);
    if (!review) return;
    
    const container = document.getElementById('repliesContent');
    const ownerReplySection = document.getElementById('ownerReplySection');
    
    // Show owner reply section only if owner is logged in
    if (ownerReplySection) {
        ownerReplySection.style.display = isOwnerLoggedIn ? 'block' : 'none';
    }
    
    if (!review.replies || review.replies.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 1rem;">No replies from the restaurant yet.</p>';
    } else {
        container.innerHTML = review.replies.map((reply, index) => {
            const timeAgo = getTimeAgo(new Date(reply.date));
            
            return `
                <div style="padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <div style="display: flex; gap: 0.8rem;">
                        <div style="width: 35px; height: 35px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                            <img src="logo.png" alt="Restaurant" style="height: 25px; width: auto;">
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                <span style="font-weight: 700; font-size: 0.9rem; color: #f59e0b;">RESTAURANT OWNER</span>
                                <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">• ${timeAgo}</span>
                                ${isOwnerLoggedIn ? `<button onclick="deleteOwnerReply(${reviewId}, ${index})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem; margin-left: auto;">🗑️</button>` : ''}
                            </div>
                            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 0; line-height: 1.4;">${reply.text}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('replyText').value = '';
    openModal('repliesModal');
}

// Submit owner reply
function submitOwnerReply() {
    if (!isOwnerLoggedIn) {
        alert('❌ Only restaurant owner can reply to reviews');
        return;
    }
    
    const text = document.getElementById('replyText').value.trim();
    if (text.length < 2) {
        alert('❌ Please write a reply');
        return;
    }
    
    const review = restaurantReviews.find(r => r.id === currentReviewId);
    if (!review) return;
    
    const reply = {
        isOwner: true,
        text: text,
        date: new Date().toISOString()
    };
    
    if (!review.replies) review.replies = [];
    review.replies.push(reply);
    saveReviews();
    
    // Refresh replies modal
    openReplies(currentReviewId);
    displayReviews();
    
    alert('✅ Reply posted!');
}

// Delete review (owner or own review)
function deleteReview(reviewId) {
    const review = restaurantReviews.find(r => r.id === reviewId);
    if (!review) return;
    
    const isOwn = currentUser && review.userId === currentUser.email;
    
    if (!isOwn && !isOwnerLoggedIn) {
        alert('❌ You can only delete your own reviews');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    restaurantReviews = restaurantReviews.filter(r => r.id !== reviewId);
    saveReviews();
    displayReviews();
    alert('✅ Review deleted');
}

// Delete owner reply
function deleteOwnerReply(reviewId, replyIndex) {
    if (!isOwnerLoggedIn) {
        alert('❌ Only owner can delete replies');
        return;
    }
    
    const review = restaurantReviews.find(r => r.id === reviewId);
    if (!review || !review.replies[replyIndex]) return;
    
    if (!confirm('Delete this reply?')) return;
    
    review.replies.splice(replyIndex, 1);
    saveReviews();
    openReplies(reviewId);
    displayReviews();
}

// Show owner dashboard direct (for owner button)
function showOwnerDashboardDirect() {
    if (isOwnerLoggedIn) {
        document.getElementById('ownerDashboard').style.display = 'block';
        hideNavigation(); // Hide navigation when dashboard opens
        updateOwnerStats();
    }
}

// Close owner dashboard and show navigation
function closeOwnerDashboard() {
    document.getElementById('ownerDashboard').style.display = 'none';
    showNavigation();
}

// Make closeOwnerDashboard globally available
window.closeOwnerDashboard = closeOwnerDashboard;

// Quick Action Functions for Owner Dashboard
function showAllOrders() {
    alert('📋 All Orders\n\nTotal Orders: ' + (orderHistory.length + pendingOrders.length) + '\nPending: ' + pendingOrders.length + '\nCompleted: ' + orderHistory.length);
}

function showAllUsers() {
    alert('👥 All Users\n\nTotal Registered Users: ' + userDatabase.length + '\n\nUse the Reset Data Options to manage user accounts.');
}

function showAllReviews() {
    closeOwnerDashboard();
    setTimeout(() => {
        const reviewSection = document.querySelector('.social-footer');
        if (reviewSection) reviewSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

function showAnalytics() {
    const totalRevenue = orderHistory.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = orderHistory.length > 0 ? totalRevenue / orderHistory.length : 0;
    alert('📠 Analytics Summary\n\n💰 Total Revenue: ' + formatPrice(totalRevenue) + '\n📦 Total Orders: ' + orderHistory.length + '\n📈 Avg Order Value: ' + formatPrice(avgOrder) + '\n👥 Total Users: ' + userDatabase.length);
}

function showNotificationCenter() {
    alert('🔔 Notification Center\n\nNo new system notifications.\n\nCustomer notifications are managed through the order system.');
}

function showSettings() {
    alert('⚙️ Settings\n\nRestaurant: ' + UK_CONFIG.restaurant.name + '\nAddress: ' + UK_CONFIG.restaurant.address + '\nPhone: ' + UK_CONFIG.restaurant.phone + '\n\nHours: 11:00 AM - 11:00 PM\nLast Orders: 10:30 PM\nMax Delivery: ' + UK_CONFIG.maxDeliveryDistance + ' miles');
}

// Make functions globally available
window.showAllOrders = showAllOrders;
window.showAllUsers = showAllUsers;
window.showAllReviews = showAllReviews;
window.showAnalytics = showAnalytics;
window.showNotificationCenter = showNotificationCenter;
window.showSettings = showSettings;

// ========================================
// RESTAURANT DASHBOARD QUICK ACTIONS
// ========================================

function refreshOrders() {
    if (typeof showRestaurantDashboard === 'function') {
        showRestaurantDashboard();
    }
    showToast('🔞 Orders refreshed!', 'success');
}

function showPendingOnly() {
    const container = document.getElementById('restaurantPendingOrders');
    if (!container) return;
    
    const pendingOnly = pendingOrders.filter(o => o.status === 'pending');
    if (pendingOnly.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.4);"><div style="font-size: 2rem;">✅</div><p>No pending orders</p></div>';
    } else {
        showToast('⏳ Showing ' + pendingOnly.length + ' pending orders', 'info');
    }
}

function showAcceptedOnly() {
    const acceptedCount = pendingOrders.filter(o => o.status === 'accepted').length;
    showToast('✅ ' + acceptedCount + ' accepted orders awaiting pickup', 'info');
}

function showDeliveryOnly() {
    const deliveryCount = pendingOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'driver_assigned').length;
    showToast('🚗 ' + deliveryCount + ' orders out for delivery', 'info');
}

function showAllOrdersRestaurant() {
    const total = pendingOrders.length + orderHistory.length;
    const pending = pendingOrders.filter(o => o.status === 'pending').length;
    const accepted = pendingOrders.filter(o => o.status === 'accepted').length;
    const delivery = pendingOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'driver_assigned').length;
    const completed = orderHistory.length;
    
    alert('📋 All Orders Summary\n\n' +
        '⏳ Pending: ' + pending + '\n' +
        '✅ Accepted: ' + accepted + '\n' +
        '🚗 Out for Delivery: ' + delivery + '\n' +
        '✅ Completed: ' + completed + '\n\n' +
        '📦 Total: ' + total);
}

function notifyAllDrivers() {
    const availableDrivers = drivers.filter(d => d.available && d.online);
    if (availableDrivers.length === 0) {
        showToast('❌ No drivers available', 'error');
        return;
    }
    showToast('📢 Alert sent to ' + availableDrivers.length + ' drivers!', 'success');
}

function goToOwnerDashboard() {
    closeRestaurantDashboard();
    setTimeout(() => {
        const ownerModal = document.getElementById('ownerModal');
        if (ownerModal) {
            ownerModal.style.display = 'flex';
            hideNavigation();
        }
    }, 100);
}

// Update restaurant stats
function updateRestaurantStats() {
    const outForDelivery = pendingOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'driver_assigned').length;
    const outForDeliveryStat = document.getElementById('outForDeliveryStat');
    if (outForDeliveryStat) outForDeliveryStat.textContent = outForDelivery;
    
    const pendingCountBadge = document.getElementById('pendingCountBadge');
    if (pendingCountBadge) {
        const pendingCount = pendingOrders.filter(o => o.status === 'pending').length;
        pendingCountBadge.textContent = pendingCount + ' orders';
    }
}

// Make restaurant functions globally available
window.refreshOrders = refreshOrders;
window.showPendingOnly = showPendingOnly;
window.showAcceptedOnly = showAcceptedOnly;
window.showDeliveryOnly = showDeliveryOnly;
window.showAllOrdersRestaurant = showAllOrdersRestaurant;
window.notifyAllDrivers = notifyAllDrivers;
window.goToOwnerDashboard = goToOwnerDashboard;
window.updateRestaurantStats = updateRestaurantStats;

// ========================================
// DELETE ACCOUNT SYSTEM
// ========================================

function confirmDeleteAccount() {
    if (!currentUser) {
        alert('❌ Please login first');
        return;
    }
    
    const hasOrders = orderHistory.some(o => o.userId === currentUser.email);
    const hasPendingOrders = pendingOrders.some(o => o.userId === currentUser.email && (o.status === 'pending' || o.status === 'preparing' || o.status === 'out_for_delivery'));
    
    if (hasPendingOrders) {
        alert('⚠️ You cannot delete your account while you have active orders.\n\nPlease wait for your orders to be completed.');
        return;
    }
    
    let warningMessage = '⚠️ DELETE ACCOUNT\n\n';
    warningMessage += 'This action is PERMANENT and cannot be undone.\n\n';
    warningMessage += 'The following will be deleted:\n';
    warningMessage += '• Your account and profile data\n';
    warningMessage += '• Your reviews and feedback\n';
    warningMessage += '• Your favorites list\n';
    warningMessage += '• Your notification preferences\n';
    
    if (hasOrders) {
        warningMessage += '\n📋 Your order history will be kept for restaurant records.';
    }
    
    warningMessage += '\n\nType "DELETE" to confirm:';
    
    const confirmation = prompt(warningMessage);
    
    if (confirmation === 'DELETE') {
        deleteUserAccount();
    } else if (confirmation !== null) {
        alert('❌ Account deletion cancelled.\n\nYou must type "DELETE" exactly to confirm.');
    }
}

function deleteUserAccount() {
    if (!currentUser) return;
    
    const userEmail = currentUser.email;
    
    // 1. Delete user's reviews
    restaurantReviews = restaurantReviews.filter(r => r.userId !== userEmail);
    saveReviews();
    
    // 2. Delete user's favorites
    delete userFavorites[userEmail];
    localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    
    // 3. Delete user's notifications
    delete userNotifications[userEmail];
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    
    // 4. Remove user from database
    userDatabase = userDatabase.filter(u => u.email !== userEmail);
    localStorage.setItem('restaurantUsers', JSON.stringify(userDatabase));
    
    // 5. Clear current user session
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // 6. Update UI
    updateHeaderForLoggedInUser();
    updateFavoritesBadge();
    updateNotificationBadge();
    displayReviews();
    
    // Close modal and show confirmation
    closeModal('accountModal');
    
    alert('✅ Your account has been permanently deleted.\n\nThank you for being our customer. We hope to see you again!');
    
    // Refresh page
    location.reload();
}

// Force hide owner buttons on initial load
setTimeout(() => {
    const desktopOwnerBtn = document.getElementById('ownerAccessBtn');
    const mobileOwnerBtn = document.getElementById('mobileOwnerBtn');
    
    if (!currentUser || currentUser.email !== 'admin@antalyashawarma.com') {
        if (desktopOwnerBtn) desktopOwnerBtn.style.display = 'none';
        if (mobileOwnerBtn) mobileOwnerBtn.style.display = 'none';
    }
}, 100);


// Review system exports
window.openWriteReview = openWriteReview;
window.setReviewRating = setReviewRating;
window.submitReview = submitReview;
window.openReplies = openReplies;
window.submitOwnerReply = submitOwnerReply;
window.deleteReview = deleteReview;
window.deleteOwnerReply = deleteOwnerReply;
window.loadReviews = loadReviews;
window.toggleShowMoreReviews = toggleShowMoreReviews;
window.showOwnerDashboardDirect = showOwnerDashboardDirect;
window.openForgotPasswordFromChangePassword = openForgotPasswordFromChangePassword;
window.confirmDeleteAccount = confirmDeleteAccount;
window.deleteUserAccount = deleteUserAccount;
window.updateOwnerButtonVisibility = updateOwnerButtonVisibility;
window.handleOwnerLogin = handleOwnerLogin;
window.loginWithGoogle = loginWithGoogle;
window.loginWithApple = loginWithApple;

// Update UI when login state changes
function updateAuthUI() {
    const isLoggedIn = currentUser !== null;
    
    document.querySelectorAll('[data-logged-in]').forEach(el => {
        el.style.display = isLoggedIn ? 'flex' : 'none';
    });
    
    document.querySelectorAll('[data-logged-out]').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'flex';
    });
    
    updateOwnerButtonVisibility();
}

// Show/hide owner button
function updateOwnerButtonVisibility() {
    const desktopOwnerBtn = document.getElementById('ownerAccessBtn');
    const mobileOwnerBtn = document.getElementById('mobileOwnerBtn');
    
    const shouldShow = currentUser && currentUser.email === 'admin@antalyashawarma.com';
    
    if (desktopOwnerBtn) {
        desktopOwnerBtn.style.display = shouldShow ? 'flex' : 'none';
    }
    if (mobileOwnerBtn) {
        mobileOwnerBtn.style.display = shouldShow ? 'flex' : 'none';
    }
}

// Make confirmLocation globally accessible
window.confirmLocation = confirmLocation;

console.log('✅ Antalya Shawarma script loaded successfully');
