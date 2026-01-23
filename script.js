, isBudgetValid, isPropertyValid}); // Debug log
            
            // If any validation fails, stop submission
            if (!isNameValid || !isPhoneValid || !isBudgetValid || !isPropertyValid) {
                showNotification('Please fix all errors before submitting', 'error');
                return;
            }
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Redirecting to WhatsApp...</span>';
            
            // Prepare data for submission
            const formData = {
                fullName,
                phone,
                budget,
                propertyType,
                area,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage (as backup)
            saveToLocalStorage(formData);
            
            // Redirect to WhatsApp
            redirectToWhatsApp(formData);
        });
    }
});

// ================================
// VALIDATION FUNCTIONS
// ================================
function validateName(name) {
    const nameError = document.getElementById('nameError');
    const nameInput = document.getElementById('fullName');
    
    if (!name || name.length < 2) {
        nameInput.classList.add('error');
        nameInput.classList.remove('success');
        nameError.textContent = 'Please enter your full name (at least 2 characters)';
        nameError.classList.add('show');
        return false;
    } else {
        nameInput.classList.remove('error');
        nameInput.classList.add('success');
        nameError.classList.remove('show');
        return true;
    }
}

function validatePhone(phone) {
    const phoneError = document.getElementById('phoneError');
    const phoneInput = document.getElementById('phone');
    
    // Check if empty
    if (!phone) {
        phoneInput.classList.add('error');
        phoneInput.classList.remove('success');
        phoneError.textContent = 'WhatsApp number is required';
        phoneError.classList.add('show');
        return false;
    }
    
    // Check if valid Indian mobile number (starts with 6-9, exactly 10 digits)
    const phonePattern = /^[6-9][0-9]{9}$/;
    
    if (!phonePattern.test(phone)) {
        phoneInput.classList.add('error');
        phoneInput.classList.remove('success');
        
        if (phone.length < 10) {
            phoneError.textContent = 'Please enter complete 10-digit number';
        } else if (phone.length === 10 && !phone.match(/^[6-9]/)) {
            phoneError.textContent = 'Mobile number should start with 6, 7, 8, or 9';
        } else {
            phoneError.textContent = 'Please enter a valid 10-digit mobile number';
        }
        
        phoneError.classList.add('show');
        return false;
    } else {
        phoneInput.classList.remove('error');
        phoneInput.classList.add('success');
        phoneError.classList.remove('show');
        return true;
    }
}

function validateSelect(selectElement, errorId, errorMessage) {
    const errorElement = document.getElementById(errorId);
    
    if (!selectElement.value) {
        selectElement.classList.add('error');
        selectElement.classList.remove('success');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        return false;
    } else {
        selectElement.classList.remove('error');
        selectElement.classList.add('success');
        errorElement.classList.remove('show');
        return true;
    }
}

// ================================
// SAVE TO LOCAL STORAGE
// ================================
function saveToLocalStorage(data) {
    try {
        const leads = JSON.parse(localStorage.getItem('propertyLeads') || '[]');
        leads.push(data);
        localStorage.setItem('propertyLeads', JSON.stringify(leads));
        console.log('Lead saved to localStorage:', data);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// ================================
// REDIRECT TO WHATSAPP
// ================================
function redirectToWhatsApp(data) {
    console.log('Redirecting to WhatsApp with CONFIG.whatsappNumber:', CONFIG.whatsappNumber); // Debug log
    
    const message = `Hi, I'm ${data.fullName}.

I'm interested in a ${data.propertyType} property in ${data.area}.

My details:
📱 WhatsApp: +91 ${data.phone}
💰 Budget: ${data.budget}
🏡 Property Type: ${data.propertyType}
📍 Preferred Area: ${data.area}

Please share available property details.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    console.log('WhatsApp URL:', whatsappUrl); // Debug log
    
    // Show success message
    showNotification('Redirecting to WhatsApp...', 'success');
    
    // Redirect after a short delay
    setTimeout(() => {
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        // Reset form
        const propertyForm = document.getElementById('propertyForm');
        if (propertyForm) {
            propertyForm.reset();
        }
        
        // Remove all success/error classes
        document.querySelectorAll('.success, .error').forEach(el => {
            el.classList.remove('success', 'error');
        });
        
        // Re-enable submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Send Details to WhatsApp</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 1.768.461 3.426 1.264 4.868L0 20l5.25-1.251A9.959 9.959 0 0010 20c5.523 0 10-4.477 10-10S15.523 0 10 0z" fill="currentColor"/>
                </svg>
            `;
        }
    }, 1000);
}

// ================================
// NOTIFICATION SYSTEM
// ================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'error' ? '#ef4444' : type === 'success' ? '#16a34a' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-size: 14px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 90%;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        document.head.appendChild(style);
    }
    
    // Append to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ================================
// LAZY LOADING FOR IMAGES (if added)
// ================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ================================
// SCROLL TO TOP ON PAGE LOAD
// ================================
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

// ================================
// VIEWPORT HEIGHT FIX FOR MOBILE
// ================================
function setVHProperty() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVHProperty();
window.addEventListener('resize', setVHProperty);

// ================================
// CONSOLE MESSAGE
// ================================
console.log('%c🏠 Property Lead Generation System Loaded', 'color: #16a34a; font-size: 16px; font-weight: bold;');
console.log('%cTo view captured leads, run: localStorage.getItem("propertyLeads")', 'color: #6b7280; font-size: 12px;');
console.log('%cWhatsApp Number configured: ' + CONFIG.whatsappNumber, 'color: #16a34a; font-size: 12px;');
