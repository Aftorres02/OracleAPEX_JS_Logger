// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-config
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */
// Create object for logger configuration
namespace.loggerConfig = (function (namespace, undefined) {
  'use strict';

  /* ================================================================================================= */
  // Default configuration values
  var DEFAULT_CONFIG = {
    level: 'INFORMATION',
    enableConsole: true,
    enableServer: true,
    retryCount: 1,
    // Security options
    enableDataMasking: true,
    sensitiveFields: ['password', 'token', 'ssn'],
    maxDataSize: 10000,
    // Cleanup option
    maxTimingUnits: 100
  };

  // Current active configuration (this is the single source of truth)
  var currentConfig = Object.assign({}, DEFAULT_CONFIG);









  /* ================================================================================================= */
  // Log level constants (matching Oracle Logger)
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









  /* ================================================================================================= */
  // Environment-specific configurations
  var ENV_CONFIGS = {
    development: {
      level: 'INFORMATION',
      enableConsole: true,
      enableServer: false,
      enableDataMasking: false, // Less strict in dev
      maxDataSize: 50000 // Larger in dev for debugging
    },
    testing: {
      level: 'INFORMATION',
      enableConsole: true,
      enableServer: true,
      enableDataMasking: true,
      maxDataSize: 20000
    },
    production: {
      level: 'WARNING',
      enableConsole: false,
      enableServer: true,
      enableDataMasking: true, // Strict in production
      sensitiveFields: ['password', 'token', 'ssn', 'credit_card', 'api_key'],
      maxDataSize: 5000 // Smaller in production
    }
  };









  /* ================================================================================================= */
  // Console formatting options
  var CONSOLE_CONFIG = {
    showTimestamp: true,
    showLevel: true,
    showScope: true,
    showExtra: true,
    timestampFormat: 'HH:mm:ss',
    levelStyles: {
      ERROR: 'color: #ff9999; font-weight: bold',        // Soft red
      WARNING: 'color: #ffcc99; font-weight: bold',      // Soft orange
      INFORMATION: 'color: #99ccff; font-weight: bold',  // Soft blue
      TIMING: 'color: #99cc99; font-weight: bold',       // Soft green
      PERMANENT: 'color: #cc99ff; font-weight: bold; background: #fff9cc'  // Soft purple with cream background
    }
  };









  /* ================================================================================================= */
  /**
   * Get environment-specific configuration
   * @param {string} environment - The environment name
   * @returns {Object} - Environment configuration
   */
  var getEnvConfig = function (environment) {
    return Object.assign({}, DEFAULT_CONFIG, ENV_CONFIGS[environment] || {});
  };









  /* ================================================================================================= */
  /**
   * Get console configuration
   * @returns {Object} - Console config
   */
  var getConsoleConfig = function () {
    return Object.assign({}, CONSOLE_CONFIG);
  };









  /* ================================================================================================= */
  /**
   * Validate log level
   * @param {string} level - The level to validate
   * @returns {boolean} - Whether the level is valid
   */
  var isValidLevel = function (level) {
    return LOG_LEVELS[level.toUpperCase()] !== undefined;
  };









  /* ================================================================================================= */
  /**
   * Validate configuration options
   * @param {Object} config - Configuration to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  var validateConfig = function (config) {
    var errors = [];
    var isValid = true;

    if (config.level && !isValidLevel(config.level)) {
      errors.push('Invalid log level: ' + config.level);
      isValid = false;
    }



    if (config.maxDataSize && (typeof config.maxDataSize !== 'number' || config.maxDataSize < 100)) {
      errors.push('maxDataSize must be at least 100 bytes');
      isValid = false;
    }

    if (config.maxTimingUnits && (typeof config.maxTimingUnits !== 'number' || config.maxTimingUnits < 10)) {
      errors.push('maxTimingUnits must be at least 10');
      isValid = false;
    }

    if (config.sensitiveFields && !Array.isArray(config.sensitiveFields)) {
      errors.push('sensitiveFields must be an array');
      isValid = false;
    }

    return {
      isValid: isValid,
      errors: errors
    };
  };









  /* ================================================================================================= */
  /**
   * Get current active configuration (used by logger.js)
   * @returns {Object} - Current active configuration
   */
  var getCurrentConfig = function () {
    return currentConfig; // Return reference, not copy, so logger.js uses live config
  };

  /**
   * Get enhanced default configuration with new options
   * @returns {Object} - Enhanced default configuration
   */
  var getEnhancedConfig = function () {
    return Object.assign({}, currentConfig); // Return current config, not default
  };









  /* ================================================================================================= */
  /**
   * Set log level
   * @param {string} level - The log level to set
   */
  var setLevel = function (level) {
    if (LOG_LEVELS[level.toUpperCase()] !== undefined) {
      currentConfig.level = level.toUpperCase();
    } else {
      console.warn('Invalid log level: ' + level);
    }
  };









  /* ================================================================================================= */
  /**
   * Get current log level
   * @returns {string} - Current log level
   */
  var getLevel = function () {
    return currentConfig.level;
  };









  /* ================================================================================================= */
  /**
   * Configure logger options
   * @param {Object} options - Configuration options
   */
  var configure = function (options) {
    Object.assign(currentConfig, options);
  };









  /* ================================================================================================= */
  /**
   * Get current configuration
   * @returns {Object} - Current configuration
   */
  var getConfig = function () {
    return Object.assign({}, currentConfig);
  };









  /* ================================================================================================= */
  /**
   * Enable or disable console output
   * @param {boolean} enabled - Whether to enable console output
   */
  var enableConsole = function (enabled) {
    currentConfig.enableConsole = enabled;
    console.log('Logger console output ' + (enabled ? 'enabled' : 'disabled'));
  };









  /* ================================================================================================= */
  /**
   * Check if console output is enabled
   * @returns {boolean} - Current console output status
   */
  var isConsoleEnabled = function () {
    return currentConfig.enableConsole;
  };









  /* ================================================================================================= */
  /* Return public API */
  /* ================================================================================================= */
  return {
    // Configuration functions
    getEnvConfig: getEnvConfig,
    getConsoleConfig: getConsoleConfig,
    getEnhancedConfig: getEnhancedConfig,
    getCurrentConfig: getCurrentConfig,

    // Validation functions
    validateConfig: validateConfig,

    // Logger control functions (moved from logger.js)
    setLevel: setLevel,
    getLevel: getLevel,
    configure: configure,
    getConfig: getConfig,
    enableConsole: enableConsole,
    isConsoleEnabled: isConsoleEnabled,

    // Constants
    LOG_LEVELS: LOG_LEVELS
  };

})(namespace);
