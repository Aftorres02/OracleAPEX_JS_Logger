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
    enableServer: true,          // Send to server
    retryCount: 3,              // Retry failed server calls 3 times
    enableDataMasking: true,    // Mask sensitive data
    sensitiveFields: ['password', 'token', 'ssn', 'credit_card', 'api_key'],
    maxDataSize: 5000           // Limit extra data size
  });
  
  namespace.logger.log('This will NOT show (level too low)');
  namespace.logger.warning('This WILL show', 'Config');
  namespace.logger.error('This WILL show', 'Config');
}

/* ================================================================ */
// Scenario 4: Dynamic Configuration (switch at runtime)
/* ================================================================ */
function dynamicConfig() {
  // Start with production config
  namespace.loggerConfig.configure(namespace.loggerConfig.getEnvConfig('production'));
  console.log('Starting in production mode');
  
  // Change log level to see more information
  namespace.loggerConfig.setLevel('INFORMATION');
  namespace.logger.log('Log level changed to INFORMATION', 'Config');
  
  // Change back to WARNING level
  namespace.loggerConfig.setLevel('WARNING');
  namespace.logger.log('This will NOT show (level too low)', 'Config');
  namespace.logger.warning('This WILL show', 'Config');
  
  // Reset to default
  namespace.loggerConfig.resetLevel();
  console.log('Reset to default level:', namespace.loggerConfig.getLevel());
}

/* ================================================================ */
// Run examples
/* ================================================================ */
developmentConfig();
// productionConfig();
// customConfig();
// dynamicConfig();
