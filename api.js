/**
 * ANTALYA SHAWARMA - API Client
 * Connects frontend to MySQL backend via PHP API
 * Version: 4.0.0
 */

const API = {
    // Base URL - Change this to your server
    baseUrl: '/api',
    
    // Auth token storage
    token: localStorage.getItem('auth_token'),
    
    // ========================================
    // CORE REQUEST METHOD
    // ========================================
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Set auth token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    },
    
    // ========================================
    // AUTH ENDPOINTS
    // ========================================
    auth: {
        async register(name, email, password, phone = null, dob = null) {
            return API.request('users.php?action=register', 'POST', {
                name, email, password, phone, dob
            });
        },
        
        async login(email, password) {
            return API.request('users.php?action=login', 'POST', {
                email, password
            });
        },
        
        async verify(userId, code) {
            const result = await API.request('users.php?action=verify', 'POST', {
                user_id: userId, code
            });
            if (result.data?.token) {
                API.setToken(result.data.token);
            }
            return result;
        },
        
        async verifyPin(pin) {
            return API.request('users.php?action=verify-pin', 'POST', { pin });
        },
        
        async forgotPassword(email) {
            return API.request('users.php?action=forgot-password', 'POST', { email });
        },
        
        async resetPassword(email, code, newPassword) {
            return API.request('users.php?action=reset-password', 'POST', {
                email, code, new_password: newPassword
            });
        },
        
        logout() {
            API.setToken(null);
            localStorage.removeItem('currentUser');
        }
    },
    
    // ========================================
    // USER ENDPOINTS
    // ========================================
    users: {
        async getProfile() {
            return API.request('users.php?action=profile');
        },
        
        async updateProfile(data) {
            return API.request('users.php?action=profile', 'PUT', data);
        },
        
        async changePassword(currentPassword, newPassword) {
            return API.request('users.php?action=password', 'PUT', {
                current_password: currentPassword,
                new_password: newPassword
            });
        },
        
        async deleteAccount() {
            return API.request('users.php?action=account', 'DELETE');
        },
        
        // Owner only
        async getAll() {
            return API.request('users.php?action=list');
        },
        
        async delete(id) {
            return API.request(`users.php?action=user&id=${id}`, 'DELETE');
        },
        
        async deleteAll() {
            return API.request('users.php?action=all-users', 'DELETE');
        }
    },
    
    // ========================================
    // MENU ENDPOINTS
    // ========================================
    menu: {
        async getCategories() {
            return API.request('menu.php?action=categories');
        },
        
        async getItems(categoryId = null) {
            let url = 'menu.php?action=list';
            if (categoryId) url += `&category_id=${categoryId}`;
            return API.request(url);
        },
        
        async getItem(id) {
            return API.request(`menu.php?action=item&id=${id}`);
        },
        
        async getFullMenu() {
            return API.request('menu.php?action=full');
        },
        
        async search(query) {
            return API.request(`menu.php?action=search&q=${encodeURIComponent(query)}`);
        },
        
        // Owner only
        async addCategory(data) {
            return API.request('menu.php?action=add-category', 'POST', data);
        },
        
        async updateCategory(data) {
            return API.request('menu.php?action=category', 'PUT', data);
        },
        
        async deleteCategory(id) {
            return API.request(`menu.php?action=category&id=${id}`, 'DELETE');
        },
        
        async addItem(data) {
            return API.request('menu.php?action=add-item', 'POST', data);
        },
        
        async updateItem(data) {
            return API.request('menu.php?action=item', 'PUT', data);
        },
        
        async deleteItem(id) {
            return API.request(`menu.php?action=item&id=${id}`, 'DELETE');
        },
        
        async setAvailability(id, available) {
            return API.request('menu.php?action=availability', 'PUT', {
                id, is_available: available
            });
        }
    },
    
    // ========================================
    // ORDER ENDPOINTS
    // ========================================
    orders: {
        async create(items, paymentMethod, deliveryAddress, deliveryLat, deliveryLng, notes = null) {
            return API.request('orders.php?action=create', 'POST', {
                items, payment_method: paymentMethod,
                delivery_address: deliveryAddress,
                delivery_lat: deliveryLat,
                delivery_lng: deliveryLng,
                notes
            });
        },
        
        async getMyOrders() {
            return API.request('orders.php?action=my-orders');
        },
        
        async getActive() {
            return API.request('orders.php?action=active');
        },
        
        async get(id) {
            return API.request(`orders.php?action=get&id=${id}`);
        },
        
        async cancel(orderId, reason = null) {
            return API.request('orders.php?action=cancel', 'POST', {
                order_id: orderId, reason
            });
        },
        
        async reorder(orderId) {
            return API.request('orders.php?action=reorder', 'POST', {
                order_id: orderId
            });
        },
        
        // Owner only
        async getPending() {
            return API.request('orders.php?action=pending');
        },
        
        async getAll(limit = 50, offset = 0, status = null) {
            let url = `orders.php?action=all&limit=${limit}&offset=${offset}`;
            if (status) url += `&status=${status}`;
            return API.request(url);
        },
        
        async getStats(from = null, to = null) {
            let url = 'orders.php?action=stats';
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;
            return API.request(url);
        },
        
        async accept(orderId, estimatedTime = 30) {
            return API.request('orders.php?action=accept', 'PUT', {
                order_id: orderId, estimated_time: estimatedTime
            });
        },
        
        async preparing(orderId) {
            return API.request('orders.php?action=preparing', 'PUT', {
                order_id: orderId
            });
        },
        
        async ready(orderId) {
            return API.request('orders.php?action=ready', 'PUT', {
                order_id: orderId
            });
        },
        
        async assignDriver(orderId, driverId) {
            return API.request('orders.php?action=assign-driver', 'PUT', {
                order_id: orderId, driver_id: driverId
            });
        },
        
        async reject(orderId, reason = null) {
            return API.request('orders.php?action=reject', 'PUT', {
                order_id: orderId, reason
            });
        }
    },
    
    // ========================================
    // DRIVER ENDPOINTS
    // ========================================
    drivers: {
        async login(email, password) {
            const result = await API.request('drivers.php?action=login', 'POST', {
                email, password
            });
            if (result.data?.token) {
                API.setToken(result.data.token);
            }
            return result;
        },
        
        async getProfile() {
            return API.request('drivers.php?action=profile');
        },
        
        async getMyDeliveries(status = 'all') {
            return API.request(`drivers.php?action=my-deliveries&status=${status}`);
        },
        
        async getEarnings(period = 'today') {
            return API.request(`drivers.php?action=earnings&period=${period}`);
        },
        
        async updateLocation(lat, lng) {
            return API.request('drivers.php?action=location', 'PUT', { lat, lng });
        },
        
        async setAvailability(available) {
            return API.request('drivers.php?action=availability', 'PUT', {
                is_available: available
            });
        },
        
        async pickupOrder(orderId) {
            return API.request('drivers.php?action=pickup', 'PUT', {
                order_id: orderId
            });
        },
        
        async deliverOrder(orderId) {
            return API.request('drivers.php?action=deliver', 'PUT', {
                order_id: orderId
            });
        },
        
        async rateDriver(orderId, rating, comment = null) {
            return API.request('drivers.php?action=rate', 'PUT', {
                order_id: orderId, rating, comment
            });
        },
        
        // Owner only
        async getAll() {
            return API.request('drivers.php?action=list');
        },
        
        async getAvailable() {
            return API.request('drivers.php?action=available');
        },
        
        async add(data) {
            return API.request('drivers.php?action=add', 'POST', data);
        },
        
        async update(data) {
            return API.request('drivers.php?action=update', 'PUT', data);
        },
        
        async delete(id) {
            return API.request(`drivers.php?action=driver&id=${id}`, 'DELETE');
        },
        
        async getLocation(driverId) {
            return API.request(`drivers.php?action=location&driver_id=${driverId}`);
        }
    },
    
    // ========================================
    // REVIEW ENDPOINTS
    // ========================================
    reviews: {
        async getAll(limit = 20, offset = 0) {
            return API.request(`reviews.php?action=list&limit=${limit}&offset=${offset}`);
        },
        
        async getSummary() {
            return API.request('reviews.php?action=summary');
        },
        
        async getMyReviews() {
            return API.request('reviews.php?action=my-reviews');
        },
        
        async create(rating, comment, title = null) {
            return API.request('reviews.php?action=create', 'POST', {
                rating, comment, title
            });
        },
        
        async delete(id) {
            return API.request(`reviews.php?action=review&id=${id}`, 'DELETE');
        },
        
        // Owner only
        async reply(reviewId, reply) {
            return API.request('reviews.php?action=reply', 'POST', {
                review_id: reviewId, reply
            });
        },
        
        async deleteReply(id) {
            return API.request(`reviews.php?action=reply&id=${id}`, 'DELETE');
        },
        
        async deleteAll() {
            return API.request('reviews.php?action=all', 'DELETE');
        }
    },
    
    // ========================================
    // FAVORITES ENDPOINTS
    // ========================================
    favorites: {
        async getAll() {
            return API.request('favorites.php?type=favorites');
        },
        
        async add(menuItemId) {
            return API.request('favorites.php?type=favorites', 'POST', {
                menu_item_id: menuItemId
            });
        },
        
        async remove(menuItemId) {
            return API.request(`favorites.php?type=favorites&menu_item_id=${menuItemId}`, 'DELETE');
        }
    },
    
    // ========================================
    // NOTIFICATIONS ENDPOINTS
    // ========================================
    notifications: {
        async getAll(limit = 50) {
            return API.request(`favorites.php?type=notifications&limit=${limit}`);
        },
        
        async getUnreadCount() {
            return API.request('favorites.php?type=notifications&action=unread-count');
        },
        
        async markRead(id = null) {
            return API.request('favorites.php?type=notifications&action=read', 'PUT', { id });
        },
        
        async delete(id = null) {
            let url = 'favorites.php?type=notifications';
            if (id) url += `&id=${id}`;
            return API.request(url, 'DELETE');
        }
    },
    
    // ========================================
    // SETTINGS ENDPOINTS
    // ========================================
    settings: {
        async getPublic() {
            return API.request('settings.php?action=public');
        },
        
        // Owner only
        async getAll() {
            return API.request('settings.php?action=all');
        },
        
        async update(settings) {
            return API.request('settings.php?action=update', 'PUT', settings);
        },
        
        async getBank() {
            return API.request('settings.php?action=bank');
        },
        
        async updateBank(data) {
            return API.request('settings.php?action=bank', 'PUT', data);
        },
        
        async updatePin(newPin) {
            return API.request('settings.php?action=pin', 'PUT', { new_pin: newPin });
        },
        
        async getStats() {
            return API.request('settings.php?action=stats');
        },
        
        async reset(options) {
            return API.request('settings.php?action=reset', 'PUT', options);
        }
    }
};

// Make API globally available
window.API = API;

// Initialize - check for existing token
if (API.token) {
    // Auth token present - user may be logged in
}
