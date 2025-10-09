// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-config
 * ==========================================================================
 */
// Create object for logger configuration
namespace.loggerConfig = (function (namespace, undefined) {
  'use strict';

  // Default configuration values
  var DEFAULT_CONFIG = {
    level: 'INFO',
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



  // Environment-specific configurations
  var ENV_CONFIGS = {
    development: {
      level: 'INFORMATION',
      enableConsole: true,
      enableServer: false,
      enableBuffer: false,
      bufferSize: 50,
      flushInterval: 15000,
      enableDataMasking: false, // Less strict in dev
      maxDataSize: 50000 // Larger in dev for debugging
    },
    testing: {
      level: 'INFO',
      enableConsole: true,
      enableServer: true,
      enableBuffer: true,
      bufferSize: 200,
      flushInterval: 60000,
      enableDataMasking: true,
      maxDataSize: 20000
    },
    production: {
      level: 'WARNING',
      enableConsole: false,
      enableServer: true,
      enableBuffer: true,
      bufferSize: 500,
      flushInterval: 120000,
      enableDataMasking: true, // Strict in production
      sensitiveFields: ['password', 'token', 'ssn', 'credit_card', 'api_key'],
      maxDataSize: 5000 // Smaller in production
    }
  };





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

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {


    /**
     * Get environment-specific configuration
     * @param {string} environment - The environment name
     * @returns {Object} - Environment configuration
     */
    getEnvConfig: function (environment) {
      return Object.assign({}, DEFAULT_CONFIG, ENV_CONFIGS[environment] || {});
    },



    /**
     * Get console configuration
     * @returns {Object} - Console config
     */
    getConsoleConfig: function () {
      return Object.assign({}, CONSOLE_CONFIG);
    },

    /**
     * Validate log level
     * @param {string} level - The level to validate
     * @returns {boolean} - Whether the level is valid
     */
    isValidLevel: function (level) {
      return LOG_LEVELS[level.toUpperCase()] !== undefined;
    },



    /**
     * Validate configuration options
     * @param {Object} config - Configuration to validate
     * @returns {Object} - Validation result with isValid and errors
     */
    validateConfig: function (config) {
      var errors = [];
      var isValid = true;

      if (config.level && !this.isValidLevel(config.level)) {
        errors.push('Invalid log level: ' + config.level);
        isValid = false;
      }

      if (config.bufferSize && (typeof config.bufferSize !== 'number' || config.bufferSize < 1)) {
        errors.push('bufferSize must be a positive number');
        isValid = false;
      }

      if (config.flushInterval && (typeof config.flushInterval !== 'number' || config.flushInterval < 1000)) {
        errors.push('flushInterval must be at least 1000ms');
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
    },

    /**
     * Get enhanced default configuration with new options
     * @returns {Object} - Enhanced default configuration
     */
    getEnhancedConfig: function () {
      return Object.assign({}, DEFAULT_CONFIG);
    }
  };

})(namespace);
