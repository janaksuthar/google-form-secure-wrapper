// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
});

// Load all dashboard data
function loadDashboardData() {
    try {
        loadStatistics();
        loadWrappersTable();
        loadSessionsTable();
        loadViolationsTable();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load overview statistics
function loadStatistics() {
    try {
        const wrapperConfigs = getAllWrapperConfigurations();
        const sessionEvents = getSessionEvents();
        const analyticsLog = getAnalyticsLog();

        // Count total wrappers
        const totalWrappers = Object.keys(wrapperConfigs).length;
        document.getElementById('totalWrappers').textContent = totalWrappers;

        // Count unique sessions
        const uniqueSessions = new Set();
        sessionEvents.forEach(event => {
            if (event.sessionId) {
                uniqueSessions.add(event.sessionId);
            }
        });
        document.getElementById('totalSessions').textContent = uniqueSessions.size;

        // Count total violations
        const violationEvents = sessionEvents.filter(event => 
            event.eventType === 'violation_recorded'
        );
        document.getElementById('totalViolations').textContent = violationEvents.length;

        // Count locked sessions
        const lockedSessions = sessionEvents.filter(event => 
            event.eventType === 'session_locked'
        ).length;
        document.getElementById('lockedSessions').textContent = lockedSessions;

    } catch (error) {
        console.error('Error loading statistics:', error);
        // Set default values on error
        document.getElementById('totalWrappers').textContent = '0';
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('totalViolations').textContent = '0';
        document.getElementById('lockedSessions').textContent = '0';
    }
}

// Load wrappers table
function loadWrappersTable() {
    const tbody = document.getElementById('wrappersTableBody');
    const container = document.getElementById('wrappersTableContainer');
    
    try {
        const wrapperConfigs = getAllWrapperConfigurations();
        const wrapperIds = Object.keys(wrapperConfigs);

        if (wrapperIds.length === 0) {
            container.innerHTML = '<div class="no-data">No wrappers created yet.</div>';
            return;
        }

        tbody.innerHTML = '';

        wrapperIds.forEach(wrapperId => {
            const config = wrapperConfigs[wrapperId];
            const row = document.createElement('tr');
            
            const createdDate = new Date(config.createdAt).toLocaleString();
            const sessionDuration = config.sessionDuration ? `${config.sessionDuration} min` : 'No limit';
            const emailRequired = config.requireEmail ? 'Yes' : 'No';
            
            row.innerHTML = `
                <td><code>${wrapperId}</code></td>
                <td>${createdDate}</td>
                <td>${config.allowedViolations}</td>
                <td>${sessionDuration}</td>
                <td>${emailRequired}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" 
                            onclick="copyWrapperUrl('${wrapperId}')">Copy URL</button>
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" 
                            onclick="deleteWrapper('${wrapperId}')">Delete</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading wrappers table:', error);
        container.innerHTML = '<div class="no-data">Error loading wrapper data.</div>';
    }
}

// Load sessions table
function loadSessionsTable() {
    const tbody = document.getElementById('sessionsTableBody');
    const container = document.getElementById('sessionsTableContainer');
    
    try {
        const sessionEvents = getSessionEvents();
        
        // Group events by session
        const sessionData = {};
        
        sessionEvents.forEach(event => {
            if (!event.sessionId) return;
            
            if (!sessionData[event.sessionId]) {
                sessionData[event.sessionId] = {
                    sessionId: event.sessionId,
                    startTime: null,
                    endTime: null,
                    studentEmail: null,
                    violations: 0,
                    status: 'Active',
                    duration: null
                };
            }
            
            const session = sessionData[event.sessionId];
            
            if (event.eventType === 'session_started') {
                session.startTime = event.timestamp;
                session.studentEmail = event.data?.studentEmail || 'Not provided';
            } else if (event.eventType === 'violation_recorded') {
                session.violations = Math.max(session.violations, event.data?.count || 0);
            } else if (event.eventType === 'session_locked') {
                session.status = 'Locked';
                session.endTime = event.timestamp;
                session.duration = event.data?.sessionDuration || 'Unknown';
            } else if (event.eventType === 'session_ended') {
                session.status = 'Completed';
                session.endTime = event.timestamp;
                session.duration = event.data?.duration || 'Unknown';
            }
        });

        const sessions = Object.values(sessionData);
        
        if (sessions.length === 0) {
            container.innerHTML = '<div class="no-data">No sessions recorded yet.</div>';
            return;
        }

        // Sort by start time (most recent first)
        sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        tbody.innerHTML = '';

        sessions.slice(0, 50).forEach(session => { // Show only last 50 sessions
            const row = document.createElement('tr');
            
            const startTime = session.startTime ? new Date(session.startTime).toLocaleString() : 'Unknown';
            const violationClass = getViolationClass(session.violations);
            const duration = session.duration ? `${session.duration} min` : 'Ongoing';
            
            row.innerHTML = `
                <td><code>${session.sessionId}</code></td>
                <td>${session.studentEmail}</td>
                <td>${startTime}</td>
                <td class="${violationClass}">${session.violations}</td>
                <td>${session.status}</td>
                <td>${duration}</td>
            `;
            
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading sessions table:', error);
        container.innerHTML = '<div class="no-data">Error loading session data.</div>';
    }
}

// Load violations table
function loadViolationsTable() {
    const tbody = document.getElementById('violationsTableBody');
    const container = document.getElementById('violationsTableContainer');
    
    try {
        const sessionEvents = getSessionEvents();
        
        const violationEvents = sessionEvents
            .filter(event => event.eventType === 'violation_recorded')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100); // Show only last 100 violations

        if (violationEvents.length === 0) {
            container.innerHTML = '<div class="no-data">No violations recorded yet.</div>';
            return;
        }

        tbody.innerHTML = '';

        violationEvents.forEach(event => {
            const row = document.createElement('tr');
            
            const timestamp = new Date(event.timestamp).toLocaleString();
            const studentEmail = event.data?.studentEmail || 'Not provided';
            const violationType = formatViolationType(event.data?.type || 'Unknown');
            const count = event.data?.count || 0;
            const countClass = getViolationClass(count);
            
            row.innerHTML = `
                <td>${timestamp}</td>
                <td><code>${event.sessionId}</code></td>
                <td>${studentEmail}</td>
                <td>${violationType}</td>
                <td class="${countClass}">${count}</td>
            `;
            
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading violations table:', error);
        container.innerHTML = '<div class="no-data">Error loading violation data.</div>';
    }
}

// Helper function to get violation CSS class
function getViolationClass(count) {
    if (count >= 3) return 'violation-high';
    if (count >= 2) return 'violation-medium';
    return 'violation-low';
}

// Helper function to format violation type
function formatViolationType(type) {
    const typeMap = {
        'tab_switch': 'Tab Switch',
        'focus_loss': 'Focus Loss',
        'right_click_blocked': 'Right Click',
        'f12_blocked': 'F12 Key',
        'dev_tools_blocked': 'Dev Tools',
        'console_blocked': 'Console Access',
        'view_source_blocked': 'View Source',
        'save_blocked': 'Save Page',
        'select_all_blocked': 'Select All',
        'copy_blocked': 'Copy Text',
        'paste_blocked': 'Paste Text',
        'suspicious_resize': 'Window Resize',
        'dev_tools_detected': 'Dev Tools Detected'
    };
    
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Copy wrapper URL to clipboard
function copyWrapperUrl(wrapperId) {
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', '');
    const wrapperUrl = `${baseUrl}wrapper.html?id=${wrapperId}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(wrapperUrl).then(() => {
            alert('Wrapper URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopyTextToClipboard(wrapperUrl);
        });
    } else {
        fallbackCopyTextToClipboard(wrapperUrl);
    }
}

// Fallback copy function
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Wrapper URL copied to clipboard!');
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        prompt('Copy this URL:', text);
    }
    
    document.body.removeChild(textArea);
}

// Delete wrapper configuration
function deleteWrapper(wrapperId) {
    if (!confirm('Are you sure you want to delete this wrapper? This action cannot be undone.')) {
        return;
    }
    
    try {
        const wrapperConfigs = getAllWrapperConfigurations();
        delete wrapperConfigs[wrapperId];
        
        localStorage.setItem('wrapperLinks', JSON.stringify(wrapperConfigs));
        
        // Refresh the table
        loadWrappersTable();
        loadStatistics();
        
        alert('Wrapper deleted successfully.');
    } catch (error) {
        console.error('Error deleting wrapper:', error);
        alert('Failed to delete wrapper. Please try again.');
    }
}

// Export wrapper data as JSON
function exportWrapperData() {
    try {
        const wrapperConfigs = getAllWrapperConfigurations();
        const analyticsLog = getAnalyticsLog();
        
        const exportData = {
            wrappers: wrapperConfigs,
            analytics: analyticsLog,
            exportedAt: new Date().toISOString()
        };
        
        downloadJSON(exportData, 'wrapper-configurations.json');
    } catch (error) {
        console.error('Error exporting wrapper data:', error);
        alert('Failed to export wrapper data.');
    }
}

// Export session data as JSON
function exportSessionData() {
    try {
        const sessionEvents = getSessionEvents();
        
        const exportData = {
            sessionEvents: sessionEvents,
            exportedAt: new Date().toISOString()
        };
        
        downloadJSON(exportData, 'session-events.json');
    } catch (error) {
        console.error('Error exporting session data:', error);
        alert('Failed to export session data.');
    }
}

// Download JSON data as file
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
    const confirmMessage = 'Are you sure you want to clear ALL data? This will delete:\n\n' +
                          '• All wrapper configurations\n' +
                          '• All session events\n' +
                          '• All analytics logs\n\n' +
                          'This action cannot be undone!';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        localStorage.removeItem('wrapperLinks');
        localStorage.removeItem('sessionEvents');
        localStorage.removeItem('analyticsLog');
        sessionStorage.clear();
        
        // Refresh dashboard
        loadDashboardData();
        
        alert('All data has been cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear all data. Please try again.');
    }
}

// Refresh dashboard data
function refreshData() {
    loadDashboardData();
    
    // Show brief feedback
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = 'Refreshed!';
    refreshBtn.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.style.backgroundColor = '';
    }, 1500);
}

// Utility functions (these should match the ones in other JS files)
function getAllWrapperConfigurations() {
    try {
        const data = localStorage.getItem('wrapperLinks');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to retrieve wrapper configurations:', error);
        return {};
    }
}

function getAnalyticsLog() {
    try {
        const data = localStorage.getItem('analyticsLog');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve analytics log:', error);
        return [];
    }
}

function getSessionEvents() {
    try {
        const data = localStorage.getItem('sessionEvents');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve session events:', error);
        return [];
    }
}
