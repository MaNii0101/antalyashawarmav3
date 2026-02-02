// ========================================
// ANTALYA SHAWARMA - OWNER DASHBOARD
// Restaurant Management & Owner Functions
// ========================================

// ========================================
// RESTAURANT DASHBOARD (FOR EMPLOYERS)
// ========================================
function showRestaurantLogin() {
    openModal('restaurantLoginModal');
}

function handleRestaurantLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('restaurantEmail').value;
    const password = document.getElementById('restaurantPassword').value;
    
    if (email === RESTAURANT_CREDENTIALS.email && password === RESTAURANT_CREDENTIALS.password) {
        isRestaurantLoggedIn = true;
        closeModal('restaurantLoginModal');
        closeModal('loginModal');
        
        setTimeout(() => {
            showRestaurantDashboard();
        }, 300);
    } else if (email === OWNER_CREDENTIALS.email && password === OWNER_CREDENTIALS.password) {
        // Also allow owner credentials for restaurant dashboard
        isRestaurantLoggedIn = true;
        closeModal('restaurantLoginModal');
        closeModal('loginModal');
        
        setTimeout(() => {
            showRestaurantDashboard();
        }, 300);
    } else {
        alert('❌ Invalid credentials!');
    }
}

function showRestaurantDashboard() {
    const modal = document.getElementById('restaurantDashboard');
    if (!modal) return;
    
    // Calculate DAILY stats (today only)
    const now = new Date();
    const today = now.toDateString();
    
    // Use orderHistory to avoid double counting
    
   // Exclude cancelled and rejected
    const dailyOrders = orderHistory.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today && o.status !== 'cancelled' && o.status !== 'rejected';
    });
    
    // Revenue from completed orders only
    const dailyRevenue = dailyOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);

    // Count specific statuses
    const pendingCount = pendingOrders.filter(o => o.status === 'pending').length;
    const completedCount = dailyOrders.filter(o => o.status === 'completed').length;
    
    // Update stats UI
    const dailyRevenueEl = document.getElementById('monthlyRevenueStat');
    const dailyOrdersEl = document.getElementById('monthlyOrdersStat');
    const pendingOrdersEl = document.getElementById('pendingOrdersStat');
    const completedOrdersEl = document.getElementById('completedOrdersStat');
    
    if (dailyRevenueEl) dailyRevenueEl.textContent = formatPrice(dailyRevenue);
    if (dailyOrdersEl) dailyOrdersEl.textContent = dailyOrders.length; // Now correct (1 order = 1 count)
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingCount;
    if (completedOrdersEl) completedOrdersEl.textContent = completedCount;
    
    // Render pending orders
    const ordersContainer = document.getElementById('restaurantPendingOrders');
    if (ordersContainer) {
        // Filter out CANCELLED orders from view
        const visibleOrders = pendingOrders.filter(o => o.status !== 'cancelled');

        if (visibleOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">
                    <div style="font-size: 4rem;">📦</div>
                    <p>No pending orders</p>
                </div>
            `;
        } else {
            ordersContainer.innerHTML = visibleOrders.map(order => {
                // Get user profile picture
                const user = userDatabase.find(u => u.email === order.userId);
                const profilePic = user && user.profilePicture 
                    ? `<img src="${user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">` 
                    : '👤';
                
                return `
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid ${order.status === 'pending' ? '#f59e0b' : order.status === 'accepted' ? '#10b981' : '#3b82f6'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-weight: 700; font-size: 1.1rem;">#${order.id}</span>
                        <span style="background: ${order.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${order.status === 'pending' ? '#f59e0b' : '#10b981'}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${order.status.toUpperCase()}</span>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; overflow: hidden; flex-shrink: 0; border: 3px solid rgba(255,255,255,0.2);">
                            ${profilePic}
                        </div>
                        <div style="flex: 1; font-size: 0.95rem;">
                            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.3rem;">${order.userName}</div>
                            <div style="color: rgba(255,255,255,0.7);">📞 ${order.userPhone || 'N/A'}</div>
                            <div style="color: rgba(255,255,255,0.7);">📍 ${order.address || 'N/A'}</div>
                            ${user && user.dob ? `<div style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">DOB: ${new Date(user.dob).toLocaleDateString()}</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 1rem;">🕐 ${new Date(order.createdAt).toLocaleString()}</div>
                    
                    <div style="background: ${order.paymentMethod === 'cash' ? 'rgba(245,158,11,0.2)' : order.paymentMethod === 'applepay' ? 'rgba(0,0,0,0.3)' : 'rgba(59,130,246,0.2)'}; padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                        ${order.paymentMethod === 'cash' ? '💵 CASH' : order.paymentMethod === 'applepay' ? ' Apple Pay' : '💳 CARD'} ${order.paymentMethod === 'cash' ? '- Collect Payment' : '- PAID'}
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">Items:</div>
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem;">
                                <span>${item.icon} ${item.name} x${item.quantity}</span>
                                <span>${formatPrice(item.finalPrice * item.quantity)}</span>
                            </div>
                        `).join('')}
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700; display: flex; justify-content: space-between;">
                            <span>Total:</span>
                            <span style="color: #ff6b6b;">${formatPrice(order.total)}</span>
                        </div>
                    </div>
                    
                    ${order.status === 'pending' ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <button onclick="acceptOrder('${order.id}')" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600;">✅ Accept</button>
                            <button onclick="rejectOrder('${order.id}')" style="background: linear-gradient(45deg, #ef4444, #dc2626); color: white; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600;">❌ Reject</button>
                        </div>
                    ` : order.status === 'accepted' ? `
                        <div style="display: grid; gap: 0.5rem;">
                            <button onclick="notifyAllAvailableDrivers('${order.id}')" style="background: linear-gradient(45deg, #f59e0b, #d97706); color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                                📢 Notify All Drivers
                            </button>
                            <button onclick="assignDriver('${order.id}')" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600;">🚗 Assign Specific Driver</button>
                        </div>
                    ` : order.status === 'driver_assigned' || order.status === 'out_for_delivery' ? `
                        <div style="background: rgba(16,185,129,0.2); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-weight: 600; color: #10b981;">🚗 Driver: ${order.driverName || 'Assigned'}</div>
                            ${order.estimatedTime ? `<div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">ETA: ${order.estimatedTime} mins</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `}).join('');
        }
    }
    
    modal.style.display = 'block';
    
    if (typeof hideNavigation === 'function') {
        hideNavigation();
    }
    
    if (typeof updateRestaurantStats === 'function') {
        updateRestaurantStats();
    }
}

function acceptOrder(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Guard against cancelled orders
    if (order.status === 'cancelled') {
        alert('❌ Cannot accept: This order was cancelled by the user.');
        showRestaurantDashboard(); // Refresh view to remove it
        return;
    }
    
    order.status = 'accepted';
    order.acceptedAt = new Date().toISOString();
    saveData();
    
    // Send notification to customer
    addNotification(order.userId, {
        type: 'order_accepted',
        title: '✅ Order Accepted!',
        message: `Your order #${orderId} has been accepted and is being prepared.`,
        orderId: orderId
    });
    
    playNotificationSound();
    showRestaurantDashboard();
    
    alert(`✅ Order #${orderId} accepted!\n\nClick "Notify All Drivers" to alert available drivers.`);
}

function notifyAllAvailableDrivers(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    if (order.driverId) {
        alert('⚠️ This order already has a driver assigned!');
        return;
    }
    
    const availableDrivers = window.driverSystem.getAvailable();
    
    if (availableDrivers.length === 0) {
        alert('⚠️ No available drivers at the moment!');
        return;
    }
    
    // Mark order as waiting for driver
    order.status = 'waiting_driver';
    order.notifiedDrivers = availableDrivers.map(d => d.id);
    saveData();
    
    // Store available order for drivers
    if (!window.availableOrdersForDrivers) {
        window.availableOrdersForDrivers = {};
    }
    window.availableOrdersForDrivers[orderId] = {
        orderId: orderId,
        order: order,
        notifiedAt: new Date().toISOString(),
        claimedBy: null
    };
    
    // Save to localStorage
    localStorage.setItem('availableOrdersForDrivers', JSON.stringify(window.availableOrdersForDrivers));
    
    let notifiedList = '📢 Notification sent to available drivers:\n\n';
    availableDrivers.forEach(driver => {
        notifiedList += `✅ ${driver.name} (${driver.phone})\n`;
    });
    
    playNotificationSound();
    showRestaurantDashboard();
    alert(notifiedList + `\n${availableDrivers.length} driver(s) notified!\n\nFirst driver to accept will get the order.`);
}

// Calculate delivery time based on distance
function calculateDeliveryTime(distanceMiles) {
    // Base time: 10 minutes per mile
    // Plus 5 minutes for preparation
    const timePerMile = 10; // minutes
    const prepTime = 5; // minutes
    
    const deliveryTime = Math.ceil(distanceMiles * timePerMile) + prepTime;
    return deliveryTime;
}

// Calculate distance between two coordinates
function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Driver accepts order
function driverAcceptOrder(orderId) {
    const driverId = sessionStorage.getItem('loggedInDriver');
    if (!driverId) {
        alert('❌ Please login first');
        return;
    }
    
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    // Check if order is still available
    const availableOrder = window.availableOrdersForDrivers?.[orderId];
    if (!availableOrder) {
        alert('❌ This order is no longer available!');
        showDriverDashboard();
        return;
    }
    
    if (availableOrder.claimedBy && availableOrder.claimedBy !== driverId) {
        alert('❌ Sorry, another driver already accepted this order!');
        showDriverDashboard();
        return;
    }
    
    // Find the actual order
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) {
        alert('❌ Order not found!');
        return;
    }
    
    // Mark order as claimed by this driver
    availableOrder.claimedBy = driverId;
    
    // Calculate distance from restaurant to customer
    let distanceMiles = 2; // Default
    let estimatedTime = 25; // Default
    
    if (order.deliveryLocation && order.deliveryLocation.lat) {
        distanceMiles = getDistanceFromLatLng(
            UK_CONFIG.restaurant.lat,
            UK_CONFIG.restaurant.lng,
            order.deliveryLocation.lat,
            order.deliveryLocation.lng
        );
        estimatedTime = calculateDeliveryTime(distanceMiles);
    } else if (order.distance) {
        distanceMiles = order.distance;
        estimatedTime = calculateDeliveryTime(distanceMiles);
    }
    
    // Update order
    order.driverId = driverId;
    order.driverName = driver.name;
    order.driverPhone = driver.phone;
    order.status = 'out_for_delivery';
    order.driverAcceptedAt = new Date().toISOString();
    order.estimatedTime = estimatedTime;
    order.distanceMiles = distanceMiles.toFixed(1);
    
    // Remove from available orders
    delete window.availableOrdersForDrivers[orderId];
    localStorage.setItem('availableOrdersForDrivers', JSON.stringify(window.availableOrdersForDrivers));
    
    saveData();
    
    // Notify customer with driver info and ETA
    addNotification(order.userId, {
        type: 'driver_on_way',
        title: '🚗 Driver On The Way!',
        message: `${driver.name} is delivering your order #${orderId}.\n📞 ${driver.phone}\n⏱️ Estimated arrival: ${estimatedTime} minutes\n📍 Distance: ${distanceMiles.toFixed(1)} miles`,
        orderId: orderId,
        driverName: driver.name,
        driverPhone: driver.phone,
        estimatedTime: estimatedTime
    });
    
    playNotificationSound();
    
    alert(`✅ Order #${orderId} accepted!\n\n📍 Distance: ${distanceMiles.toFixed(1)} miles\n⏱️ Estimated time: ${estimatedTime} minutes\n\nClick "Directions" to navigate to customer.`);
    
    showDriverDashboard();
}

function rejectOrder(orderId) {
    const reason = prompt('Reason for rejection (optional):');
    
    // 1. Find in Pending Orders
    const orderIndex = pendingOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    // 2. FIX: Update the status in the main orderHistory
    const historyOrder = orderHistory.find(o => o.id === orderId);
    if (historyOrder) {
        historyOrder.status = 'rejected';
        historyOrder.rejectionReason = reason;
    }
    
    // 3. Remove from Pending Orders (it is no longer pending)
    pendingOrders.splice(orderIndex, 1);
    saveData();
    
    // 4. Send notification to customer
    addNotification(orderHistory.find(o => o.id === orderId)?.userId, {
        type: 'order_rejected',
        title: '❌ Order Rejected',
        message: `Your order #${orderId} has been rejected.${reason ? ' Reason: ' + reason : ''}`,
        orderId: orderId
    });
    
    showRestaurantDashboard();
    alert(`❌ Order #${orderId} rejected`);
}

function assignDriver(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const availableDrivers = window.driverSystem.getAvailable();
    
    if (availableDrivers.length === 0) {
        alert('❌ No available drivers at the moment!\n\nAll drivers are either offline or inactive.');
        return;
    }
    
    // Create a nice selection dialog
    let driverList = '🚗 Available Drivers:\n\n';
    availableDrivers.forEach((d, i) => {
        driverList += `${i + 1}. ${d.name}\n   📦 ${d.deliveries} deliveries | ⭐ ${d.rating}\n   📞 ${d.phone}\n\n`;
    });
    
    const selection = prompt(driverList + 'Enter driver number (or 0 to notify all):');
    
    if (selection === null) return;
    
    if (selection === '0') {
        notifyAllAvailableDrivers(orderId);
        return;
    }
    
    const driverIndex = parseInt(selection) - 1;
    if (isNaN(driverIndex) || driverIndex < 0 || driverIndex >= availableDrivers.length) {
        alert('❌ Invalid selection');
        return;
    }
    
    const selectedDriver = availableDrivers[driverIndex];
    order.driverId = selectedDriver.id;
    order.assignedDriver = selectedDriver.id;
    order.driverName = selectedDriver.name;
    order.status = 'out_for_delivery';
    saveData();
    
    // Send notification to customer
    addNotification(order.userId, {
        type: 'driver_assigned',
        title: '🚗 Driver Assigned!',
        message: `${selectedDriver.name} is on the way with your order #${orderId}.`,
        orderId: orderId
    });
    
    playNotificationSound();
    showRestaurantDashboard();
    alert(`✅ Driver ${selectedDriver.name} assigned to order #${orderId}\n\n📞 Driver phone: ${selectedDriver.phone}`);
}

function completeOrder(orderId) {
    const orderIndex = pendingOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    
    // Move to history and remove from pending
    const historyOrder = orderHistory.find(o => o.id === orderId);
    if (historyOrder) {
        historyOrder.status = 'completed';
        historyOrder.completedAt = order.completedAt;
    }
    
    pendingOrders.splice(orderIndex, 1);
    saveData();
    
    // Send notification to customer
    addNotification(order.userId, {
        type: 'order_completed',
        title: '✅ Order Delivered!',
        message: `Your order #${orderId} has been delivered. Enjoy your meal!`,
        orderId: orderId
    });
    
    showRestaurantDashboard();
    playNotificationSound();
    alert(`✅ Order #${orderId} completed!`);
}

function closeRestaurantDashboard() {
    isRestaurantLoggedIn = false;
    document.getElementById('restaurantDashboard').style.display = 'none';
    
    // Show navigation when dashboard closes
    if (typeof showNavigation === 'function') {
        showNavigation();
    } else {
        const mobileNav = document.querySelector('.mobile-bottom-nav');
        const header = document.querySelector('.header');
        if (mobileNav) mobileNav.style.cssText = '';
        if (header) header.style.cssText = '';
    }
}

// ========================================
// DRIVER MANAGEMENT (OWNER ONLY)
// ========================================
function showDriverManagementModal() {
    if (!isOwnerLoggedIn) {
        alert('❌ Owner access required!');
        return;
    }
    
    renderDriverList();
    openModal('driverManagementModal');
}

function renderDriverList() {
    const container = document.getElementById('driverListContainer');
    if (!container) return;
    
    const allDrivers = window.driverSystem.getAll();
    
    if (allDrivers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">
                <div style="font-size: 3rem;">🚗</div>
                <p>No drivers registered yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allDrivers.map(driver => {
        const profilePic = driver.profilePicture 
            ? `<img src="${driver.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">` 
            : '🚗';
        const statusColor = driver.active ? '#10b981' : '#ef4444';
        const statusText = driver.active ? '🟢 Active' : '🔴 Inactive';
        const availableText = driver.available ? '✅ Available' : '⏸️ Unavailable';
        
        return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid ${statusColor};">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden; flex-shrink: 0; border: 3px solid ${statusColor};">
                    ${profilePic}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: white;">${driver.name}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">Code: <strong>${driver.secretCode}</strong></div>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                        <span style="font-size: 0.8rem; color: ${driver.active ? '#10b981' : '#ef4444'};">${statusText}</span>
                        <span style="font-size: 0.8rem; color: ${driver.available ? '#3b82f6' : '#f59e0b'};">${availableText}</span>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-bottom: 1rem;">
                <div>📧 ${driver.email}</div>
                <div>📞 ${driver.phone}</div>
                <div>📦 ${driver.deliveries || 0} deliveries</div>
                <div>⭐ ${driver.rating || 5.0} rating</div>
                ${driver.dob ? `<div>🎂 ${new Date(driver.dob).toLocaleDateString()}</div>` : ''}
                ${driver.gender ? `<div>👤 ${driver.gender.charAt(0).toUpperCase() + driver.gender.slice(1)}</div>` : ''}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                <button onclick="editDriver('${driver.id}')" style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">✏️ Edit</button>
                <button onclick="toggleDriverStatus('${driver.id}')" style="background: ${driver.active ? 'linear-gradient(45deg, #f59e0b, #d97706)' : 'linear-gradient(45deg, #10b981, #059669)'}; color: white; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">${driver.active ? '⏸️ Deactivate' : '▶️ Activate'}</button>
                <button onclick="deleteDriver('${driver.id}')" style="background: linear-gradient(45deg, #ef4444, #dc2626); color: white; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">🗑️ Remove</button>
            </div>
        </div>
    `}).join('');
}

function editDriver(driverId) {
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    const editDriverId = document.getElementById('editDriverId');
    const editDriverName = document.getElementById('editDriverName');
    const editDriverEmail = document.getElementById('editDriverEmail');
    const editDriverPhone = document.getElementById('editDriverPhone');
    const editDriverPassword = document.getElementById('editDriverPassword');
    const editDriverBirth = document.getElementById('editDriverBirth');
    const editDriverGender = document.getElementById('editDriverGender');
    const editDriverStatus = document.getElementById('editDriverStatus');
    
    if (editDriverId) editDriverId.value = driverId;
    if (editDriverName) editDriverName.value = driver.name || '';
    if (editDriverEmail) editDriverEmail.value = driver.email || '';
    if (editDriverPhone) editDriverPhone.value = driver.phone || '';
    if (editDriverPassword) editDriverPassword.value = '';
    if (editDriverBirth) editDriverBirth.value = driver.dob || '';
    if (editDriverGender) editDriverGender.value = driver.gender || '';
    if (editDriverStatus) editDriverStatus.value = driver.active ? 'active' : 'inactive';
    
    const preview = document.getElementById('editDriverPicPreview');
    if (preview) {
        if (driver.profilePicture) {
            preview.innerHTML = `<img src="${driver.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            preview.innerHTML = '🚗';
        }
        preview.dataset.newPic = '';
    }
    
    openModal('editDriverModal');
}

function previewDriverPic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('newDriverPicPreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            preview.dataset.newPic = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewEditDriverPic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editDriverPicPreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            preview.dataset.newPic = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveDriverChanges() {
    const driverId = document.getElementById('editDriverId').value;
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    const name = document.getElementById('editDriverName').value.trim();
    const email = document.getElementById('editDriverEmail').value.trim();
    const phone = document.getElementById('editDriverPhone').value.trim();
    const password = document.getElementById('editDriverPassword').value;
    const dob = document.getElementById('editDriverBirth').value;
    const gender = document.getElementById('editDriverGender').value;
    const status = document.getElementById('editDriverStatus').value;
    const preview = document.getElementById('editDriverPicPreview');
    const newPic = preview.dataset.newPic;
    
    if (!name || !email || !phone) {
        alert('❌ Name, email and phone are required');
        return;
    }
    
    const updates = {
        name: name,
        email: email,
        phone: phone,
        dob: dob,
        gender: gender,
        active: status === 'active'
    };
    
    if (password) {
        updates.password = password;
    }
    
    if (newPic) {
        updates.profilePicture = newPic;
    }
    
    window.driverSystem.update(driverId, updates);
    
    closeModal('editDriverModal');
    renderDriverList();
    updateOwnerStats();
    
    alert('✅ Driver updated successfully!');
}

function toggleDriverStatus(driverId) {
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    const newStatus = !driver.active;
    window.driverSystem.update(driverId, { active: newStatus, available: newStatus });
    
    renderDriverList();
    alert(`✅ Driver ${driver.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
}

function addNewDriver() {
    const name = document.getElementById('newDriverName').value.trim();
    const email = document.getElementById('newDriverEmail').value.trim();
    const phone = document.getElementById('newDriverPhone').value.trim();
    const password = document.getElementById('newDriverPassword').value;
    const dob = document.getElementById('newDriverBirth').value;
    const gender = document.getElementById('newDriverGender').value;
    const preview = document.getElementById('newDriverPicPreview');
    const profilePic = preview.dataset ? preview.dataset.newPic : null;
    
    if (!name || !email || !phone || !password) {
        alert('❌ Please fill in name, email, phone and password');
        return;
    }
    
    // Check if email already exists
    if (window.driverSystem.getByEmail(email)) {
        alert('❌ A driver with this email already exists');
        return;
    }
    
    // Generate unique driver code
    const driverCount = window.driverSystem.getAll().length + 1;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const secretCode = `DRV-${String(driverCount).padStart(3, '0')}-${initials}`;
    
    const newDriver = {
        id: 'driver-' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        dob: dob || null,
        gender: gender || null,
        secretCode: secretCode,
        deliveries: 0,
        rating: 5.0,
        active: true,
        available: true,
        profilePicture: profilePic || null,
        currentLocation: null,
        createdAt: new Date().toISOString()
    };
    
    window.driverSystem.add(newDriver);
    
    // Clear form
    document.getElementById('newDriverName').value = '';
    document.getElementById('newDriverEmail').value = '';
    document.getElementById('newDriverPhone').value = '';
    document.getElementById('newDriverPassword').value = '';
    document.getElementById('newDriverBirth').value = '';
    document.getElementById('newDriverGender').value = '';
    if (preview) {
        preview.innerHTML = '🚗';
        preview.dataset.newPic = '';
    }
    
    // Update UI
    renderDriverList();
    updateOwnerStats();
    
    alert(`✅ Driver ${name} added!\n\nSecret Code: ${secretCode}\nPassword: ${password}\n\nDriver can login with either the code or email+password.`);
}

function deleteDriver(driverId) {
    if (!confirm('Are you sure you want to remove this driver?')) return;
    
    window.driverSystem.delete(driverId);
    renderDriverList();
    updateOwnerStats();
    
    alert('✅ Driver removed');
}

// ========================================
// BANK SETTINGS (OWNER ONLY)
// ========================================
function showBankSettingsModal() {
    if (!isOwnerLoggedIn) {
        alert('❌ Owner access required!');
        return;
    }
    
    // Load existing bank details
    const bankNameEl = document.getElementById('bankName');
    const accountHolderEl = document.getElementById('accountHolder');
    const accountNumberEl = document.getElementById('accountNumber');
    const sortCodeEl = document.getElementById('sortCode');
    const ibanEl = document.getElementById('iban');
    
    if (bankNameEl) bankNameEl.value = ownerBankDetails.bankName || '';
    if (accountHolderEl) accountHolderEl.value = ownerBankDetails.accountHolder || '';
    if (accountNumberEl) accountNumberEl.value = ownerBankDetails.accountNumber || '';
    if (sortCodeEl) sortCodeEl.value = ownerBankDetails.sortCode || '';
    if (ibanEl) ibanEl.value = ownerBankDetails.iban || '';
    
    openModal('bankSettingsModal');
}

function saveBankSettings(event) {
    event.preventDefault();
    
    ownerBankDetails = {
        bankName: document.getElementById('bankName').value,
        accountHolder: document.getElementById('accountHolder').value,
        accountNumber: document.getElementById('accountNumber').value,
        sortCode: document.getElementById('sortCode').value,
        iban: document.getElementById('iban').value || ''
    };
    
    // Save to localStorage
    localStorage.setItem('ownerBankDetails', JSON.stringify(ownerBankDetails));
    
    closeModal('bankSettingsModal');
    alert('✅ Bank details saved successfully!');
}

// Load bank details on init
function loadBankDetails() {
    const saved = localStorage.getItem('ownerBankDetails');
    if (saved) {
        ownerBankDetails = JSON.parse(saved);
    }
}

// ========================================
// OWNER ACCESS (FULL SYSTEM)
// ========================================
function showOwnerLogin() {
    openModal('ownerModal');
}

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
    
    // Show owner button on ALL devices (desktop + mobile)
    const desktopOwnerBtn = document.getElementById('ownerAccessBtn');
    const mobileOwnerBtn = document.getElementById('mobileOwnerBtn');
    
    if (desktopOwnerBtn) desktopOwnerBtn.style.display = 'flex';
    if (mobileOwnerBtn) mobileOwnerBtn.style.display = 'flex';
    
    closeModal('ownerModal');
    document.getElementById('ownerDashboard').style.display = 'block';
    
    // Hide navigation when dashboard opens
    if (typeof hideNavigation === 'function') {
        hideNavigation();
    } else {
        const mobileNav = document.querySelector('.mobile-bottom-nav');
        const header = document.querySelector('.header');
        if (mobileNav) mobileNav.style.cssText = 'display: none !important;';
        if (header) header.style.cssText = 'display: none !important;';
    }
    
    updateOwnerStats();
    
    alert('✅ Owner access granted!');
    
}
// Add to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Hide owner buttons by default
    const desktopOwnerBtn = document.getElementById('ownerAccessBtn');
    const mobileOwnerBtn = document.getElementById('mobileOwnerBtn');
    if (desktopOwnerBtn) desktopOwnerBtn.style.display = 'none';
    if (mobileOwnerBtn) mobileOwnerBtn.style.display = 'none';
    
    // Rest of your existing code...
});

function updateOwnerStats() {
    // Revenue from completed orders only
    const totalRevenue = orderHistory
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);

    // Exclude cancelled and rejected
    const totalOrders = orderHistory.filter(o => o.status !== 'cancelled' && o.status !== 'rejected').length;
    
    const pendingCount = pendingOrders.filter(o => o.status === 'pending').length;
    
    const totalUsers = userDatabase.length;
    const totalDrivers = window.driverSystem.getAll().length;
    
    // Main stats
    const revenueEl = document.getElementById('revenueStat');
    const ordersEl = document.getElementById('ordersStat');
    const pendingEl = document.getElementById('pendingStat');
    const usersEl = document.getElementById('usersStat');
    const driverCountEl = document.getElementById('driverCountStat');
    const driversTextEl = document.getElementById('driversRegisteredText');
    
    if (revenueEl) revenueEl.textContent = formatPrice(totalRevenue);
    if (ordersEl) ordersEl.textContent = totalOrders;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (usersEl) usersEl.textContent = totalUsers;
    if (driverCountEl) driverCountEl.textContent = totalDrivers;
    if (driversTextEl) driversTextEl.textContent = totalDrivers + ' registered';
    
    // Today's stats
    const today = new Date().toDateString();
    
    // Today's orders (exclude cancelled and rejected)
    const todayOrders = orderHistory.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today && o.status !== 'cancelled' && o.status !== 'rejected';
    });
    
    // Today's revenue (completed only)
    const todayRevenue = todayOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);

    const avgOrderVal = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
    
    const newUsersToday = userDatabase.filter(u => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.toDateString() === today;
    }).length;
    
    const todayRevenueEl = document.getElementById('todayRevenue');
    const todayOrdersEl = document.getElementById('todayOrders');
    const avgOrderEl = document.getElementById('avgOrderValue');
    const newCustomersEl = document.getElementById('newCustomers');
    const avgRatingEl = document.getElementById('avgRatingStat');
    
    if (todayRevenueEl) todayRevenueEl.textContent = formatPrice(todayRevenue);
    if (todayOrdersEl) todayOrdersEl.textContent = todayOrders.length;
    if (avgOrderEl) avgOrderEl.textContent = formatPrice(avgOrderVal);
    if (newCustomersEl) newCustomersEl.textContent = newUsersToday;
    
    // Average rating — computed from real driver ratings
    if (avgRatingEl) {
        const ratedOrders = orderHistory.filter(o => o.driverRated && o.driverRating);
        if (ratedOrders.length > 0) {
            const avgRating = ratedOrders.reduce((sum, o) => sum + o.driverRating, 0) / ratedOrders.length;
            avgRatingEl.textContent = avgRating.toFixed(1);
        } else {
            avgRatingEl.textContent = '—';
        }
    }
    
    // Popular Items — computed from all completed orders
    const popularEl = document.getElementById('popularItemsList');
    if (popularEl) {
        const completedOrders = orderHistory.filter(o => o.status === 'completed' && o.items);
        const itemCounts = {};
        
        completedOrders.forEach(order => {
            order.items.forEach(item => {
                const name = item.name || 'Unknown';
                const icon = item.icon || '🍽️';
                const key = name;
                if (!itemCounts[key]) {
                    itemCounts[key] = { name, icon, count: 0 };
                }
                itemCounts[key].count += (item.quantity || 1);
            });
        });
        
        const sorted = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
        
        if (sorted.length === 0) {
            popularEl.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 1rem 0;">No order data yet</div>';
        } else {
            popularEl.innerHTML = sorted.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.85rem;">
                    <span>${item.icon} ${item.name}</span>
                    <span style="color: #10b981; font-weight: 600;">${item.count}</span>
                </div>
            `).join('');
        }
    }
}

// ========================================
// OWNER MENU MANAGEMENT SYSTEM
// ========================================
let editingFoodId = null;
let editingCategory = null;

function openMenuManager() {
    const modal = document.getElementById('menuManagerModal');
    if (modal) {
        renderMenuManagerList();
        modal.style.display = 'flex';
    }
}

function renderMenuManagerList() {
    const container = document.getElementById('menuManagerContent');
    if (!container) return;
    
    const categoryKeys = Object.keys(categories);
    
    container.innerHTML = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button onclick="openAddCategory()" style="background: linear-gradient(45deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                ➕ Add Category
            </button>
            <button onclick="openAddFood()" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                🍽️ Add Food Item
            </button>
        </div>
        
        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 1rem;">💡 Use ⬆️ ⬇️ arrows to reorder categories</p>
        
        ${categoryKeys.map((catKey, index) => {
            const cat = categories[catKey];
            return `
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 1rem; overflow: hidden;">
                <div style="background: rgba(139,92,246,0.2); padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <button onclick="moveCategoryUp('${catKey}')" ${index === 0 ? 'disabled' : ''} style="background: ${index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.2)'}; color: ${index === 0 ? 'rgba(255,255,255,0.3)' : '#3b82f6'}; border: none; padding: 0.2rem 0.4rem; border-radius: 4px; cursor: ${index === 0 ? 'not-allowed' : 'pointer'}; font-size: 0.7rem;">⬆️</button>
                            <button onclick="moveCategoryDown('${catKey}')" ${index === categoryKeys.length - 1 ? 'disabled' : ''} style="background: ${index === categoryKeys.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.2)'}; color: ${index === categoryKeys.length - 1 ? 'rgba(255,255,255,0.3)' : '#3b82f6'}; border: none; padding: 0.2rem 0.4rem; border-radius: 4px; cursor: ${index === categoryKeys.length - 1 ? 'not-allowed' : 'pointer'}; font-size: 0.7rem;">⬇️</button>
                        </div>
                        ${cat.image ? `<img src="${cat.image}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">` : `<span style="font-size: 1.5rem;">${cat.icon}</span>`}
                        <span style="font-weight: 700;">${cat.name}</span>
                        <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">(${menuData[catKey]?.length || 0} items)</span>
                    </div>
                    <button onclick="openEditCategory('${catKey}')" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                        ✏️ Edit
                    </button>
                </div>
                
                <div style="padding: 0.5rem;">
                    ${(menuData[catKey] || []).map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1; min-width: 200px;">
                                ${item.image ? `<img src="${item.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">` : (cat.image ? `<img src="${cat.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; opacity: 0.7;">` : `<span style="font-size: 1.3rem;">${item.icon || cat.icon}</span>`)}
                                <div>
                                    <div style="font-weight: 600; ${item.available === false ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${item.name}</div>
                                    <div style="font-size: 0.85rem; color: #10b981;">${formatPrice(item.price)}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.3rem;">
                                <button onclick="toggleFoodAvailability('${catKey}', ${item.id})" style="background: ${item.available !== false ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${item.available !== false ? '#10b981' : '#ef4444'}; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    ${item.available !== false ? '✅' : '❌'}
                                </button>
                                <button onclick="openEditFood('${catKey}', ${item.id})" style="background: rgba(59,130,246,0.2); color: #3b82f6; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    ✏️
                                </button>
                                <button onclick="deleteFood('${catKey}', ${item.id})" style="background: rgba(239,68,68,0.2); color: #ef4444; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('')}
    `;
}

// Move category up in order
function moveCategoryUp(catKey) {
    const keys = Object.keys(categories);
    const index = keys.indexOf(catKey);
    if (index <= 0) return;
    
    // Swap with previous
    const newCategories = {};
    const newMenuData = {};
    
    keys.forEach((key, i) => {
        if (i === index - 1) {
            newCategories[catKey] = categories[catKey];
            newMenuData[catKey] = menuData[catKey];
        } else if (i === index) {
            newCategories[keys[index - 1]] = categories[keys[index - 1]];
            newMenuData[keys[index - 1]] = menuData[keys[index - 1]];
        } else {
            newCategories[key] = categories[key];
            newMenuData[key] = menuData[key];
        }
    });
    
    // Replace global objects
    Object.keys(categories).forEach(k => delete categories[k]);
    Object.assign(categories, newCategories);
    
    Object.keys(menuData).forEach(k => delete menuData[k]);
    Object.assign(menuData, newMenuData);
    
    saveMenuData();
    renderMenuManagerList();
    renderCategories();
}

// Move category down in order
function moveCategoryDown(catKey) {
    const keys = Object.keys(categories);
    const index = keys.indexOf(catKey);
    if (index >= keys.length - 1) return;
    
    // Swap with next
    const newCategories = {};
    const newMenuData = {};
    
    keys.forEach((key, i) => {
        if (i === index) {
            newCategories[keys[index + 1]] = categories[keys[index + 1]];
            newMenuData[keys[index + 1]] = menuData[keys[index + 1]];
        } else if (i === index + 1) {
            newCategories[catKey] = categories[catKey];
            newMenuData[catKey] = menuData[catKey];
        } else {
            newCategories[key] = categories[key];
            newMenuData[key] = menuData[key];
        }
    });
    
    // Replace global objects
    Object.keys(categories).forEach(k => delete categories[k]);
    Object.assign(categories, newCategories);
    
    Object.keys(menuData).forEach(k => delete menuData[k]);
    Object.assign(menuData, newMenuData);
    
    saveMenuData();
    renderMenuManagerList();
    renderCategories();
}

function toggleFoodAvailability(catKey, foodId) {
    const item = menuData[catKey]?.find(i => i.id === foodId);
    if (item) {
        item.available = item.available === false ? true : false;
        saveMenuData();
        renderMenuManagerList();
        displayMenu(currentCategory);
    }
}

function openAddFood() {
    editingFoodId = null;
    editingCategory = null;
    
    const modal = document.getElementById('foodEditorModal');
    if (modal) {
        document.getElementById('foodEditorTitle').textContent = 'Add New Food';
        document.getElementById('foodEditCategory').value = '';
        document.getElementById('foodEditName').value = '';
        document.getElementById('foodEditPrice').value = '';
        document.getElementById('foodEditIcon').value = '🍽️';
        document.getElementById('foodEditDesc').value = '';
        document.getElementById('foodEditOptions').value = '';
        document.getElementById('foodEditImage').value = '';
        document.getElementById('foodEditImagePreview').innerHTML = '';
        modal.style.display = 'flex';
    }
}

function openEditFood(catKey, foodId) {
    const item = menuData[catKey]?.find(i => i.id === foodId);
    if (!item) return;
    
    editingFoodId = foodId;
    editingCategory = catKey;
    
    const modal = document.getElementById('foodEditorModal');
    if (modal) {
        document.getElementById('foodEditorTitle').textContent = 'Edit Food Item';
        document.getElementById('foodEditCategory').value = catKey;
        document.getElementById('foodEditName').value = item.name;
        document.getElementById('foodEditPrice').value = item.price;
        document.getElementById('foodEditIcon').value = item.icon || '🍽️';
        document.getElementById('foodEditDesc').value = item.desc || '';
        document.getElementById('foodEditOptions').value = item.options ? item.options.map(o => `${o.name}:${o.price}`).join('\n') : '';
        document.getElementById('foodEditImage').value = item.image || '';
        document.getElementById('foodEditImagePreview').innerHTML = item.image ? `<img src="${item.image}" style="max-width: 100px; max-height: 100px; border-radius: 8px;">` : '';
        modal.style.display = 'flex';
    }
}

function saveFoodItem() {
    const category = document.getElementById('foodEditCategory').value;
    const name = document.getElementById('foodEditName').value.trim();
    const price = parseFloat(document.getElementById('foodEditPrice').value);
    const icon = document.getElementById('foodEditIcon').value || '🍽️';
    const desc = document.getElementById('foodEditDesc').value.trim();
    const optionsText = document.getElementById('foodEditOptions').value.trim();
    const image = document.getElementById('foodEditImage').value.trim();
    
    if (!category || !name || isNaN(price)) {
        alert('❌ Please fill category, name and price');
        return;
    }
    
    // Parse options
    const options = optionsText ? optionsText.split('\n').map(line => {
        const [optName, optPrice] = line.split(':');
        return { name: optName?.trim() || '', price: parseFloat(optPrice) || 0 };
    }).filter(o => o.name) : [];
    
    if (editingFoodId && editingCategory) {
        // Edit existing
        const item = menuData[editingCategory]?.find(i => i.id === editingFoodId);
        if (item) {
            // If category changed, move item
            if (editingCategory !== category) {
                menuData[editingCategory] = menuData[editingCategory].filter(i => i.id !== editingFoodId);
                if (!menuData[category]) menuData[category] = [];
                menuData[category].push({ ...item, name, price, icon, desc, options, image, available: item.available });
            } else {
                item.name = name;
                item.price = price;
                item.icon = icon;
                item.desc = desc;
                item.options = options;
                item.image = image;
            }
        }
    } else {
        // Add new
        if (!menuData[category]) menuData[category] = [];
        const newId = Date.now();
        menuData[category].push({
            id: newId,
            name,
            price,
            icon,
            image,
            desc,
            options,
            available: true
        });
    }
    
    saveMenuData();
    closeFoodEditor();
    renderMenuManagerList();
    renderCategories();
    displayMenu(currentCategory);
    alert('✅ Food item saved!');
}

function deleteFood(catKey, foodId) {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    
    // Remove from menu
    menuData[catKey] = menuData[catKey].filter(i => i.id !== foodId);
    
    // Clean up favorites for all users
    Object.keys(userFavorites).forEach(userEmail => {
        userFavorites[userEmail] = userFavorites[userEmail].filter(id => id !== foodId);
    });
    localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    
    // Clean up cart if item is there
    cart = cart.filter(item => item.id !== foodId);
    if (currentUser) {
        localStorage.setItem('cart_' + currentUser.email, JSON.stringify(cart));
    }
    
    saveMenuData();
    renderMenuManagerList();
    displayMenu(currentCategory);
    updateFavoritesBadge();
    updateCartBadge();
}

function closeFoodEditor() {
    const modal = document.getElementById('foodEditorModal');
    if (modal) modal.style.display = 'none';
}

function openAddCategory() {
    editingCategory = null;
    
    const modal = document.getElementById('categoryEditorModal');
    if (modal) {
        document.getElementById('categoryEditorTitle').textContent = 'Add New Category';
        document.getElementById('categoryEditKey').value = '';
        document.getElementById('categoryEditKey').disabled = false;
        document.getElementById('categoryEditName').value = '';
        document.getElementById('categoryEditIcon').value = '🍽️';
        document.getElementById('categoryEditImage').value = '';
        document.getElementById('categoryEditImagePreview').innerHTML = '';
        document.getElementById('deleteCategoryBtn').style.display = 'none';
        modal.style.display = 'flex';
    }
}

function openEditCategory(catKey) {
    const cat = categories[catKey];
    if (!cat) return;
    
    editingCategory = catKey;
    
    const modal = document.getElementById('categoryEditorModal');
    if (modal) {
        document.getElementById('categoryEditorTitle').textContent = 'Edit Category';
        document.getElementById('categoryEditKey').value = catKey;
        document.getElementById('categoryEditKey').disabled = true;
        document.getElementById('categoryEditName').value = cat.name;
        document.getElementById('categoryEditIcon').value = cat.icon || '🍽️';
        document.getElementById('categoryEditImage').value = cat.image || '';
        document.getElementById('categoryEditImagePreview').innerHTML = cat.image ? `<img src="${cat.image}" style="max-width: 100px; max-height: 100px; border-radius: 8px;">` : '';
        document.getElementById('deleteCategoryBtn').style.display = 'block';
        modal.style.display = 'flex';
    }
}

function deleteCategory() {
    if (!editingCategory) return;
    
    const itemCount = menuData[editingCategory]?.length || 0;
    if (!confirm(`Are you sure you want to delete this category?\n\nThis will also delete ${itemCount} food items in it.`)) return;
    
    // Remove all food items from favorites
    if (menuData[editingCategory]) {
        menuData[editingCategory].forEach(item => {
            Object.keys(userFavorites).forEach(userEmail => {
                userFavorites[userEmail] = userFavorites[userEmail].filter(id => id !== item.id);
            });
        });
        localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    }
    
    // Delete category and its food items
    delete menuData[editingCategory];
    delete categories[editingCategory];
    
    saveMenuData();
    closeCategoryEditor();
    renderMenuManagerList();
    renderCategories();
    
    // Switch to first available category
    const firstCat = Object.keys(categories)[0];
    if (firstCat) {
        displayMenu(firstCat);
    }
    
    updateFavoritesBadge();
    alert('✅ Category deleted');
}

// Image upload handlers
function handleFoodImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Image must be less than 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('foodEditImage').value = e.target.result;
        previewFoodImage();
    };
    reader.readAsDataURL(file);
}

function handleCategoryImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Image must be less than 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('categoryEditImage').value = e.target.result;
        previewCategoryImage();
    };
    reader.readAsDataURL(file);
}

function saveCategory() {
    const key = document.getElementById('categoryEditKey').value.trim().toLowerCase().replace(/\s+/g, '_');
    const name = document.getElementById('categoryEditName').value.trim();
    const icon = document.getElementById('categoryEditIcon').value || '🍽️';
    const image = document.getElementById('categoryEditImage').value.trim();
    
    if (!key || !name) {
        alert('❌ Please fill key and name');
        return;
    }
    
    if (editingCategory) {
        // Edit existing
        categories[editingCategory].name = name;
        categories[editingCategory].icon = icon;
        categories[editingCategory].image = image;
    } else {
        // Add new
        if (categories[key]) {
            alert('❌ Category key already exists');
            return;
        }
        categories[key] = { name, icon, image };
        if (!menuData[key]) menuData[key] = [];
    }
    
    saveMenuData();
    closeCategoryEditor();
    renderMenuManagerList();
    renderCategories();
    alert('✅ Category saved!');
}

function closeCategoryEditor() {
    const modal = document.getElementById('categoryEditorModal');
    if (modal) modal.style.display = 'none';
}

function previewFoodImage() {
    const url = document.getElementById('foodEditImage').value.trim();
    const preview = document.getElementById('foodEditImagePreview');
    if (url && preview) {
        preview.innerHTML = `<img src="${url}" style="max-width: 100px; max-height: 100px; border-radius: 8px;" onerror="this.parentElement.innerHTML='Invalid URL'">`;
    } else if (preview) {
        preview.innerHTML = '';
    }
}

function previewCategoryImage() {
    const url = document.getElementById('categoryEditImage').value.trim();
    const preview = document.getElementById('categoryEditImagePreview');
    if (url && preview) {
        preview.innerHTML = `<img src="${url}" style="max-width: 100px; max-height: 100px; border-radius: 8px;" onerror="this.parentElement.innerHTML='Invalid URL'">`;
    } else if (preview) {
        preview.innerHTML = '';
    }
}

// ========================================
// GLOBAL EXPORTS FOR OWNER.JS FUNCTIONS
// ========================================
window.showRestaurantLogin = showRestaurantLogin;
window.handleRestaurantLogin = handleRestaurantLogin;
window.showRestaurantDashboard = showRestaurantDashboard;
window.closeRestaurantDashboard = closeRestaurantDashboard;
window.showOwnerLogin = showOwnerLogin;
window.showDriverManagementModal = showDriverManagementModal;
window.addNewDriver = addNewDriver;
window.deleteDriver = deleteDriver;
window.editDriver = editDriver;
window.previewDriverPic = previewDriverPic;
window.previewEditDriverPic = previewEditDriverPic;
window.saveDriverChanges = saveDriverChanges;
window.toggleDriverStatus = toggleDriverStatus;
window.notifyAllAvailableDrivers = notifyAllAvailableDrivers;
window.driverAcceptOrder = driverAcceptOrder;
window.showBankSettingsModal = showBankSettingsModal;
window.saveBankSettings = saveBankSettings;
window.updateOwnerStats = updateOwnerStats;
window.closeOwnerDashboard = closeOwnerDashboard;
window.openMenuManager = openMenuManager;
window.renderMenuManagerList = renderMenuManagerList;
window.openAddFood = openAddFood;
window.openEditFood = openEditFood;
window.saveFoodItem = saveFoodItem;
window.deleteFood = deleteFood;
window.closeFoodEditor = closeFoodEditor;
window.openAddCategory = openAddCategory;
window.openEditCategory = openEditCategory;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.closeCategoryEditor = closeCategoryEditor;
window.previewFoodImage = previewFoodImage;
window.previewCategoryImage = previewCategoryImage;
window.handleFoodImageUpload = handleFoodImageUpload;
window.handleCategoryImageUpload = handleCategoryImageUpload;
