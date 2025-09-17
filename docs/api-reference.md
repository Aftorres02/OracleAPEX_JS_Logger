# API Reference

Complete API documentation for the Oracle APEX JS Logger library.

## Table of Contents

- [Logger Module](#logger-module)
- [Logger Config Module](#logger-config-module)
- [Logger Utils Module](#logger-utils-module)

---

## Logger Module

The main logging module that provides the core logging functionality.

### Methods

#### `log(text, scope, extra, level)`

Main logging function (equivalent to `logger.log` in PL/SQL).

**Parameters:**
- `text` (string) - The log message
- `scope` (string) - The scope/context for the log
- `extra` (Object) - Additional data to include
- `level` (string) - The log level (optional, defaults to 'INFORMATION')

**Example:**
```javascript
namespace.logger.log('User action completed', 'user_workflow', { user_id: 123 }, 'INFO');
```

#### `error(text, scope, extra)`

Log an error message.

**Parameters:**
- `text` (string) - The error message
- `scope` (string) - The scope/context
- `extra` (Object) - Additional error data

**Example:**
```javascript
namespace.logger.error('Database connection failed', 'database', { 
  error_code: 'DB001',
  retry_count: 3 
});
```

#### `warning(text, scope, extra)`

Log a warning message.

**Parameters:**
- `text` (string) - The warning message
- `scope` (string) - The scope/context
- `extra` (Object) - Additional warning data

**Example:**
```javascript
namespace.logger.warning('High memory usage detected', 'performance', { 
  memory_usage: '85%' 
});
```

#### `info(text, scope, extra)`

Log an information message.

**Parameters:**
- `text` (string) - The info message
- `scope` (string) - The scope/context
- `extra` (Object) - Additional info data

**Example:**
```javascript
namespace.logger.info('User logged in successfully', 'authentication', { 
  user_id: 123,
  login_time: new Date().toISOString()
});
```

#### `debug(text, scope, extra)`

Log a debug message.

**Parameters:**
- `text` (string) - The debug message
- `scope` (string) - The scope/context
- `extra` (Object) - Additional debug data

**Example:**
```javascript
namespace.logger.debug('Processing user data', 'data_processing', { 
  record_count: 150,
  processing_time: 250 
});
```

#### `timeStart(unit)`

Start timing for a specific unit.

**Parameters:**
- `unit` (string) - The timing unit name

**Example:**
```javascript
namespace.logger.timeStart('data_loading');
```

#### `timeStop(unit, scope)`

Stop timing for a unit and log the result.

**Parameters:**
- `unit` (string) - The timing unit name
- `scope` (string) - The scope for the timing log

**Returns:**
- `number` - Time elapsed in milliseconds

**Example:**
```javascript
var elapsed = namespace.logger.timeStop('data_loading', 'performance');
console.log(`Operation took ${elapsed}ms`);
```

#### `setLevel(level)`

Set the current log level.

**Parameters:**
- `level` (string) - The log level to set

**Example:**
```javascript
namespace.logger.setLevel('DEBUG');
```

#### `getLevel()`

Get the current log level.

**Returns:**
- `string` - Current log level

**Example:**
```javascript
var currentLevel = namespace.logger.getLevel();
console.log('Current level:', currentLevel);
```

#### `configure(options)`

Configure logger options.

**Parameters:**
- `options` (Object) - Configuration options
  - `level` (string) - Log level
  - `enableConsole` (boolean) - Enable console output
  - `enableServer` (boolean) - Enable server logging
  - `enableBuffer` (boolean) - Enable buffering
  - `bufferSize` (number) - Buffer size
  - `flushInterval` (number) - Flush interval in milliseconds
  - `retryCount` (number) - Retry count for server requests

**Example:**
```javascript
namespace.logger.configure({
  level: 'WARNING',
  enableConsole: true,
  enableServer: true,
  enableBuffer: true,
  bufferSize: 200,
  flushInterval: 60000,
  retryCount: 2
});
```

#### `getConfig()`

Get current configuration.

**Returns:**
- `Object` - Current configuration object

**Example:**
```javascript
var config = namespace.logger.getConfig();
console.log('Current config:', config);
```

#### `flush()`

Flush the buffer immediately.

**Example:**
```javascript
namespace.logger.flush();
```

#### `clearBuffer()`

Clear the log buffer.

**Example:**
```javascript
namespace.logger.clearBuffer();
```

#### `getBufferSize()`

Get current buffer size.

**Returns:**
- `number` - Current buffer size

**Example:**
```javascript
var size = namespace.logger.getBufferSize();
console.log('Buffer size:', size);
```

---

## Logger Config Module

Configuration management module for the logger.

### Methods

#### `getDefaultConfig()`

Get default configuration.

**Returns:**
- `Object` - Default configuration object

**Example:**
```javascript
var defaultConfig = namespace.loggerConfig.getDefaultConfig();
```

#### `getEnvConfig(environment)`

Get environment-specific configuration.

**Parameters:**
- `environment` (string) - Environment name ('development', 'testing', 'production')

**Returns:**
- `Object` - Environment configuration

**Example:**
```javascript
var devConfig = namespace.loggerConfig.getEnvConfig('development');
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
```

#### `getLogLevels()`

Get available log levels.

**Returns:**
- `Object` - Log levels object

**Example:**
```javascript
var levels = namespace.loggerConfig.getLogLevels();
console.log('Available levels:', levels);
```

#### `getLevelNames()`

Get level names mapping.

**Returns:**
- `Object` - Level names object

**Example:**
```javascript
var names = namespace.loggerConfig.getLevelNames();
console.log('Level names:', names);
```

#### `getApexConfigKeys()`

Get APEX configuration keys.

**Returns:**
- `Object` - APEX config keys

**Example:**
```javascript
var apexKeys = namespace.loggerConfig.getApexConfigKeys();
console.log('APEX keys:', apexKeys);
```

#### `getServerConfig()`

Get server configuration.

**Returns:**
- `Object` - Server config

**Example:**
```javascript
var serverConfig = namespace.loggerConfig.getServerConfig();
console.log('Server config:', serverConfig);
```

#### `getConsoleConfig()`

Get console configuration.

**Returns:**
- `Object` - Console config

**Example:**
```javascript
var consoleConfig = namespace.loggerConfig.getConsoleConfig();
console.log('Console config:', consoleConfig);
```

#### `isValidLevel(level)`

Validate log level.

**Parameters:**
- `level` (string) - Level to validate

**Returns:**
- `boolean` - Whether the level is valid

**Example:**
```javascript
var isValid = namespace.loggerConfig.isValidLevel('DEBUG');
console.log('Is DEBUG valid?', isValid);
```

#### `getLevelValue(level)`

Get numeric value for log level.

**Parameters:**
- `level` (string) - Level name

**Returns:**
- `number` - Numeric value

**Example:**
```javascript
var value = namespace.loggerConfig.getLevelValue('ERROR');
console.log('ERROR level value:', value); // 2
```

#### `getLevelName(value)`

Get level name from numeric value.

**Parameters:**
- `value` (number) - Numeric value

**Returns:**
- `string` - Level name

**Example:**
```javascript
var name = namespace.loggerConfig.getLevelName(8);
console.log('Level 8 name:', name); // INFORMATION
```

---

## Logger Utils Module

Utility functions for the logger system.

### Methods

#### `formatTimestamp(timestamp, format)`

Format timestamp for display.

**Parameters:**
- `timestamp` (Date|string) - The timestamp to format
- `format` (string) - Format string ('HH:mm:ss', 'ISO', 'LOCALE')

**Returns:**
- `string` - Formatted timestamp

**Example:**
```javascript
var formatted = namespace.loggerUtils.formatTimestamp(new Date(), 'HH:mm:ss');
console.log('Time:', formatted);
```

#### `formatLevel(level, colorMap)`

Format log level with color for console.

**Parameters:**
- `level` (string) - The log level
- `colorMap` (Object) - Color mapping object

**Returns:**
- `string` - Formatted level string

**Example:**
```javascript
var formatted = namespace.loggerUtils.formatLevel('ERROR', {
  ERROR: '#ff0000'
});
```

#### `formatExtra(extra, maxDepth)`

Format extra data for display.

**Parameters:**
- `extra` (Object) - The extra data
- `maxDepth` (number) - Maximum depth for object traversal

**Returns:**
- `string` - Formatted extra data

**Example:**
```javascript
var formatted = namespace.loggerUtils.formatExtra({ user_id: 123, data: 'test' });
console.log('Extra data:', formatted);
```

#### `getApexContext(keys)`

Get APEX context information.

**Parameters:**
- `keys` (Array) - Array of APEX context keys to retrieve

**Returns:**
- `Object` - APEX context information

**Example:**
```javascript
var context = namespace.loggerUtils.getApexContext(['APP_USER', 'APP_PAGE_ID']);
console.log('APEX context:', context);
```

#### `getBrowserInfo()`

Get browser information.

**Returns:**
- `Object` - Browser information

**Example:**
```javascript
var browserInfo = namespace.loggerUtils.getBrowserInfo();
console.log('Browser info:', browserInfo);
```

#### `getPerformanceInfo()`

Get performance information.

**Returns:**
- `Object` - Performance information

**Example:**
```javascript
var perfInfo = namespace.loggerUtils.getPerformanceInfo();
console.log('Performance info:', perfInfo);
```

#### `pushContext(scope, context)`

Push context scope for logging.

**Parameters:**
- `scope` (string) - The scope name
- `context` (Object) - Additional context data

**Example:**
```javascript
namespace.loggerUtils.pushContext('ticket_creation', {
  user_id: 123,
  project_id: 456
});
```

#### `popContext()`

Pop context scope.

**Returns:**
- `Object` - The removed context

**Example:**
```javascript
var context = namespace.loggerUtils.popContext();
console.log('Removed context:', context);
```

#### `getContextStack()`

Get current context stack.

**Returns:**
- `Array` - Current context stack

**Example:**
```javascript
var stack = namespace.loggerUtils.getContextStack();
console.log('Context stack:', stack);
```

#### `generateId()`

Generate unique identifier.

**Returns:**
- `string` - Unique identifier

**Example:**
```javascript
var id = namespace.loggerUtils.generateId();
console.log('Generated ID:', id);
```

#### `sanitizeMessage(message)`

Sanitize log message for security.

**Parameters:**
- `message` (string) - The message to sanitize

**Returns:**
- `string` - Sanitized message

**Example:**
```javascript
var safe = namespace.loggerUtils.sanitizeMessage('<script>alert("xss")</script>');
console.log('Safe message:', safe);
```

#### `timeStart(unit)`

Start timing for a unit.

**Parameters:**
- `unit` (string) - The timing unit name

**Example:**
```javascript
namespace.loggerUtils.timeStart('operation');
```

#### `timeStop(unit)`

Stop timing for a unit.

**Parameters:**
- `unit` (string) - The timing unit name

**Returns:**
- `Object` - Timing result

**Example:**
```javascript
var result = namespace.loggerUtils.timeStop('operation');
console.log('Timing result:', result);
```

#### `getActiveTimings()`

Get all active timing units.

**Returns:**
- `Object` - Active timing units

**Example:**
```javascript
var timings = namespace.loggerUtils.getActiveTimings();
console.log('Active timings:', timings);
```

#### `clearTimings()`

Clear all timing units.

**Example:**
```javascript
namespace.loggerUtils.clearTimings();
```

---

## Log Levels Reference

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

## Error Handling

All methods include proper error handling and will gracefully degrade if dependencies are not available. For example, if APEX is not available, the logger will still function but without APEX-specific context information.
