/**
 * ==========================================================================
 * Example 1: Basic Logging
 * ==========================================================================
 * Demonstrates simple console-only logging with colored output
 */

// Initialize namespace (if not already done)
var namespace = namespace || {};

// Configure logger for development
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableConsole: true,
  enableServer: false  // Console only for this example
});

// Basic logging examples
function basicLoggingExamples() {
  
  // Information log (blue in console)
  namespace.logger.log('Application initialized', 'AppMain');
  
  // Log with extra data
  namespace.logger.log('User action detected', 'UI', {
    action: 'button_click',
    element: 'submit_button'
  });
  
  // Warning log (orange in console)
  namespace.logger.warning('API response slow', 'Network', {
    url: '/api/data',
    responseTime: 3500
  });
  
  // Error log (red in console)
  namespace.logger.error('Validation failed', 'FormValidation', {
    field: 'email',
    error: 'Invalid format'
  });
  
  // Log with sensitive data (automatically masked)
  namespace.logger.log('User login attempt', 'Auth', {
    username: 'john.doe',
    password: 'secret123',  // Will be masked as ***MASKED***
    token: 'abc123xyz'      // Will be masked as ***MASKED***
  });
}

// Run examples
basicLoggingExamples();
