// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger
 * ==========================================================================
 */
// Create object for logger functions
namespace.logger = (function(namespace, $, undefined) {
  'use strict';

  // Configuration - Can be changed at runtime
  var config = {
    level: 'INFO',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 100,
    flushInterval: 30000,
    retryCount: 1
  };

  // Private variables
  var logBuffer = [];
  var flushTimer = null;
  var timingUnits = {};

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

  // Level names for easy access
  var LEVEL_NAMES = {
    0: 'OFF',
    1: 'PERMANENT',
    2: 'ERROR',
    4: 'WARNING',
    8: 'INFORMATION',
    16: 'DEBUG',
    32: 'TIMING',
    64: 'SYS_CONTEXT',
    128: 'APEX'
  };

  /* ================================================================ */
  /**
   * Check if a log level should be logged based on current configuration
   * @param {string|number} level - The log level to check
   * @returns {boolean} - Whether the level should be logged
   */
  var _shouldLog = function(level) {
    var levelNum = typeof level === 'string' ? LOG_LEVELS[level.toUpperCase()] : level;
    var configNum = LOG_LEVELS[config.level.toUpperCase()];
    return levelNum <= configNum;
  };

  /**
   * Add log entry to buffer
   * @param {Object} logEntry - The log entry to add
   */
  var _addToBuffer = function(logEntry) {
    if (!config.enableBuffer) return;
    
    logBuffer.push(logEntry);
    
    if (logBuffer.length >= config.bufferSize) {
      _flushBuffer();
    }
  };

  /**
   * Schedule server sync for buffered logs
   */
  var _scheduleServerSync = function() {
    if (!config.enableServer || !config.enableBuffer) return;
    
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    
    flushTimer = setTimeout(function() {
      _flushBuffer();
    }, config.flushInterval);
  };

  /**
   * Flush buffer to server
   */
  var _flushBuffer = function() {
    if (logBuffer.length === 0) return;
    
    var logsToSend = logBuffer.splice(0);
    
    logsToSend.forEach(function(logEntry) {
      _sendToServer(logEntry);
    });
  };

  /**
   * Send log entry to server via AJAX
   * @param {Object} logEntry - The log entry to send
   */
  var _sendToServer = function(logEntry) {
    if (!config.enableServer) return;
    
    var retryAttempts = 0;
    
    var attemptSend = function() {
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
        success: function(response) {
          // Log sent successfully to Oracle Logger
        },
        error: function(xhr, status, error) {
          retryAttempts++;
          if (retryAttempts <= config.retryCount) {
            // Retry once
            setTimeout(attemptSend, 1000);
          } else {
            // Fallback to console only
            console.warn('Logger server failed, using console fallback');
          }
        }
      });
    };
    
    attemptSend();
  };

  /**
   * Format log entry for console output
   * @param {Object} logEntry - The log entry to format
   * @returns {string} - Formatted log message
   */
  var _formatConsoleMessage = function(logEntry) {
    var timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    var level = logEntry.level.toUpperCase();
    var scope = logEntry.scope ? `[${logEntry.scope}]` : '';
    var extra = logEntry.extra ? ` ${JSON.stringify(logEntry.extra)}` : '';
    
    return `[${timestamp}] ${level} ${scope} ${logEntry.text}${extra}`;
  };

  /**
   * Create log entry object
   * @param {string} text - The log message
   * @param {string} scope - The scope/context
   * @param {Object} extra - Extra data
   * @param {string} level - The log level
   * @returns {Object} - Formatted log entry
   */
  var _createLogEntry = function(text, scope, extra, level) {
    return {
      timestamp: new Date().toISOString(),
      level: level || 'INFORMATION',
      text: text,
      scope: scope,
      extra: extra,
      user: apex.env.APP_USER || 'UNKNOWN',
      page: apex.env.APP_PAGE_ID || 0,
      session: apex.env.APP_SESSION || 0
    };
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
    log: function(text, scope, extra, level) {
      var logEntry = _createLogEntry(text, scope, extra, level);
      
      if (!_shouldLog(logEntry.level)) return;
      
      // Console output
      if (config.enableConsole) {
        console.log(_formatConsoleMessage(logEntry));
      }
      
      // Buffer and server sync
      _addToBuffer(logEntry);
      _scheduleServerSync();
    },

    /**
     * Log error message
     * @param {string} text - The error message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    error: function(text, scope, extra) {
      this.log(text, scope, extra, 'ERROR');
    },

    /**
     * Log warning message
     * @param {string} text - The warning message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    warning: function(text, scope, extra) {
      this.log(text, scope, extra, 'WARNING');
    },

    /**
     * Log info message
     * @param {string} text - The info message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    info: function(text, scope, extra) {
      this.log(text, scope, extra, 'INFORMATION');
    },

    /**
     * Log debug message
     * @param {string} text - The debug message
     * @param {string} scope - The scope/context
     * @param {Object} extra - Extra data
     */
    debug: function(text, scope, extra) {
      this.log(text, scope, extra, 'DEBUG');
    },

    /**
     * Start timing for a unit
     * @param {string} unit - The timing unit name
     */
    timeStart: function(unit) {
      timingUnits[unit] = performance.now();
    },

    /**
     * Stop timing for a unit and log the result
     * @param {string} unit - The timing unit name
     * @param {string} scope - The scope/context
     * @returns {number} - Time elapsed in milliseconds
     */
    timeStop: function(unit, scope) {
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
     * Set log level
     * @param {string} level - The log level to set
     */
    setLevel: function(level) {
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
    getLevel: function() {
      return config.level;
    },

    /**
     * Configure logger options
     * @param {Object} options - Configuration options
     */
    configure: function(options) {
      Object.assign(config, options);
    },

    /**
     * Get current configuration
     * @returns {Object} - Current configuration
     */
    getConfig: function() {
      return Object.assign({}, config);
    },

    /**
     * Flush buffer immediately
     */
    flush: function() {
      _flushBuffer();
    },

    /**
     * Clear buffer
     */
    clearBuffer: function() {
      logBuffer.length = 0;
    },

    /**
     * Get buffer size
     * @returns {number} - Current buffer size
     */
    getBufferSize: function() {
      return logBuffer.length;
    }
  };

})(namespace, window.jQuery || window.$ || function(){});
