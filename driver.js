// ========================================
// ANTALYA SHAWARMA - DRIVER SYSTEM
// Driver Dashboard & Delivery Functions
// ========================================

// ========================================
// SVG ICON LIBRARY (UI Icons)
// ========================================
const SVG_ICONS = {
    // Navigation & Actions
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
    logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    
    // Status Icons
    package: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    
    // Control Icons
    pause: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    
    // Location & Map
    location: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    map: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    
    // People & Contact
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    
    // Transport & Delivery
    car: '<img class="svg-icon car-icon" src="assets/delivery/driver-motorcycle.svg" alt="driver" />',
    motorcycle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 12c-.93 0-1.78.28-2.5.76V11c0-1.1-.9-2-2-2h-2V7h1c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1h1v2H8c-1.1 0-2 .9-2 2v1.76c-.72-.48-1.57-.76-2.5-.76C1.57 12 0 13.57 0 15.5S1.57 19 3.5 19s3.5-1.57 3.5-3.5c0-.59-.15-1.15-.41-1.64L8 12.2V15c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2.8l1.41 1.66c-.26.49-.41 1.05-.41 1.64 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm-16 5c-.83 0-1.5-.67-1.5-1.5S2.67 14 3.5 14s1.5.67 1.5 1.5S4.33 17 3.5 17zm16 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    
    // Checks & Confirmations  
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    
    // Finance
    pound: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="6" y2="20"/><path d="M8 20V9a4 4 0 1 1 8 0"/><line x1="6" y1="13" x2="14" y2="13"/></svg>',
    ruler: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>',
    
    // Status Indicators
    signal: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>',
    moon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
};

// Motorcycle SVG path for map marker (pointing up by default)
const MOTORCYCLE_MARKER_PATH = 'M12 2L15 8L22 9L17 14L18 22L12 18L6 22L7 14L2 9L9 8L12 2Z';

// ========================================
// DRIVER FUNCTIONS
// ========================================
function showDriverLogin() {
    showDriverCodeLogin();
    openModal('driverLoginModal');
}

function showDriverCodeLogin() {
    const codeLogin = document.getElementById('driverCodeLogin');
    const emailLogin = document.getElementById('driverEmailLogin');
    if (codeLogin) codeLogin.style.display = 'block';
    if (emailLogin) emailLogin.style.display = 'none';
}

function showDriverEmailLogin() {
    const codeLogin = document.getElementById('driverCodeLogin');
    const emailLogin = document.getElementById('driverEmailLogin');
    if (codeLogin) codeLogin.style.display = 'none';
    if (emailLogin) emailLogin.style.display = 'block';
}

function handleDriverCodeLogin(event) {
    event.preventDefault();
    const code = document.getElementById('driverSecretCode').value.trim().toUpperCase();
    
    if (!code) {
        uiAlert('Please enter your secret code!', 'error');
        return;
    }
    
    const driver = window.driverSystem.getByCode(code);
    
    if (!driver) {
        uiAlert('Invalid secret code!', 'error');
        return;
    }
    
    if (!driver.active) {
        uiAlert('Your account is inactive. Please contact management.', 'error');
        return;
    }
    
    // Login successful
    loginDriver(driver);
}

function handleDriverEmailPasswordLogin(event) {
    event.preventDefault();
    const email = document.getElementById('driverLoginEmail').value.trim();
    const password = document.getElementById('driverLoginPassword').value;
    
    if (!email || !password) {
        uiAlert('Please enter email and password!', 'error');
        return;
    }
    
    const driver = window.driverSystem.getByEmail(email);
    
    if (!driver) {
        uiAlert('Driver not found with this email!', 'error');
        return;
    }
    
    if (!driver.active) {
        uiAlert('Your account is inactive. Please contact management.', 'error');
        return;
    }
    
    if (driver.password !== password) {
        uiAlert('Incorrect password!', 'error');
        return;
    }
    
    // Login successful
    loginDriver(driver);
}

function loginDriver(driver) {
    currentDriver = driver;
    sessionStorage.setItem('loggedInDriver', driver.id);
    sessionStorage.setItem('driverName', driver.name);
    
    // Clear forms
    const codeInput = document.getElementById('driverSecretCode');
    const emailInput = document.getElementById('driverLoginEmail');
    const passInput = document.getElementById('driverLoginPassword');
    if (codeInput) codeInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    
    closeModal('driverLoginModal');
    closeModal('loginModal');
    
    updateDriverLoginUI(driver.name);
    showDriverDashboard(driver);
}

function updateDriverLoginUI(driverName) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.car} ${driverName}</span>`;
        loginBtn.onclick = function() { showDriverDashboard(); };
    }
}

function showDriverDashboard(driver = null) {
    if (!driver) {
        const driverId = sessionStorage.getItem('loggedInDriver');
        if (!driverId) {
            showLogin();
            return;
        }
        driver = window.driverSystem.get(driverId);
    }
    
    if (!driver) {
        uiAlert('Driver session expired. Please login again.', 'error');
        logoutDriver();
        return;
    }
    
    const modal = document.getElementById('driverDashboardModal');
    const content = document.getElementById('driverDashboardContent');
    if (!modal || !content) return;
    
    // Load available orders from localStorage
    const savedAvailableOrders = localStorage.getItem('availableOrdersForDrivers');
    if (savedAvailableOrders) {
        window.availableOrdersForDrivers = JSON.parse(savedAvailableOrders);
    }
    
    // Get driver's assigned orders
    const assignedOrders = pendingOrders.filter(o => o.driverId === driver.id);
    
    // Get available orders for this driver
    const availableOrders = [];
    if (window.availableOrdersForDrivers) {
        Object.keys(window.availableOrdersForDrivers).forEach(orderId => {
            const orderData = window.availableOrdersForDrivers[orderId];
            if (!orderData.claimedBy) {
                const order = pendingOrders.find(o => o.id === orderId);
                if (order && order.status === 'waiting_driver') {
                    availableOrders.push(order);
                }
            }
        });
    }
    
    const profilePic = driver.profilePicture 
        ? `<img src="${driver.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">` 
        : `<span style="color: white;">${SVG_ICONS.motorcycle}</span>`;
    
    content.innerHTML = `
        <!-- Header Bar -->
        <div style="background: linear-gradient(135deg, #10b981, #047857); padding: 1.2rem 1.5rem; border-radius: 20px; margin-bottom: 1rem; position: relative; box-shadow: 0 4px 20px rgba(16,185,129,0.35);">
            <button onclick="closeDriverDashboard()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.25); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">${SVG_ICONS.close}</button>
            
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; overflow: hidden; border: 3px solid rgba(255,255,255,0.5); flex-shrink: 0;">
                    ${profilePic}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                        <h2 style="margin: 0; color: white; font-size: 1.3rem; font-weight: 700;">${driver.name}</h2>
                        <span style="background: ${driver.available ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}; padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: white;">
                            ${driver.available ? svgIcon('circle-green', 10) + ' ONLINE' : svgIcon('circle-red', 10) + ' OFFLINE'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 1.2rem; margin-top: 0.4rem; font-size: 0.95rem; color: rgba(255,255,255,0.95); align-items: center;">
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.package} ${driver.deliveries || 0} trips</span>
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.star} ${(driver.rating || 5.0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="display: flex; gap: 0.6rem; margin-bottom: 1rem;">
            <button onclick="toggleDriverAvailability()" style="flex: 1; background: ${driver.available ? '#fee2e2' : '#d1fae5'}; color: ${driver.available ? '#dc2626' : '#059669'}; border: none; padding: 0.9rem 0.8rem; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                ${driver.available ? SVG_ICONS.pause + ' Go Offline' : SVG_ICONS.play + ' Go Online'}
            </button>
            <button onclick="updateDriverLocation()" style="flex: 1; background: #dbeafe; color: #2563eb; border: none; padding: 0.9rem 0.8rem; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                ${SVG_ICONS.location} Location
            </button>
            <button onclick="showDriverDashboard()" style="background: #f3f4f6; color: #6b7280; border: none; padding: 0.9rem 1rem; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                ${SVG_ICONS.refresh}
            </button>
        </div>
        
        <!-- New Orders Alert -->
        ${driver.available && availableOrders.length > 0 ? `
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 16px; padding: 1rem; margin-bottom: 1rem; border: 2px solid #f59e0b;">
                <div style="font-weight: 700; color: #92400e; font-size: 1.1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">${SVG_ICONS.bell} ${availableOrders.length} New Order${availableOrders.length > 1 ? 's' : ''}</div>
                ${availableOrders.map(order => `
                    <div style="background: white; padding: 1rem; border-radius: 12px; margin-bottom: 0.6rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 700; color: #1f2937; font-size: 1.1rem;">#${order.id}</span>
                            <span style="font-weight: 800; color: #059669; font-size: 1.3rem;">${formatPrice(order.total)}</span>
                        </div>
                        <div style="color: #6b7280; font-size: 0.95rem; margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 0.3rem;">${SVG_ICONS.mapPin} ${order.address ? (order.address.length > 45 ? order.address.substring(0,45) + '...' : order.address) : 'Pending'}</div>
                        <button onclick="driverAcceptOrder('${order.id}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 700; width: 100%; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                            ${SVG_ICONS.check} ACCEPT ORDER
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Status Message (when no orders) -->
        ${driver.available && availableOrders.length === 0 && assignedOrders.length === 0 ? `
            <div style="background: #f8fafc; padding: 2.5rem 1.5rem; border-radius: 16px; text-align: center; margin-bottom: 1rem; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 0.5rem; color: #64748b;">${SVG_ICONS.signal}</div>
                <p style="color: #64748b; margin: 0; font-size: 1.1rem; font-weight: 500;">Waiting for orders...</p>
            </div>
        ` : ''}
        
        ${!driver.available && assignedOrders.length === 0 ? `
            <div style="background: #fef2f2; padding: 2.5rem 1.5rem; border-radius: 16px; text-align: center; margin-bottom: 1rem; border: 2px solid #fecaca;">
                <div style="margin-bottom: 0.5rem; color: #dc2626;">${SVG_ICONS.moon}</div>
                <p style="color: #dc2626; margin: 0; font-size: 1.1rem; font-weight: 600;">You're offline</p>
                <p style="color: #9ca3af; margin: 0.3rem 0 0; font-size: 0.95rem;">Go online to receive orders</p>
            </div>
        ` : ''}
        
        <!-- Active Deliveries -->
        ${assignedOrders.length > 0 ? `
            <div style="margin-bottom: 0.8rem;">
                <div style="font-size: 1rem; color: #6b7280; font-weight: 600; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.4rem;">
                    ${SVG_ICONS.car} Active Delivery${assignedOrders.length > 1 ? ` (${assignedOrders.length})` : ''}
                </div>
                ${assignedOrders.map(order => `
                    <div style="background: white; border-radius: 18px; margin-bottom: 0.8rem; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                        <!-- Order Header -->
                        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 0.9rem 1.2rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 700; color: white; font-size: 1.15rem;">#${order.id}</span>
                            <span style="background: rgba(255,255,255,0.25); color: white; padding: 0.3rem 0.7rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">
                                ${order.status === 'out_for_delivery' ? SVG_ICONS.car + ' EN ROUTE' : order.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        </div>
                        
                        <!-- Customer Details -->
                        <div style="padding: 1rem 1.2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                                <span style="color: #1f2937; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.user} ${order.userName}</span>
                                <a href="tel:${order.userPhone}" style="background: #dbeafe; color: #2563eb; text-decoration: none; padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.phone} Call</a>
                            </div>
                            
                            <div style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem; line-height: 1.4; display: flex; align-items: flex-start; gap: 0.3rem;">
                                ${SVG_ICONS.mapPin} ${order.address || 'Address N/A'}
                            </div>
                            
                            <!-- Payment & Distance -->
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: #f9fafb; border-radius: 12px; margin-bottom: 0.8rem;">
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span style="background: ${order.paymentMethod === 'cash' ? '#fef3c7' : '#d1fae5'}; color: ${order.paymentMethod === 'cash' ? '#92400e' : '#065f46'}; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.3rem;">
                                        ${order.paymentMethod === 'cash' ? SVG_ICONS.pound + ' £' + order.total.toFixed(2) : SVG_ICONS.checkCircle + ' PAID'}
                                    </span>
                                </div>
                                ${order.distanceMiles ? `
                                    <span style="color: #6b7280; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">${SVG_ICONS.ruler} ${order.distanceMiles} mi</span>
                                ` : ''}
                            </div>
                            
                            <!-- Action Buttons -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                                <button onclick="openDirections('${encodeURIComponent(order.address)}', '${order.deliveryLocation?.lat || ''}', '${order.deliveryLocation?.lng || ''}')" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                                    ${SVG_ICONS.map} Directions
                                </button>
                                <button onclick="markOrderDelivered('${order.id}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                                    ${SVG_ICONS.checkCircle} Delivered
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Logout Footer -->
        <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid #e5e7eb;">
            <button onclick="confirmLogoutDriver()" style="background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 0.8rem; border-radius: 10px; cursor: pointer; font-size: 0.95rem; width: 100%; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                ${SVG_ICONS.logout} Logout
            </button>
        </div>
    `;
    
    // Show fullscreen dashboard
    modal.style.display = 'block';
    
    // Hide navigation bar for fullscreen dashboard
    document.body.classList.add('modal-open');
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    const header = document.querySelector('.header');
    if (mobileNav) mobileNav.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    if (header) header.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
}

function callCustomer(phone) {
    if (phone && phone !== 'N/A') {
        window.location.href = 'tel:' + phone;
    } else {
        uiAlert('Customer phone number not available', 'error');
    }
}

function confirmLogoutDriver() {
    if (confirm('Are you sure you want to logout?\n\nYou will stop receiving new orders.')) {
        logoutDriver();
    }
}

function toggleDriverAvailability() {
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (!driverId) return;
    
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    const newStatus = !driver.available;
    window.driverSystem.update(driverId, { available: newStatus });
    
    showDriverDashboard();
    uiAlert(`You are now ${newStatus ? 'Online - Ready for deliveries!' : 'Offline'}`, 'success');
}

function updateDriverLocation() {
    if (!navigator.geolocation) {
        uiAlert('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (!driverId) {
        uiAlert('Please login first', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                updatedAt: new Date().toISOString()
            };
            
            // Update driver's location in system
            window.driverSystem.update(driverId, {
                currentLocation: locationData
            });
            
            // Save to localStorage for customer tracking
            const liveLocations = JSON.parse(localStorage.getItem('driverLiveLocations') || '{}');
            liveLocations[driverId] = locationData;
            localStorage.setItem('driverLiveLocations', JSON.stringify(liveLocations));
            
            uiAlert('Location updated!<br><br>Customers can now see your live location.', 'success');
            showDriverDashboard();
        },
        (error) => {
            uiAlert('Unable to get your location: ' + error.message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Auto-update driver location every 30 seconds when online
function startDriverLocationTracking() {
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (!driverId) return;
    
    const driver = window.driverSystem.get(driverId);
    if (!driver || !driver.available) return;
    
    // Check if there are assigned orders
    const hasOrders = pendingOrders.some(o => o.driverId === driverId);
    if (!hasOrders) return;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    updatedAt: new Date().toISOString()
                };
                
                window.driverSystem.update(driverId, { currentLocation: locationData });
                
                const liveLocations = JSON.parse(localStorage.getItem('driverLiveLocations') || '{}');
                liveLocations[driverId] = locationData;
                localStorage.setItem('driverLiveLocations', JSON.stringify(liveLocations));
            },
            () => {}, // Silently fail
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }
}

// Start tracking when driver goes online or accepts order
setInterval(() => {
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (driverId) {
        startDriverLocationTracking();
    }
}, 60000); // Update every 60 seconds

function openDirections(address, lat, lng) {
    // Prevent double-click
    if (window.directionsBtnCooldown) return;
    window.directionsBtnCooldown = true;
    setTimeout(() => { window.directionsBtnCooldown = false; }, 1000);
    
    let destination;
    
    // First try: use provided lat/lng if valid numbers
    if (lat && lng && lat !== '' && lng !== '' && lat !== 'undefined' && lng !== 'undefined') {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
            destination = `${latNum},${lngNum}`;
        }
    }
    
    // Second try: extract coordinates from address string like "Location: 53.4539, -2.0695 (0.5 miles)"
    if (!destination && address) {
        const decodedAddress = decodeURIComponent(address);
        const coordMatch = decodedAddress.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
            destination = `${coordMatch[1]},${coordMatch[2]}`;
        }
    }
    
    // Fallback: use cleaned address (remove Location: prefix and miles suffix)
    if (!destination && address) {
        let cleanAddress = decodeURIComponent(address);
        cleanAddress = cleanAddress.replace(/^Location:\s*/i, '').replace(/\s*\([^)]*miles?\)/i, '').trim();
        destination = encodeURIComponent(cleanAddress);
    }
    
    if (!destination) {
        uiAlert('No delivery address available', 'error');
        return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
}

function markOrderDelivered(orderId) {
    if (!confirm('Mark this order as delivered?')) return;
    
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Update order status
    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    order.driverRated = false; // Flag for rating
    
    // Move to order history
    orderHistory.push(order);
    pendingOrders = pendingOrders.filter(o => o.id !== orderId);
    
    // Update driver stats
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (driverId) {
        const driver = window.driverSystem.get(driverId);
        if (driver) {
            window.driverSystem.update(driverId, {
                deliveries: (driver.deliveries || 0) + 1
            });
        }
    }
    
    // Notify customer (without driver details for completed orders)
    addNotification(order.userId, {
        type: 'order_completed',
        title: 'Order Delivered!',
        message: `Your order #${orderId} has been delivered. Enjoy your meal!`,
        orderId: orderId
    });
    
    saveData();
    playNotificationSound();
    showDriverDashboard();
    
    uiAlert('Order marked as delivered!', 'success');
    
    // Trigger rating popup for customer if they're logged in
    if (currentUser && currentUser.email === order.userId) {
        showDeliveryRatingPopup(orderId, order.driverId, order.driverName || 'Driver');
    }
}

function logoutDriver() {
    sessionStorage.removeItem('loggedInDriver');
    sessionStorage.removeItem('driverName');
    currentDriver = null;
    
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLogin;
    }
    
    // Close modal if open
    const modal = document.getElementById('driverDashboardModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    
    // Restore navigation bar and body scroll
    restorePageState();
}

// Close dashboard without logging out (for X button)
function closeDriverDashboard() {
    const modal = document.getElementById('driverDashboardModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    
    // Restore navigation bar and body scroll
    restorePageState();
}

// Helper function to restore page state
function restorePageState() {
    // Remove modal-open class
    document.body.classList.remove('modal-open');
    
    // Restore body scroll (critical for desktop)
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.documentElement.style.overflow = '';
    
    // Restore navigation bar
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    const header = document.querySelector('.header');
    
    // Mobile nav needs display:flex
    if (mobileNav) {
        mobileNav.style.cssText = '';
    }
    
    // Header should NOT have display:flex - just clear inline styles
    if (header) {
        header.style.cssText = '';
    }
}

// ========================================
// DRIVER LIVE TRACKING
// ========================================
let trackingMap = null;
let driverMarker = null;
let customerMarker = null;
let trackingInterval = null;
let trackingOrderId = null;

function trackDriver(orderId) {
    const order = pendingOrders.find(o => o.id === orderId) || orderHistory.find(o => o.id === orderId);
    if (!order) {
        uiAlert('Order not found', 'error');
        return;
    }
    
    if (!order.driverId) {
        uiAlert('No driver assigned to this order yet', 'error');
        return;
    }
    
    // Check if order is still out for delivery
    if (order.status === 'completed') {
        uiAlert('This order has been delivered!', 'success');
        return;
    }
    
    trackingOrderId = orderId;
    
    // Get driver info
    const driver = window.driverSystem.get(order.driverId);
    
    // Show tracking modal
    const modal = document.getElementById('driverTrackingModal');
    const orderIdDisplay = document.getElementById('trackingOrderId');
    const infoPanel = document.getElementById('driverInfoPanel');
    
    if (orderIdDisplay) {
        orderIdDisplay.textContent = `Order #${orderId}`;
    }
    
    // Get driver image
    const driverImage = driver?.profilePic || driver?.profilePicture || null;
    
    // Render driver info panel with image
    if (infoPanel) {
        infoPanel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; overflow: hidden; border: 3px solid #10b981;">
                    ${driverImage ? `<img src="${driverImage}" style="width: 100%; height: 100%; object-fit: cover;">` : svgIcon('driver-marker', 48)}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: white; font-size: 1.1rem;">${order.driverName || 'Driver'}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">${svgIcon("phone", 14, "icon-teal")} ${order.driverPhone || 'N/A'}</div>
                    ${driver?.rating ? `<div style="color: #f59e0b; font-size: 0.85rem;">${svgIcon("star", 14)} ${driver.rating.toFixed(1)} rating</div>` : ''}
                </div>
                <div style="text-align: right;">
                    ${order.distanceMiles ? `<div style="color: #3b82f6; font-weight: 700; font-size: 1.1rem;">${svgIcon("map-pin", 14, "icon-blue")} ${order.distanceMiles} mi</div>` : ''}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                <a href="tel:${order.driverPhone}" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 600; text-align: center; text-decoration: none;">
                    ${svgIcon("phone", 14, "icon-teal")} Call Driver
                </a>
                <button onclick="refreshDriverLocation()" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    ${svgIcon("refresh", 14, "icon-blue")} Refresh
                </button>
            </div>
        `;
    }
    
    modal.style.display = 'block';
    
    // Hide navigation — tracking view is fullscreen
    document.body.classList.add('modal-open');
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    const header = document.querySelector('.header');
    if (mobileNav) mobileNav.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    if (header) header.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    
    // Initialize tracking map
    setTimeout(() => {
        initTrackingMap(order, driver);
    }, 100);
    
    // Start location updates
    startLocationUpdates(order, driver);
}

function initTrackingMap(order, driver) {
    const mapContainer = document.getElementById('trackingMap');
    if (!mapContainer || !window.google) {
        mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.5);">Map requires Google Maps API</div>';
        return;
    }
    
    // Default to restaurant location if no delivery location
    const customerLat = order.deliveryLocation?.lat || UK_CONFIG.restaurant.lat + 0.01;
    const customerLng = order.deliveryLocation?.lng || UK_CONFIG.restaurant.lng + 0.01;
    
    // Driver location - check if driver has real location, otherwise simulate
    let driverLat, driverLng;
    
    // Check for real-time driver location from localStorage
    const liveDriverLocations = JSON.parse(localStorage.getItem('driverLiveLocations') || '{}');
    if (liveDriverLocations[order.driverId]) {
        driverLat = liveDriverLocations[order.driverId].lat;
        driverLng = liveDriverLocations[order.driverId].lng;
    } else if (driver?.currentLocation?.lat) {
        driverLat = driver.currentLocation.lat;
        driverLng = driver.currentLocation.lng;
    } else {
        // Simulate starting from restaurant
        driverLat = UK_CONFIG.restaurant.lat;
        driverLng = UK_CONFIG.restaurant.lng;
    }
    
    const center = {
        lat: (customerLat + driverLat) / 2,
        lng: (customerLng + driverLng) / 2
    };
    
    trackingMap = new google.maps.Map(mapContainer, {
        center: center,
        zoom: 15,
        mapTypeId: 'hybrid', // Satellite with labels
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        gestureHandling: 'greedy', // Single finger drag on mobile
        zoomControl: true,
        fullscreenControl: false,
        streetViewControl: false
    });
    
    // Customer marker (destination) - House icon
    customerMarker = new google.maps.Marker({
        position: { lat: customerLat, lng: customerLng },
        map: trackingMap,
        title: 'Delivery Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
        },
        label: {
            text: '',
            fontSize: '16px'
        }
    });
    
    // Driver marker - Motorcycle delivery icon with rotation support
    driverMarker = new google.maps.Marker({
        position: { lat: driverLat, lng: driverLng },
        map: trackingMap,
        title: order.driverName || 'Driver',
        icon: {
            path: 'M12 2C11.5 2 11 2.19 10.59 2.59L7.29 5.88C6.5 6.67 6 7.7 6 9V14.5C6 15.33 6.67 16 7.5 16H8.5L9 18H7V20H17V18H15L15.5 16H16.5C17.33 16 18 15.33 18 14.5V9C18 7.7 17.5 6.67 16.71 5.88L13.41 2.59C13 2.19 12.5 2 12 2M12 4L15 7H9L12 4M8 9H16V14H8V9M9.5 10C8.67 10 8 10.67 8 11.5S8.67 13 9.5 13 11 12.33 11 11.5 10.33 10 9.5 10M14.5 10C13.67 10 13 10.67 13 11.5S13.67 13 14.5 13 16 12.33 16 11.5 15.33 10 14.5 10Z',
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: 1.8,
            anchor: new google.maps.Point(12, 12),
            rotation: 0
        }
    });
    
    // Draw route line
    const routePath = new google.maps.Polyline({
        path: [
            { lat: driverLat, lng: driverLng },
            { lat: customerLat, lng: customerLng }
        ],
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 4
    });
    routePath.setMap(trackingMap);
    
    // Fit bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: customerLat, lng: customerLng });
    bounds.extend({ lat: driverLat, lng: driverLng });
    trackingMap.fitBounds(bounds, 50);
}

function startLocationUpdates(order, driver) {
    // Clear any existing interval
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
    
    // Simulate driver movement towards customer
    let progress = 0;
    const startLat = driver?.currentLocation?.lat || UK_CONFIG.restaurant.lat;
    const startLng = driver?.currentLocation?.lng || UK_CONFIG.restaurant.lng;
    const endLat = order.deliveryLocation?.lat || UK_CONFIG.restaurant.lat + 0.01;
    const endLng = order.deliveryLocation?.lng || UK_CONFIG.restaurant.lng + 0.01;
    const orderId = order.id;
    
    trackingInterval = setInterval(() => {
        if (!driverMarker || !trackingMap) {
            clearInterval(trackingInterval);
            trackingInterval = null;
            return;
        }
        
        // Check if order is still active (not completed/cancelled)
        const currentOrder = pendingOrders.find(o => o.id === orderId) || orderHistory.find(o => o.id === orderId);
        if (!currentOrder || currentOrder.status === 'completed' || currentOrder.status === 'cancelled') {
            clearInterval(trackingInterval);
            trackingInterval = null;
            // Auto-close tracking modal if order is done
            if (currentOrder && (currentOrder.status === 'completed' || currentOrder.status === 'cancelled')) {
                closeTrackingModal();
                uiAlert(currentOrder.status === 'completed' ? 'Your order has been delivered!' : 'Order was cancelled', currentOrder.status === 'completed' ? 'success' : 'info');
            }
            return;
        }
        
        // Move driver closer to destination (simulation)
        progress += 0.05;
        if (progress >= 1) {
            progress = 1;
            clearInterval(trackingInterval);
            trackingInterval = null;
        }
        
   const newLat = startLat + (endLat - startLat) * progress;
        const newLng = startLng + (endLng - startLng) * progress;
        
        // Smooth animation to new position
        const oldPos = driverMarker.getPosition();
        animateMarker(driverMarker, oldPos.lat(), oldPos.lng(), newLat, newLng);
        
    }, 60000); // Update every 60 seconds
}

// Smooth marker animation
function animateMarker(marker, fromLat, fromLng, toLat, toLng) {
    let step = 0;
    const steps = 30;
    // Calculate bearing (rotation angle)
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(toLat * Math.PI / 180);
    const x = Math.cos(fromLat * Math.PI / 180) * Math.sin(toLat * Math.PI / 180) -
              Math.sin(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    
    // Set icon rotation once at start
    const icon = marker.getIcon();
    if (icon) { icon.rotation = bearing; marker.setIcon(icon); }
    
    const interval = setInterval(() => {
        step++;
        const t = step / steps;
        const ease = t * (2 - t);
        marker.setPosition({
            lat: fromLat + (toLat - fromLat) * ease,
            lng: fromLng + (toLng - fromLng) * ease
        });
        if (step >= steps) clearInterval(interval);
    }, 50);
}


function refreshDriverLocation() {
    if (trackingOrderId) {
        const order = pendingOrders.find(o => o.id === trackingOrderId) || orderHistory.find(o => o.id === trackingOrderId);
        if (order) {
            const driver = window.driverSystem.get(order.driverId);
            initTrackingMap(order, driver);
        }
    }
    uiAlert('Location refreshed!', 'info');
}

function closeTrackingModal() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    trackingOrderId = null;
    const modal = document.getElementById('driverTrackingModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Restore navigation properly - just clear styles, let CSS handle display
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

// ========================================
// DRIVER RATING SYSTEM
// ========================================
let currentRating = 0;

function openDriverRating(orderId, driverId, driverName, autoPopup = false) {
    // Check if order was already rated
    const order = orderHistory.find(o => o.id === orderId);
    if (order && order.driverRated) {
        if (!autoPopup) {
            uiAlert(`You have already rated this driver!<br><br><strong>Rating:</strong> ${order.driverRating}/5 stars`, 'warning');
        }
        return;
    }
    
    // Get driver info for image
    const driver = window.driverSystem.get(driverId);
    
    document.getElementById('ratingOrderId').value = orderId;
    document.getElementById('ratingDriverId').value = driverId;
    document.getElementById('ratingDriverName').textContent = driverName;
    
    // Show driver image if available
    const driverImageContainer = document.getElementById('ratingDriverImage');
    if (driverImageContainer) {
        if (driver && driver.profilePic) {
            driverImageContainer.innerHTML = `<img src="${driver.profilePic}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #f59e0b;">`;
        } else {
            driverImageContainer.innerHTML = `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">${svgIcon('user-circle', 50, 'icon-blue')}</div>`;
        }
    }
    
    // Clear comment field
    const commentField = document.getElementById('ratingComment');
    if (commentField) commentField.value = '';
    
    currentRating = 0;
    renderStarRating();
    document.getElementById('ratingValue').textContent = '0';
    
    openModal('driverRatingModal');
}

function renderStarRating() {
    const container = document.getElementById('starRatingContainer');
    if (!container) return;
    
    // Simple 5-star rating (whole numbers only)
    container.innerHTML = `
        <div style="display: flex; gap: 0.5rem; justify-content: center;">
            ${[1, 2, 3, 4, 5].map(i => `
                <div onclick="setRating(${i})" 
                     style="font-size: 2.8rem; cursor: pointer; opacity: ${i <= currentRating ? 1 : 0.3}; transition: all 0.2s; transform: ${i <= currentRating ? 'scale(1.1)' : 'scale(1)'};" 
                     onmouseover="previewRating(${i})" 
                     onmouseout="resetPreview()">${svgIcon("star", 22)}</div>
            `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding: 0 0.5rem;">
            ${['Poor', 'Fair', 'Good', 'Great', 'Excellent'].map((label, i) => `
                <span style="font-size: 0.7rem; color: rgba(255,255,255,0.4); text-align: center; width: 50px;">${label}</span>
            `).join('')}
        </div>
    `;
}

function setRating(value) {
    currentRating = value;
    document.getElementById('ratingValue').textContent = value;
    renderStarRating();
}

function previewRating(value) {
    // Visual preview on hover
    const stars = document.querySelectorAll('#starRatingContainer > div > div');
    stars.forEach((star, index) => {
        star.style.opacity = index + 1 <= value ? 1 : 0.3;
        star.style.transform = index + 1 <= value ? 'scale(1.1)' : 'scale(1)';
    });
}

function resetPreview() {
    renderStarRating();
}

function submitDriverRating() {
    if (currentRating < 1) {
        uiAlert('Please select a rating (1-5 stars)', 'warning');
        return;
    }
    
    const orderId = document.getElementById('ratingOrderId').value;
    const driverId = document.getElementById('ratingDriverId').value;
    const comment = document.getElementById('ratingComment')?.value.trim() || '';
    
    // Find order and update
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
        order.driverRated = true;
        order.driverRating = currentRating;
        order.driverRatingComment = comment;
        saveData();
    }
    
    // Also update in pendingOrders if exists there
    const pendingOrder = pendingOrders.find(o => o.id === orderId);
    if (pendingOrder) {
        pendingOrder.driverRated = true;
        pendingOrder.driverRating = currentRating;
        pendingOrder.driverRatingComment = comment;
        saveData();
    }
    
    // Update driver's average rating (keeps decimal precision internally)
    const driver = window.driverSystem.get(driverId);
    if (driver) {
        const totalRatings = (driver.totalRatings || 0) + 1;
        const ratingSum = ((driver.rating || 5) * (driver.totalRatings || 0)) + currentRating;
        const newAverage = ratingSum / totalRatings;
        
        window.driverSystem.update(driverId, {
            rating: Math.round(newAverage * 100) / 100, // Keep 2 decimal places internally
            totalRatings: totalRatings
        });
    }
    
    closeModal('driverRatingModal');
    
    uiAlert(`Thank you for your ${currentRating}-star rating!${comment ? '<br><br>Your feedback has been saved.' : ''}`, 'success');
    
    // Refresh account page if open
    if (document.getElementById('accountModal')?.style.display === 'flex') {
        showAccount();
    }
}

// Auto-popup rating after delivery
function showDeliveryRatingPopup(orderId, driverId, driverName) {
    setTimeout(() => {
        openDriverRating(orderId, driverId, driverName, true);
    }, 1500);
}

function generateDriverSecretCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DRV-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ========================================
// GLOBAL EXPORTS FOR DRIVER.JS FUNCTIONS
// ========================================
window.showDriverLogin = showDriverLogin;
window.showDriverCodeLogin = showDriverCodeLogin;
window.showDriverEmailLogin = showDriverEmailLogin;
window.handleDriverCodeLogin = handleDriverCodeLogin;
window.handleDriverEmailPasswordLogin = handleDriverEmailPasswordLogin;
window.loginDriver = loginDriver;
window.showDriverDashboard = showDriverDashboard;
window.toggleDriverAvailability = toggleDriverAvailability;
window.updateDriverLocation = updateDriverLocation;
window.openDirections = openDirections;
window.markOrderDelivered = markOrderDelivered;
window.callCustomer = callCustomer;
window.confirmLogoutDriver = confirmLogoutDriver;
window.logoutDriver = logoutDriver;
window.closeDriverDashboard = closeDriverDashboard;
window.updateDriverLoginUI = updateDriverLoginUI;
window.generateDriverSecretCode = generateDriverSecretCode;
window.trackDriver = trackDriver;
window.closeTrackingModal = closeTrackingModal;
window.refreshDriverLocation = refreshDriverLocation;
window.openDriverRating = openDriverRating;
window.submitDriverRating = submitDriverRating;
window.showDeliveryRatingPopup = showDeliveryRatingPopup;
