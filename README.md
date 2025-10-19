# Oracle APEX JS Logger

A JavaScript logging library that mimics Oracle Logger functionality, designed specifically for Oracle APEX integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

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

### Basic Usage

```javascript
// Configure the logger (optional - works out of the box)
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableConsole: true,
  enableServer: true
});

// Log messages with automatic colors in console
namespace.logger.log('User logged in', 'authentication', { user_id: 123 });     // Blue INFO
namespace.logger.error('Database connection failed', 'database');                // Red ERROR  
namespace.logger.warning('Slow query detected', 'performance', { duration: 5000 }); // Orange WARNING

// Module-specific logger
var logger = namespace.logger.createModuleLogger('AuthModule');
logger.setExtra({ feature: 'session' });
logger.log('Processing request', { step: 'start' });

// Performance timing
namespace.logger.timeStart('page_load');
// ... do work ...
namespace.logger.timeStop('page_load', 'performance'); // Logs elapsed time (blue INFO)
```

## 📖 API Reference

### Core Logging Methods

All logging methods share the same signature:

```javascript
namespace.logger.log(text, module, extra)       // INFORMATION level - console only (blue)
namespace.logger.error(text, module, extra)     // ERROR level - console only (red)
namespace.logger.warning(text, module, extra)   // WARNING level - console only (orange)
namespace.logger.logServer(text, module, extra) // INFORMATION level - console + database (blue)
```

**Parameters:**
- **`text`** (string, required) - The log message
- **`module`** (string, optional) - Module or component name for context
- **`extra`** (Object, optional) - Additional data (automatically sanitized and masked)

**Key Differences:**
- `log()`, `error()`, `warning()` → Console only, no database persistence
- `logServer()` → Console AND database via APEX process

> 💡 **Tip:** Use console-only methods during development, and `logServer()` for production monitoring.

---

### Performance Timing Methods

```javascript
namespace.logger.timeStart(unit)              // Start timer
namespace.logger.timeStop(unit, module)       // Stop timer - console only
namespace.logger.timeStopServer(unit, module) // Stop timer - console + database
```

**Parameters:**
- **`unit`** (string, required) - Unique timer identifier (must match between start/stop)
- **`module`** (string, optional) - Module name for context (*stop methods only*)

**Returns:** `number` - Elapsed time in milliseconds (*stop methods only*)

**Usage:** See Basic Usage section above for complete example.

---

### Module Logger

```javascript
var logger = namespace.logger.createModuleLogger(moduleName)
```

Creates a scoped logger with pre-configured module name and persistent extra data.

**Parameters:**
- **`moduleName`** (string, required) - Module name (automatically applied to all logs)

**Returns:** Logger object with these methods:
- `log(text, extra)`, `error(text, extra)`, `warning(text, extra)`, `logServer(text, extra)`
- `setExtra(extraData)` - Set persistent extra data for all subsequent logs
- `clearExtra()`, `getExtra()` - Manage persistent data
- `timeStart(unit)`, `timeStop(unit)`, `timeStopServer(unit)` - Timing methods

**Usage:** See Basic Usage section above for complete example.

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

| Level | Value | Status | Purpose |
|-------|-------|--------|----------|
| ERROR | 4 | ✅ Implemented | Error messages via `logger.error()` |
| WARNING | 8 | ✅ Implemented | Warning messages via `logger.warning()` |
| INFORMATION | 12 | ✅ Implemented | Info messages via `logger.log()`, `logger.logServer()` |
| OFF | 0 | ⚙️ Configuration only | Disable all logging |
| PERMANENT | 1 | 🔮 Future | Critical logs that bypass level filtering |
| DEBUG | 16 | 🔮 Future | Detailed debug information |
| TIMING | 32 | 🔮 Future | Dedicated performance measurements |
| SYS_CONTEXT | 64 | 🔮 Future | System context information |
| APEX | 128 | 🔮 Future | APEX-specific diagnostic logs |

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