// Instructor Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wrapperForm');
    const resultSection = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const generatedUrlInput = document.getElementById('generatedUrl');
    const copyBtn = document.getElementById('copyBtn');
    const createAnotherBtn = document.getElementById('createAnother');
    const configSummary = document.getElementById('configSummary');

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const config = validateAndCreateConfig(formData);
            
            if (config) {
                const wrapperId = generateUniqueId();
                saveConfiguration(wrapperId, config);
                displayResult(wrapperId, config);
                hideError();
            }
        } catch (error) {
            showError(error.message);
        }
    });

    // Copy button handler
    copyBtn.addEventListener('click', function() {
        generatedUrlInput.select();
        generatedUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            showError('Failed to copy URL. Please copy manually.');
        }
    });

    // Create another wrapper button
    createAnotherBtn.addEventListener('click', function() {
        form.reset();
        resultSection.style.display = 'none';
        document.getElementById('allowedViolations').value = '3'; // Reset to default
    });

    // Validate form data and create configuration object
    function validateAndCreateConfig(formData) {
        const googleFormUrl = formData.get('googleFormUrl').trim();
        const allowedViolations = parseInt(formData.get('allowedViolations')) || 3;
        const sessionDuration = parseInt(formData.get('sessionDuration')) || null;
        const requireEmail = formData.get('requireEmail') === 'on';

        // Validate Google Form URL
        if (!googleFormUrl) {
            throw new Error('Google Form URL is required.');
        }

        if (!isValidGoogleFormUrl(googleFormUrl)) {
            throw new Error('Please enter a valid Google Forms URL (must start with https://docs.google.com/forms/).');
        }

        // Validate violations count
        if (allowedViolations < 1 || allowedViolations > 10) {
            throw new Error('Allowed violations must be between 1 and 10.');
        }

        // Validate session duration if provided
        if (sessionDuration && (sessionDuration < 5 || sessionDuration > 300)) {
            throw new Error('Session duration must be between 5 and 300 minutes.');
        }

        return {
            googleFormUrl: googleFormUrl,
            allowedViolations: allowedViolations,
            sessionDuration: sessionDuration,
            requireEmail: requireEmail,
            createdAt: new Date().toISOString(),
            createdBy: 'instructor' // Could be enhanced with actual user identification
        };
    }

    // Validate Google Form URL format
    function isValidGoogleFormUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'docs.google.com' && 
                   urlObj.pathname.startsWith('/forms/');
        } catch (e) {
            return false;
        }
    }

    // Generate unique identifier for the wrapper
    function generateUniqueId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `wrapper_${timestamp}_${randomStr}`;
    }

    // Save configuration to localStorage and create shareable URL with embedded config
    function saveConfiguration(wrapperId, config) {
        try {
            let wrapperLinks = {};
            
            // Get existing configurations
            const existingData = localStorage.getItem('wrapperLinks');
            if (existingData) {
                wrapperLinks = JSON.parse(existingData);
            }

            // Add new configuration
            wrapperLinks[wrapperId] = config;

            // Save back to localStorage
            localStorage.setItem('wrapperLinks', JSON.stringify(wrapperLinks));

            // Also save to a separate log for analytics
            saveToAnalyticsLog(wrapperId, config);

        } catch (error) {
            throw new Error('Failed to save configuration. Please try again.');
        }
    }

    // Save to analytics log
    function saveToAnalyticsLog(wrapperId, config) {
        try {
            let analyticsLog = [];
            
            const existingLog = localStorage.getItem('analyticsLog');
            if (existingLog) {
                analyticsLog = JSON.parse(existingLog);
            }

            analyticsLog.push({
                id: wrapperId,
                action: 'wrapper_created',
                timestamp: new Date().toISOString(),
                config: {
                    allowedViolations: config.allowedViolations,
                    sessionDuration: config.sessionDuration,
                    requireEmail: config.requireEmail
                }
            });

            // Keep only last 100 entries to prevent localStorage bloat
            if (analyticsLog.length > 100) {
                analyticsLog = analyticsLog.slice(-100);
            }

            localStorage.setItem('analyticsLog', JSON.stringify(analyticsLog));
        } catch (error) {
            console.warn('Failed to save to analytics log:', error);
        }
    }

    // Display the generated result with embedded configuration
    function displayResult(wrapperId, config) {
        const baseUrl = window.location.origin + window.location.pathname.replace('instructor.html', '');
        
        // Create URL with embedded configuration for cross-device compatibility
        const configData = btoa(JSON.stringify({
            id: wrapperId,
            googleFormUrl: config.googleFormUrl,
            allowedViolations: config.allowedViolations,
            sessionDuration: config.sessionDuration,
            requireEmail: config.requireEmail,
            createdAt: config.createdAt
        }));
        
        const wrapperUrl = `${baseUrl}wrapper.html?config=${configData}`;

        generatedUrlInput.value = wrapperUrl;

        // Update configuration summary
        configSummary.innerHTML = '';
        
        const configItems = [
            `Allowed Violations: ${config.allowedViolations}`,
            config.sessionDuration ? `Session Duration: ${config.sessionDuration} minutes` : 'No time limit',
            config.requireEmail ? 'Email verification required' : 'No email verification',
            `Created: ${new Date(config.createdAt).toLocaleString()}`,
            `Wrapper ID: ${wrapperId}`
        ];

        configItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            configSummary.appendChild(li);
        });

        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Show error message
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Hide error message
    function hideError() {
        errorDiv.style.display = 'none';
    }

    // URL input validation on blur
    document.getElementById('googleFormUrl').addEventListener('blur', function() {
        const url = this.value.trim();
        if (url && !isValidGoogleFormUrl(url)) {
            this.style.borderColor = '#ef4444';
            showError('Please enter a valid Google Forms URL.');
        } else {
            this.style.borderColor = '';
            hideError();
        }
    });

    // Real-time validation for violations input
    document.getElementById('allowedViolations').addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value && (value < 1 || value > 10)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });

    // Real-time validation for session duration
    document.getElementById('sessionDuration').addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value && (value < 5 || value > 300)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });

    // Initialize page
    function init() {
        // Check if localStorage is available
        if (typeof(Storage) === "undefined") {
            showError('Your browser does not support local storage. Some features may not work properly.');
        }

        // Clear any previous results
        resultSection.style.display = 'none';
        hideError();
    }

    init();
});

// Utility function to get all wrapper configurations (for admin dashboard)
function getAllWrapperConfigurations() {
    try {
        const data = localStorage.getItem('wrapperLinks');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to retrieve wrapper configurations:', error);
        return {};
    }
}

// Utility function to get analytics log (for admin dashboard)
function getAnalyticsLog() {
    try {
        const data = localStorage.getItem('analyticsLog');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve analytics log:', error);
        return [];
    }
}
