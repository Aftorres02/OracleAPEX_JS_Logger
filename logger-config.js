// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module logger-config
 * ==========================================================================
 */
// Create object for logger configuration
namespace.loggerConfig = (function(namespace, undefined) {
  'use strict';

  // Default configuration values
  var DEFAULT_CONFIG = {
    level: 'INFO',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 100,
    flushInterval: 30000,
    retryCount: 1
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

  // Level names mapping
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

  // Environment-specific configurations
  var ENV_CONFIGS = {
    development: {
      level: 'DEBUG',
      enableConsole: true,
      enableServer: false,
      enableBuffer: false,
      bufferSize: 50,
      flushInterval: 15000
    },
    testing: {
      level: 'INFO',
      enableConsole: true,
      enableServer: true,
      enableBuffer: true,
      bufferSize: 200,
      flushInterval: 60000
    },
    production: {
      level: 'WARNING',
      enableConsole: false,
      enableServer: true,
      enableBuffer: true,
      bufferSize: 500,
      flushInterval: 120000
    }
  };

  // APEX-specific configuration keys
  var APEX_CONFIG_KEYS = {
    USER: 'APP_USER',
    PAGE: 'APP_PAGE_ID',
    SESSION: 'APP_SESSION',
    APP: 'APP_ID',
    WORKSPACE: 'WORKSPACE_ID'
  };

  // Server endpoint configuration
  var SERVER_CONFIG = {
    defaultEndpoint: 'logger_process.sql',
    timeout: 10000,
    retryDelay: 1000
  };

  // Console formatting options
  var CONSOLE_CONFIG = {
    showTimestamp: true,
    showLevel: true,
    showScope: true,
    showExtra: true,
    timestampFormat: 'HH:mm:ss',
    levelColors: {
      ERROR: '#ff0000',
      WARNING: '#ffa500',
      INFORMATION: '#0000ff',
      DEBUG: '#808080',
      TIMING: '#008000'
    }
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    /**
     * Get default configuration
     * @returns {Object} - Default configuration object
     */
    getDefaultConfig: function() {
      return Object.assign({}, DEFAULT_CONFIG);
    },

    /**
     * Get environment-specific configuration
     * @param {string} environment - The environment name
     * @returns {Object} - Environment configuration
     */
    getEnvConfig: function(environment) {
      return Object.assign({}, DEFAULT_CONFIG, ENV_CONFIGS[environment] || {});
    },

    /**
     * Get log levels
     * @returns {Object} - Log levels object
     */
    getLogLevels: function() {
      return Object.assign({}, LOG_LEVELS);
    },

    /**
     * Get level names
     * @returns {Object} - Level names object
     */
    getLevelNames: function() {
      return Object.assign({}, LEVEL_NAMES);
    },

    /**
     * Get APEX configuration keys
     * @returns {Object} - APEX config keys
     */
    getApexConfigKeys: function() {
      return Object.assign({}, APEX_CONFIG_KEYS);
    },

    /**
     * Get server configuration
     * @returns {Object} - Server config
     */
    getServerConfig: function() {
      return Object.assign({}, SERVER_CONFIG);
    },

    /**
     * Get console configuration
     * @returns {Object} - Console config
     */
    getConsoleConfig: function() {
      return Object.assign({}, CONSOLE_CONFIG);
    },

    /**
     * Validate log level
     * @param {string} level - The level to validate
     * @returns {boolean} - Whether the level is valid
     */
    isValidLevel: function(level) {
      return LOG_LEVELS[level.toUpperCase()] !== undefined;
    },

    /**
     * Get numeric value for log level
     * @param {string} level - The level name
     * @returns {number} - The numeric value
     */
    getLevelValue: function(level) {
      return LOG_LEVELS[level.toUpperCase()] || 0;
    },

    /**
     * Get level name from numeric value
     * @param {number} value - The numeric value
     * @returns {string} - The level name
     */
    getLevelName: function(value) {
      return LEVEL_NAMES[value] || 'UNKNOWN';
    }
  };

})(namespace);
