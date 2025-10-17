# Oracle APEX JS Logger

A JavaScript logging library that mimics Oracle Logger functionality, designed specifically for Oracle APEX integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

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

// Enhanced timing
namespace.logger.timeStart('page_load');
// ... do work ...
namespace.logger.timeStop('page_load', 'performance'); // Green TIMING message
```

## 📚 Documentation

- **[Examples](examples/)** - Small, focused examples (start here!)
- **[Demo](demo/)** - Full reference implementation
- **[Tests](test/)** - Manual test page & automated tests (planned)

## 🎯 Features

- **Oracle Logger Compatible** - Mimics Oracle Logger API and behavior
- **APEX Integration** - Built specifically for Oracle APEX applications
- **Multiple Log Levels** - ERROR, WARNING, INFORMATION, TIMING, PERMANENT
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
- **TIMING** - Green text, uses `console.log()`
- **PERMANENT** - Purple text with yellow background, uses `console.log()`

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

| Level | Value | Description |
|-------|-------|-------------|
| OFF | 0 | No logging |
| PERMANENT | 1 | Permanent logs |
| ERROR | 2 | Error messages |
| WARNING | 4 | Warning messages |
| INFORMATION | 8 | Information messages |
| DEBUG | 16 | Debug messages |
| TIMING | 32 | Performance timing |
| SYS_CONTEXT | 64 | System context |
| APEX | 128 | APEX-specific |

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