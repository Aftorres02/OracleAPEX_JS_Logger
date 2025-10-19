# Oracle APEX JS Logger

A JavaScript logging library that mimics Oracle Logger functionality, designed specifically for Oracle APEX integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📑 Table of Contents

- [Purpose](#-purpose)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Utilities](#-utilities)
- [APEX Integration](#-apex-integration)
- [Log Level Filtering](#-log-level-filtering)
- [Server Setup](#️-server-setup-optional)
- [Additional Resources](#-additional-resources)

## 📖 Purpose

If you're building Oracle APEX applications, you need visibility into what's happening in the browser — especially in production where users can't open DevTools. This library gives you:

**The Problem:**
- JavaScript errors happen silently in production
- `console.log()` only works when DevTools is open
- No way to track client-side performance issues
- Can't audit user actions or debug reported issues
- Sensitive data (passwords, tokens) gets logged accidentally

**The Solution:**
This logger provides a structured, configurable logging system that:
- ✅ **Stores logs in your database** via APEX processes for production monitoring
- ✅ **Colored console output** for development (blue, orange, red by level)
- ✅ **Automatically masks sensitive data** (passwords, tokens, SSN)
- ✅ **Performance timing** to find bottlenecks
- ✅ **Module-scoped loggers** for clean, contextual logging
- ✅ **Environment-aware** — verbose in dev, quiet in production
- ✅ **Graceful fallbacks** — if server fails, logs to console

**Use Cases:**
- 📊 Track user actions for audit trails
- 🐛 Debug production issues without user screenshots
- ⚡ Measure page load and API performance
- 🔒 Monitor failed authentication attempts
- 💰 Log business events (payments, orders)
- 🚨 Get alerts on client-side errors

## 🚀 Quick Start

### Installation

Include the library files in your Oracle APEX application:

```html
<!-- In WorkspaceFiles/Application files > JavaScript > File URLs -->
#APP_FILES#js/logger-config.js
#APP_FILES#js/logger-utils.js
#APP_FILES#js/logger.js
```


## 📖 API Reference

### Core Logging Methods

All logging methods share the same signature: `(text, module, extra)`

**Parameters:**
- **`text`** (string, required) - The log message
- **`module`** (string, optional) - Module or component name for context
- **`extra`** (Object, optional) - Additional data (automatically sanitized and masked)

---

#### `namespace.logger.log(text, module, extra)`
INFORMATION level - console only (blue output)

**Example:**
```javascript
// Simple log
namespace.logger.log('Application started');

// Log with module
namespace.logger.log('User logged in', 'authentication');

// Log with data
namespace.logger.log('User logged in', 'authentication', { userId: 123, role: 'admin' });
```

---

#### `namespace.logger.error(text, module, extra)`
ERROR level - console only (red output)

**Example:**
```javascript
namespace.logger.error('Database connection failed', 'database', { 
  error: 'Timeout',
  retries: 3 
});
```

---

#### `namespace.logger.warning(text, module, extra)`
WARNING level - console only (orange output)

**Example:**
```javascript
namespace.logger.warning('API response slow', 'network', { 
  url: '/api/data',
  responseTime: 3500 
});
```

---

#### `namespace.logger.logServer(text, module, extra)`
INFORMATION level - console AND database (blue output + persisted)

**Example:**
```javascript
namespace.logger.logServer('Payment processed', 'payments', {
  orderId: 'ORD-123',
  amount: 99.99,
  customerId: 456
});
```

> 💡 **Tip:** Use `log()`, `error()`, `warning()` for development. Use `logServer()` for production events you want to persist.

---

### Performance Timing Methods

#### `namespace.logger.timeStart(unit)`
Start a performance timer.

**Parameters:**
- **`unit`** (string, required) - Unique timer identifier

**Example:**
```javascript
namespace.logger.timeStart('page_load');
namespace.logger.timeStart('api_call');
```

---

#### `namespace.logger.timeStop(unit, module)`
Stop timer and log elapsed time - console only

**Parameters:**
- **`unit`** (string, required) - Timer identifier (must match `timeStart`)
- **`module`** (string, optional) - Module name for context

**Returns:** `number` - Elapsed time in milliseconds

**Example:**
```javascript
namespace.logger.timeStart('data_loading');
// ... perform operation ...
var elapsed = namespace.logger.timeStop('data_loading', 'performance');
// Logs: "data_loading completed in 125.43ms"
```

---

#### `namespace.logger.timeStopServer(unit, module)`
Stop timer and log to console + database

**Parameters:**
- **`unit`** (string, required) - Timer identifier
- **`module`** (string, optional) - Module name for context

**Returns:** `number` - Elapsed time in milliseconds

**Example:**
```javascript
namespace.logger.timeStart('critical_operation');
// ... perform operation ...
var elapsed = namespace.logger.timeStopServer('critical_operation', 'production');
// Logs to console AND database
```

---

### Module Logger

#### `namespace.logger.createModuleLogger(moduleName)`
Creates a scoped logger with pre-configured module name and persistent extra data.

**Parameters:**
- **`moduleName`** (string, required) - Module name (automatically applied to all logs)

**Returns:** Logger object with these methods:
- `log(text, extra)`, `error(text, extra)`, `warning(text, extra)`, `logServer(text, extra)`
- `setExtra(extraData)` - Set persistent extra data for all subsequent logs
- `clearExtra()`, `getExtra()` - Manage persistent data
- `timeStart(unit)`, `timeStop(unit)`, `timeStopServer(unit)` - Timing methods

**Example:**
```javascript
// Create module logger
var logger = namespace.logger.createModuleLogger('PaymentModule');

// Set persistent data (included in all logs from this logger)
logger.setExtra({ feature: 'checkout', version: '2.0' });

// All logs automatically include module and extra data
logger.log('Payment started', { amount: 99.99 });
logger.error('Payment failed', { reason: 'insufficient_funds' });

// Clear persistent data if needed
logger.clearExtra();
```

---

### Automatic Data Enhancements

The logger automatically adds these fields to every log entry:
- **`timestamp`** - ISO 8601 timestamp
- **`level`** - Log level (INFORMATION, WARNING, ERROR)
- **`user`** - APEX user (`apex.env.APP_USER`)
- **`page`** - APEX page ID (`apex.env.APP_PAGE_ID`)
- **`session`** - APEX session ID (`apex.env.APP_SESSION`)

### Automatic Data Protection

The `extra` parameter is automatically:
- ✅ **Sanitized** - Handles circular references safely
- ✅ **Size-limited** - Truncated if exceeds `maxDataSize` (default: 5000 bytes)
- ✅ **Masked** - Sensitive fields automatically hidden (password, token, ssn, etc.)

**Example of automatic masking:**
```javascript
namespace.logger.log('Login attempt', 'auth', {
  username: 'john.doe',
  password: 'secret123'  // Automatically becomes '***MASKED***'
});
```

---

## 🔧 Configuration Management

### Configuration Methods

```javascript
// Get environment-specific configuration
var devConfig = namespace.loggerConfig.getEnvConfig('development');
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
var testConfig = namespace.loggerConfig.getEnvConfig('testing');

// Apply configuration
namespace.loggerConfig.configure(devConfig);

// Runtime configuration changes
namespace.loggerConfig.setLevel('WARNING');
namespace.loggerConfig.enableConsole(false);

// Get current configuration
var currentConfig = namespace.loggerConfig.getConfig();
var currentLevel = namespace.loggerConfig.getLevel();

// Validate configuration
var validation = namespace.loggerConfig.validateConfig({
  level: 'INVALID_LEVEL',
  maxDataSize: 50
});
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

### Available Environments

| Environment | Console | Server | Data Masking | Max Data Size |
|-------------|---------|--------|--------------|---------------|
| **development** | ✅ Enabled | ❌ Disabled | ❌ Disabled | 50,000 bytes |
| **testing** | ✅ Enabled | ✅ Enabled | ✅ Enabled | 20,000 bytes |
| **production** | ❌ Disabled | ✅ Enabled | ✅ Enabled | 5,000 bytes |

---

## 🛠️ Utilities

### APEX Context Functions

```javascript
// Get APEX context information
var ctx = namespace.loggerUtils.getApexContext(['APP_USER', 'APP_PAGE_ID', 'APP_SESSION']);
// Returns: { APP_USER: 'JOHN.DOE', APP_PAGE_ID: 123, APP_SESSION: 456789 }

// Get browser information
var browser = namespace.loggerUtils.getBrowserInfo();
// Returns: { userAgent: 'Mozilla/5.0...', language: 'en-US', cookieEnabled: true, onLine: true }

// Use in logging
namespace.logger.log('Page loaded', 'Navigation', { 
  context: ctx, 
  browser: browser 
});
```

### Module Logger Advanced Methods

```javascript
var logger = namespace.logger.createModuleLogger('MyModule');

// Set persistent extra data for all logs from this module
logger.setExtra({ userId: 123, feature: 'checkout' });

// Get current extra data
var currentExtra = logger.getExtra();

// Clear extra data
logger.clearExtra();

// All subsequent logs will include the extra data
logger.log('User action'); // Automatically includes { userId: 123, feature: 'checkout' }
```

---

## 🔧 Configuration

### Environment-based Configuration

```javascript
// Development - verbose logging with console output
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.loggerConfig.configure(devConfig);

// Production - errors only with server logging
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.loggerConfig.configure(prodConfig);
```

### Custom Configuration Options

```javascript
namespace.loggerConfig.configure({
  // Log Level Control
  level: 'WARNING',            // OFF | PERMANENT | ERROR | WARNING | INFORMATION | DEBUG | TIMING | SYS_CONTEXT | APEX
  
  // Output Channels
  enableConsole: false,        // Enable/disable console output
  enableServer: true,          // Enable/disable database logging via APEX
  retryCount: 1,               // Server request retry attempts on failure
  
  // Data Protection
  enableDataMasking: true,     // Auto-mask sensitive fields
  sensitiveFields: ['password','token','ssn','credit_card','api_key'],
  maxDataSize: 5000,           // Max bytes for extra data (prevents large payloads)
  
  // Performance
  maxTimingUnits: 100          // Max concurrent timing operations
});
```

## 🧰 Utilities

```javascript
// Get APEX context values
var ctx = namespace.loggerUtils.getApexContext(['APP_USER','APP_PAGE_ID']);

// Get browser info
var browser = namespace.loggerUtils.getBrowserInfo();

// Use with logs
namespace.logger.log('Processing ticket', 'tickets', { ctx: ctx, browser: browser });
```

## 🌐 APEX Integration

### Dynamic Actions

```javascript
// Function for Dynamic Actions
window.logUserAction = function(action, details) {
  namespace.logger.log(`User action: ${action}`, 'dynamic_action', {
    action: action,
    details: details,
    page: apex.env.APP_PAGE_ID
  });
};
```

### Server-side Processing

The logger automatically sends logs using `apex.server.process`:

- **Process name**: `LOG_ENTRY` (create this page/process in your APEX app)
- **Parameters**: x01-x08 (level, text, module, extra, timestamp, user, page, session)

## 📊 Log Level Filtering

Control which logs appear by setting the log level in configuration:

```javascript
// Show only errors
namespace.loggerConfig.configure({ level: 'ERROR' });
namespace.logger.log('This will NOT show');      // Suppressed
namespace.logger.warning('This will NOT show');  // Suppressed
namespace.logger.error('This WILL show');        // Shown

// Show errors and warnings
namespace.loggerConfig.configure({ level: 'WARNING' });
namespace.logger.log('This will NOT show');      // Suppressed
namespace.logger.warning('This WILL show');      // Shown
namespace.logger.error('This WILL show');        // Shown

// Show everything (default)
namespace.loggerConfig.configure({ level: 'INFORMATION' });
namespace.logger.log('This WILL show');          // Shown
namespace.logger.warning('This WILL show');      // Shown
namespace.logger.error('This WILL show');        // Shown
```

### Available Log Levels

| Level | Value | API Method | Description |
|-------|-------|------------|-------------|
| ERROR | 2 | `logger.error()` | Error messages - red console output |
| WARNING | 4 | `logger.warning()` | Warning messages - orange console output |
| INFORMATION | 8 | `logger.log()`, `logger.logServer()` | Information messages - blue console output |

**Configuration-only levels** (used for filtering, no dedicated API methods):
- **OFF** (0) - Disable all logging
- **PERMANENT** (1) - Reserved for future critical logs
- **DEBUG** (16), **TIMING** (32), **SYS_CONTEXT** (64), **APEX** (128) - Reserved for future use

---

## 🗄️ Server Setup (Optional)

To persist logs to your database, create an APEX process to receive log entries.

### 1. Create APEX Process

Create a page/application process named `LOG_ENTRY`:

```sql
BEGIN
  -- Map JavaScript log levels to Oracle Logger levels
  DECLARE
    v_level NUMBER;
  BEGIN
    CASE :x01
      WHEN 'ERROR' THEN v_level := 2;
      WHEN 'WARNING' THEN v_level := 4;
      WHEN 'INFORMATION' THEN v_level := 8;
      ELSE v_level := 8;
    END CASE;
    
    -- Log to Oracle Logger (https://github.com/OraOpenSource/Logger)
    logger.log(
      p_text => :x02,
      p_module => :x03,
      p_level => v_level,
      p_extra => :x04
    );
  END;
END;
```

### 2. Process Parameters

The logger automatically sends:
- **x01**: Log level (ERROR, WARNING, INFORMATION)
- **x02**: Log message text
- **x03**: Module name
- **x04**: Extra data (JSON string)
- **x05**: Timestamp (ISO 8601)
- **x06**: APEX user
- **x07**: APEX page ID
- **x08**: APEX session ID

### 3. View Logs

```sql
-- View recent logs
SELECT * FROM logger_logs 
WHERE module = 'JS_LOGGER' 
ORDER BY time_stamp DESC;
```

> 💡 **Note:** Requires Oracle Logger installed. See [Oracle Logger on GitHub](https://github.com/OraOpenSource/Logger)

---

## 📚 Additional Resources

### Examples & Documentation
- **[Examples](examples/)** - Small, focused code examples (recommended starting point)
- **[Demo](demo/)** - Full-featured reference implementation
- **[Tests](test/)** - Manual test page & unit tests (planned)

### Project Structure
```
oracle-apex-js-logger/
├── src/                    # Source files
│   ├── logger.js          # Main logger implementation
│   ├── logger-config.js   # Configuration management
│   └── logger-utils.js    # Utility functions
├── examples/              # Focused examples
├── demo/                  # Complete demo app
├── test/                  # Test suite
└── README.md              # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by Oracle Logger PL/SQL package and built with ❤️ for the Oracle APEX community.

---

**Found an issue?** [Report it on GitHub Issues](https://github.com/your-username/oracle-apex-js-logger/issues)