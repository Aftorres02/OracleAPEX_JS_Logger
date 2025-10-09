// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger
 * ==========================================================================
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

  // Private variables
  var logBuffer = [];
  var flushTimer = null;
  var timingUnits = {};
  var currentContext = null;

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
   * @param {string|number} level - The log level to check
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

  /**
   * Add log entry to buffer
   * @param {Object} logEntry - The log entry to add
   */
  var _addToBuffer = function (logEntry) {
    if (!config.enableBuffer) return;

    logBuffer.push(logEntry);

    if (logBuffer.length >= config.bufferSize) {
      _flushBuffer();
    }
  };

  /**
   * Schedule server sync for buffered logs
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

  /**
   * Flush buffer to server
   */
  var _flushBuffer = function () {
    if (logBuffer.length === 0) return;

    var logsToSend = logBuffer.splice(0);

    logsToSend.forEach(function (logEntry) {
      _sendToServer(logEntry);
    });
  };

  /**
   * Send log entry to server via AJAX with enhanced error handling
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
          x03: logEntry.scope || 'JS_LOGGER',
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

  /**
   * Output log entry to console with colors and appropriate console method
   * @param {Object} logEntry - The log entry to output
   */
  var _outputToConsole = function (logEntry) {
    var timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    var level = logEntry.level.toUpperCase();
    var scope = logEntry.scope ? `[${logEntry.scope}]` : '';
    var extra = logEntry.extra ? ` ${JSON.stringify(logEntry.extra)}` : '';
    var context = logEntry.context ? ` Context: ${JSON.stringify(logEntry.context)}` : '';

    var message = `[${timestamp}] ${scope} ${logEntry.text}${extra}${context}`;

    // Get styles from config (single source of truth)
    var consoleConfig = namespace.loggerConfig.getConsoleConfig();
    var styles = consoleConfig.levelStyles;

    // Use appropriate console method with styles from config
    switch (level) {
      case 'ERROR':
        console.error(`%c[${timestamp}] ERROR%c ${scope} ${logEntry.text}${extra}${context}`,
          styles.ERROR, 'color: inherit');
        break;
      case 'WARNING':
        console.warn(`%c[${timestamp}] WARNING%c ${scope} ${logEntry.text}${extra}${context}`,
          styles.WARNING, 'color: inherit');
        break;
      case 'PERMANENT':
        console.log(`%c[${timestamp}] PERMANENT%c ${scope} ${logEntry.text}${extra}${context}`,
          styles.PERMANENT, 'color: inherit');
        break;
      case 'TIMING':
        console.log(`%c[${timestamp}] TIMING%c ${scope} ${logEntry.text}${extra}${context}`,
          styles.TIMING, 'color: inherit');
        break;
      case 'INFORMATION':
      default:
        console.log(`%c[${timestamp}] INFO%c ${scope} ${logEntry.text}${extra}${context}`,
          styles.INFORMATION, 'color: inherit');
        break;
    }
  };

  /**
   * Format log entry for console output (fallback for server errors)
   * @param {Object} logEntry - The log entry to format
   * @returns {string} - Formatted log message
   */
  var _formatConsoleMessage = function (logEntry) {
    var timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    var level = logEntry.level.toUpperCase();
    var scope = logEntry.scope ? `[${logEntry.scope}]` : '';
    var extra = logEntry.extra ? ` ${JSON.stringify(logEntry.extra)}` : '';
    var context = logEntry.context ? ` Context: ${JSON.stringify(logEntry.context)}` : '';

    return `[${timestamp}] ${level} ${scope} ${logEntry.text}${extra}${context}`;
  };

  /**
   * Sanitize data to prevent issues with circular references and size limits
   * @param {*} data - The data to sanitize
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

  /**
   * Mask sensitive fields in data
   * @param {*} data - The data to mask
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

  /**
   * Clean up resources to prevent memory leaks
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

  /**
   * Create log entry object with enhanced features
   * @param {string} text - The log message
   * @param {string} scope - The scope/context
   * @param {Object} extra - Extra data
   * @param {string} level - The log level
   * @returns {Object} - Formatted log entry
   */
  var _createLogEntry = function (text, scope, extra, level) {
    var logEntry = {
      timestamp: new Date().toISOString(),
      level: level || 'INFORMATION',
      text: text,
      scope: scope,
      extra: _sanitizeData(extra),
      user: (typeof apex !== 'undefined' && apex.env && apex.env.APP_USER) || 'UNKNOWN',
      page: (typeof apex !== 'undefined' && apex.env && apex.env.APP_PAGE_ID) || 0,
      session: (typeof apex !== 'undefined' && apex.env && apex.env.APP_SESSION) || 0
    };

    // Add context if available
    if (currentContext) {
      logEntry.context = currentContext;
    }

    return logEntry;
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    /**
     * Main logging function (equivalent to logger.log in PL/SQL)
     * @param {string} text - The log message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     * @param {string} level - The log level
     */
    log: function (text, scope, extra, level) {
      try {
        var logEntry = _createLogEntry(text, scope, extra, level);

        if (!_shouldLog(logEntry.level)) return;

        // Console output with colors
        if (config.enableConsole) {
          _outputToConsole(logEntry);
        }

        // Buffer and server sync
        _addToBuffer(logEntry);
        _scheduleServerSync();
      } catch (e) {
        // Fallback logging if main logging fails
        if (typeof console !== 'undefined') {
          console.error('Logger error:', e.message);
          console.log('Original message:', text);
        }
      }
    },

    /**
     * Log error message
     * @param {string} text - The error message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    error: function (text, scope, extra) {
      this.log(text, scope, extra, 'ERROR');
    },

    /**
     * Log warning message
     * @param {string} text - The warning message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    warning: function (text, scope, extra) {
      this.log(text, scope, extra, 'WARNING');
    },



    /**
     * Start timing for a unit
     * @param {string} unit - The timing unit name
     */
    timeStart: function (unit) {
      timingUnits[unit] = performance.now();
    },

    /**
     * Stop timing for a unit and log the result
     * @param {string} unit - The timing unit name
     * @param {string} scope - The scope/context
     * @returns {number} - Time elapsed in milliseconds
     */
    timeStop: function (unit, scope) {
      if (!timingUnits[unit]) {
        console.warn(`Timing unit '${unit}' was not started`);
        return 0;
      }

      var elapsed = performance.now() - timingUnits[unit];
      var message = `${unit} completed in ${elapsed.toFixed(2)}ms`;

      this.log(message, scope, { unit: unit, elapsed: elapsed }, 'TIMING');

      delete timingUnits[unit];
      return elapsed;
    },

    /**
     * Set current context for logging
     * @param {string} scope - The context scope
     * @param {Object} data - Context data
     */
    setContext: function (scope, data) {
      currentContext = {
        scope: scope,
        data: data || {},
        timestamp: new Date().toISOString()
      };
    },

    /**
     * Clear current context
     */
    clearContext: function () {
      currentContext = null;
    },

    /**
     * Get current context
     * @returns {Object|null} - Current context or null
     */
    getContext: function () {
      return currentContext;
    },

    /**
     * Set log level
     * @param {string} level - The log level to set
     */
    setLevel: function (level) {
      if (LOG_LEVELS[level.toUpperCase()] !== undefined) {
        config.level = level.toUpperCase();
      } else {
        console.warn(`Invalid log level: ${level}`);
      }
    },

    /**
     * Get current log level
     * @returns {string} - Current log level
     */
    getLevel: function () {
      return config.level;
    },

    /**
     * Configure logger options
     * @param {Object} options - Configuration options
     */
    configure: function (options) {
      Object.assign(config, options);
    },

    /**
     * Get current configuration
     * @returns {Object} - Current configuration
     */
    getConfig: function () {
      return Object.assign({}, config);
    },

    /**
     * Flush buffer immediately with error handling
     */
    flush: function () {
      try {
        _flushBuffer();
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.error('Logger flush error:', e.message);
        }
      }
    },

    /**
     * Clear buffer with memory cleanup
     */
    clearBuffer: function () {
      try {
        logBuffer.length = 0;
        _cleanupResources();
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.error('Logger clear buffer error:', e.message);
        }
      }
    },

    /**
     * Get buffer size
     * @returns {number} - Current buffer size
     */
    getBufferSize: function () {
      return logBuffer.length;
    }
  };

})(namespace, window.jQuery || window.$ || function () { });

// Auto cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(function () {
    if (namespace.logger && namespace.logger.clearBuffer) {
      try {
        // This will trigger _cleanupResources internally
        if (namespace.logger.getBufferSize && namespace.logger.getBufferSize() > 0) {
          // Only cleanup if there are items in buffer
          var currentSize = namespace.logger.getBufferSize();
          if (currentSize > 50) { // Only cleanup if buffer is getting large
            namespace.logger.clearBuffer();
          }
        }
      } catch (e) {
        // Silent cleanup failure
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}
