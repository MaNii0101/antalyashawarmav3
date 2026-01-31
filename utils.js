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
            showToast('💡 Tap Share → Add to Home Screen for quick access!', 'info', 5000);
        }
    }
}

// Show add to home screen after 10 seconds
setTimeout(showAddToHomeScreen, 10000);

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Copied to clipboard!', 'success');
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
        showToast('✅ Copied!', 'success');
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
    markFormClean
};
