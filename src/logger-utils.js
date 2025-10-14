// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-utils
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */
// Create object for logger utility functions
namespace.loggerUtils = (function (namespace, undefined) {
  'use strict';

  /* ================================================================================================= */
  /**
   * Get APEX context information
   * @author Angel O. Flores Torres
   * @created 2024
   *
   * @param {Array} keys - Array of APEX context keys to retrieve
   *
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









  /* ================================================================================================= */
  /**
   * Get browser information
   * @author Angel O. Flores Torres
   * @created 2024
   *
   * @returns {Object} - Browser information
   */
  var _getBrowserInfo = function () {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };









  /* ================================================================================================= */
  /**
   * Get APEX context
   * @author Angel O. Flores Torres
   * @created 2024
   *
   * @param {Array} keys - APEX context keys
   *
   * @returns {Object} - APEX context
   */
  var getApexContext = function (keys) {
    return _getApexContext(keys);
  };









  /* ================================================================================================= */
  /**
   * Get browser information
   * @returns {Object} - Browser info
   */
  var getBrowserInfo = function () {
    return _getBrowserInfo();
  };









  /* ================================================================================================= */
  /* Return public API */
  /* ================================================================================================= */
  return {
    // APEX functions
    getApexContext: getApexContext,

    // Browser functions
    getBrowserInfo: getBrowserInfo
  };

})(namespace);
