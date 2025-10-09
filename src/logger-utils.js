// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-utils
 * ==========================================================================
 */
// Create object for logger utility functions
namespace.loggerUtils = (function (namespace, undefined) {
  'use strict';

  /**
   * Get APEX context information
   * @param {Array} keys - Array of APEX context keys to retrieve
   * @returns {Object} - APEX context information
   */
  var _getApexContext = function (keys) {
    var context = {};
    var defaultKeys = ['APP_USER', 'APP_PAGE_ID', 'APP_SESSION', 'APP_ID'];

    keys = keys || defaultKeys;

    keys.forEach(function (key) {
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
  var _getBrowserInfo = function () {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    /**
     * Get APEX context
     * @param {Array} keys - APEX context keys
     * @returns {Object} - APEX context
     */
    getApexContext: function (keys) {
      return _getApexContext(keys);
    },

    /**
     * Sanitize data to prevent issues with circular references and size limits
     * @param {*} data - The data to sanitize
     * @param {Object} options - Sanitization options
     * @returns {*} - Sanitized data
     */
    sanitizeData: function (data, options) {
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
    maskSensitiveFields: function (data, sensitiveFields, enableMasking) {
      if (!enableMasking || !data || typeof data !== 'object') {
        return data;
      }

      sensitiveFields = sensitiveFields || ['password', 'token', 'ssn'];
      var masked = {};

      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var lowerKey = key.toLowerCase();
          var isSensitive = sensitiveFields.some(function (field) {
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
     * Simple context management (not stack-based)
     * @param {string} scope - The context scope
     * @param {Object} data - Context data
     * @returns {Object} - Context object
     */
    createSimpleContext: function (scope, data) {
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
    isApexAvailable: function () {
      try {
        return typeof apex !== 'undefined' && apex.env;
      } catch (e) {
        return false;
      }
    },

    /**
     * Get browser information
     * @returns {Object} - Browser info
     */
    getBrowserInfo: function () {
      return _getBrowserInfo();
    },

    /**
     * Safe APEX context retrieval with error handling
     * @param {Array} keys - APEX context keys to retrieve
     * @returns {Object} - APEX context with error handling
     */
    getSafeApexContext: function (keys) {
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
