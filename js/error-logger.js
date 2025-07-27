//  error handler
window.onerror = function(message, source, lineno, colno, error) {
    // preparing error data
    const errorData = {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        stack: error ? error.stack : null,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        type: 'frontend_error'
    };
    
    //  error to backend
    sendErrorLog(errorData);
    
    // gives false to allow default error handling
    return false;
};

// settles unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    const errorData = {
        message: event.reason ? event.reason.toString() : 'Unhandled Promise Rejection',
        source: 'promise',
        line: null,
        column: null,
        stack: event.reason ? event.reason.stack : null,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        type: 'promise_rejection'
    };
    
    sendErrorLog(errorData);
});

// sends error logs to backend
function sendErrorLog(errorData) {
    // dont send errors if we're already in an error state
    if (window.errorLoggingFailed) {
        console.error('Error logging failed, not sending:', errorData);
        return;
    }
    
            fetch('https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/log-error', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to log error');
        }
        console.log('Error logged successfully');
    })
    .catch(err => {
        console.error('Failed to send error log:', err);
        // stops inf loops
        window.errorLoggingFailed = true;
    });
}

//  manually log errors
function logError(message, error = null) {
    const errorData = {
        message: message,
        source: 'manual',
        line: null,
        column: null,
        stack: error ? error.stack : null,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        type: 'manual_error'
    };
    
    sendErrorLog(errorData);
}

// export for use in other files
window.logError = logError; 