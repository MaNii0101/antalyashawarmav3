/* ============================================
   ADDITIONAL UTILITIES - utils.js
   Extra helper functions for the project
   Link this AFTER script.js in your HTML
   ============================================ */

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
    return 'Â£' + parseFloat(price).toFixed(2);
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
            showToast('Tip: Tap Share â†’ Add to Home Screen for quick access!', 'info', 5000);
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
// SWEETALERT2 ALERT SYSTEM
// Replaces all native alert() with modern UI
// ============================================

/**
 * Unified alert system with SVG icons
 * @param {string} message - Alert message (supports HTML)
 * @param {string} type - 'warning', 'error', 'success', or 'info'
 * @param {string} title - Optional custom title
 * @returns {Promise} SweetAlert2 promise
 */
function uiAlert(message, type = 'info', title = null) {
    // Fallback to native alert if SweetAlert2 failed to load
    if (typeof Swal === 'undefined') {
        console.warn('SweetAlert2 not loaded, falling back to native alert');
        alert(message.replace(/<[^>]*>/g, '')); // Strip HTML tags for native alert
        return Promise.resolve();
    }
    
    // Icon configurations with inline SVG
    const icons = {
        warning: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            title: title || 'Warning',
            color: '#f59e0b',
            bg: 'rgba(251, 191, 36, 0.15)'
        },
        error: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            title: title || 'Error',
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.15)'
        },
        success: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>',
            title: title || 'Success',
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.15)'
        },
        info: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            title: title || 'Info',
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.15)'
        }
    };
    
    const config = icons[type] || icons.info;
    
    // CRITICAL FIX: Force SweetAlert2 to append to body and use maximum z-index
    // This ensures alerts appear above ALL modals, forms, and transformed containers
    return Swal.fire({
        target: document.body, // Always append to body, not nested containers
        title: config.title,
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1.2rem; padding: 0.5rem;">
                <div style="background: ${config.bg}; padding: 1.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    ${config.svg}
                </div>
                <div style="color: #e2e8f0; line-height: 1.6; font-size: 0.95rem; text-align: center; max-width: 400px;">
                    ${message}
                </div>
            </div>
        `,
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: config.color,
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
            container: 'swal-top-container',
            popup: 'swal-modern-popup',
            title: 'swal-modern-title',
            htmlContainer: 'swal-modern-html',
            confirmButton: 'swal-modern-button',
            actions: 'swal-modern-actions'
        },
        didOpen: () => {
            // CRITICAL: Force maximum z-index after opening
            // This overrides any stacking context issues from modals
            const container = document.querySelector('.swal2-container');
            if (container) {
                container.style.zIndex = '999999';
            }
        },
        showClass: {
            popup: 'swal2-show',
            backdrop: 'swal2-backdrop-show'
        },
        hideClass: {
            popup: 'swal2-hide',
            backdrop: 'swal2-backdrop-hide'
        },
        backdrop: 'rgba(0, 0, 0, 0.6)'
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
    uiAlert  // Modern alert system
};

// Make uiAlert globally available for all scripts
window.uiAlert = uiAlert;

// ============================================
// SWEETALERT2 CUSTOM STYLES
// Ensures alerts always appear on top with modern appearance
// ============================================
(function() {
    const swalStyles = document.createElement('style');
    swalStyles.id = 'swal-custom-styles';
    swalStyles.textContent = `
        /* CRITICAL: Maximum z-index for SweetAlert2 container and backdrop */
        /* This ensures alerts appear above ALL modals, forms, and overlays */
        .swal2-container {
            z-index: 999999 !important;
        }
        
        .swal2-container.swal-top-container {
            z-index: 999999 !important;
        }
        
        /* Modern popup styling */
        .swal-modern-popup {
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
            padding: 2rem 1.5rem !important;
            min-width: 340px;
            max-width: 500px;
        }
        
        .swal-modern-title {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            margin-bottom: 0.5rem !important;
            color: #f1f5f9 !important;
        }
        
        .swal-modern-html {
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* Custom button styling */
        .swal-modern-button {
            padding: 0.75rem 2rem !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            color: white !important;
        }
        
        .swal-modern-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        
        .swal-modern-button:active {
            transform: translateY(0) !important;
        }
        
        .swal-modern-actions {
            margin-top: 1.5rem !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 500px) {
            .swal-modern-popup {
                min-width: 90vw !important;
                padding: 1.5rem 1rem !important;
            }
            
            .swal-modern-title {
                font-size: 1.1rem !important;
            }
        }
    `;
    
    // Inject styles only once
    if (!document.getElementById('swal-custom-styles')) {
        document.head.appendChild(swalStyles);
    }
})();

