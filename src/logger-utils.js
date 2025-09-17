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
    }
  };

})(namespace);
