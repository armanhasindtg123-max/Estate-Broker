// ================================
// CONFIGURATION
// ================================
const CONFIG = {
    whatsappNumber: '919876543210', // Replace with actual WhatsApp number
    formSubmitWebhook: 'https://formsubmit.co/your-email@example.com' // Replace with actual webhook
};

// ================================
// SMOOTH SCROLL FOR CTA BUTTON
// ================================
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offset = 20;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});

// ================================
// FORM VALIDATION & SUBMISSION
// ================================
const propertyForm = document.getElementById('propertyForm');

if (propertyForm) {
    propertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const budget = document.getElementById('budget').value;
        const propertyType = document.getElementById('propertyType').value;
        const area = document.getElementById('area').value.trim() || 'Any area';
        
        // Basic validation
        if (!fullName || fullName.length < 2) {
            showNotification('Please enter your full name', 'error');
            return;
        }
        
        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            return;
        }
        
        if (!budget) {
            showNotification('Please select your budget range', 'error');
            return;
        }
        
        if (!propertyType) {
            showNotification('Please select a property type', 'error');
            return;
        }
        
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
        
        // Optional: Send to webhook/backend
        sendToWebhook(formData);
        
        // Redirect to WhatsApp
        redirectToWhatsApp(formData);
    });
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
// SEND TO WEBHOOK (OPTIONAL)
// ================================
function sendToWebhook(data) {
    // This is a placeholder for webhook integration
    // Replace with actual FormSubmit or custom webhook URL
    
    // Example using FormSubmit:
    // const formSubmitUrl = CONFIG.formSubmitWebhook;
    
    // fetch(formSubmitUrl, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(result => {
    //     console.log('Form submitted successfully:', result);
    // })
    // .catch(error => {
    //     console.error('Error submitting form:', error);
    // });
    
    console.log('Form data ready for webhook:', data);
}

// ================================
// REDIRECT TO WHATSAPP
// ================================
function redirectToWhatsApp(data) {
    const message = `Hi, I'm ${data.fullName}.

I'm interested in a ${data.propertyType} property in ${data.area}.

My details:
📱 Phone: ${data.phone}
💰 Budget: ${data.budget}
🏡 Property Type: ${data.propertyType}
📍 Preferred Area: ${data.area}

Please share available property details.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    // Show success message
    showNotification('Redirecting to WhatsApp...', 'success');
    
    // Redirect after a short delay
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        
        // Reset form
        propertyForm.reset();
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