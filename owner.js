// ========================================
// ANTALYA SHAWARMA - OWNER DASHBOARD
// Restaurant Management & Owner Functions
// ========================================

// ========================================
// EMOJI CONVERSION HELPERS
// FIX: Auto-convert icon keywords to emoji
// ========================================

// Convert icon input to emoji when user types or pastes
function normalizeIconToEmoji(iconValue) {
    if (!iconValue) return '🍽️'; // Default emoji
    
    // If already an emoji (contains unicode emoji), return it
    if (/[\u{1F300}-\u{1F9FF}]/u.test(iconValue)) {
        return iconValue;
    }
    
    // Convert keyword to emoji using FOOD_EMOJI_MAP from utils.js
    return getFoodEmoji(iconValue.trim().toLowerCase());
}

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
        uiAlert('Invalid credentials!', 'error');
    }
}

function showRestaurantDashboard() {
    const modal = document.getElementById('restaurantDashboard');
    if (!modal) return;
    
    // Calculate DAILY stats (today only)
    const now = new Date();
    const today = now.toDateString();
    
    // FIX 1: Use ONLY orderHistory to avoid double counting
    
   // FIX: Exclude both CANCELLED and REJECTED
    const dailyOrders = orderHistory.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today && o.status !== 'cancelled' && o.status !== 'rejected';
    });
    
    // FIX 3: Stats count ONLY 'completed' (Delivered) orders for money
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
                    <div style="font-size: 4rem;">${svgIcon("package", 48, "icon-muted")}</div>
                    <p>No pending orders</p>
                </div>
            `;
        } else {
            // FIX TASK 1+2: Redesigned order cards with CSS classes + delivery ETA support
            ordersContainer.innerHTML = visibleOrders.map(order => {
                const user = userDatabase.find(u => u.email === order.userId);
                const profilePic = user && user.profilePicture
                    ? `<img src="${user.profilePicture}" alt="">`
                    : svgIcon('user-circle', 28, 'icon-muted');

                const statusClass = order.status === 'pending' ? 'rd-status-pending'
                    : order.status === 'ready' ? 'rd-status-ready'
                    : order.status === 'accepted' ? 'rd-status-accepted'
                    : 'rd-status-driver';

                const statusLabel = order.status === 'ready' ? 'READY FOR PICKUP' : order.status.replace(/_/g, ' ').toUpperCase();
                const isCollection = order.orderType === 'collection';
                const typeClass = isCollection ? 'rd-tag-collection' : 'rd-tag-delivery';
                const typeLabel = isCollection ? svgIcon('building', 13, 'icon-success') + ' COLLECTION' : svgIcon('truck', 13, 'icon-blue') + ' DELIVERY';
                const payClass = order.paymentMethod === 'applepay' ? 'rd-tag-applepay' : 'rd-tag-card';
                const payLabel = order.paymentMethod === 'applepay'
                    ? '<img src="apple-pay.png" class="apple-pay-logo-sm" alt="Apple Pay"> PAID'
                    : svgIcon('credit-card', 12, 'icon-purple') + ' CARD PAID';

                // UPGRADED TASK 2: ETA display with countdown for BOTH collection and delivery
                let etaHtml = '';
                const hasEta = (order.etaMinutes || order.estimatedTime) && ['accepted', 'ready', 'waiting_driver', 'driver_assigned', 'out_for_delivery'].includes(order.status);
                if (hasEta) {
                    const etaMins = order.etaMinutes || order.estimatedTime;
                    const acceptedStr = order.acceptedAt ? formatTimeHHMM(order.acceptedAt) : '--:--';
                    const readyByStr = order.readyBy ? formatTimeHHMM(order.readyBy) : '--:--';
                    const countdownStr = order.readyBy ? formatEtaCountdown(order.readyBy) : '';
                    etaHtml = `<div class="rd-eta-bar rd-eta-upgraded" data-readyby="${order.readyBy || ''}">
                        <div class="rd-eta-row">${svgIcon('clock', 13, 'icon-blue')} Accepted: <strong>${acceptedStr}</strong></div>
                        <div class="rd-eta-row">${svgIcon('clock', 13, 'icon-blue')} Estimated: <strong>${etaMins} min</strong></div>
                        <div class="rd-eta-row">${svgIcon('clock', 13, 'icon-blue')} Ready by: <strong>${readyByStr}</strong> <span class="rd-eta-countdown">${countdownStr}</span></div>
                        <button class="rd-eta-change" onclick="showEstimatedTimePrompt('${order.id}')">Change</button>
                    </div>`;
                }

                // Build action buttons based on status
                let actionsHtml = '';
                if (order.status === 'pending') {
                    actionsHtml = `<div class="rd-actions rd-actions-2col">
                        <button class="rd-btn rd-btn-accept" onclick="acceptOrder('${order.id}')">${svgIcon("check-circle", 13)} Accept</button>
                        <button class="rd-btn rd-btn-reject" onclick="rejectOrder('${order.id}')">${svgIcon("x-circle", 13)} Reject</button>
                    </div>`;
                } else if (order.status === 'accepted') {
                    if (isCollection) {
                        actionsHtml = `<div class="rd-actions rd-actions-1col">
                            ${!order.estimatedTime ? `<button class="rd-btn rd-btn-eta" onclick="showEstimatedTimePrompt('${order.id}')">${svgIcon('clock', 13, 'icon-blue')} Set Estimated Time</button>` : ''}
                            <button class="rd-btn rd-btn-ready" onclick="markOrderReady('${order.id}')">${svgIcon('check-circle', 13)} Ready for Pickup</button>
                            <button class="rd-btn rd-btn-print" onclick="printBill('${order.id}')">${svgIcon("printer", 13)} Print</button>
                        </div>`;
                    } else {
                        // FIX TASK 2: Delivery orders also get ETA + driver controls
                        actionsHtml = `<div class="rd-actions rd-actions-1col">
                            ${!order.estimatedTime ? `<button class="rd-btn rd-btn-eta" onclick="showEstimatedTimePrompt('${order.id}')">${svgIcon('clock', 13, 'icon-blue')} Set Estimated Time</button>` : ''}
                            <button class="rd-btn rd-btn-notify" onclick="notifyAllAvailableDrivers('${order.id}')">${svgIcon("megaphone", 13)} Notify All Drivers</button>
                            <button class="rd-btn rd-btn-assign" onclick="assignDriver('${order.id}')">${svgIcon("car", 13)} Assign Driver</button>
                            <button class="rd-btn rd-btn-print" onclick="printBill('${order.id}')">${svgIcon("printer", 13)} Print</button>
                        </div>`;
                    }
                } else if (order.status === 'ready') {
                    actionsHtml = `<div class="rd-actions rd-actions-1col">
                        <div class="rd-ready-banner">
                            <div class="rd-ready-banner-title">${svgIcon('check-circle', 14, 'icon-warning')} Ready for Pickup</div>
                            <div class="rd-ready-banner-sub">Waiting for customer to collect</div>
                        </div>
                        <button class="rd-btn rd-btn-complete" onclick="completeCollectionOrder('${order.id}')">${svgIcon('check-circle', 13)} Complete Order</button>
                        <button class="rd-btn rd-btn-print" onclick="printBill('${order.id}')">${svgIcon("printer", 13)} Print</button>
                    </div>`;
                } else if (order.status === 'driver_assigned' || order.status === 'out_for_delivery') {
                    actionsHtml = `<div class="rd-actions rd-actions-1col">
                        <div class="rd-ready-banner" style="border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.15);">
                            <div class="rd-ready-banner-title" style="color: #10b981;">${svgIcon("car", 14, "icon-success")} Driver: ${order.driverName || 'Assigned'}</div>
                        </div>
                        <button class="rd-btn rd-btn-print" onclick="printBill('${order.id}')">${svgIcon("printer", 13)} Print</button>
                    </div>`;
                }

                return `
                <div class="rd-order-card">
                    <div class="rd-order-header">
                        <span class="rd-order-id">#${order.id}</span>
                        <span class="rd-status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="rd-order-body">
                        <div class="rd-customer-row">
                            <div class="rd-avatar">${profilePic}</div>
                            <div class="rd-customer-info">
                                <div class="rd-customer-name">${order.userName}</div>
                                <div class="rd-customer-detail">${svgIcon("phone", 12, "icon-teal")} ${order.userPhone || 'N/A'}</div>
                                ${order.orderType === 'delivery' ? `<div class="rd-customer-detail">${svgIcon("map-pin", 12, "icon-blue")} ${order.address || 'N/A'}</div>` : ''}
                            </div>
                        </div>
                        <div class="rd-meta-row">
                            <span class="rd-tag ${typeClass}">${typeLabel}</span>
                            <span class="rd-tag ${payClass}">${payLabel}</span>
                            <span class="rd-tag rd-tag-time">${svgIcon("clock", 11, "icon-muted")} ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        ${etaHtml}
                        <div class="rd-items-box">
                            <div class="rd-items-title">Items</div>
                            ${order.items.map(item => `<div class="rd-item-line"><span>${item.icon} ${item.name} x${item.quantity}</span><span>${formatPrice(item.finalPrice * item.quantity)}</span></div>`).join('')}
                            <div class="rd-total-line"><span>Total</span><span class="rd-total-amount">${formatPrice(order.total)}</span></div>
                        </div>
                    </div>
                    ${actionsHtml}
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

    // Start live countdown timer for restaurant dashboard ETA elements
    startEtaCountdownTimer();
}

// UPGRADED TASK 2: Global countdown timer — updates every second
let _etaCountdownInterval = null;
function startEtaCountdownTimer() {
    // Clear any previous interval to avoid duplicates
    if (_etaCountdownInterval) clearInterval(_etaCountdownInterval);
    _etaCountdownInterval = setInterval(() => {
        const countdownEls = document.querySelectorAll('.rd-eta-countdown');
        if (countdownEls.length === 0) {
            // No countdown elements visible, stop ticking
            clearInterval(_etaCountdownInterval);
            _etaCountdownInterval = null;
            return;
        }
        countdownEls.forEach(el => {
            const parent = el.closest('.rd-eta-upgraded');
            if (!parent) return;
            const readyBy = parent.getAttribute('data-readyby');
            if (!readyBy) return;
            el.innerHTML = formatEtaCountdown(readyBy);
        });
    }, 1000);
}

function acceptOrder(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // FIX: Guard against cancelled orders
    if (order.status === 'cancelled') {
        uiAlert('Cannot accept: This order was cancelled by the user.', 'error');
        showRestaurantDashboard(); // Refresh view to remove it
        return;
    }
    
    order.status = 'accepted';
    order.acceptedAt = new Date().toISOString();

    // Sync acceptedAt to orderHistory
    const historyOrder = orderHistory.find(o => o.id === orderId);
    if (historyOrder) {
        historyOrder.status = 'accepted';
        historyOrder.acceptedAt = order.acceptedAt;
    }

    saveData();

    // Send notification to customer
    addNotification(order.userId, {
        type: 'order_accepted',
        title: 'Order Accepted!',
        message: `Your order #${orderId} has been accepted and is being prepared.`,
        orderId: orderId
    });

    playNotificationSound();

    // FIX TASK 2: Show estimated time prompt for BOTH collection and delivery orders
    showEstimatedTimePrompt(orderId);
}

// FIX TASK 2: Set estimated time for BOTH collection and delivery orders
// UPGRADED: Now stores etaMinutes, readyBy, acceptedAt — supports live countdown
function showEstimatedTimePrompt(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    const isCollection = order.orderType === 'collection';
    const label = isCollection ? 'collection' : 'delivery';

    const currentEta = order.etaMinutes || order.estimatedTime || '20';
    const time = prompt(`Set estimated ${label} time (minutes):\n\nSuggested: 15, 20, 30, 45, 60`, currentEta);
    if (time !== null) {
        const mins = parseInt(time);
        if (!isNaN(mins) && mins > 0) {
            // Store new ETA fields
            order.etaMinutes = mins;
            order.estimatedTime = mins; // keep backward compat
            if (!order.acceptedAt) order.acceptedAt = new Date().toISOString();
            order.readyBy = new Date(new Date(order.acceptedAt).getTime() + mins * 60000).toISOString();
            saveData();

            // Sync ALL ETA fields to orderHistory
            const historyOrder = orderHistory.find(o => o.id === orderId);
            if (historyOrder) {
                historyOrder.etaMinutes = mins;
                historyOrder.estimatedTime = mins;
                historyOrder.acceptedAt = order.acceptedAt;
                historyOrder.readyBy = order.readyBy;
            }

            // Notify customer of estimated time
            const readyTime = new Date(order.readyBy).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const etaMsg = isCollection
                ? `Your order #${orderId} will be ready for pickup in ~${mins} minutes (by ${readyTime}).`
                : `Your order #${orderId} estimated delivery: ~${mins} minutes (by ${readyTime}).`;
            addNotification(order.userId, {
                type: 'order_estimated_time',
                title: 'Estimated Time Updated',
                message: etaMsg,
                orderId: orderId
            });
        }
    }

    showRestaurantDashboard();
    if (order.status === 'accepted') {
        const extraMsg = isCollection ? '' : '<br><br>Click "Notify All Drivers" to alert available drivers.';
        uiAlert(`Order #${orderId} accepted!${extraMsg}`, 'success');
    }
}

// ETA COUNTDOWN HELPER: Formats remaining time or overdue message
function formatEtaCountdown(readyBy) {
    if (!readyBy) return '';
    const now = Date.now();
    const target = new Date(readyBy).getTime();
    const diff = target - now;
    if (diff > 0) {
        const totalSec = Math.floor(diff / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `in ${m}m ${s < 10 ? '0' + s : s}s`;
    } else {
        const overMin = Math.ceil(Math.abs(diff) / 60000);
        return `<span style="color:#ef4444;font-weight:700;">Overdue by ${overMin}m</span>`;
    }
}

// Format time from ISO string to HH:MM
function formatTimeHHMM(iso) {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

// CHANGED: New function - mark collection order as ready for pickup
function markOrderReady(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'ready';
    order.readyAt = new Date().toISOString();
    saveData();

    // Update in order history too
    const historyOrder = orderHistory.find(o => o.id === orderId);
    if (historyOrder) {
        historyOrder.status = 'ready';
        historyOrder.readyAt = order.readyAt;
    }

    // Send notification to customer
    addNotification(order.userId, {
        type: 'order_ready',
        title: 'Order Ready for Pickup!',
        message: `Your order #${orderId} is ready for pickup. Please come to the restaurant.`,
        orderId: orderId
    });

    playNotificationSound();
    showRestaurantDashboard();
    uiAlert(`Order #${orderId} is ready for pickup! Customer has been notified.`, 'success');
}

// CHANGED: New function - complete a collection order
function completeCollectionOrder(orderId) {
    const orderIndex = pendingOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const order = pendingOrders[orderIndex];
    order.status = 'completed';
    order.completedAt = new Date().toISOString();

    // Update in order history
    const historyOrder = orderHistory.find(o => o.id === orderId);
    if (historyOrder) {
        historyOrder.status = 'completed';
        historyOrder.completedAt = order.completedAt;
    }

    // Remove from pending
    pendingOrders.splice(orderIndex, 1);
    saveData();

    // Send notification to customer
    addNotification(order.userId, {
        type: 'order_completed',
        title: 'Order Completed!',
        message: `Your order #${orderId} has been completed. Thank you!`,
        orderId: orderId
    });

    playNotificationSound();
    showRestaurantDashboard();
    uiAlert(`Order #${orderId} completed!`, 'success');
}

function notifyAllAvailableDrivers(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // COLLECTION ORDER SUPPORT: Don't notify drivers for collection orders
    if (order.orderType === 'collection') {
        uiAlert('This is a COLLECTION order. No driver needed!', 'warning');
        return;
    }
    
    if (order.driverId) {
        uiAlert('This order already has a driver assigned!', 'warning');
        return;
    }
    
    const availableDrivers = window.driverSystem.getAvailable();
    
    if (availableDrivers.length === 0) {
        uiAlert('No available drivers at the moment!', 'warning');
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
    
    let notifiedList = 'Notification sent to available drivers:\n\n';
    availableDrivers.forEach(driver => {
        notifiedList += `${driver.name} (${driver.phone})\n`;
    });
    
    playNotificationSound();
    showRestaurantDashboard();
    uiAlert(notifiedList + `<br>${availableDrivers.length} driver(s) notified!<br><br>First driver to accept will get the order.`, 'info');
}

// Calculate delivery time based on distance
function calculateDeliveryTime(distanceMiles) {
    // Base time: 10 minutes per mile (driving time only)
    const timePerMile = 10; // minutes
    
    const deliveryTime = Math.ceil(distanceMiles * timePerMile);
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
        uiAlert('Please login first', 'error');
        return;
    }
    
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    // Check if order is still available
    const availableOrder = window.availableOrdersForDrivers?.[orderId];
    if (!availableOrder) {
        uiAlert('This order is no longer available!', 'error');
        showDriverDashboard();
        return;
    }
    
    if (availableOrder.claimedBy && availableOrder.claimedBy !== driverId) {
        uiAlert('Sorry, another driver already accepted this order!', 'error');
        showDriverDashboard();
        return;
    }
    
    // Find the actual order
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) {
        uiAlert('Order not found!', 'error');
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
        title: 'Driver On The Way!',
        message: `${driver.name} is delivering your order #${orderId}.\nPhone: ${driver.phone}\nEst. Estimated arrival: ${estimatedTime} minutes\nDistance: Distance: ${distanceMiles.toFixed(1)} miles`,
        orderId: orderId,
        driverName: driver.name,
        driverPhone: driver.phone,
        estimatedTime: estimatedTime
    });
    
    playNotificationSound();
    
    uiAlert(`Order #${orderId} accepted!<br><br><strong>Distance:</strong> ${distanceMiles.toFixed(1)} miles<br><strong>Est. time:</strong> ${estimatedTime} minutes<br><br>Click "Directions" to navigate to customer.`, 'success');
    
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
        title: 'Order Rejected',
        message: `Your order #${orderId} has been rejected.${reason ? ' Reason: ' + reason : ''}`,
        orderId: orderId
    });
    
    showRestaurantDashboard();
    uiAlert(`Order #${orderId} rejected`, 'error');
}

function assignDriver(orderId) {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // COLLECTION ORDER SUPPORT: Don't assign driver for collection orders
    if (order.orderType === 'collection') {
        uiAlert('This is a COLLECTION order. No driver needed!', 'warning');
        return;
    }
    
    const availableDrivers = window.driverSystem.getAvailable();
    
    if (availableDrivers.length === 0) {
        uiAlert('No available drivers at the moment!<br><br>All drivers are either offline or inactive.', 'error');
        return;
    }
    
    // Create a nice selection dialog
    let driverList = 'Available Drivers:\n\n';
    availableDrivers.forEach((d, i) => {
        driverList += `${i + 1}. ${d.name}\n   ${d.deliveries} deliveries | Rating: ${d.rating}\n   Tel: ${d.phone}\n\n`;
    });
    
    const selection = prompt(driverList + 'Enter driver number (or 0 to notify all):');
    
    if (selection === null) return;
    
    if (selection === '0') {
        notifyAllAvailableDrivers(orderId);
        return;
    }
    
    const driverIndex = parseInt(selection) - 1;
    if (isNaN(driverIndex) || driverIndex < 0 || driverIndex >= availableDrivers.length) {
        uiAlert('Invalid selection', 'error');
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
        title: 'Driver Assigned!',
        message: `${selectedDriver.name} is on the way with your order #${orderId}.`,
        orderId: orderId
    });
    
    playNotificationSound();
    showRestaurantDashboard();
    uiAlert(`Driver ${selectedDriver.name} assigned to order #${orderId}<br><br><strong>Phone:</strong> ${selectedDriver.phone}`, 'success');
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
        title: 'Order Delivered!',
        message: `Your order #${orderId} has been delivered. Enjoy your meal!`,
        orderId: orderId
    });
    
    showRestaurantDashboard();
    playNotificationSound();
    uiAlert(`Order #${orderId} completed!`, 'success');
}


// FIX TASK 1: Receipt printing via hidden iframe — no visible window/tab opens
function printBill(orderId) {
    const order = pendingOrders.find(o => o.id === orderId) || orderHistory.find(o => o.id === orderId);
    if (!order) {
        uiAlert('Order not found!', 'error');
        return;
    }

    const orderTypeDisplay = order.orderType === 'collection' ? 'COLLECTION' : 'DELIVERY';
    const paymentDisplay = order.paymentMethod === 'applepay' ? 'Apple Pay' : 'Card';
    const d = new Date(order.createdAt);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    // Build ETA info for receipt
    let etaLine = '';
    if (order.etaMinutes && order.acceptedAt) {
        const readyByDate = new Date(new Date(order.acceptedAt).getTime() + order.etaMinutes * 60000);
        etaLine = `<tr><td>ETA:</td><td class="right bold">${order.etaMinutes} min (by ${readyByDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})})</td></tr>`;
    } else if (order.estimatedTime) {
        etaLine = `<tr><td>ETA:</td><td class="right bold">${order.estimatedTime} min</td></tr>`;
    }

    const itemRows = order.items.map(item => {
        const extras = item.extras && item.extras.length > 0 ? ` +${item.extras.map(e => e.name).join(',')}` : '';
        return `<tr><td style="padding:2px 0;">${item.quantity}x ${item.name}${extras}</td><td style="padding:2px 0;text-align:right;">£${(item.finalPrice * item.quantity).toFixed(2)}</td></tr>`;
    }).join('');

    const receiptHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt #${order.id}</title>
<style>
    @page { size: 80mm auto; margin: 2mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; width: 72mm; max-width: 72mm; padding: 2mm; font-size: 10px; line-height: 1.4; color: #000; background: #fff; }
    .rcpt-table { width: 100%; border-collapse: collapse; }
    .rcpt-table td { padding: 2px 0; font-size: 10px; vertical-align: top; }
    .rcpt-hr { border: none; border-top: 1px dashed #000; margin: 4px 0; }
    .rcpt-hr-double { border: none; border-top: 2px solid #000; margin: 4px 0; }
    .center { text-align: center; }
    .bold { font-weight: 900; }
    .right { text-align: right; }
</style></head><body>
    <div class="center" style="margin-bottom:4px;">
        <div style="font-size:14px;" class="bold">ANTALYA SHAWARMA</div>
        <div style="font-size:9px;">181 Market St, Hyde, SK14 1HF</div>
        <div style="font-size:9px;">Tel: 0161 536 1862</div>
    </div>
    <hr class="rcpt-hr-double">
    <table class="rcpt-table">
        <tr><td>Order:</td><td class="right bold">#${order.id}</td></tr>
        <tr><td>Date:</td><td class="right">${dateStr}</td></tr>
        <tr><td>Type:</td><td class="right bold">${orderTypeDisplay}</td></tr>
        <tr><td>Customer:</td><td class="right">${order.userName}</td></tr>
        <tr><td>Phone:</td><td class="right">${order.userPhone || '-'}</td></tr>
        ${order.orderType === 'delivery' ? `<tr><td>Address:</td><td class="right" style="font-size:9px;max-width:35mm;word-wrap:break-word;">${order.address || '-'}</td></tr>` : ''}
        <tr><td>Payment:</td><td class="right">${paymentDisplay} (PAID)</td></tr>
        ${etaLine}
    </table>
    <hr class="rcpt-hr-double">
    <div class="bold" style="margin-bottom:2px;">ITEMS</div>
    <table class="rcpt-table">${itemRows}</table>
    <hr class="rcpt-hr">
    <table class="rcpt-table">
        <tr><td>Subtotal:</td><td class="right">£${order.subtotal.toFixed(2)}</td></tr>
        ${order.orderType === 'delivery' && order.deliveryFee ? `<tr><td>Delivery:</td><td class="right">£${order.deliveryFee.toFixed(2)}</td></tr>` : ''}
    </table>
    <hr class="rcpt-hr-double">
    <table class="rcpt-table">
        <tr style="font-size:13px;" class="bold"><td>TOTAL</td><td class="right">£${order.total.toFixed(2)}</td></tr>
    </table>
    <hr class="rcpt-hr">
    <div class="center" style="font-size:9px;margin-top:4px;">
        <div class="bold">Thank you for your order!</div>
        <div>www.antalyashawarma.com</div>
    </div>
</body></html>`;

    console.log('Receipt HTML length:', receiptHTML.length, '| Order:', order.id);

    // Hidden iframe approach — no visible tab/window
    let iframe = document.getElementById('printReceiptFrame');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'printReceiptFrame';
        iframe.style.cssText = 'position:fixed;right:-9999px;bottom:-9999px;width:0;height:0;border:none;visibility:hidden;';
        document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = iframeDoc.document || iframeDoc;

    doc.open();
    doc.write(receiptHTML);
    doc.close();

    // Wait for iframe content to render, then print
    const tryPrint = () => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch(e) {
            console.warn('Print error:', e);
        }
    };

    // Use iframe onload if supported, otherwise fallback to timeout
    iframe.onload = () => { setTimeout(tryPrint, 200); };
    // Fallback for browsers where onload doesn't fire on document.write
    setTimeout(tryPrint, 500);
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
        uiAlert('Owner access required!', 'error');
        return;
    }
    
    renderDriverList();
    openModal('driverManagementModal');
}

function toggleAddDriverForm() {
    const formContent = document.getElementById('addDriverFormContent');
    const toggleIcon = document.getElementById('addDriverToggle');

    // CHANGED: Use innerHTML instead of textContent so SVG renders properly (not raw markup)
    if (formContent && toggleIcon) {
        formContent.classList.toggle('collapsed');
        toggleIcon.innerHTML = formContent.classList.contains('collapsed')
            ? '<svg class="svg-icon" width="14" height="14" aria-hidden="true"><use href="#i-chevron-right"></use></svg>'
            : '<svg class="svg-icon" width="14" height="14" aria-hidden="true"><use href="#i-chevron-down"></use></svg>';
    }
}


function renderDriverList() {
    const container = document.getElementById('driverListContainer');
    if (!container) return;
    
    const allDrivers = window.driverSystem.getAll();
    
    if (allDrivers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.4);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${svgIcon("car", 40, "icon-teal")}</div>
                <p style="margin: 0;">No drivers registered yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allDrivers.map(driver => {
        const profilePic = driver.profilePicture 
            ? `<img src="${driver.profilePicture}" alt="${driver.name}">` 
:        `<img src="driver-motorcycle.svg" 
        alt="Driver" 
        class="driver-avatar-svg">`;        const isActive = driver.active;
        const isAvailable = driver.available;
        
        return `
        <div class="driver-card ${isActive ? '' : 'inactive'}">
            <div class="driver-card-header">
                <div class="driver-card-avatar">
                    ${profilePic}
                </div>
                <div class="driver-card-info">
                    <div class="driver-card-name">${driver.name}</div>
                    <div class="driver-card-code">Code: <strong>${driver.secretCode}</strong></div>
                    <div class="driver-card-badges">
                        <span class="driver-badge ${isActive ? 'active' : 'inactive'}">${isActive ? svgIcon('circle-green', 12) + ' Active' : svgIcon('circle-red', 12) + ' Inactive'}</span>
                        <span class="driver-badge ${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? svgIcon('check-circle', 12, 'icon-success') + ' Available' : svgIcon('pause', 12, 'icon-warning') + ' Busy'}</span>
                    </div>
                </div>
            </div>
            
            <div class="driver-stats-row">
                <div>${svgIcon("mail", 12, "icon-blue")} ${driver.email}</div>
                <div>${svgIcon("phone", 12, "icon-teal")} ${driver.phone}</div>
                <div>${svgIcon("package", 12, "icon-orange")} ${driver.deliveries || 0} deliveries</div>
                <div>${svgIcon("star", 12)} ${(driver.rating || 5.0).toFixed(1)} rating</div>
            </div>
            
            <div class="driver-card-actions">
                <button onclick="editDriver('${driver.id}')" class="driver-action-btn edit">${svgIcon("edit", 12)} Edit</button>
                <button onclick="toggleDriverStatus('${driver.id}')" class="driver-action-btn toggle ${isActive ? '' : 'activate'}">${isActive ? svgIcon('pause', 12) + ' Disable' : svgIcon('play', 12) + ' Enable'}</button>
                <button onclick="deleteDriver('${driver.id}')" class="driver-action-btn delete">${svgIcon("trash", 12, "icon-danger")} Remove</button>
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
            preview.innerHTML = svgIcon('car', 40, 'icon-teal');
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
        uiAlert('Name, email and phone are required', 'error');
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
    
    uiAlert('Driver updated successfully!', 'success');
}

function toggleDriverStatus(driverId) {
    const driver = window.driverSystem.get(driverId);
    if (!driver) return;
    
    const newStatus = !driver.active;
    window.driverSystem.update(driverId, { active: newStatus, available: newStatus });
    
    renderDriverList();
    uiAlert(`Driver ${driver.name} is now ${newStatus ? 'Active' : 'Inactive'}`, 'success');
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
        uiAlert('Please fill in name, email, phone and password', 'error');
        return;
    }
    
    // Check if email already exists
    if (window.driverSystem.getByEmail(email)) {
        uiAlert('A driver with this email already exists', 'error');
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
        preview.innerHTML = svgIcon('car', 40, 'icon-teal');
        preview.dataset.newPic = '';
    }
    
    // Update UI
    renderDriverList();
    updateOwnerStats();
    
    uiAlert(`Driver ${name} added!<br><br><strong>Secret Code:</strong> ${secretCode}<br><strong>Password:</strong> ${password}<br><br>Driver can login with either the code or email+password.`, 'success');
}

function deleteDriver(driverId) {
    if (!confirm('Are you sure you want to remove this driver?')) return;
    
    window.driverSystem.delete(driverId);
    renderDriverList();
    updateOwnerStats();
    
    uiAlert('Driver removed', 'success');
}

// ========================================
// BANK SETTINGS (OWNER ONLY)
// ========================================
function showBankSettingsModal() {
    if (!isOwnerLoggedIn) {
        uiAlert('Owner access required!', 'error');
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
    uiAlert('Bank details saved successfully!', 'success');
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
        uiAlert('Invalid credentials', 'error');
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
    
    uiAlert('Owner access granted!', 'success');
    
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
    // FIX: Only sum revenue for COMPLETED orders
    const totalRevenue = orderHistory
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);

   // FIX: Count all orders EXCEPT cancelled AND rejected
    const totalOrders = orderHistory.filter(o => o.status !== 'cancelled' && o.status !== 'rejected').length;
    
    // Pending should just check pending status
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
    
   // FIX: Today's orders (exclude cancelled AND rejected)
    const todayOrders = orderHistory.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today && o.status !== 'cancelled' && o.status !== 'rejected';
    });
    
    // FIX: Today's Revenue (exclude cancelled AND pending)
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
    if (avgRatingEl) avgRatingEl.textContent = '5.0'; 
    
    // CHANGED: Popular Food Stats - count from COMPLETED orders only (both delivery + collection)
    // Excludes pending, accepted, ready, cancelled, rejected to avoid inflating stats
    const popularItemsList = document.getElementById('popularItemsList');
    if (popularItemsList) {
        const itemCounts = {};

        // Count items from completed orders only (includes both delivery and collection completed)
        orderHistory
            .filter(o => o.status === 'completed')
            .forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const key = item.name || item.id;
                        if (key) {
                            if (!itemCounts[key]) {
                                itemCounts[key] = { name: item.name, icon: item.icon || 'utensils', count: 0 };
                            }
                            itemCounts[key].count += (item.quantity || 1);
                        }
                    });
                }
            });

        // Sort by count and get top 5
        const topItems = Object.values(itemCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        if (topItems.length > 0) {
            // CHANGED: Use getFoodEmoji to convert icon keywords to proper emoji
            popularItemsList.innerHTML = topItems.map(item => {
                const iconDisplay = typeof getFoodEmoji === 'function' ? getFoodEmoji(item.icon) : (item.icon || '🍽️');
                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.85rem;">
                    <span>${iconDisplay} ${item.name}</span>
                    <span style="color: #10b981; font-weight: 600;">${item.count}</span>
                </div>
            `}).join('');
        } else {
            popularItemsList.innerHTML = `
                <div style="color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 1rem;">
                    No completed orders yet
                </div>
            `;
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
                ${svgIcon("plus", 14, "icon-success")} Add Category
            </button>
            <button onclick="openAddFood()" style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                ${svgIcon("utensils", 14, "icon-accent")} Add Food Item
            </button>
        </div>
        
        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 1rem;">${svgIcon("lightbulb", 14, "icon-warning")} Use arrows to reorder categories</p>
        
        ${categoryKeys.map((catKey, index) => {
            const cat = categories[catKey];
            return `
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 1rem; overflow: hidden;">
                <div style="background: rgba(139,92,246,0.2); padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <button onclick="moveCategoryUp('${catKey}')" ${index === 0 ? 'disabled' : ''} style="background: ${index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.2)'}; color: ${index === 0 ? 'rgba(255,255,255,0.3)' : '#3b82f6'}; border: none; padding: 0.2rem 0.4rem; border-radius: 4px; cursor: ${index === 0 ? 'not-allowed' : 'pointer'}; font-size: 0.7rem;">${svgIcon("arrows-up-down", 12)} ↑</button>
                            <button onclick="moveCategoryDown('${catKey}')" ${index === categoryKeys.length - 1 ? 'disabled' : ''} style="background: ${index === categoryKeys.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.2)'}; color: ${index === categoryKeys.length - 1 ? 'rgba(255,255,255,0.3)' : '#3b82f6'}; border: none; padding: 0.2rem 0.4rem; border-radius: 4px; cursor: ${index === categoryKeys.length - 1 ? 'not-allowed' : 'pointer'}; font-size: 0.7rem;">↓</button>
                        </div>
                        ${/* FIX: Use shared getCategoryVisual for consistent category icons/images */''}
                        <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            ${getCategoryVisual(cat, 40, true)}
                        </div>
                        <span style="font-weight: 700;">${cat.name}</span>
                        <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">(${menuData[catKey]?.length || 0} items)</span>
                    </div>
                    <button onclick="openEditCategory('${catKey}')" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                        ${svgIcon("edit",12)} Edit
                    </button>
                </div>
                
                <div style="padding: 0.5rem;">
                    ${(menuData[catKey] || []).map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1; min-width: 200px;">
                                ${/* FIX: Use emoji for food items, fallback to category image/emoji */''}
                                <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    ${item.image 
                                        ? `<img src="${item.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; object-position: center;">` 
                                        : (cat.image 
                                            ? `<img src="${cat.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; object-position: center; opacity: 0.7;">` 
                                            : `<span style="font-size: 1.3rem;">${getFoodEmoji(item.icon || cat.icon)}</span>`
                                        )
                                    }
                                </div>
                                <div>
                                    <div style="font-weight: 600; ${item.available === false ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${item.name}</div>
                                    <div style="font-size: 0.85rem; color: #10b981;">${formatPrice(item.price)}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.3rem;">
                                <button onclick="toggleFoodAvailability('${catKey}', ${item.id})" style="background: ${item.available !== false ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${item.available !== false ? '#10b981' : '#ef4444'}; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    ${item.available !== false ? svgIcon('check-circle', 14, 'icon-success') : svgIcon('x-circle', 14, 'icon-danger')}
                                </button>
                                <button onclick="openEditFood('${catKey}', ${item.id})" style="background: rgba(59,130,246,0.2); color: #3b82f6; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    ${svgIcon("edit",12)}
                                </button>
                                <button onclick="deleteFood('${catKey}', ${item.id})" style="background: rgba(239,68,68,0.2); color: #ef4444; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    ${svgIcon("trash",12,"icon-danger")}
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
        // FIX: Default to emoji, not keyword
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
        // FIX: Show emoji in input, not keyword
        const foodIcon = normalizeIconToEmoji(item.icon || 'utensils');
        document.getElementById('foodEditIcon').value = foodIcon;
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
    const iconInput = document.getElementById('foodEditIcon').value || 'utensils';
    // FIX: Convert keyword to emoji before saving
    const icon = normalizeIconToEmoji(iconInput);
    const desc = document.getElementById('foodEditDesc').value.trim();
    const optionsText = document.getElementById('foodEditOptions').value.trim();
    const image = document.getElementById('foodEditImage').value.trim();
    
    if (!category || !name || isNaN(price)) {
        uiAlert('Please fill category, name and price', 'error');
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
    uiAlert('Food item saved!', 'success');
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
        // FIX: Default to emoji, not keyword
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
        // FIX: Show emoji in input, not keyword
        const categoryIcon = normalizeIconToEmoji(cat.icon || 'utensils');
        document.getElementById('categoryEditIcon').value = categoryIcon;
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
    uiAlert('Category deleted', 'success');
}

// Image upload handlers
function handleFoodImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        uiAlert('Image must be less than 2MB', 'error');
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
        uiAlert('Image must be less than 2MB', 'error');
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
    const iconInput = document.getElementById('categoryEditIcon').value || 'utensils';
    // FIX: Convert keyword to emoji before saving
    const icon = normalizeIconToEmoji(iconInput);
    const image = document.getElementById('categoryEditImage').value.trim();
    
    if (!key || !name) {
        uiAlert('Please fill key and name', 'error');
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
            uiAlert('Category key already exists', 'error');
            return;
        }
        categories[key] = { name, icon, image };
        if (!menuData[key]) menuData[key] = [];
    }
    
    saveMenuData();
    closeCategoryEditor();
    renderMenuManagerList();
    renderCategories();
    uiAlert('Category saved!', 'success');
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
window.toggleAddDriverForm = toggleAddDriverForm;
window.addNewDriver = addNewDriver;
window.deleteDriver = deleteDriver;
window.editDriver = editDriver;
window.previewDriverPic = previewDriverPic;
window.previewEditDriverPic = previewEditDriverPic;
window.saveDriverChanges = saveDriverChanges;
window.toggleDriverStatus = toggleDriverStatus;
window.notifyAllAvailableDrivers = notifyAllAvailableDrivers;
window.driverAcceptOrder = driverAcceptOrder;
// HEALTH CHECK: Ensure all onclick-referenced functions are exported
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.assignDriver = assignDriver;
window.showEstimatedTimePrompt = showEstimatedTimePrompt;
window.formatEtaCountdown = formatEtaCountdown;
window.formatTimeHHMM = formatTimeHHMM;
window.markOrderReady = markOrderReady;
window.completeCollectionOrder = completeCollectionOrder;
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
window.moveCategoryUp = moveCategoryUp;
window.moveCategoryDown = moveCategoryDown;

// ========================================
// AUTO-CONVERT ICON INPUTS TO EMOJI
// FIX: Add live icon preview when user types in icon field
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Auto-convert category icon input to emoji
    const categoryIconInput = document.getElementById('categoryEditIcon');
    if (categoryIconInput) {
        categoryIconInput.addEventListener('input', function() {
            const currentValue = this.value;
            const emojiValue = normalizeIconToEmoji(currentValue);
            if (currentValue !== emojiValue) {
                this.value = emojiValue;
            }
        });
        categoryIconInput.addEventListener('blur', function() {
            this.value = normalizeIconToEmoji(this.value);
        });
    }
    
    // Auto-convert food icon input to emoji
    const foodIconInput = document.getElementById('foodEditIcon');
    if (foodIconInput) {
        foodIconInput.addEventListener('input', function() {
            const currentValue = this.value;
            const emojiValue = normalizeIconToEmoji(currentValue);
            if (currentValue !== emojiValue) {
                this.value = emojiValue;
            }
        });
        foodIconInput.addEventListener('blur', function() {
            this.value = normalizeIconToEmoji(this.value);
        });
    }
});

window.printBill = printBill;
