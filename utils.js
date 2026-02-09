/* ============================================
   ADDITIONAL UTILITIES - utils.js
   Extra helper functions for the project
   Link this AFTER script.js in your HTML
   ============================================ */

// ========================================
// FOOD EMOJI MAPPING - Replaces SVG icons for food/categories
// FIX: Moved from script.js to utils.js so it's available everywhere
// ========================================
const FOOD_EMOJI_MAP = {
    'wrap': '🌯',
    'sandwich': '🥙',
    'meat': '🍗',
    'drumstick': '🍗',
    'fries': '🍟',
    'rice': '🍚',
    'potato': '🥔',
    'salad': '🥗',
    'cabbage': '🥬',
    'bread': '🍞',
    'naan': '🫓',
    'garlic': '🧄',
    'falafel': '🧆',
    'dumpling': '🥟',
    'cheese': '🧀',
    'yogurt': '🥛',
    'pizza': '🍕',
    'cup': '🥤',
    'droplet': '💧',
    'juice': '🧃',
    'sauce': '🥫',
    'chili': '🌶️',
    'utensils': '🍴',
    '🫓': '🫓', // Allow direct emoji passthrough
    '🫜': '🫜'  // Allow direct emoji passthrough
};

// Helper function: Get emoji for food icon name
function getFoodEmoji(iconName) {
    return FOOD_EMOJI_MAP[iconName] || FOOD_EMOJI_MAP['utensils'];
}

// ========================================
// CATEGORY VISUAL HELPER - Unified rendering for customer UI + owner dashboard
// FIX: Shared function ensures consistent category icon/image display everywhere
// ========================================
/**
 * Returns HTML for category visual (image or emoji icon)
 * @param {Object} category - Category object with .image and .icon properties
 * @param {number} size - Size in pixels (default: 48 for customer UI, 40 for owner dashboard)
 * @param {boolean} isOwnerDashboard - Whether rendering in owner dashboard (affects styling)
 * @returns {string} HTML string for category visual
 */
function getCategoryVisual(category, size = 48, isOwnerDashboard = false) {
    if (!category) {
        // Fallback for missing category
        return `<span style="font-size: ${size}px; line-height: 1;">${FOOD_EMOJI_MAP['utensils']}</span>`;
    }
    
    if (category.image) {
        // FIX: Category has uploaded image - show with proper sizing
        const sizeStyle = isOwnerDashboard 
            ? `width: ${size}px; height: ${size}px;` 
            : `width: 100%; height: 100%;`;
        
        return `<img src="${category.image}" 
                     alt="${category.name || 'Category'}" 
                     class="category-image"
                     style="${sizeStyle} object-fit: cover; object-position: center; border-radius: 8px;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span style="font-size: ${size}px; line-height: 1; display: none;">${getFoodEmoji(category.icon)}</span>`;
    } else {
        // FIX: No image - show emoji icon
        return `<span style="font-size: ${size}px; line-height: 1;">${getFoodEmoji(category.icon)}</span>`;
    }
}

// Mobile detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Touch device detection
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Smooth scroll with offset for sticky header
function smoothScrollTo(element) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = element.offsetTop - headerHeight;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Format price consistently
function formatPrice(price) {
    return '£' + parseFloat(price).toFixed(2);
}

// Format phone number for display
function formatPhoneDisplay(phone) {
    // Format: +44 7700 900 123
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('44')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith('0')) {
        return `0${cleaned.slice(1, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Vibrate on button click (mobile only)
function vibrateButton() {
    if (navigator.vibrate && isTouchDevice()) {
        navigator.vibrate(10);
    }
}

// Add vibration to all buttons
document.addEventListener('DOMContentLoaded', function() {
    if (isTouchDevice()) {
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                vibrateButton();
            }
        });
    }
});

// Handle orientation change
window.addEventListener('orientationchange', function() {
    // Refresh layout after orientation change
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Add to home screen prompt (PWA-like)
function showAddToHomeScreen() {
    if (isMobile() && !window.matchMedia('(display-mode: standalone)').matches) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
            showToast('Tip: Tap Share → Add to Home Screen for quick access!', 'info', 5000);
        }
    }
}

// Show add to home screen after 10 seconds
setTimeout(showAddToHomeScreen, 10000);

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied!', 'success');
    }
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Prevent accidental back navigation
let isFormDirty = false;

function markFormDirty() {
    isFormDirty = true;
}

function markFormClean() {
    isFormDirty = false;
}

window.addEventListener('beforeunload', function(e) {
    if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Monitor all form inputs
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('input', markFormDirty);
        form.addEventListener('submit', markFormClean);
    });
});

// Performance monitoring
function measurePerformance() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        // Performance metrics available via perfData if needed
    }
}

window.addEventListener('load', measurePerformance);

// ============================================
// LUXURY MODERN ALERT SYSTEM
// Premium glassmorphism design with base64 SVG icons
// Fixes GitHub Pages SVG loading issues
// ============================================

/**
 * Luxury alert system with base64 SVG icons (works everywhere including GitHub Pages)
 * @param {string} message - Alert message (supports HTML)
 * @param {string} type - 'warning', 'error', 'success', or 'info'
 * @param {string} title - Optional custom title
 * @returns {Promise} SweetAlert2 promise
 */
function uiAlert(message, type = 'info', title = null) {
    // Fallback to native alert if SweetAlert2 failed to load
    if (typeof Swal === 'undefined') {
        console.warn('SweetAlert2 not loaded, falling back to native alert');
        alert(message.replace(/<[^>]*>/g, ''));
        return Promise.resolve();
    }
    
    // Base64 encoded SVG icons (fixes GitHub Pages loading issue)
    const icons = {
        warning: {
            // Orange warning triangle - base64 encoded
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTAuMjkgMy44NkwxLjgyIDE4YTIgMiAwIDAgMCAxLjcxIDNoMTYuOTRhMiAyIDAgMCAwIDEuNzEtM0wxMy43MSAzLjg2YTIgMiAwIDAgMC0zLjQyIDB6Ij48L3BhdGg+PGxpbmUgeDE9IjEyIiB5MT0iOSIgeDI9IjEyIiB5Mj0iMTMiPjwvbGluZT48bGluZSB4MT0iMTIiIHkxPSIxNyIgeDI9IjEyLjAxIiB5Mj0iMTciPjwvbGluZT48L3N2Zz4=',
            title: title || 'Warning',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            glow: 'rgba(245, 158, 11, 0.4)'
        },
        error: {
            // Red X circle - base64 encoded
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PGxpbmUgeDE9IjE1IiB5MT0iOSIgeDI9IjkiIHkyPSIxNSI+PC9saW5lPjxsaW5lIHgxPSI5IiB5MT0iOSIgeDI9IjE1IiB5Mj0iMTUiPjwvbGluZT48L3N2Zz4=',
            title: title || 'Error',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            glow: 'rgba(239, 68, 68, 0.4)'
        },
        success: {
            // Green checkmark circle - base64 encoded
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iOSAxMiAxMSAxNCAxNSAxMCI+PC9wb2x5bGluZT48L3N2Zz4=',
            title: title || 'Success',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            glow: 'rgba(16, 185, 129, 0.4)'
        },
        info: {
            // Blue info circle - base64 encoded
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMiIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjEyIiB5MT0iOCIgeDI9IjEyLjAxIiB5Mj0iOCI+PC9saW5lPjwvc3ZnPg==',
            title: title || 'Info',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            glow: 'rgba(59, 130, 246, 0.4)'
        }
    };
    
    const config = icons[type] || icons.info;
    
    return Swal.fire({
        target: document.body,
        title: config.title,
        html: `
            <div class="luxury-alert-content">
                <div class="luxury-icon-wrapper">
                    <img src="${config.icon}" alt="${type}" class="luxury-icon" />
                </div>
                <div class="luxury-message">
                    ${message}
                </div>
            </div>
        `,
        background: 'rgba(15, 23, 42, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.75)',
        color: '#f1f5f9',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
            container: 'luxury-alert-container',
            popup: 'luxury-alert-popup',
            title: 'luxury-alert-title',
            htmlContainer: 'luxury-alert-html',
            confirmButton: 'luxury-alert-button',
            actions: 'luxury-alert-actions'
        },
        didOpen: () => {
            // Force maximum z-index
            const container = document.querySelector('.swal2-container');
            if (container) {
                container.style.zIndex = '999999';
            }
            
            // Apply gradient to button dynamically
            const button = document.querySelector('.luxury-alert-button');
            if (button) {
                button.style.background = config.gradient;
                button.style.boxShadow = `0 8px 32px ${config.glow}`;
            }
        },
        showClass: {
            popup: 'swal2-show luxury-alert-show',
            backdrop: 'swal2-backdrop-show'
        },
        hideClass: {
            popup: 'swal2-hide luxury-alert-hide',
            backdrop: 'swal2-backdrop-hide'
        }
    });
}

// Export functions for use in main script
window.utils = {
    isMobile,
    isTouchDevice,
    smoothScrollTo,
    formatPrice,
    formatPhoneDisplay,
    debounce,
    showToast,
    lazyLoadImages,
    isInViewport,
    vibrateButton,
    copyToClipboard,
    formatDate,
    markFormDirty,
    markFormClean,
    uiAlert
};

// Make uiAlert globally available for all scripts
window.uiAlert = uiAlert;

// ============================================
// LUXURY ALERT CUSTOM STYLES
// Glassmorphism design with premium animations
// ============================================
(function() {
    const luxuryStyles = document.createElement('style');
    luxuryStyles.id = 'luxury-alert-styles';
    luxuryStyles.textContent = `
        /* ========================================
           CRITICAL Z-INDEX - Always on top
           ======================================== */
        .swal2-container.luxury-alert-container {
            z-index: 999999 !important;
        }
        
        /* ========================================
           LUXURY POPUP - Glassmorphism
           ======================================== */
        .luxury-alert-popup {
            border-radius: 24px !important;
            padding: 2.5rem 2rem !important;
            min-width: 380px;
            max-width: 480px;
            background: rgba(15, 23, 42, 0.95) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 20px 60px rgba(0, 0, 0, 0.6),
                0 0 100px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Title with premium font */
        .luxury-alert-title {
            font-size: 1.5rem !important;
            font-weight: 700 !important;
            margin-bottom: 1rem !important;
            color: #f8fafc !important;
            letter-spacing: -0.02em;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        
        /* Content wrapper */
        .luxury-alert-html {
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .luxury-alert-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }
        
        /* Icon wrapper with glow effect */
        .luxury-icon-wrapper {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            animation: luxuryIconPulse 2s ease-in-out infinite;
        }
        
        .luxury-icon-wrapper::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4));
            opacity: 0.5;
            animation: luxuryIconRotate 3s linear infinite;
        }
        
        .luxury-icon {
            width: 56px;
            height: 56px;
            position: relative;
            z-index: 1;
            filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4));
        }
        
        /* Message text */
        .luxury-message {
            color: #cbd5e1;
            font-size: 1rem;
            line-height: 1.7;
            text-align: center;
            max-width: 380px;
            font-weight: 400;
        }
        
        .luxury-message strong {
            color: #f1f5f9;
            font-weight: 600;
        }
        
        /* Button container */
        .luxury-alert-actions {
            margin-top: 2rem !important;
        }
        
        /* Premium button */
        .luxury-alert-button {
            padding: 0.875rem 2.5rem !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            border: none !important;
            color: white !important;
            cursor: pointer !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative;
            overflow: hidden;
            letter-spacing: 0.02em;
        }
        
        .luxury-alert-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .luxury-alert-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5) !important;
        }
        
        .luxury-alert-button:hover::before {
            opacity: 1;
        }
        
        .luxury-alert-button:active {
            transform: translateY(0) !important;
        }
        
        /* ========================================
           ANIMATIONS
           ======================================== */
        @keyframes luxuryIconPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
        
        @keyframes luxuryIconRotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        .luxury-alert-show {
            animation: luxurySlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
        
        .luxury-alert-hide {
            animation: luxurySlideOut 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards !important;
        }
        
        @keyframes luxurySlideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        @keyframes luxurySlideOut {
            from {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            to {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
            }
        }
        
        /* ========================================
           MOBILE RESPONSIVE
           ======================================== */
        @media (max-width: 500px) {
            .luxury-alert-popup {
                min-width: 90vw !important;
                padding: 2rem 1.5rem !important;
                border-radius: 20px !important;
            }
            
            .luxury-alert-title {
                font-size: 1.25rem !important;
            }
            
            .luxury-icon-wrapper {
                width: 72px;
                height: 72px;
            }
            
            .luxury-icon {
                width: 48px;
                height: 48px;
            }
            
            .luxury-message {
                font-size: 0.95rem;
            }
            
            .luxury-alert-button {
                padding: 0.75rem 2rem !important;
                font-size: 0.95rem !important;
            }
        }
        
        /* High-DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .luxury-alert-popup {
                backdrop-filter: blur(30px) saturate(200%) !important;
                -webkit-backdrop-filter: blur(30px) saturate(200%) !important;
            }
        }
    `;
    
    // Inject styles only once
    if (!document.getElementById('luxury-alert-styles')) {
        document.head.appendChild(luxuryStyles);
    }
})();
