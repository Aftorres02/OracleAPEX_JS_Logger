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
  l_level VARCHAR2(20) := apex_application.g_x01;
  l_text VARCHAR2(4000) := apex_application.g_x02;
  l_scope VARCHAR2(100) := apex_application.g_x03;
  l_extra CLOB := apex_application.g_x04;
  l_timestamp VARCHAR2(50) := apex_application.g_x05;
  l_user VARCHAR2(100) := apex_application.g_x06;
  l_page NUMBER := TO_NUMBER(apex_application.g_x07);
  l_session NUMBER := TO_NUMBER(apex_application.g_x08);
  l_logger_level logger.log_level_type;
BEGIN
  -- Map JavaScript log levels to Logger constants
  CASE UPPER(l_level)
    WHEN 'ERROR' THEN 
      l_logger_level := logger.g_error;
    WHEN 'WARNING' THEN 
      l_logger_level := logger.g_warning;
    WHEN 'INFORMATION' THEN 
      l_logger_level := logger.g_information;
    WHEN 'DEBUG' THEN 
      l_logger_level := logger.g_debug;
    WHEN 'TIMING' THEN 
      l_logger_level := logger.g_timing;
    WHEN 'PERMANENT' THEN 
      l_logger_level := logger.g_permanent;
    WHEN 'SYS_CONTEXT' THEN 
      l_logger_level := logger.g_sys_context;
    WHEN 'APEX' THEN 
      l_logger_level := logger.g_apex;
    ELSE 
      l_logger_level := logger.g_information;
  END CASE;
  
  -- Use Oracle Logger API to log the message
  logger.log(
    p_text => l_text,
    p_scope => l_scope,
    p_extra => logger.gc_extra_null,
    p_params => logger.tab_param(
      logger.new_param('extra_data', l_extra),
      logger.new_param('js_timestamp', l_timestamp),
      logger.new_param('apex_user', l_user),
      logger.new_param('apex_page', l_page),
      logger.new_param('apex_session', l_session)
    ),
    p_level => l_logger_level
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error using Logger API
    logger.log_error('JavaScript Logger Process Error: ' || SQLERRM, 'JS_LOGGER_PROCESS');
    RAISE;
END;
```

### Prerequisites

Before using the JavaScript Logger with server-side processing, ensure that:

1. **Oracle Logger is installed** in your database schema
2. **Logger is properly configured** with appropriate log levels
3. **Logger tables are accessible** to your APEX parsing schema

```sql
-- Verify Logger installation
SELECT logger_version FROM logger_prefs;

-- Check Logger configuration
SELECT * FROM logger_prefs;

-- Verify Logger tables exist
SELECT table_name FROM user_tables WHERE table_name LIKE 'LOGGER_%';
```

### JavaScript Logger Configuration

```javascript
// Configure JavaScript logger to integrate with Oracle Logger
namespace.logger.configure({
  level: 'INFO',
  enableConsole: true,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 200,
  flushInterval: 60000
});
```

### Oracle Logger Configuration

Ensure Oracle Logger is configured with appropriate settings:

```sql
-- Set Logger level (adjust as needed for your environment)
BEGIN
  logger.set_level(logger.g_debug); -- For development
  -- logger.set_level(logger.g_information); -- For production
END;
/

-- Optional: Configure Logger preferences
BEGIN
  logger.set_pref(
    p_pref_name => 'LEVEL',
    p_pref_value => 'DEBUG' -- or 'INFO' for production
  );
  
  logger.set_pref(
    p_pref_name => 'INCLUDE_CALL_STACK',
    p_pref_value => 'TRUE'
  );
END;
/
```

### Viewing Logs

Once integrated with Oracle Logger, you can view logs using standard Logger queries:

```sql
-- View recent logs from JavaScript Logger
SELECT id, 
       logger_level,
       text,
       module,
       action,
       time_stamp,
       extra
FROM logger_logs 
WHERE module = 'JS_LOGGER' 
ORDER BY time_stamp DESC;

-- View logs with JavaScript-specific parameters
SELECT l.id,
       l.logger_level,
       l.text,
       l.module,
       l.time_stamp,
       le.name as param_name,
       le.val as param_value
FROM logger_logs l
JOIN logger_logs_extra le ON l.id = le.logger_logs_id
WHERE l.module = 'JS_LOGGER'
ORDER BY l.time_stamp DESC, le.name;

-- View logs for specific APEX page
SELECT l.id,
       l.logger_level,
       l.text,
       l.time_stamp,
       le.val as apex_page
FROM logger_logs l
JOIN logger_logs_extra le ON l.id = le.logger_logs_id
WHERE l.module = 'JS_LOGGER'
  AND le.name = 'apex_page'
  AND le.val = '1' -- Replace with your page ID
ORDER BY l.time_stamp DESC;
```

### Logger Maintenance

Use Oracle Logger's built-in maintenance procedures:

```sql
-- Purge old logs (keeps last 7 days)
BEGIN
  logger.purge(p_purge_after_days => 7);
END;
/

-- Purge logs older than specific date
BEGIN
  logger.purge(p_purge_before_date => SYSDATE - 30);
END;
/

-- Set up automatic purging job
BEGIN
  logger.purge_all;
  logger.status(p_output_format => logger.g_status_format_html);
END;
/
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
