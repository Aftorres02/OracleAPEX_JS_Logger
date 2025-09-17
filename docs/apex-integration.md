# Oracle APEX Integration Guide

Complete guide for integrating the Oracle APEX JS Logger with your APEX applications.

## Table of Contents

- [Installation in APEX](#installation-in-apex)
- [Basic Integration](#basic-integration)
- [Dynamic Actions Integration](#dynamic-actions-integration)
- [Server-side Processing](#server-side-processing)
- [Advanced Integration Patterns](#advanced-integration-patterns)
- [Troubleshooting](#troubleshooting)

---

## Installation in APEX

### Method 1: Static Application Files

1. **Upload Files to Static Application Files:**
   - Go to **Shared Components > Static Application Files**
   - Upload the following files in order:
     - `src/logger-config.js`
     - `src/logger-utils.js`
     - `src/logger.js`

2. **Reference Files in Application:**
   - Go to **Shared Components > User Interface Attributes**
   - In **JavaScript > File URLs**, add:
     ```
     #APP_FILES#logger_js/src/logger-config.js
     #APP_FILES#logger_js/src/logger-utils.js
     #APP_FILES#logger_js/src/logger.js
     ```

### Method 2: CDN Integration

```html
<!-- In Page Designer > JavaScript > Inline -->
<script src="https://cdn.jsdelivr.net/npm/oracle-apex-js-logger@latest/src/logger-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/oracle-apex-js-logger@latest/src/logger-utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/oracle-apex-js-logger@latest/src/logger.js"></script>
```

### Method 3: Page-level Integration

For specific pages, add the files in **Page Designer > JavaScript > File URLs**:

```
#APP_FILES#logger_js/src/logger-config.js
#APP_FILES#logger_js/src/logger-utils.js
#APP_FILES#logger_js/src/logger.js
```

---

## Basic Integration

### Initialization

Add initialization code to your application:

```javascript
// In Page Designer > JavaScript > Execute when Page Loads
(function() {
  'use strict';
  
  // Configure logger for APEX
  namespace.logger.configure({
    level: 'INFO',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 200,
    flushInterval: 60000
  });
  
  // Log application start
  namespace.logger.info('APEX Application Started', 'app_initialization', {
    app_id: apex.env.APP_ID,
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER
  });
})();
```

### Page Load Logging

```javascript
// In Page Designer > JavaScript > Execute when Page Loads
namespace.logger.info('Page Loaded', 'page_rendering', {
  page_id: apex.env.APP_PAGE_ID,
  page_name: $v('P1_PAGE_NAME'),
  user: apex.env.APP_USER,
  session: apex.env.APP_SESSION,
  load_time: performance.now()
});
```

### User Action Logging

```javascript
// In Page Designer > JavaScript > Execute when Page Loads
window.logUserAction = function(action, details) {
  namespace.logger.info(`User Action: ${action}`, 'user_interaction', {
    action: action,
    details: details,
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER,
    timestamp: new Date().toISOString()
  });
};
```

---

## Dynamic Actions Integration

### Button Click Logging

1. **Create Dynamic Action:**
   - **Event:** Click
   - **Selection Type:** Button
   - **Button:** Your button

2. **Add JavaScript Action:**
   ```javascript
   // Log button click
   namespace.logger.info('Button Clicked', 'user_interaction', {
     button_id: this.triggeringElement.id,
     button_text: this.triggeringElement.textContent,
     page_id: apex.env.APP_PAGE_ID,
     user: apex.env.APP_USER
   });
   ```

### Form Submission Logging

```javascript
// In Dynamic Action for form submission
namespace.logger.info('Form Submitted', 'form_processing', {
  form_id: this.triggeringElement.id,
  page_id: apex.env.APP_PAGE_ID,
  user: apex.env.APP_USER,
  form_data: {
    // Add relevant form data
    item1: $v('P1_ITEM1'),
    item2: $v('P1_ITEM2')
  }
});
```

### AJAX Call Logging

```javascript
// Log AJAX calls
function logAjaxCall(url, data) {
  namespace.logger.info('AJAX Call Initiated', 'ajax_processing', {
    url: url,
    data: data,
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER
  });
  
  // Make the AJAX call
  apex.server.process('YOUR_PROCESS', {
    x01: data.param1,
    x02: data.param2
  }, {
    success: function(data) {
      namespace.logger.info('AJAX Call Successful', 'ajax_processing', {
        url: url,
        response: data
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      namespace.logger.error('AJAX Call Failed', 'ajax_processing', {
        url: url,
        error: errorThrown,
        status: textStatus
      });
    }
  });
}
```

---

## Server-side Processing

### Create APEX Process

Create a new **Process** in your APEX application:

1. **Process Name:** `LOG_ENTRY`
2. **Process Point:** On Demand
3. **Process Type:** PL/SQL Code

```sql
-- Process: LOG_ENTRY
DECLARE
  l_level VARCHAR2(20) := :P1_LEVEL;
  l_text VARCHAR2(4000) := :P1_TEXT;
  l_scope VARCHAR2(100) := :P1_SCOPE;
  l_extra CLOB := :P1_EXTRA;
  l_timestamp VARCHAR2(50) := :P1_TIMESTAMP;
  l_user VARCHAR2(100) := :P1_USER;
  l_page NUMBER := :P1_PAGE;
  l_session NUMBER := :P1_SESSION;
BEGIN
  -- Insert into your log table
  INSERT INTO app_logs (
    id,
    log_level,
    log_text,
    log_scope,
    extra_data,
    log_timestamp,
    app_user,
    page_id,
    session_id,
    created_on
  ) VALUES (
    app_logs_seq.NEXTVAL,
    l_level,
    l_text,
    l_scope,
    l_extra,
    TO_TIMESTAMP(l_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
    l_user,
    l_page,
    l_session,
    SYSDATE
  );
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error to APEX debug
    apex_debug.error('Logger Process Error: %s', SQLERRM);
    RAISE;
END;
```

### Create Log Table

```sql
-- Create log table
CREATE TABLE app_logs (
  id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  log_level VARCHAR2(20) NOT NULL,
  log_text VARCHAR2(4000) NOT NULL,
  log_scope VARCHAR2(100),
  extra_data CLOB,
  log_timestamp TIMESTAMP WITH LOCAL TIME ZONE,
  app_user VARCHAR2(100),
  page_id NUMBER,
  session_id NUMBER,
  created_on DATE DEFAULT SYSDATE
);

-- Create sequence
CREATE SEQUENCE app_logs_seq START WITH 1 INCREMENT BY 1;

-- Create index for performance
CREATE INDEX idx_app_logs_level ON app_logs(log_level);
CREATE INDEX idx_app_logs_timestamp ON app_logs(log_timestamp);
CREATE INDEX idx_app_logs_user ON app_logs(app_user);
```

### Update Logger Configuration

```javascript
// Configure logger to use your process
namespace.logger.configure({
  level: 'INFO',
  enableConsole: true,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 200,
  flushInterval: 60000,
  serverEndpoint: 'LOG_ENTRY' // Your process name
});
```

---

## Advanced Integration Patterns

### Error Handling Integration

```javascript
// Global error handler
window.addEventListener('error', function(event) {
  namespace.logger.error('JavaScript Error', 'javascript_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error ? event.error.stack : null,
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  namespace.logger.error('Unhandled Promise Rejection', 'promise_error', {
    reason: event.reason,
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER
  });
});
```

### Performance Monitoring

```javascript
// Monitor page performance
namespace.logger.timeStart('page_load');

// Monitor specific operations
function monitorOperation(operationName, operationFunction) {
  namespace.logger.timeStart(operationName);
  
  try {
    var result = operationFunction();
    namespace.logger.timeStop(operationName, 'performance');
    return result;
  } catch (error) {
    namespace.logger.error(`Operation ${operationName} failed`, 'operation_error', {
      operation: operationName,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Usage
var result = monitorOperation('data_processing', function() {
  // Your operation code
  return processData();
});
```

### Context Management

```javascript
// Push context for user workflow
function startUserWorkflow(workflowId, userId) {
  namespace.loggerUtils.pushContext('user_workflow', {
    workflow_id: workflowId,
    user_id: userId,
    start_time: new Date().toISOString()
  });
  
  namespace.logger.info('User Workflow Started', 'workflow_management');
}

// Pop context when workflow ends
function endUserWorkflow() {
  var context = namespace.loggerUtils.popContext();
  
  namespace.logger.info('User Workflow Ended', 'workflow_management', {
    workflow_id: context.context.workflow_id,
    user_id: context.context.user_id,
    duration: Date.now() - new Date(context.context.start_time).getTime()
  });
}
```

### Conditional Logging

```javascript
// Log based on user role
function logUserAction(action, details) {
  var userRole = apex.env.APP_USER_ROLE || 'USER';
  
  if (userRole === 'ADMIN') {
    namespace.logger.debug(`Admin Action: ${action}`, 'admin_actions', details);
  } else {
    namespace.logger.info(`User Action: ${action}`, 'user_actions', details);
  }
}

// Log based on page
function logPageAction(action, details) {
  var pageId = apex.env.APP_PAGE_ID;
  
  // Only log for specific pages
  if ([1, 5, 10].includes(pageId)) {
    namespace.logger.info(`Page ${pageId} Action: ${action}`, 'page_actions', details);
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Logger Not Available

**Problem:** `namespace.logger is undefined`

**Solution:**
```javascript
// Check if logger is loaded
if (typeof namespace === 'undefined' || !namespace.logger) {
  console.error('Logger not loaded. Check file references.');
  return;
}
```

#### 2. APEX Context Not Available

**Problem:** APEX environment variables are undefined

**Solution:**
```javascript
// Check APEX availability
if (typeof apex === 'undefined' || !apex.env) {
  console.warn('APEX environment not available');
  // Use fallback values
  var fallbackContext = {
    APP_USER: 'UNKNOWN',
    APP_PAGE_ID: 0,
    APP_SESSION: 0
  };
}
```

#### 3. Server Requests Failing

**Problem:** Logs not being sent to server

**Solution:**
```javascript
// Check server configuration
var config = namespace.logger.getConfig();
console.log('Logger config:', config);

// Check if server is enabled
if (!config.enableServer) {
  console.warn('Server logging is disabled');
}

// Force flush
namespace.logger.flush();
```

#### 4. Performance Issues

**Problem:** Logger causing performance problems

**Solution:**
```javascript
// Reduce logging in production
var isProduction = window.location.hostname !== 'localhost';

if (isProduction) {
  namespace.logger.configure({
    level: 'WARNING',
    enableConsole: false,
    enableBuffer: true,
    bufferSize: 500,
    flushInterval: 120000
  });
}
```

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// Enable debug mode
namespace.logger.configure({
  level: 'DEBUG',
  enableConsole: true,
  enableServer: false
});

// Log debug information
namespace.logger.debug('Debug Mode Enabled', 'debug_mode', {
  config: namespace.logger.getConfig(),
  apex_available: typeof apex !== 'undefined',
  buffer_size: namespace.logger.getBufferSize()
});
```

### Testing Integration

Test your integration:

```javascript
// Test function
function testLoggerIntegration() {
  console.log('Testing Logger Integration...');
  
  // Test basic logging
  namespace.logger.info('Test Message', 'integration_test');
  
  // Test timing
  namespace.logger.timeStart('test_timing');
  setTimeout(function() {
    namespace.logger.timeStop('test_timing', 'integration_test');
  }, 100);
  
  // Test context
  namespace.loggerUtils.pushContext('test_context', { test: true });
  namespace.logger.info('Context Test', 'integration_test');
  namespace.loggerUtils.popContext();
  
  console.log('Logger Integration Test Complete');
}

// Run test
testLoggerIntegration();
```

---

## Best Practices

### 1. Use Appropriate Log Levels

```javascript
// Use appropriate levels
namespace.logger.error('Critical error occurred', 'error_handling');
namespace.logger.warning('High memory usage', 'performance');
namespace.logger.info('User action completed', 'user_workflow');
namespace.logger.debug('Variable value', 'debugging');
```

### 2. Include Relevant Context

```javascript
// Include relevant context
namespace.logger.info('Form submitted', 'form_processing', {
  form_id: 'P1_FORM',
  user: apex.env.APP_USER,
  page: apex.env.APP_PAGE_ID,
  timestamp: new Date().toISOString()
});
```

### 3. Use Scopes Consistently

```javascript
// Use consistent scopes
namespace.logger.info('User logged in', 'authentication');
namespace.logger.info('User logged out', 'authentication');
namespace.logger.info('Password changed', 'authentication');
```

### 4. Handle Errors Gracefully

```javascript
// Handle errors gracefully
try {
  // Your code
  namespace.logger.info('Operation successful', 'operation');
} catch (error) {
  namespace.logger.error('Operation failed', 'operation', {
    error: error.message,
    stack: error.stack
  });
}
```

### 5. Monitor Performance

```javascript
// Monitor performance
namespace.logger.timeStart('data_processing');
// ... your code ...
namespace.logger.timeStop('data_processing', 'performance');
```
