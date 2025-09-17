# Configuration Guide

Complete guide for configuring the Oracle APEX JS Logger library.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Environment-based Configuration](#environment-based-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Configuration Options](#configuration-options)
- [Best Practices](#best-practices)

---

## Basic Configuration

### Default Configuration

The logger comes with sensible defaults that work for most scenarios:

```javascript
var defaultConfig = {
  level: 'INFO',
  enableConsole: true,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 100,
  flushInterval: 30000,
  retryCount: 1
};
```

### Simple Configuration

```javascript
// Basic configuration
namespace.logger.configure({
  level: 'DEBUG',
  enableConsole: true
});
```

---

## Environment-based Configuration

### Development Environment

```javascript
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.logger.configure(devConfig);

// Development config includes:
// - level: 'DEBUG'
// - enableConsole: true
// - enableServer: false
// - enableBuffer: false
// - bufferSize: 50
// - flushInterval: 15000
```

### Testing Environment

```javascript
var testConfig = namespace.loggerConfig.getEnvConfig('testing');
namespace.logger.configure(testConfig);

// Testing config includes:
// - level: 'INFO'
// - enableConsole: true
// - enableServer: true
// - enableBuffer: true
// - bufferSize: 200
// - flushInterval: 60000
```

### Production Environment

```javascript
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.logger.configure(prodConfig);

// Production config includes:
// - level: 'WARNING'
// - enableConsole: false
// - enableServer: true
// - enableBuffer: true
// - bufferSize: 500
// - flushInterval: 120000
```

### Custom Environment

```javascript
// Create custom environment configuration
var customConfig = {
  level: 'ERROR',
  enableConsole: false,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 1000,
  flushInterval: 300000
};

namespace.logger.configure(customConfig);
```

---

## Advanced Configuration

### Complete Configuration Example

```javascript
namespace.logger.configure({
  // Log level (controls which messages are logged)
  level: 'INFO',
  
  // Console output
  enableConsole: true,
  
  // Server logging
  enableServer: true,
  
  // Buffer management
  enableBuffer: true,
  bufferSize: 200,
  flushInterval: 60000,
  
  // Retry configuration
  retryCount: 2
});
```

### Dynamic Configuration

```javascript
// Configure based on runtime conditions
function configureLogger() {
  var isDevelopment = window.location.hostname === 'localhost';
  var isProduction = window.location.hostname === 'myapp.com';
  
  if (isDevelopment) {
    namespace.logger.configure({
      level: 'DEBUG',
      enableConsole: true,
      enableServer: false
    });
  } else if (isProduction) {
    namespace.logger.configure({
      level: 'WARNING',
      enableConsole: false,
      enableServer: true,
      enableBuffer: true,
      bufferSize: 500
    });
  }
}

configureLogger();
```

### Runtime Configuration Changes

```javascript
// Change log level at runtime
namespace.logger.setLevel('DEBUG');

// Update specific configuration
var currentConfig = namespace.logger.getConfig();
currentConfig.bufferSize = 300;
namespace.logger.configure(currentConfig);
```

---

## Configuration Options

### Log Level

Controls which log messages are displayed and sent to the server.

**Available Levels:**
- `OFF` (0) - No logging
- `PERMANENT` (1) - Permanent logs only
- `ERROR` (2) - Error messages only
- `WARNING` (4) - Warning and error messages
- `INFORMATION` (8) - Info, warning, and error messages
- `DEBUG` (16) - All messages including debug
- `TIMING` (32) - All messages including timing
- `SYS_CONTEXT` (64) - All messages including system context
- `APEX` (128) - All messages including APEX-specific

**Example:**
```javascript
// Only log errors and warnings
namespace.logger.setLevel('WARNING');

// Log everything
namespace.logger.setLevel('DEBUG');
```

### Console Output

Controls whether log messages are displayed in the browser console.

```javascript
// Enable console output
namespace.logger.configure({ enableConsole: true });

// Disable console output
namespace.logger.configure({ enableConsole: false });
```

### Server Logging

Controls whether log messages are sent to the server.

```javascript
// Enable server logging
namespace.logger.configure({ enableServer: true });

// Disable server logging
namespace.logger.configure({ enableServer: false });
```

### Buffer Management

Controls how log messages are buffered before sending to the server.

```javascript
// Enable buffering
namespace.logger.configure({ 
  enableBuffer: true,
  bufferSize: 200,
  flushInterval: 60000
});

// Disable buffering (send immediately)
namespace.logger.configure({ 
  enableBuffer: false 
});
```

**Buffer Options:**
- `bufferSize` - Number of messages to buffer before sending
- `flushInterval` - Time in milliseconds between automatic flushes

### Retry Configuration

Controls retry behavior for failed server requests.

```javascript
// Set retry count
namespace.logger.configure({ retryCount: 3 });
```

---

## Best Practices

### 1. Environment-specific Configuration

Always use environment-specific configurations:

```javascript
// Determine environment
var environment = getEnvironment(); // Your function to determine environment

// Configure based on environment
var config = namespace.loggerConfig.getEnvConfig(environment);
namespace.logger.configure(config);
```

### 2. Production Configuration

For production, use conservative settings:

```javascript
// Production configuration
namespace.logger.configure({
  level: 'WARNING',        // Only log warnings and errors
  enableConsole: false,    // No console output
  enableServer: true,      // Send to server
  enableBuffer: true,      // Use buffering
  bufferSize: 500,         // Larger buffer
  flushInterval: 120000,   // 2 minutes
  retryCount: 2            // Retry failed requests
});
```

### 3. Development Configuration

For development, use verbose settings:

```javascript
// Development configuration
namespace.logger.configure({
  level: 'DEBUG',          // Log everything
  enableConsole: true,     // Show in console
  enableServer: false,     // Don't send to server
  enableBuffer: false      // No buffering
});
```

### 4. Testing Configuration

For testing, use balanced settings:

```javascript
// Testing configuration
namespace.logger.configure({
  level: 'INFO',           // Log info and above
  enableConsole: true,     // Show in console
  enableServer: true,      // Send to server
  enableBuffer: true,      // Use buffering
  bufferSize: 200,         // Medium buffer
  flushInterval: 60000     // 1 minute
});
```

### 5. Performance Considerations

- Use buffering in production to reduce server load
- Set appropriate buffer sizes based on your application's logging volume
- Use longer flush intervals for high-volume applications
- Consider disabling console output in production

### 6. Error Handling

Always handle configuration errors gracefully:

```javascript
try {
  namespace.logger.configure(config);
} catch (error) {
  console.error('Logger configuration failed:', error);
  // Fallback to default configuration
  namespace.logger.configure(namespace.loggerConfig.getDefaultConfig());
}
```

### 7. Configuration Validation

Validate configuration before applying:

```javascript
function validateConfig(config) {
  // Validate log level
  if (!namespace.loggerConfig.isValidLevel(config.level)) {
    console.warn('Invalid log level:', config.level);
    config.level = 'INFO';
  }
  
  // Validate buffer size
  if (config.bufferSize && config.bufferSize < 1) {
    console.warn('Invalid buffer size:', config.bufferSize);
    config.bufferSize = 100;
  }
  
  return config;
}

var config = validateConfig(myConfig);
namespace.logger.configure(config);
```

---

## Configuration Examples

### APEX Application Configuration

```javascript
// Configure for APEX application
function configureForApex() {
  var config = {
    level: 'INFO',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 200,
    flushInterval: 60000,
    retryCount: 1
  };
  
  // Add APEX-specific context
  if (typeof apex !== 'undefined' && apex.env) {
    config.apexContext = {
      appId: apex.env.APP_ID,
      pageId: apex.env.APP_PAGE_ID,
      userId: apex.env.APP_USER
    };
  }
  
  namespace.logger.configure(config);
}
```

### High-volume Application Configuration

```javascript
// Configure for high-volume logging
namespace.logger.configure({
  level: 'WARNING',
  enableConsole: false,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 1000,
  flushInterval: 300000, // 5 minutes
  retryCount: 3
});
```

### Debug Mode Configuration

```javascript
// Configure for debugging
namespace.logger.configure({
  level: 'DEBUG',
  enableConsole: true,
  enableServer: false,
  enableBuffer: false
});
```

---

## Troubleshooting Configuration

### Common Issues

1. **Logs not appearing in console**
   - Check `enableConsole` setting
   - Verify log level is appropriate
   - Check browser console settings

2. **Logs not being sent to server**
   - Check `enableServer` setting
   - Verify APEX environment is available
   - Check network connectivity

3. **Buffer not flushing**
   - Check `enableBuffer` setting
   - Verify `flushInterval` is not too long
   - Check `bufferSize` is appropriate

4. **Performance issues**
   - Reduce log level
   - Increase buffer size
   - Increase flush interval
   - Disable console output

### Debug Configuration

```javascript
// Debug current configuration
console.log('Current configuration:', namespace.logger.getConfig());
console.log('Current level:', namespace.logger.getLevel());
console.log('Buffer size:', namespace.logger.getBufferSize());
console.log('Available levels:', namespace.loggerConfig.getLogLevels());
```
