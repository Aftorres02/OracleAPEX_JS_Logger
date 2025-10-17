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
#APP_FILES#logger_js/src/logger-config.js
#APP_FILES#logger_js/src/logger-utils.js
#APP_FILES#logger_js/src/logger.js
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

## 📚 Documentation

- **[Examples](examples/)** - Small, focused examples (start here!)
- **[Demo](demo/)** - Full reference implementation
- **[Tests](test/)** - Manual test page & automated tests (planned)

## 🎯 Features

- **Oracle Logger Compatible** - Mimics Oracle Logger API and behavior
- **APEX Integration** - Built specifically for Oracle APEX applications
- **Three Log Levels** - ERROR, WARNING, INFORMATION with level filtering
- **Colored Console Output** - Different colors for each log level in browser console
- **Enhanced Error Handling** - Graceful fallback when server is unavailable
- **Data Sanitization** - Automatic masking of sensitive fields (passwords, tokens)
- **Module Loggers** - Create scoped loggers with persistent extra data
- **Performance Timing** - Built-in timing functions for performance monitoring
- **Memory Management** - Automatic cleanup to prevent memory leaks
- **Environment Support** - Different configurations for dev/test/prod

## 🎨 Console Colors

The logger automatically uses different colors and console methods for each log level:

- **ERROR** - Red text, uses `console.error()`
- **WARNING** - Orange text, uses `console.warn()`  
- **INFORMATION** - Blue text, uses `console.log()`

## 📁 Project Structure

```
oracle-apex-js-logger/
├── src/                    # Source files
│   ├── logger.js          # Main logger class
│   ├── logger-config.js   # Configuration management
│   └── logger-utils.js    # Utility functions
├── examples/              # Small, focused examples
│   ├── index.html         # Run all examples
│   ├── 01-basic-logging.js
│   ├── 02-module-logger.js
│   ├── 03-configuration.js
│   ├── 04-timing.js
│   ├── 05-server-logging.js
│   └── README.md
├── demo/                  # Full reference implementation
│   ├── payment-module.js  # Complete payment module
│   ├── demo.html          # Interactive demo
│   └── README.md
├── test/                  # Tests (manual + automated)
│   ├── logger-test.html   # Manual test page
│   └── README.md
├── CHANGELOG.md           # Changes over time
├── CONTRIBUTING.md        # Contribution guidelines
├── README.md              # This file
├── package.json           # NPM package configuration
└── LICENSE                # MIT License
```

## 🔧 Configuration

### Environment-based Configuration

```javascript
// Development
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.loggerConfig.configure(devConfig);

// Production
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.loggerConfig.configure(prodConfig);
```

### Custom Configuration

```javascript
namespace.loggerConfig.configure({
  level: 'WARNING',            // One of: OFF, PERMANENT, ERROR, WARNING, INFORMATION, DEBUG, TIMING, SYS_CONTEXT, APEX
  enableConsole: false,        // Console output toggle
  enableServer: true,          // Send logs to APEX process
  retryCount: 1,               // Retry attempts when server errors
  enableDataMasking: true,     // Mask sensitive fields in extra data
  sensitiveFields: ['password','token','ssn'],
  maxDataSize: 5000,           // Max serialized size for extra data
  maxTimingUnits: 100          // Internal timing units limit
});
```

## ⏱️ Performance Timing

```javascript
// Start timing
namespace.logger.timeStart('data_loading');

// ... perform operation ...

// Stop timing and log result
namespace.logger.timeStop('data_loading', 'performance');
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

## 📊 Log Levels

### Currently Implemented

These levels have dedicated API methods:

| Level | API Method | Description |
|-------|------------|-------------|
| ERROR | `logger.error()` | Error messages - red console output |
| WARNING | `logger.warning()` | Warning messages - orange console output |
| INFORMATION | `logger.log()`, `logger.logServer()` | Information messages - blue console output |

### Level Filtering

Use `namespace.loggerConfig.configure({ level: '...' })` to control which logs appear:

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

### Reserved Levels (Future Implementation)

These levels are defined but not yet exposed via public API:

| Level | Value | Purpose |
|-------|-------|---------|
| OFF | 0 | Disable all logging |
| PERMANENT | 1 | Critical logs that always appear |
| DEBUG | 16 | Detailed debug information |
| TIMING | 32 | Performance measurements |
| SYS_CONTEXT | 64 | System context information |
| APEX | 128 | APEX-specific logs |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Oracle Logger PL/SQL package
- Designed for Oracle APEX community
- Built with modern JavaScript standards

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/oracle-apex-js-logger/issues)
- **Examples**: [examples/](examples/) - Start here for simple examples
- **Demo**: [demo/](demo/) - Full reference implementation
- **Tests**: [test/logger-test.html](test/logger-test.html) - Manual test page

---
**Made with ❤️ for the Oracle APEX community**