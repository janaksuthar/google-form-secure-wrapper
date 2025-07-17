// Wrapper Page JavaScript - Anti-Cheating Security Features
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let config = null;
    let violationCount = 0;
    let sessionStartTime = null;
    let timerInterval = null;
    let sessionLocked = false;
    let warningShown = false;
    let studentEmail = null;
    let sessionId = null;

    // DOM elements
    const emailModal = document.getElementById('emailModal');
    const warningModal = document.getElementById('warningModal');
    const lockedModal = document.getElementById('lockedModal');
    const statusBar = document.getElementById('statusBar');
    const violationCountDisplay = document.getElementById('violationCount');
    const maxViolationsDisplay = document.getElementById('maxViolations');
    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemainingDisplay = document.getElementById('timeRemaining');
    const googleFormFrame = document.getElementById('googleFormFrame');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Initialize the wrapper
    function init() {
        try {
            // Get configuration from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const configData = urlParams.get('config');
            const configId = urlParams.get('id'); // Fallback for old links

            // Try to load from embedded config first (new method)
            if (configData) {
                try {
                    const decodedConfig = atob(configData);
                    config = JSON.parse(decodedConfig);
                    console.log('Loaded embedded configuration');
                } catch (decodeError) {
                    console.error('Failed to decode embedded config:', decodeError);
                    showError('Invalid configuration data. Please use a valid link from your instructor.');
                    return;
                }
            }
            // Fallback to localStorage method (for backward compatibility)
            else if (configId) {
                config = loadConfiguration(configId);
                if (!config) {
                    showError('Configuration not found. Please check your link or contact your instructor.');
                    return;
                }
                console.log('Loaded configuration from localStorage');
            }
            // No valid configuration found
            else {
                showError('Invalid access link. Please use the link provided by your instructor.');
                return;
            }

            // Validate required configuration fields
            if (!config.googleFormUrl || !config.allowedViolations) {
                showError('Invalid configuration. Please contact your instructor for a new link.');
                return;
            }

            // Generate session ID
            sessionId = generateSessionId();
            sessionStartTime = new Date();

            // Update UI with configuration
            maxViolationsDisplay.textContent = config.allowedViolations;

            // Check if email is required
            if (config.requireEmail) {
                showEmailModal();
            } else {
                startSecureSession();
            }

        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize secure session. Please try again.');
        }
    }

    // Load configuration from localStorage
    function loadConfiguration(configId) {
        try {
            const wrapperLinks = localStorage.getItem('wrapperLinks');
            if (!wrapperLinks) {
                return null;
            }

            const configs = JSON.parse(wrapperLinks);
            return configs[configId] || null;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            return null;
        }
    }

    // Generate unique session ID
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    }

    // Show email collection modal
    function showEmailModal() {
        emailModal.style.display = 'flex';
        
        const emailForm = document.getElementById('emailForm');
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('studentEmail');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                studentEmail = email;
                emailModal.style.display = 'none';
                startSecureSession();
                logEvent('email_provided', { email: email });
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Start the secure session
    function startSecureSession() {
        // Generate unique session key for this specific student session
        const sessionKey = 'secureFormSession_' + sessionId;
        
        // Check if THIS specific session already exists (prevent refresh abuse)
        const existingSession = sessionStorage.getItem(sessionKey);
        if (existingSession) {
            // Allow the same student to continue their session after refresh
            console.log('Continuing existing session for this student');
        }

        // Mark session as started with unique identifier
        sessionStorage.setItem(sessionKey, sessionId);

        // Load the Google Form
        loadGoogleForm();

        // Setup security monitoring
        setupSecurityMonitoring();

        // Setup timer if configured
        if (config.sessionDuration) {
            setupTimer();
        }

        // Log session start
        logEvent('session_started', {
            sessionId: sessionId,
            studentEmail: studentEmail,
            timestamp: sessionStartTime.toISOString()
        });

        // Hide loading message
        loadingMessage.style.display = 'none';
    }

    // Load Google Form in iframe
    function loadGoogleForm() {
        try {
            googleFormFrame.src = config.googleFormUrl;
            googleFormFrame.style.display = 'block';
            
            // Handle iframe load events
            googleFormFrame.onload = function() {
                console.log('Google Form loaded successfully');
            };

            googleFormFrame.onerror = function() {
                showError('Failed to load the form. Please check your internet connection.');
            };

        } catch (error) {
            console.error('Failed to load Google Form:', error);
            showError('Failed to load the form. Please try again.');
        }
    }

    // Setup comprehensive security monitoring
    function setupSecurityMonitoring() {
        // Prevent right-click context menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            recordViolation('right_click_blocked');
        });

        // Prevent text selection and copying
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });

        // Block common keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Block F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                recordViolation('f12_blocked');
                return false;
            }

            // Block Ctrl+Shift+I (Developer Tools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                recordViolation('dev_tools_blocked');
                return false;
            }

            // Block Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                recordViolation('console_blocked');
                return false;
            }

            // Block Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                recordViolation('view_source_blocked');
                return false;
            }

            // Block Ctrl+S (Save Page)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                recordViolation('save_blocked');
                return false;
            }

            // Block Ctrl+A (Select All)
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                recordViolation('select_all_blocked');
                return false;
            }

            // Block Ctrl+C (Copy)
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                recordViolation('copy_blocked');
                return false;
            }

            // Block Ctrl+V (Paste)
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                recordViolation('paste_blocked');
                return false;
            }
        });

        // Monitor tab switching and window focus
        document.addEventListener('visibilitychange', function() {
            if (document.hidden && !sessionLocked) {
                recordViolation('tab_switch');
            }
        });

        // Monitor window blur (focus loss)
        window.addEventListener('blur', function() {
            if (!sessionLocked) {
                recordViolation('focus_loss');
            }
        });

        // Monitor window resize (potential screen sharing detection)
        window.addEventListener('resize', function() {
            // Only flag if significant resize that might indicate screen sharing
            const aspectRatio = window.innerWidth / window.innerHeight;
            if (aspectRatio < 0.5 || aspectRatio > 3) {
                recordViolation('suspicious_resize');
            }
        });

        // Prevent drag and drop
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        document.addEventListener('drop', function(e) {
            e.preventDefault();
        });

        // Monitor for developer tools (basic detection)
        let devtools = {
            open: false,
            orientation: null
        };

        const threshold = 160;
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    recordViolation('dev_tools_detected');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    // Record a security violation
    function recordViolation(type) {
        if (sessionLocked) return;

        violationCount++;
        updateViolationDisplay();

        const violationData = {
            type: type,
            count: violationCount,
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            studentEmail: studentEmail
        };

        logEvent('violation_recorded', violationData);

        // Handle violation based on count
        if (violationCount === 1) {
            showWarningModal();
        } else if (violationCount >= config.allowedViolations) {
            lockSession();
        }
    }

    // Update violation count display
    function updateViolationDisplay() {
        violationCountDisplay.textContent = violationCount;
        
        // Change color based on violation count
        if (violationCount >= config.allowedViolations - 1) {
            violationCountDisplay.style.color = '#ef4444';
        } else if (violationCount >= Math.floor(config.allowedViolations / 2)) {
            violationCountDisplay.style.color = '#f59e0b';
        }
    }

    // Show warning modal
    function showWarningModal() {
        if (warningShown) return;
        
        warningShown = true;
        document.getElementById('modalViolationCount').textContent = violationCount;
        warningModal.style.display = 'flex';

        document.getElementById('acknowledgeWarning').addEventListener('click', function() {
            warningModal.style.display = 'none';
        });
    }

    // Lock the session
    function lockSession() {
        sessionLocked = true;
        
        // Hide the form
        googleFormFrame.style.display = 'none';
        
        // Stop timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Show locked modal
        document.getElementById('finalViolationCount').textContent = violationCount;
        
        const sessionDuration = Math.round((new Date() - sessionStartTime) / 1000 / 60);
        document.getElementById('sessionDuration').textContent = sessionDuration + ' minutes';
        
        lockedModal.style.display = 'flex';

        // Log session end
        logEvent('session_locked', {
            finalViolationCount: violationCount,
            sessionDuration: sessionDuration,
            lockReason: 'max_violations_exceeded'
        });

        // Clear this specific session storage
        const sessionKey = 'secureFormSession_' + sessionId;
        sessionStorage.removeItem(sessionKey);
    }

    // Setup session timer
    function setupTimer() {
        const durationMs = config.sessionDuration * 60 * 1000;
        const endTime = new Date(sessionStartTime.getTime() + durationMs);
        
        timerDisplay.style.display = 'block';

        timerInterval = setInterval(function() {
            const now = new Date();
            const remaining = endTime - now;

            if (remaining <= 0) {
                // Time's up
                clearInterval(timerInterval);
                timeRemainingDisplay.textContent = '00:00';
                lockSession();
                return;
            }

            // Update display
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timeRemainingDisplay.textContent = 
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

            // Warning when less than 5 minutes
            if (remaining < 5 * 60 * 1000) {
                timeRemainingDisplay.style.color = '#ef4444';
            } else if (remaining < 10 * 60 * 1000) {
                timeRemainingDisplay.style.color = '#f59e0b';
            }
        }, 1000);
    }

    // Log events for analytics
    function logEvent(eventType, data) {
        try {
            let eventLog = [];
            
            const existingLog = localStorage.getItem('sessionEvents');
            if (existingLog) {
                eventLog = JSON.parse(existingLog);
            }

            eventLog.push({
                eventType: eventType,
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                data: data
            });

            // Keep only last 500 events to prevent localStorage bloat
            if (eventLog.length > 500) {
                eventLog = eventLog.slice(-500);
            }

            localStorage.setItem('sessionEvents', JSON.stringify(eventLog));
        } catch (error) {
            console.warn('Failed to log event:', error);
        }
    }

    // Show error message
    function showError(message) {
        loadingMessage.style.display = 'none';
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Prevent page unload without warning
    window.addEventListener('beforeunload', function(e) {
        if (!sessionLocked && sessionStartTime) {
            const message = 'Are you sure you want to leave? Your session will be terminated.';
            e.returnValue = message;
            return message;
        }
    });

    // Handle page unload
    window.addEventListener('unload', function() {
        if (!sessionLocked && sessionStartTime) {
            logEvent('session_ended', {
                reason: 'page_unload',
                duration: Math.round((new Date() - sessionStartTime) / 1000 / 60)
            });
        }
    });

    // Initialize the application
    init();
});

// Utility functions for admin dashboard
function getSessionEvents() {
    try {
        const data = localStorage.getItem('sessionEvents');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve session events:', error);
        return [];
    }
}

function clearSessionData() {
    try {
        sessionStorage.clear();
        localStorage.removeItem('sessionEvents');
        return true;
    } catch (error) {
        console.error('Failed to clear session data:', error);
        return false;
    }
}
