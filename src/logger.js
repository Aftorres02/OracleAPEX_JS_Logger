// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2025
 * @version 1.0
 */
// Create object for logger functions
namespace.logger = (function (namespace, $, undefined) {
  'use strict';

  // Configuration - Can be changed at runtime
  var config = {
    level: 'INFORMATION',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 100,
    flushInterval: 30000,
    retryCount: 1,
    // New security options
    enableDataMasking: true,
    sensitiveFields: ['password', 'token', 'ssn'],
    maxDataSize: 10000,
    // New cleanup option
    maxTimingUnits: 100
  };

  /* ================================================================ */
  // Private variables
  var logBuffer = [];
  var flushTimer = null;
  var timingUnits = {};

  /* ================================================================ */
  // Log levels (same as Oracle Logger)
  var LOG_LEVELS = {
    OFF: 0,
    PERMANENT: 1,
    ERROR: 2,
    WARNING: 4,
    INFORMATION: 8,
    DEBUG: 16,
    TIMING: 32,
    SYS_CONTEXT: 64,
    APEX: 128
  };









  /* ================================================================ */
  /**
   * Check if a log level should be logged based on current configuration
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string|number} level - The log level to check
   *
   * @returns {boolean} - Whether the level should be logged
   */
  var _shouldLog = function (level) {
    var levelNum = typeof level === 'string' ? LOG_LEVELS[level.toUpperCase()] : level;
    var configNum = LOG_LEVELS[config.level.toUpperCase()];

    // PERMANENT always logs, even when OFF
    if (levelNum === LOG_LEVELS.PERMANENT) {
      return true;
    }

    // OFF blocks everything except PERMANENT
    if (configNum === LOG_LEVELS.OFF) {
      return false;
    }

    return levelNum <= configNum;
  };








  /* ================================================================ */
  /**
   * Add log entry to buffer
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {Object} logEntry - The log entry to add
   */
  var _addToBuffer = function (logEntry) {
    if (!config.enableBuffer) return;

    logBuffer.push(logEntry);

    if (logBuffer.length >= config.bufferSize) {
      _flushBuffer();
    }
  };








  /* ================================================================ */
  /**
   * Schedule server sync for buffered logs
   * @author Angel O. Flores Torres
   * @created 2025
   */
  var _scheduleServerSync = function () {
    if (!config.enableServer || !config.enableBuffer) return;

    if (flushTimer) {
      clearTimeout(flushTimer);
    }

    flushTimer = setTimeout(function () {
      _flushBuffer();
    }, config.flushInterval);
  };










  /* ================================================================ */
  /**
   * Flush buffer to server
   * @author Angel O. Flores Torres
   * @created 2025
   */
  var _flushBuffer = function () {
    if (logBuffer.length === 0) return;

    var logsToSend = logBuffer.splice(0);

    logsToSend.forEach(function (logEntry) {
      _sendToServer(logEntry);
    });
  };









  /* ================================================================ */
  /**
   * Send log entry to server via AJAX with enhanced error handling
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {Object} logEntry - The log entry to send
   */
  var _sendToServer = function (logEntry) {
    if (!config.enableServer) return;

    var retryAttempts = 0;
    var maxRetries = config.retryCount || 1;

    var attemptSend = function () {
      try {
        apex.server.process('LOG_ENTRY', {
          x01: logEntry.level,
          x02: logEntry.text,
          x03: logEntry.module || 'JS_LOGGER',
          x04: JSON.stringify(logEntry.extra || {}),
          x05: logEntry.timestamp,
          x06: logEntry.user,
          x07: logEntry.page,
          x08: logEntry.session
        }, {
          success: function (response) {
            // Success - reset any error flags
            config._serverError = false;
          },
          error: function (xhr, status, error) {
            retryAttempts++;
            if (retryAttempts <= maxRetries) {
              // Exponential backoff retry
              setTimeout(attemptSend, 1000 * retryAttempts);
            } else {
              // Mark server as failed, switch to console-only mode
              config._serverError = true;
              if (config.enableConsole) {
                console.warn('Logger server failed, using console fallback');
                console.log(_formatConsoleMessage(logEntry));
              }
            }
          }
        });
      } catch (e) {
        // APEX not available or other critical error
        config._serverError = true;
        if (config.enableConsole) {
          console.error('Logger server error:', e.message);
          console.log(_formatConsoleMessage(logEntry));
        }
      }
    };

    attemptSend();
  };








  /* ================================================================ */
  /**
   * Output log entry to console with colors and appropriate console method
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {Object} logEntry - The log entry to output
   */
  var _outputToConsole = function (logEntry) {
    var timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    var level = logEntry.level.toUpperCase();
    var module = logEntry.module ? `[${logEntry.module}]` : '';
    var extra = logEntry.extra ? ` ${JSON.stringify(logEntry.extra)}` : '';

    var message = `[${timestamp}] ${module} ${logEntry.text}${extra}`;

    // Get styles from config (single source of truth)
    var consoleConfig = namespace.loggerConfig.getConsoleConfig();
    var styles = consoleConfig.levelStyles;

    // Use appropriate console method with styles from config
    switch (level) {
      case 'ERROR':
        console.error(`%c[${timestamp}] ERROR%c ${module} ${logEntry.text}${extra}`,
          styles.ERROR, 'color: inherit');
        break;
      case 'WARNING':
        console.warn(`%c[${timestamp}] WARNING%c ${module} ${logEntry.text}${extra}`,
          styles.WARNING, 'color: inherit');
        break;
      case 'PERMANENT':
        console.log(`%c[${timestamp}] PERMANENT%c ${module} ${logEntry.text}${extra}`,
          styles.PERMANENT, 'color: inherit');
        break;
      case 'TIMING':
        console.log(`%c[${timestamp}] TIMING%c ${module} ${logEntry.text}${extra}`,
          styles.TIMING, 'color: inherit');
        break;
      case 'INFORMATION':
      default:
        console.log(`%c[${timestamp}] INFO%c ${module} ${logEntry.text}${extra}`,
          styles.INFORMATION, 'color: inherit');
        break;
    }
  };







  /* ================================================================ */
  /**
   * Format log entry for console output (fallback for server errors)
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {Object} logEntry - The log entry to format
   *
   * @returns {string} - Formatted log message
   */
  var _formatConsoleMessage = function (logEntry) {
    var timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    var level = logEntry.level.toUpperCase();
    var module = logEntry.module ? `[${logEntry.module}]` : '';
    var extra = logEntry.extra ? ` ${JSON.stringify(logEntry.extra)}` : '';

    return `[${timestamp}] ${level} ${module} ${logEntry.text}${extra}`;
  };







  /* ================================================================ */
  /**
   * Sanitize data to prevent issues with circular references and size limits
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {*} data - The data to sanitize
   *
   * @returns {*} - Sanitized data
   */
  var _sanitizeData = function (data) {
    if (!data) return data;

    try {
      // Check for circular references
      JSON.stringify(data);

      // Check size limit
      var dataStr = JSON.stringify(data);
      if (dataStr.length > config.maxDataSize) {
        return {
          _truncated: true,
          _originalSize: dataStr.length,
          data: dataStr.substring(0, config.maxDataSize) + '...'
        };
      }

      // Mask sensitive fields
      return _maskSensitiveFields(data);

    } catch (e) {
      // Circular reference or other JSON error
      return {
        _error: 'Could not serialize data',
        _type: typeof data,
        _string: String(data).substring(0, 100)
      };
    }
  };






  /* ================================================================ */
  /**
   * Mask sensitive fields in data
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {*} data - The data to mask
   *
   * @returns {*} - Data with sensitive fields masked
   */
  var _maskSensitiveFields = function (data) {
    if (!config.enableDataMasking || !data || typeof data !== 'object') {
      return data;
    }

    var sensitiveFields = config.sensitiveFields || ['password', 'token', 'ssn'];
    var masked = {};

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var lowerKey = key.toLowerCase();
        var isSensitive = sensitiveFields.some(function (field) {
          return lowerKey.includes(field);
        });

        if (isSensitive) {
          masked[key] = '***MASKED***';
        } else {
          masked[key] = data[key];
        }
      }
    }

    return masked;
  };







  /* ================================================================ */
  /**
   * Clean up resources to prevent memory leaks
   * @author Angel O. Flores Torres
   * @created 2025
   */
  var _cleanupResources = function () {
    // Clean up old timing units (keep only last maxTimingUnits)
    var timingKeys = Object.keys(timingUnits);
    if (timingKeys.length > (config.maxTimingUnits || 100)) {
      var toRemove = timingKeys.slice(0, timingKeys.length - config.maxTimingUnits);
      toRemove.forEach(function (key) {
        delete timingUnits[key];
      });
    }

    // Clean up buffer if too large
    if (logBuffer.length > config.bufferSize * 2) {
      logBuffer = logBuffer.slice(-config.bufferSize);
    }
  };






  /* ================================================================ */
  /**
   * Create log entry object with enhanced features
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} text - The log message
   * @param {string} module - The module name
   * @param {Object} extra - Extra data
   * @param {string} level - The log level
   *
   * @returns {Object} - Formatted log entry
   */
  var _createLogEntry = function (text, module, extra, level) {
    var logEntry = {
      timestamp: new Date().toISOString(),
      level: level || 'INFORMATION',
      text: text,
      module: module,
      extra: _sanitizeData(extra),
      user: (typeof apex !== 'undefined' && apex.env && apex.env.APP_USER) || 'UNKNOWN',
      page: (typeof apex !== 'undefined' && apex.env && apex.env.APP_PAGE_ID) || 0,
      session: (typeof apex !== 'undefined' && apex.env && apex.env.APP_SESSION) || 0
    };

    // No context needed - module name is the context

    return logEntry;
  };







  /* ================================================================ */
  /**
   * Console-only logging function (no database storage) - Always INFORMATION level
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} text - The log message
   * @param {string} module - The module name
   * @param {Object} extra - Extra data
   */
  var log = function (text, module, extra) {
    try {
      var logEntry = _createLogEntry(text, module, extra, 'INFORMATION');

      if (!_shouldLog(logEntry.level)) return;

      // Console output only - no server sync
      if (config.enableConsole) {
        _outputToConsole(logEntry);
      }
    } catch (e) {
      // Fallback logging if main logging fails
      if (typeof console !== 'undefined') {
        console.error('Logger error:', e.message);
        console.log('Original message:', text);
      }
    }
  };





  /* ================================================================ */
  /**
   * Server logging function (includes database storage) - Always INFORMATION level
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} text - The log message
   * @param {string} module - The module name
   * @param {Object} extra - Extra data
   */
  var logServer = function (text, module, extra) {
    try {
      var logEntry = _createLogEntry(text, module, extra, 'INFORMATION');

      if (!_shouldLog(logEntry.level)) return;

      // Console output with colors
      if (config.enableConsole) {
        _outputToConsole(logEntry);
      }

      // Buffer and server sync for database storage
      _addToBuffer(logEntry);
      _scheduleServerSync();
    } catch (e) {
      // Fallback logging if main logging fails
      if (typeof console !== 'undefined') {
        console.error('Logger server error:', e.message);
        console.log('Original message:', text);
      }
    }
  };





  /* ================================================================ */
  /**
   * Console-only error logging
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} text - The error message
   * @param {string} module - The module name
   * @param {Object} extra - Extra data
   */
  var error = function (text, module, extra) {
    try {
      var logEntry = _createLogEntry(text, module, extra, 'ERROR');

      if (!_shouldLog(logEntry.level)) return;

      // Console output only - no server sync
      if (config.enableConsole) {
        _outputToConsole(logEntry);
      }
    } catch (e) {
      // Fallback logging if main logging fails
      if (typeof console !== 'undefined') {
        console.error('Logger error:', e.message);
        console.log('Original message:', text);
      }
    }
  };





  /* ================================================================ */
  /**
   * Console-only warning logging
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} text - The warning message
   * @param {string} module - The module name
   * @param {Object} extra - Extra data
   */
  var warning = function (text, module, extra) {
    try {
      var logEntry = _createLogEntry(text, module, extra, 'WARNING');

      if (!_shouldLog(logEntry.level)) return;

      // Console output only - no server sync
      if (config.enableConsole) {
        _outputToConsole(logEntry);
      }
    } catch (e) {
      // Fallback logging if main logging fails
      if (typeof console !== 'undefined') {
        console.error('Logger error:', e.message);
        console.log('Original message:', text);
      }
    }
  };





  /* ================================================================ */
  /**
   * Start timing for a unit
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} unit - The timing unit name
   */
  var timeStart = function (unit) {
    timingUnits[unit] = performance.now();
  };





  /* ================================================================ */
  /**
   * Stop timing for a unit and log the result (console-only)
   * @param {string} unit - The timing unit name
   * @param {string} module - The module name
   * @returns {number} - Time elapsed in milliseconds
   */
  var timeStop = function (unit, module) {
    if (!timingUnits[unit]) {
      console.warn(`Timing unit '${unit}' was not started`);
      return 0;
    }

    var elapsed = performance.now() - timingUnits[unit];
    var message = `${unit} completed in ${elapsed.toFixed(2)}ms`;

    log(message, module, { unit: unit, elapsed: elapsed });

    delete timingUnits[unit];
    return elapsed;
  };








  /* ================================================================ */
  /**
   * Stop timing for a unit and log to server (includes database storage)
   * @param {string} unit - The timing unit name
   * @param {string} module - The module name
   * @returns {number} - Time elapsed in milliseconds
   */
  var timeStopServer = function (unit, module) {
    if (!timingUnits[unit]) {
      console.warn(`Timing unit '${unit}' was not started`);
      return 0;
    }

    var elapsed = performance.now() - timingUnits[unit];
    var message = `${unit} completed in ${elapsed.toFixed(2)}ms`;

    logServer(message, module, { unit: unit, elapsed: elapsed });

    delete timingUnits[unit];
    return elapsed;
  };











  /* ================================================================ */
  /**
   * Set log level
   * @param {string} level - The log level to set
   */
  var setLevel = function (level) {
    if (LOG_LEVELS[level.toUpperCase()] !== undefined) {
      config.level = level.toUpperCase();
    } else {
      console.warn(`Invalid log level: ${level}`);
    }
  };





  /* ================================================================ */
  /**
   * Get current log level
   * @returns {string} - Current log level
   */
  var getLevel = function () {
    return config.level;
  };





  /* ================================================================ */
  /**
   * Configure logger options
   * @param {Object} options - Configuration options
   */
  var configure = function (options) {
    Object.assign(config, options);
  };





  /* ================================================================ */
  /**
   * Get current configuration
   * @returns {Object} - Current configuration
   */
  var getConfig = function () {
    return Object.assign({}, config);
  };





  /* ================================================================ */
  /**
   * Flush buffer immediately with error handling
   */
  var flush = function () {
    try {
      _flushBuffer();
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.error('Logger flush error:', e.message);
      }
    }
  };





  /* ================================================================ */
  /**
   * Clear buffer with memory cleanup
   */
  var clearBuffer = function () {
    try {
      logBuffer.length = 0;
      _cleanupResources();
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.error('Logger clear buffer error:', e.message);
      }
    }
  };





  /* ================================================================ */
  /**
   * Get buffer size
   * @returns {number} - Current buffer size
   */
  var getBufferSize = function () {
    return logBuffer.length;
  };





  /* ================================================================ */
  /**
   * Enable or disable console output
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {boolean} enabled - Whether to enable console output
   */
  var enableConsole = function (enabled) {
    config.enableConsole = enabled;
    console.log('Logger console output ' + (enabled ? 'enabled' : 'disabled'));
  };





  /* ================================================================ */
  /**
   * Check if console output is enabled
   * @returns {boolean} - Current console output status
   */
  var isConsoleEnabled = function () {
    return config.enableConsole;
  };





  /* ================================================================ */
  /**
   * Create a module logger with pre-configured scope and persistent extra data
   * @author Angel O. Flores Torres
   * @created 2025
   *
   * @param {string} moduleName - The module name (becomes the scope)
   * @returns {Object} - Module logger with all logging methods
   */
  var createModuleLogger = function (moduleName) {
    var moduleExtra = {};  // Persistent extra data for this module

    return {
      setExtra: function (extraData) {
        moduleExtra = extraData || {};
      },
      clearExtra: function () {
        moduleExtra = {};
      },
      getExtra: function () {
        return Object.assign({}, moduleExtra);
      },
      log: function (text, extra) {
        var combinedExtra = Object.assign({}, moduleExtra, extra || {});
        log(text, moduleName, combinedExtra);
      },
      error: function (text, extra) {
        var combinedExtra = Object.assign({}, moduleExtra, extra || {});
        error(text, moduleName, combinedExtra);
      },
      warning: function (text, extra) {
        var combinedExtra = Object.assign({}, moduleExtra, extra || {});
        warning(text, moduleName, combinedExtra);
      },
      logServer: function (text, extra) {
        var combinedExtra = Object.assign({}, moduleExtra, extra || {});
        logServer(text, moduleName, combinedExtra);
      },
      timeStart: function (unit) {
        timeStart(unit);
      },
      timeStop: function (unit) {
        return timeStop(unit, moduleName);
      },
      timeStopServer: function (unit) {
        return timeStopServer(unit, moduleName);
      }
    };
  };





  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    // Console-only logging functions
    log: log, //  namespace.logger.log("API response received", "ajax", { status: 200, data: "success" });
    error: error, // namespace.logger.error("Validation failed", "form-validation", { field: "email", value: "" });
    warning: warning, // namespace.logger.warning("Deprecated function used", "legacy-code", { function: "oldMethod" });

    // Server logging functions (includes database storage)
    logServer: logServer, // namespace.logger.logServer("User login successful", "authentication", { userId: 123, ip: "192.168.1.1" });

    // Timing functions
    timeStart: timeStart, // namespace.logger.timeStart("page-load");
    timeStop: timeStop, // namespace.logger.timeStop("page-load", "performance");
    timeStopServer: timeStopServer, // namespace.logger.timeStopServer("database-query", "production-performance");

    // Configuration functions
    setLevel: setLevel, // namespace.logger.setLevel("DEBUG");
    getLevel: getLevel, // var level = namespace.logger.getLevel();
    configure: configure, // namespace.logger.configure({ enableConsole: true, bufferSize: 50, enableDataMasking: true });
    getConfig: getConfig, // var config = namespace.logger.getConfig();

    // Buffer functions (for server logging only)
    flush: flush, // namespace.logger.flush();
    clearBuffer: clearBuffer, // namespace.logger.clearBuffer();
    getBufferSize: getBufferSize, // var size = namespace.logger.getBufferSize();

    // Console control functions
    enableConsole: enableConsole, // namespace.logger.enableConsole(false);
    isConsoleEnabled: isConsoleEnabled, // var consoleEnabled = namespace.logger.isConsoleEnabled();

    // Module logger factory
    createModuleLogger: createModuleLogger // var logger = namespace.logger.createModuleLogger('PaymentModule');

  };


})(namespace, window.jQuery || window.$ || function () { });
