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
// Configure the logger
namespace.logger.configure({
  level: 'INFO',
  enableConsole: true,
  enableServer: true
});

// Log messages
namespace.logger.info('User logged in', 'authentication', { user_id: 123 });
namespace.logger.error('Database connection failed', 'database');
namespace.logger.debug('Processing data', 'data_processing');
```

## 📚 Documentation

- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Configuration Guide](docs/configuration.md)** - Detailed configuration options
- **[Examples](examples/)** - Usage examples and patterns
- **[Integration Guide](docs/apex-integration.md)** - Oracle APEX integration

## 🎯 Features

- **Oracle Logger Compatible** - Mimics Oracle Logger API and behavior
- **APEX Integration** - Built specifically for Oracle APEX applications
- **Multiple Log Levels** - ERROR, WARNING, INFO, DEBUG, TIMING, and more
- **Performance Timing** - Built-in timing functions for performance monitoring
- **Context Management** - Push/pop context for structured logging
- **Buffer Management** - Configurable buffering for server-side logging
- **Environment Support** - Different configurations for dev/test/prod

## 📁 Project Structure

```
oracle-apex-js-logger/
├── src/                    # Source files
│   ├── logger.js          # Main logger class
│   ├── logger-config.js   # Configuration management
│   └── logger-utils.js    # Utility functions
├── examples/              # Usage examples
│   └── logger-example.js  # Comprehensive examples
├── docs/                  # Documentation
│   ├── api-reference.md   # API documentation
│   ├── configuration.md   # Configuration guide
│   └── apex-integration.md # APEX integration guide
├── README.md              # This file
├── package.json           # NPM package configuration
└── LICENSE                # MIT License
```

## 🔧 Configuration

### Environment-based Configuration

```javascript
// Development
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.logger.configure(devConfig);

// Production
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.logger.configure(prodConfig);
```

### Custom Configuration

```javascript
namespace.logger.configure({
  level: 'WARNING',
  enableConsole: false,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 500,
  flushInterval: 60000
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

## 🎯 Context Management

```javascript
// Push context
namespace.loggerUtils.pushContext('ticket_creation', {
  user_id: 123,
  project_id: 456
});

// All subsequent logs include context
namespace.logger.info('Processing ticket');

// Pop context
namespace.loggerUtils.popContext();
```

## 🌐 APEX Integration

### Dynamic Actions

```javascript
// Function for Dynamic Actions
window.logUserAction = function(action, details) {
  namespace.logger.info(`User action: ${action}`, 'dynamic_action', {
    action: action,
    details: details,
    page: apex.env.APP_PAGE_ID
  });
};
```

### Server-side Processing

The logger automatically sends logs to your APEX process:
- **Endpoint**: `apex.env.APP_IMAGES_URL + 'logger_process.sql'`
- **Parameters**: x01-x08 (level, text, scope, extra, timestamp, user, page, session)

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
- **Documentation**: [docs/](docs/)
- **Examples**: [examples/](examples/)

---

**Made with ❤️ for the Oracle APEX community**