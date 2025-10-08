// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-utils
 * ==========================================================================
 */
// Create object for logger utility functions
namespace.loggerUtils = (function(namespace, undefined) {
  'use strict';

  // Private variables
  var timingUnits = {};
  var contextStack = [];

  /* ================================================================ */
  /**
   * Format timestamp for display
   * @param {Date|string} timestamp - The timestamp to format
   * @param {string} format - The format string (HH:mm:ss, ISO, etc.)
   * @returns {string} - Formatted timestamp
   */
  var _formatTimestamp = function(timestamp, format) {
    var date = new Date(timestamp);
    
    switch (format) {
      case 'HH:mm:ss':
        return date.toLocaleTimeString();
      case 'ISO':
        return date.toISOString();
      case 'LOCALE':
        return date.toLocaleString();
      default:
        return date.toLocaleTimeString();
    }
  };

  /**
   * Format log level with color for console
   * @param {string} level - The log level
   * @param {Object} colorMap - Color mapping object
   * @returns {string} - Formatted level string
   */
  var _formatLevel = function(level, colorMap) {
    var levelUpper = level.toUpperCase();
    var color = colorMap[levelUpper] || '#000000';
    
    if (typeof console !== 'undefined' && console.log) {
      return `%c${levelUpper}%c`;
    }
    
    return levelUpper;
  };

  /**
   * Format extra data for display
   * @param {Object} extra - The extra data object
   * @param {number} maxDepth - Maximum depth for object traversal
   * @returns {string} - Formatted extra data
   */
  var _formatExtra = function(extra, maxDepth) {
    if (!extra) return '';
    
    maxDepth = maxDepth || 3;
    
    try {
      return JSON.stringify(extra, null, 2);
    } catch (e) {
      return '[Circular or non-serializable object]';
    }
  };

  /**
   * Get APEX context information
   * @param {Array} keys - Array of APEX context keys to retrieve
   * @returns {Object} - APEX context information
   */
  var _getApexContext = function(keys) {
    var context = {};
    var defaultKeys = ['APP_USER', 'APP_PAGE_ID', 'APP_SESSION', 'APP_ID'];
    
    keys = keys || defaultKeys;
    
    keys.forEach(function(key) {
      try {
        if (apex && apex.env && apex.env[key] !== undefined) {
          context[key] = apex.env[key];
        } else {
          context[key] = null;
        }
      } catch (e) {
        context[key] = null;
      }
    });
    
    return context;
  };

  /**
   * Get browser information
   * @returns {Object} - Browser information
   */
  var _getBrowserInfo = function() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  /**
   * Get performance information
   * @returns {Object} - Performance information
   */
  var _getPerformanceInfo = function() {
    var perf = {};
    
    if (window.performance) {
      perf.timing = window.performance.timing;
      perf.navigation = window.performance.navigation;
      perf.memory = window.performance.memory;
    }
    
    return perf;
  };

  /**
   * Create a context scope for logging
   * @param {string} scope - The scope name
   * @param {Object} context - Additional context data
   */
  var _pushContext = function(scope, context) {
    contextStack.push({
      scope: scope,
      context: context || {},
      timestamp: new Date()
    });
  };

  /**
   * Remove the last context scope
   * @returns {Object} - The removed context
   */
  var _popContext = function() {
    return contextStack.pop();
  };

  /**
   * Get current context stack
   * @returns {Array} - Current context stack
   */
  var _getContextStack = function() {
    return contextStack.slice();
  };

  /**
   * Generate unique identifier
   * @returns {string} - Unique identifier
   */
  var _generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  /**
   * Sanitize log message for security
   * @param {string} message - The message to sanitize
   * @returns {string} - Sanitized message
   */
  var _sanitizeMessage = function(message) {
    if (typeof message !== 'string') return String(message);
    
    // Remove potential XSS vectors
    return message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    /**
     * Format timestamp
     * @param {Date|string} timestamp - The timestamp to format
     * @param {string} format - The format string
     * @returns {string} - Formatted timestamp
     */
    formatTimestamp: function(timestamp, format) {
      return _formatTimestamp(timestamp, format);
    },

    /**
     * Format log level
     * @param {string} level - The log level
     * @param {Object} colorMap - Color mapping
     * @returns {string} - Formatted level
     */
    formatLevel: function(level, colorMap) {
      return _formatLevel(level, colorMap);
    },

    /**
     * Format extra data
     * @param {Object} extra - The extra data
     * @param {number} maxDepth - Maximum depth
     * @returns {string} - Formatted extra data
     */
    formatExtra: function(extra, maxDepth) {
      return _formatExtra(extra, maxDepth);
    },

    /**
     * Get APEX context
     * @param {Array} keys - APEX context keys
     * @returns {Object} - APEX context
     */
    getApexContext: function(keys) {
      return _getApexContext(keys);
    },

    /**
     * Get browser information
     * @returns {Object} - Browser info
     */
    getBrowserInfo: function() {
      return _getBrowserInfo();
    },

    /**
     * Get performance information
     * @returns {Object} - Performance info
     */
    getPerformanceInfo: function() {
      return _getPerformanceInfo();
    },

    /**
     * Push context scope
     * @param {string} scope - The scope name
     * @param {Object} context - Additional context
     */
    pushContext: function(scope, context) {
      _pushContext(scope, context);
    },

    /**
     * Pop context scope
     * @returns {Object} - The removed context
     */
    popContext: function() {
      return _popContext();
    },

    /**
     * Get context stack
     * @returns {Array} - Context stack
     */
    getContextStack: function() {
      return _getContextStack();
    },

    /**
     * Generate unique ID
     * @returns {string} - Unique identifier
     */
    generateId: function() {
      return _generateId();
    },

    /**
     * Sanitize message
     * @param {string} message - The message to sanitize
     * @returns {string} - Sanitized message
     */
    sanitizeMessage: function(message) {
      return _sanitizeMessage(message);
    },

    /**
     * Start timing for a unit
     * @param {string} unit - The timing unit name
     */
    timeStart: function(unit) {
      timingUnits[unit] = {
        start: performance.now(),
        id: _generateId()
      };
    },

    /**
     * Stop timing for a unit
     * @param {string} unit - The timing unit name
     * @returns {Object} - Timing result
     */
    timeStop: function(unit) {
      if (!timingUnits[unit]) {
        return { elapsed: 0, unit: unit, error: 'Unit not started' };
      }
      
      var elapsed = performance.now() - timingUnits[unit].start;
      var result = {
        elapsed: elapsed,
        unit: unit,
        id: timingUnits[unit].id,
        start: timingUnits[unit].start,
        end: performance.now()
      };
      
      delete timingUnits[unit];
      return result;
    },

    /**
     * Get all active timing units
     * @returns {Object} - Active timing units
     */
    getActiveTimings: function() {
      return Object.assign({}, timingUnits);
    },

    /**
     * Clear all timing units
     */
    clearTimings: function() {
      timingUnits = {};
    },

    /**
     * Sanitize data to prevent issues with circular references and size limits
     * @param {*} data - The data to sanitize
     * @param {Object} options - Sanitization options
     * @returns {*} - Sanitized data
     */
    sanitizeData: function(data, options) {
      if (!data) return data;
      
      options = options || {};
      var maxDataSize = options.maxDataSize || 10000;
      var enableDataMasking = options.enableDataMasking !== false;
      var sensitiveFields = options.sensitiveFields || ['password', 'token', 'ssn'];
      
      try {
        // Check for circular references
        JSON.stringify(data);
        
        // Check size limit
        var dataStr = JSON.stringify(data);
        if (dataStr.length > maxDataSize) {
          return {
            _truncated: true,
            _originalSize: dataStr.length,
            data: dataStr.substring(0, maxDataSize) + '...'
          };
        }
        
        // Mask sensitive fields
        return this.maskSensitiveFields(data, sensitiveFields, enableDataMasking);
        
      } catch (e) {
        // Circular reference or other JSON error
        return {
          _error: 'Could not serialize data',
          _type: typeof data,
          _string: String(data).substring(0, 100)
        };
      }
    },

    /**
     * Mask sensitive fields in data
     * @param {*} data - The data to mask
     * @param {Array} sensitiveFields - Array of sensitive field names
     * @param {boolean} enableMasking - Whether masking is enabled
     * @returns {*} - Data with sensitive fields masked
     */
    maskSensitiveFields: function(data, sensitiveFields, enableMasking) {
      if (!enableMasking || !data || typeof data !== 'object') {
        return data;
      }
      
      sensitiveFields = sensitiveFields || ['password', 'token', 'ssn'];
      var masked = {};
      
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var lowerKey = key.toLowerCase();
          var isSensitive = sensitiveFields.some(function(field) {
            return lowerKey.includes(field.toLowerCase());
          });
          
          if (isSensitive) {
            masked[key] = '***MASKED***';
          } else {
            masked[key] = data[key];
          }
        }
      }
      
      return masked;
    },

    /**
     * Clean up resources to prevent memory leaks
     * @param {Object} options - Cleanup options
     */
    cleanupResources: function(options) {
      options = options || {};
      var maxTimingUnits = options.maxTimingUnits || 100;
      
      try {
        // Clean up old timing units (keep only last maxTimingUnits)
        var timingKeys = Object.keys(timingUnits);
        if (timingKeys.length > maxTimingUnits) {
          var toRemove = timingKeys.slice(0, timingKeys.length - maxTimingUnits);
          toRemove.forEach(function(key) {
            delete timingUnits[key];
          });
        }
        
        // Clean up old context entries (keep only last 50)
        if (contextStack.length > 50) {
          contextStack = contextStack.slice(-50);
        }
      } catch (e) {
        // Silent cleanup failure
        if (typeof console !== 'undefined') {
          console.warn('Logger utils cleanup error:', e.message);
        }
      }
    },

    /**
     * Simple context management (not stack-based)
     * @param {string} scope - The context scope
     * @param {Object} data - Context data
     * @returns {Object} - Context object
     */
    createSimpleContext: function(scope, data) {
      return {
        scope: scope,
        data: data || {},
        timestamp: new Date().toISOString()
      };
    },

    /**
     * Check if APEX environment is available
     * @returns {boolean} - Whether APEX is available
     */
    isApexAvailable: function() {
      try {
        return typeof apex !== 'undefined' && apex.env;
      } catch (e) {
        return false;
      }
    },

    /**
     * Safe APEX context retrieval with error handling
     * @param {Array} keys - APEX context keys to retrieve
     * @returns {Object} - APEX context with error handling
     */
    getSafeApexContext: function(keys) {
      try {
        return this.getApexContext(keys);
      } catch (e) {
        return {
          _error: 'APEX context unavailable',
          _message: e.message
        };
      }
    }
  };

})(namespace);
