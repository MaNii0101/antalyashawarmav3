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
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 1.5rem; border-radius: 15px; text-align: center; margin-bottom: 1.5rem; position: relative;">
            <button onclick="confirmLogoutDriver()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">✕</button>
            
            <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 0.8rem; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; overflow: hidden; border: 3px solid rgba(255,255,255,0.3);">
                ${profilePic}
            </div>
            <h2 style="margin: 0; color: white; font-size: 1.3rem;">${driver.name}</h2>
            <p style="margin: 0.3rem 0 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">${driver.secretCode}</p>
            
            <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;">
                <div><span style="font-size: 1.3rem; font-weight: 700;">${driver.deliveries || 0}</span><br><span style="font-size: 0.8rem; opacity: 0.9;">Deliveries</span></div>
                <div><span style="font-size: 1.3rem; font-weight: 700;">⭐ ${driver.rating || 5.0}</span><br><span style="font-size: 0.8rem; opacity: 0.9;">Rating</span></div>
            </div>
            
            <div style="margin-top: 1rem;">
                <span style="background: ${driver.available ? 'rgba(255,255,255,0.3)' : 'rgba(239,68,68,0.5)'}; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                    ${driver.available ? '🟢 Online' : '🔴 Offline'}
                </span>
            </div>
        </div>
        
        <!-- Status Toggle -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.5rem;">
            <button onclick="toggleDriverAvailability()" style="background: ${driver.available ? 'linear-gradient(45deg, #ef4444, #dc2626)' : 'linear-gradient(45deg, #10b981, #059669)'}; color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                ${driver.available ? '⏸️ Go Offline' : '▶️ Go Online'}
            </button>
            <button onclick="updateDriverLocation()" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 1rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                📍 Update Location
            </button>
        </div>
        
        <!-- Available Orders Section -->
        ${driver.available && availableOrders.length > 0 ? `
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h3 style="color: white; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                    🔔 New Orders Available (${availableOrders.length})
                </h3>
                ${availableOrders.map(order => `
                    <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 10px; margin-bottom: 0.8rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <span style="font-weight: 700; font-size: 1.1rem; color: white;">#${order.id}</span>
                            <span style="font-weight: 700; color: white; font-size: 1.1rem;">${formatPrice(order.total)}</span>
                        </div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-bottom: 0.8rem;">
                            <div>📍 ${order.address || 'Address pending'}</div>
                            <div>📦 ${order.items.length} item(s)</div>
                        </div>
                        <button onclick="driverAcceptOrder('${order.id}')" style="background: white; color: #d97706; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 700; width: 100%; font-size: 1rem;">
                            ✅ ACCEPT ORDER
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : driver.available ? `
            <div style="background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 3rem;">📡</div>
                <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0 0;">Waiting for new orders...</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin: 0.3rem 0 0;">You'll be notified when orders are available</p>
            </div>
        ` : `
            <div style="background: rgba(239,68,68,0.1); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem; border: 2px solid rgba(239,68,68,0.3);">
                <div style="font-size: 3rem;">🔴</div>
                <p style="color: #ef4444; font-weight: 600; margin: 0.5rem 0 0;">You're Offline</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin: 0.3rem 0 0;">Go online to receive orders</p>
            </div>
        `}
        
        <!-- My Deliveries Section -->
        <h3 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            🚗 My Deliveries (${assignedOrders.length})
        </h3>
        
        ${assignedOrders.length === 0 ? `
            <div style="background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 2.5rem;">📦</div>
                <p style="color: rgba(255,255,255,0.5); margin: 0.5rem 0 0;">No active deliveries</p>
            </div>
        ` : assignedOrders.map(order => `
            <div style="background: rgba(59,130,246,0.1); padding: 1.2rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid rgba(59,130,246,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-weight: 700; font-size: 1.1rem; color: white;">#${order.id}</span>
                    <span style="background: rgba(59,130,246,0.3); color: #3b82f6; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                        ${order.status === 'out_for_delivery' ? '🚗 EN ROUTE' : order.status.toUpperCase()}
                    </span>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="margin-bottom: 0.5rem; font-size: 1rem;">
                        👤 <strong>${order.userName}</strong>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">
                        📞 <a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none;">${order.userPhone || 'N/A'}</a>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">
                        📍 ${order.address || 'N/A'}
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: rgba(255,255,255,0.6);">💰 Total:</span>
                        <span style="font-weight: 700; color: #10b981; font-size: 1.1rem;">${formatPrice(order.total)}</span>
                    </div>
                    ${order.distanceMiles ? `
                        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                            <span style="color: rgba(255,255,255,0.6);">📏 Distance:</span>
                            <span style="color: white;">${order.distanceMiles} miles</span>
                        </div>
                    ` : ''}
                    ${order.estimatedTime ? `
                        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                            <span style="color: rgba(255,255,255,0.6);">⏱️ ETA:</span>
                            <span style="color: #f59e0b; font-weight: 600;">${order.estimatedTime} mins</span>
                        </div>
                    ` : ''}
                    
                    <!-- Payment Method for Driver -->
                    <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="background: ${order.paymentMethod === 'cash' ? 'rgba(245,158,11,0.3)' : 'rgba(42,157,143,0.3)'}; padding: 0.6rem; border-radius: 8px; text-align: center; font-weight: 700; color: ${order.paymentMethod === 'cash' ? '#f4a261' : '#2a9d8f'};">
                            ${order.paymentMethod === 'cash' ? '💷 CASH - Collect £' + order.total.toFixed(2) : order.paymentMethod === 'applepay' ? '🍎 Apple Pay - PAID' : '💳 Card - PAID'}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <button onclick="openDirections('${encodeURIComponent(order.address)}')" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 1rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        🗺️ Directions
                    </button>
                    <button onclick="markOrderDelivered('${order.id}')" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 1rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        ✅ Delivered
                    </button>
                </div>
                
                <button onclick="callCustomer('${order.userPhone}')" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.8rem; border-radius: 10px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.8rem;">
                    📞 Call Customer
                </button>
            </div>
        `).join('')}
        
        <!-- Logout Button -->
        <button onclick="confirmLogoutDriver()" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 2px solid #ef4444; padding: 1.2rem; border-radius: 12px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 1rem; font-size: 1rem;">
            🚪 Logout
        </button>
        
        <!-- Refresh Button -->
        <button onclick="showDriverDashboard()" style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 0.8rem; border-radius: 10px; cursor: pointer; width: 100%; margin-top: 0.8rem;">
            🔄 Refresh
        </button>
    `;
    
    // Show fullscreen dashboard
    modal.style.display = 'block';
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

function openDirections(address) {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
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
                    ${order.estimatedTime ? `<div style="color: #f59e0b; font-weight: 700; font-size: 1.2rem;">~${order.estimatedTime} min</div>` : ''}
                    ${order.distanceMiles ? `<div style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">${order.distanceMiles} miles</div>` : ''}
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
    
    trackingInterval = setInterval(() => {
        if (!driverMarker || !trackingMap) {
            clearInterval(trackingInterval);
            return;
        }
        
        // Move driver closer to destination (simulation)
        progress += 0.05;
        if (progress >= 1) {
            progress = 1;
            clearInterval(trackingInterval);
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
        icon.rotation = heading;
        driverMarker.setIcon(icon);
        
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
window.updateDriverLoginUI = updateDriverLoginUI;
window.generateDriverSecretCode = generateDriverSecretCode;
