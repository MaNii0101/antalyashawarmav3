// ========================================
// ANTALYA SHAWARMA - DRIVER SYSTEM
// Driver Dashboard & Delivery Functions
// ========================================

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
        alert('❌ Please enter your secret code!');
        return;
    }
    
    const driver = window.driverSystem.getByCode(code);
    
    if (!driver) {
        alert('❌ Invalid secret code!');
        return;
    }
    
    if (!driver.active) {
        alert('❌ Your account is inactive. Please contact management.');
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
        alert('❌ Please enter email and password!');
        return;
    }
    
    const driver = window.driverSystem.getByEmail(email);
    
    if (!driver) {
        alert('❌ Driver not found with this email!');
        return;
    }
    
    if (!driver.active) {
        alert('❌ Your account is inactive. Please contact management.');
        return;
    }
    
    if (driver.password !== password) {
        alert('❌ Incorrect password!');
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
        loginBtn.textContent = `🚗 ${driverName}`;
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
        alert('❌ Driver session expired. Please login again.');
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
        : '🚗';
    
    content.innerHTML = `
        <!-- Header Bar -->
        <div style="background: linear-gradient(135deg, #10b981, #047857); padding: 1.2rem 1.5rem; border-radius: 20px; margin-bottom: 1rem; position: relative; box-shadow: 0 4px 20px rgba(16,185,129,0.35);">
            <button onclick="closeDriverDashboard()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.25); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">✕</button>
            
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; overflow: hidden; border: 3px solid rgba(255,255,255,0.5); flex-shrink: 0;">
                    ${profilePic}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                        <h2 style="margin: 0; color: white; font-size: 1.3rem; font-weight: 700;">${driver.name}</h2>
                        <span style="background: ${driver.available ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}; padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: white;">
                            ${driver.available ? '● ONLINE' : '● OFFLINE'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 1.2rem; margin-top: 0.4rem; font-size: 0.95rem; color: rgba(255,255,255,0.95);">
                        <span>📦 ${driver.deliveries || 0} trips</span>
                        <span>⭐ ${(driver.rating || 5.0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="display: flex; gap: 0.6rem; margin-bottom: 1rem;">
            <button onclick="toggleDriverAvailability()" style="flex: 1; background: ${driver.available ? '#fee2e2' : '#d1fae5'}; color: ${driver.available ? '#dc2626' : '#059669'}; border: none; padding: 0.9rem 0.8rem; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                ${driver.available ? '⏸ Go Offline' : '▶ Go Online'}
            </button>
            <button onclick="updateDriverLocation()" style="flex: 1; background: #dbeafe; color: #2563eb; border: none; padding: 0.9rem 0.8rem; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                📍 Location
            </button>
            <button onclick="showDriverDashboard()" style="background: #f3f4f6; color: #6b7280; border: none; padding: 0.9rem 1rem; border-radius: 14px; cursor: pointer; font-size: 1.1rem;">
                🔄
            </button>
        </div>
        
        <!-- New Orders Alert -->
        ${driver.available && availableOrders.length > 0 ? `
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 16px; padding: 1rem; margin-bottom: 1rem; border: 2px solid #f59e0b;">
                <div style="font-weight: 700; color: #92400e; font-size: 1.1rem; margin-bottom: 0.8rem;">🔔 ${availableOrders.length} New Order${availableOrders.length > 1 ? 's' : ''}</div>
                ${availableOrders.map(order => `
                    <div style="background: white; padding: 1rem; border-radius: 12px; margin-bottom: 0.6rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 700; color: #1f2937; font-size: 1.1rem;">#${order.id}</span>
                            <span style="font-weight: 800; color: #059669; font-size: 1.3rem;">${formatPrice(order.total)}</span>
                        </div>
                        <div style="color: #6b7280; font-size: 0.95rem; margin-bottom: 0.6rem;">📍 ${order.address ? (order.address.length > 45 ? order.address.substring(0,45) + '...' : order.address) : 'Pending'}</div>
                        <button onclick="driverAcceptOrder('${order.id}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 700; width: 100%; font-size: 1rem;">
                            ✓ ACCEPT ORDER
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Status Message (when no orders) -->
        ${driver.available && availableOrders.length === 0 && assignedOrders.length === 0 ? `
            <div style="background: #f8fafc; padding: 2.5rem 1.5rem; border-radius: 16px; text-align: center; margin-bottom: 1rem; border: 1px solid #e2e8f0;">
                <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">📡</div>
                <p style="color: #64748b; margin: 0; font-size: 1.1rem; font-weight: 500;">Waiting for orders...</p>
            </div>
        ` : ''}
        
        ${!driver.available && assignedOrders.length === 0 ? `
            <div style="background: #fef2f2; padding: 2.5rem 1.5rem; border-radius: 16px; text-align: center; margin-bottom: 1rem; border: 2px solid #fecaca;">
                <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">😴</div>
                <p style="color: #dc2626; margin: 0; font-size: 1.1rem; font-weight: 600;">You're offline</p>
                <p style="color: #9ca3af; margin: 0.3rem 0 0; font-size: 0.95rem;">Go online to receive orders</p>
            </div>
        ` : ''}
        
        <!-- Active Deliveries -->
        ${assignedOrders.length > 0 ? `
            <div style="margin-bottom: 0.8rem;">
                <div style="font-size: 1rem; color: #6b7280; font-weight: 600; margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">
                    🚗 Active Delivery${assignedOrders.length > 1 ? ` (${assignedOrders.length})` : ''}
                </div>
                ${assignedOrders.map(order => `
                    <div style="background: white; border-radius: 18px; margin-bottom: 0.8rem; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                        <!-- Order Header -->
                        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 0.9rem 1.2rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 700; color: white; font-size: 1.15rem;">#${order.id}</span>
                            <span style="background: rgba(255,255,255,0.25); color: white; padding: 0.3rem 0.7rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">
                                ${order.status === 'out_for_delivery' ? '🚗 EN ROUTE' : order.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        </div>
                        
                        <!-- Customer Details -->
                        <div style="padding: 1rem 1.2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                                <span style="color: #1f2937; font-weight: 600; font-size: 1.1rem;">👤 ${order.userName}</span>
                                <a href="tel:${order.userPhone}" style="background: #dbeafe; color: #2563eb; text-decoration: none; padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600;">📞 Call</a>
                            </div>
                            
                            <div style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem; line-height: 1.4;">
                                📍 ${order.address || 'Address N/A'}
                            </div>
                            
                            <!-- Payment & Distance -->
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: #f9fafb; border-radius: 12px; margin-bottom: 0.8rem;">
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span style="background: ${order.paymentMethod === 'cash' ? '#fef3c7' : '#d1fae5'}; color: ${order.paymentMethod === 'cash' ? '#92400e' : '#065f46'}; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 1rem;">
                                        ${order.paymentMethod === 'cash' ? '💷 £' + order.total.toFixed(2) : '✓ PAID'}
                                    </span>
                                </div>
                                ${order.distanceMiles ? `
                                    <span style="color: #6b7280; font-size: 1rem; font-weight: 600;">📏 ${order.distanceMiles} mi</span>
                                ` : ''}
                            </div>
                            
                            <!-- Action Buttons -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                                <button onclick="openDirections('${encodeURIComponent(order.address)}', '${order.deliveryLocation?.lat || ''}', '${order.deliveryLocation?.lng || ''}')" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                                    🗺️ Directions
                                </button>
                                <button onclick="markOrderDelivered('${order.id}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                                    ✅ Delivered
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- Logout Footer -->
        <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid #e5e7eb;">
            <button onclick="confirmLogoutDriver()" style="background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 0.8rem; border-radius: 10px; cursor: pointer; font-size: 0.95rem; width: 100%; font-weight: 500;">
                🚪 Logout
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
        alert('❌ Customer phone number not available');
    }
}

function confirmLogoutDriver() {
    if (confirm('🚪 Are you sure you want to logout?\n\nYou will stop receiving new orders.')) {
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
    alert(`✅ You are now ${newStatus ? 'Online - Ready for deliveries!' : 'Offline'}`);
}

function updateDriverLocation() {
    if (!navigator.geolocation) {
        alert('❌ Geolocation is not supported by your browser');
        return;
    }
    
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (!driverId) {
        alert('❌ Please login first');
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
            
            alert('✅ Location updated!\n\nCustomers can now see your live location.');
            showDriverDashboard();
        },
        (error) => {
            alert('❌ Unable to get your location: ' + error.message);
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
}, 30000); // Update every 30 seconds

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
        alert('❌ No delivery address available');
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
        title: '🎉 Order Delivered!',
        message: `Your order #${orderId} has been delivered. Enjoy your meal!`,
        orderId: orderId
    });
    
    saveData();
    playNotificationSound();
    showDriverDashboard();
    
    alert('✅ Order marked as delivered!');
    
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
        alert('❌ Order not found');
        return;
    }
    
    if (!order.driverId) {
        alert('❌ No driver assigned to this order yet');
        return;
    }
    
    // Check if order is still out for delivery
    if (order.status === 'completed') {
        alert('✅ This order has been delivered!');
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
                    ${driverImage ? `<img src="${driverImage}" style="width: 100%; height: 100%; object-fit: cover;">` : '🚗'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: white; font-size: 1.1rem;">${order.driverName || 'Driver'}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">📞 ${order.driverPhone || 'N/A'}</div>
                    ${driver?.rating ? `<div style="color: #f59e0b; font-size: 0.85rem;">⭐ ${driver.rating.toFixed(1)} rating</div>` : ''}
                </div>
                <div style="text-align: right;">
                    ${order.distanceMiles ? `<div style="color: #3b82f6; font-weight: 700; font-size: 1.1rem;">📍 ${order.distanceMiles} mi</div>` : ''}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                <a href="tel:${order.driverPhone}" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 600; text-align: center; text-decoration: none;">
                    📞 Call Driver
                </a>
                <button onclick="refreshDriverLocation()" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    🔄 Refresh
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
            text: '🏠',
            fontSize: '16px'
        }
    });
    
    // Driver marker - Car icon
    driverMarker = new google.maps.Marker({
        position: { lat: driverLat, lng: driverLng },
        map: trackingMap,
        title: order.driverName || 'Driver',
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
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
                alert(currentOrder.status === 'completed' ? '🎉 Your order has been delivered!' : '❌ Order was cancelled');
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
        
        driverMarker.setPosition({ lat: newLat, lng: newLng });
        
        // Calculate heading for arrow rotation
        const heading = google.maps.geometry?.spherical?.computeHeading(
            new google.maps.LatLng(newLat, newLng),
            new google.maps.LatLng(endLat, endLng)
        ) || 0;
        
        const icon = driverMarker.getIcon();
        if (icon) {
            icon.rotation = heading;
            driverMarker.setIcon(icon);
        }
        
    }, 3000); // Update every 3 seconds
}

function refreshDriverLocation() {
    if (trackingOrderId) {
        const order = pendingOrders.find(o => o.id === trackingOrderId) || orderHistory.find(o => o.id === trackingOrderId);
        if (order) {
            const driver = window.driverSystem.get(order.driverId);
            initTrackingMap(order, driver);
        }
    }
    alert('📍 Location refreshed!');
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
            alert(`⚠️ You have already rated this driver!\n\nRating: ${order.driverRating}/5 stars`);
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
            driverImageContainer.innerHTML = `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">🚗</div>`;
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
                     onmouseout="resetPreview()">⭐</div>
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
        alert('⚠️ Please select a rating (1-5 stars)');
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
    
    alert(`⭐ Thank you for your ${currentRating}-star rating!${comment ? '\n\nYour feedback has been saved.' : ''}`);
    
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
