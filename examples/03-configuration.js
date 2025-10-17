/**
 * ==========================================================================
 * Example 3: Configuration Scenarios
 * ==========================================================================
 * Demonstrates different configuration options for various environments
 */

// Initialize namespace
var namespace = namespace || {};

/* ================================================================ */
// Scenario 1: Development Environment
/* ================================================================ */
function developmentConfig() {
  var devConfig = namespace.loggerConfig.getEnvConfig('development');
  namespace.loggerConfig.configure(devConfig);
  
  console.log('Development config:', namespace.loggerConfig.getConfig());
  
  namespace.logger.log('Development mode active', 'Config');
  // Output: Console shows all logs, no server calls, no data masking
}

/* ================================================================ */
// Scenario 2: Production Environment
/* ================================================================ */
function productionConfig() {
  var prodConfig = namespace.loggerConfig.getEnvConfig('production');
  namespace.loggerConfig.configure(prodConfig);
  
  console.log('Production config:', namespace.loggerConfig.getConfig());
  
  namespace.logger.warning('Production mode active', 'Config');
  // Output: Console disabled, server logging enabled, strict data masking
}

/* ================================================================ */
// Scenario 3: Custom Configuration
/* ================================================================ */
function customConfig() {
  namespace.loggerConfig.configure({
    level: 'WARNING',           // Only WARNING and ERROR
    enableConsole: true,         // Keep console for debugging
    enableServer: true,          // Send to server
    retryCount: 3,              // Retry failed server calls 3 times
    enableDataMasking: true,    // Mask sensitive data
    sensitiveFields: ['password', 'token', 'ssn', 'credit_card', 'api_key'],
    maxDataSize: 5000,          // Limit extra data size
    maxTimingUnits: 100         // Limit timing units in memory
  });
  
  namespace.logger.log('This will NOT show (level too low)');
  namespace.logger.warning('This WILL show', 'Config');
  namespace.logger.error('This WILL show', 'Config');
}

/* ================================================================ */
// Scenario 4: Dynamic Configuration (switch at runtime)
/* ================================================================ */
function dynamicConfig() {
  // Start with production
  namespace.loggerConfig.configure(namespace.loggerConfig.getEnvConfig('production'));
  namespace.logger.log('Running in production mode', 'Config');
  
  // Temporarily enable console for debugging
  namespace.loggerConfig.enableConsole(true);
  namespace.logger.log('Console enabled for debugging', 'Config');
  
  // Change log level
  namespace.loggerConfig.setLevel('INFORMATION');
  namespace.logger.log('Log level changed to INFORMATION', 'Config');
  
  // Disable console again
  namespace.loggerConfig.enableConsole(false);
}

/* ================================================================ */
// Scenario 5: Configuration Validation
/* ================================================================ */
function validateConfiguration() {
  var invalidConfig = {
    level: 'INVALID_LEVEL',
    maxDataSize: 50,              // Too small
    maxTimingUnits: 5,            // Too small
    sensitiveFields: 'not-array'  // Wrong type
  };
  
  var validation = namespace.loggerConfig.validateConfig(invalidConfig);
  
  if (!validation.isValid) {
    console.error('Configuration errors:', validation.errors);
    // Output: ['Invalid log level: INVALID_LEVEL', 'maxDataSize must be at least 100 bytes', ...]
  }
}

/* ================================================================ */
// Run examples
/* ================================================================ */
developmentConfig();
// productionConfig();
// customConfig();
// dynamicConfig();
// validateConfiguration();
