# Oracle APEX JS Logger

A JavaScript logging library that mimics Oracle Logger functionality, designed specifically for Oracle APEX integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📑 Table of Contents

- [The Problem: console.log](#-the-problem-consolelog)
- [The Solution](#-the-solution)
- [Quick Start](#-quick-start)
- [Advanced Examples](#-advanced-examples)
- [API Reference](#-api-reference)
- [Configuration and Customization](#-configuration-and-customization)
- [Server Setup](#️-server-setup-optional)
- [Additional Resources](#-additional-resources)

## 📖 The Problem: console.log

When working with JavaScript, we usually use `console.log()` for debugging. However, it can generate so much content in the console that it becomes difficult to manage, and practically impossible to use in production:

- A user reports an issue, but you can't reproduce it
- You see the error in DevTools, but users in production don't have it open
- No audit trail for user actions
- No performance metrics for slow operations
- Sensitive data (passwords, tokens) might accidentally get logged

## 🎯 The Solution

A structured, configurable logging system that:
- ✅ **Stores logs in your database** via APEX processes for production monitoring
- ✅ **Colored console output** for development (blue, orange, red by level)
- ✅ **Automatically masks sensitive data** (passwords, tokens, SSN)
- ✅ **Performance timing** to find bottlenecks
- ✅ **Module-scoped loggers** for clean, contextual logging
- ✅ **Environment-aware** — verbose in dev, quiet in production
- ✅ **Graceful fallbacks** — if server fails, logs to console

## 🚀 Quick Start

### Step 1: Load the Files

Load the files into your APEX application:

```html
#WORKSPACE_FILES#js/logger-config.js
#WORKSPACE_FILES#js/logger.js
```

### Step 2: Usage

```javascript
// Basic usage
namespace.logger.log('Application started', 'AppMain');

// With data
namespace.logger.log('User action', 'UI', {
  action: 'button_click',
  pageId: apex.env.APP_PAGE_ID
});

// For production events
namespace.logger.logServer('Payment processed', 'Payments', {
  orderId: 'ORD-123',
  amount: 99.99
});
```


## 💡 Advanced Examples

### 1. Three Log Levels with Colors

The logger provides three log levels that automatically output in different colors:

**Information (Blue)**
```javascript
namespace.logger.log('User logged in', 'Auth', { userId: 123 });
```

**Warning (Orange)**
```javascript
namespace.logger.warning('API slow', 'Network', { responseTime: 3500 });
```

**Error (Red)**
```javascript
namespace.logger.error('Validation failed', 'Form', { field: 'email' });
```

### 2. Module-Scoped Loggers

Create a logger for your module with persistent context:

```javascript
// Create a module logger
var logger = namespace.logger.createModuleLogger('PaymentModule');

// Set context that applies to all logs from this module
logger.setExtra({ version: '2.0', feature: 'checkout' });

// Now all logs automatically include the context
logger.log('Processing payment', { amount: 99.99 });
logger.error('Payment failed', { reason: 'insufficient_funds' });

// Clear context when done
logger.clearExtra();
```

### 3. Console vs Server Logging

Three logging modes for different needs:

**Console-only** (development)
```javascript
namespace.logger.log('Debug info', 'MyModule', { data: 'value' });
```

**Console + Database** (production)
```javascript
namespace.logger.logServer('Important event', 'Business', { 
  orderId: 'ORD-123',
  action: 'order_shipped' 
});
```

**Console + Database with options** (manual control per log)
```javascript
namespace.logger.log('User completed checkout', 'Ecommerce', {
  orderId: 'ORD-123',
  total: 99.99
}, {
  sendToServer: true  // Enable server sending
});
```

### 4. Automatic Data Masking

Security is built-in. Sensitive fields are automatically masked:

```javascript
namespace.logger.log('Login attempt', 'Auth', {
  username: 'john.doe',
  password: 'secret123',  // Automatically becomes: ***MASKED***
  token: 'abc123'         // Automatically becomes: ***MASKED***
});
```

### 5. Performance Timing

Measure how long operations take:

```javascript
// Start timing
namespace.logger.timeStart('page-load');

// ... do work ...

// Stop and log elapsed time
var elapsed = namespace.logger.timeStop('page-load', 'Performance');
// Output: "page-load completed in 125.43ms"
```

---

## 📖 API Reference

### Core Logging Methods

All console-only logging methods share the same signature: `(text, module, extra, options)`

**Parameters:**
- **`text`** (string, required) - The log message
- **`module`** (string, optional) - Module or component name for context
- **`extra`** (Object, optional) - Additional data (automatically sanitized and masked)
- **`options`** (Object, optional) - Optional configuration
  - **`options.sendToServer`** (boolean, default: false) - If true, also send to server

#### `namespace.logger.log(text, module, extra, options)`
INFORMATION level - console only (blue output)

#### `namespace.logger.warning(text, module, extra, options)`
WARNING level - console only (orange output)

#### `namespace.logger.error(text, module, extra, options)`
ERROR level - console only (red output)

#### `namespace.logger.logServer(text, module, extra)`
INFORMATION level - console AND database (blue output + persisted)

### Performance Timing

#### `namespace.logger.timeStart(unit)`
Start a performance timer

#### `namespace.logger.timeStop(unit, module)`
Stop timer and log elapsed time - console only

### Module Logger

#### `namespace.logger.createModuleLogger(moduleName)`
Creates a scoped logger with pre-configured module name and persistent extra data.

Returns: Logger object with `log()`, `error()`, `warning()`, `logServer()`, `setExtra()`, `clearExtra()`, `getExtra()`, `timeStart()`, `timeStop()` methods

---

## 🔧 Configuration and Customization

### Turning Off and Customizing Output

To turn off logging completely we use LEVEL set to OFF.
Then depending on what we need we can use:
- **INFORMATION**: shows everything
- **WARNING**: shows warnings and errors
- **ERROR**: only errors
- **OFF**: turns off all console logs

To return to the initial configuration use `resetLevel()` or set `level: 'INFORMATION'`.

```javascript
namespace.loggerConfig.configure({
  level: 'OFF',  // OFF | ERROR | WARNING | INFORMATION
});

// Reset the level according to the main configuration
namespace.loggerConfig.resetLevel();

// Development: detailed console output
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.loggerConfig.configure(devConfig);

// Production: errors only, with server logging
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.loggerConfig.configure(prodConfig);
```

### Advanced Configuration Options

```javascript
var DEFAULT_CONFIG = {
  // Logging behavior
  level:                  'INFORMATION',        // Console log level - values: OFF, ERROR, WARNING, INFORMATION
  enableServer:           true,                 // Enable server logging (database storage)

  // Server logging configuration
  serverProcessName:     'JS_LOGGER',          // APEX process name for server logging
  retryCount:             1,                    // Maximum number of retry attempts
  retryAttemptInitial:    0,                    // Initial retry attempt counter
  retryDelayBase:         1000,                 // Base delay in milliseconds

  // Default values
  defaultModuleName:      'JS_LOGGER',          // Default module name
  defaultUserName:        'UNKNOWN',            // Default user name

  // Security and data handling
  enableDataMasking:      true,                 // Enable masking of sensitive fields
  sensitiveFields:        ['password', 'token', 'ssn'],  // Fields to mask
  maxDataSize:            10000,                // Maximum data size in bytes
  maxErrorStringLength:    100,                  // Maximum error string length

  // Timing configuration
  timingDecimalPlaces:    2                     // Decimal places for timing
};
```

---

## 🗄️ Server Setup (Optional)

To persist logs to your database, create an APEX process to receive log entries.

### 1. Create APEX Process

Create a page/application process named `JS_LOGGER`:

```sql
declare
  l_level        varchar2(50)   := apex_application.g_x01;
  l_text         varchar2(4000) := apex_application.g_x02;
  l_module       varchar2(100)  := apex_application.g_x03;
  l_extra_json   clob           := apex_application.g_x04;
  l_timestamp    varchar2(50)   := apex_application.g_x05;
  l_user         varchar2(100)  := apex_application.g_x06;
  l_page_id      number         := apex_application.g_x07;
  l_session      number         := apex_application.g_x08;
  
begin

  
  -- Call logger package to insert log entry
  logger.log(
      p_text    => l_text
    , p_scope   => l_module
    , p_extra   => l_extra_json
    --, p_params  => null
   -- p_timestamp   => to_timestamp_tz(l_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZR'),
   -- p_user        => l_user,
   -- p_page_id     => l_page_id,
   -- p_session     => l_session
  );
  
  -- Return success response
  apex_json.open_object;
  apex_json.write('success', true);
  apex_json.close_object;

exception
  when others then
    apex_json.open_object;
    apex_json.write('success', false);
    apex_json.write('error_msg', sqlerrm);
    apex_json.close_object;
end;
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
│   ├── logger-config.js   # Configuration management
│   └── logger.js          # Main logger implementation
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