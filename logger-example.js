/**
 * ==========================================================================
 * Logger Usage Examples
 * ==========================================================================
 * This file demonstrates how to use the Logger system in different scenarios
 */

// Example 1: Basic Configuration
function basicLoggerExample() {
  'use strict';
  
  // Configure logger for development
  namespace.logger.configure({
    level: 'DEBUG',
    enableConsole: true,
    enableServer: false,
    enableBuffer: false
  });
  
  // Basic logging
  namespace.logger.log('Application started', 'app_initialization');
  namespace.logger.info('User logged in', 'authentication', { user_id: 123 });
  namespace.logger.debug('Loading user preferences', 'user_prefs');
}

// Example 2: APEX Integration
function apexLoggerExample() {
  'use strict';
  
  // Configure for APEX production
  namespace.logger.configure({
    level: 'INFO',
    enableConsole: false,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 200,
    flushInterval: 60000
  });
  
  // Log APEX-specific information
  namespace.logger.log('Page loaded', 'page_rendering', {
    page_id: apex.env.APP_PAGE_ID,
    user: apex.env.APP_USER,
    session: apex.env.APP_SESSION
  });
  
  // Log user actions
  namespace.logger.info('Button clicked', 'user_interaction', {
    button_id: 'save_btn',
    page: apex.env.APP_PAGE_ID
  });
}

// Example 3: Performance Timing
function timingLoggerExample() {
  'use strict';
  
  // Start timing for different operations
  namespace.logger.timeStart('data_loading');
  namespace.logger.timeStart('ui_rendering');
  
  // Simulate some work
  setTimeout(function() {
    // Stop timing and log results
    namespace.logger.timeStop('data_loading', 'performance');
    
    setTimeout(function() {
      namespace.logger.timeStop('ui_rendering', 'performance');
    }, 500);
  }, 1000);
}

// Example 4: Error Handling
function errorLoggerExample() {
  'use strict';
  
  try {
    // Simulate an error
    throw new Error('Database connection failed');
  } catch (error) {
    namespace.logger.error('Failed to connect to database', 'database_connection', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

// Example 5: Context Management
function contextLoggerExample() {
  'use strict';
  
  // Push context for a specific operation
  namespace.loggerUtils.pushContext('ticket_creation', {
    user_id: 123,
    project_id: 456
  });
  
  // All logs in this context will include the context data
  namespace.logger.info('Starting ticket creation process');
  namespace.logger.debug('Validating ticket data');
  
  // Pop context when done
  var context = namespace.loggerUtils.popContext();
  namespace.logger.info('Ticket creation context ended', 'context_management', context);
}

// Example 6: Batch Operations
function batchLoggerExample() {
  'use strict';
  
  // Configure for batch processing
  namespace.logger.configure({
    level: 'WARNING',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 1000,
    flushInterval: 300000 // 5 minutes
  });
  
  // Process multiple items
  for (var i = 0; i < 100; i++) {
    namespace.logger.info(`Processing item ${i}`, 'batch_processing', {
      item_id: i,
      status: 'processing'
    });
  }
  
  // Force flush at the end
  namespace.logger.flush();
}

// Example 7: Environment-Specific Configuration
function environmentLoggerExample() {
  'use strict';
  
  // Get environment-specific config
  var env = 'development'; // This could be determined dynamically
  var envConfig = namespace.loggerConfig.getEnvConfig(env);
  
  // Apply environment configuration
  namespace.logger.configure(envConfig);
  
  namespace.logger.info(`Logger configured for ${env} environment`, 'configuration');
}

// Example 8: Custom Log Levels
function customLevelsExample() {
  'use strict';
  
  // Use different log levels for different purposes
  namespace.logger.log('Critical system event', 'system_monitoring', null, 'ERROR');
  namespace.logger.log('Performance metric', 'performance_monitoring', { cpu: 85 }, 'TIMING');
  namespace.logger.log('APEX context change', 'apex_integration', { page: 1 }, 'APEX');
}

// Example 9: Integration with Existing Code
function integrationExample() {
  'use strict';
  
  // Replace console.log calls with logger
  var originalConsoleLog = console.log;
  
  // Override console.log to use logger
  console.log = function(message, ...args) {
    namespace.logger.info(message, 'console_override', args);
    originalConsoleLog.apply(console, arguments);
  };
  
  // Now all console.log calls go through logger
  console.log('This will be logged through the logger system');
}

// Example 10: Advanced Configuration
function advancedConfigurationExample() {
  'use strict';
  
  // Advanced configuration with all options
  namespace.logger.configure({
    level: 'DEBUG',
    enableConsole: true,
    enableServer: true,
    enableBuffer: true,
    bufferSize: 500,
    flushInterval: 45000,
    retryCount: 2
  });
  
  // Get current configuration
  var currentConfig = namespace.logger.getConfig();
  console.log('Current logger configuration:', currentConfig);
  
  // Change level dynamically
  namespace.logger.setLevel('WARNING');
  
  // Check if specific level will be logged
  var willLogDebug = namespace.loggerConfig.isValidLevel('DEBUG');
  console.log('Will DEBUG level be logged?', willLogDebug);
}

// Example 11: APEX Dynamic Actions Integration
function apexDynamicActionsExample() {
  'use strict';
  
  // This function can be called from APEX Dynamic Actions
  window.logUserAction = function(action, details) {
    namespace.logger.info(`User action: ${action}`, 'dynamic_action', {
      action: action,
      details: details,
      page: apex.env.APP_PAGE_ID,
      user: apex.env.APP_USER,
      timestamp: new Date().toISOString()
    });
  };
  
  // Usage in APEX:
  // apex.server.process('LOG_ACTION', {
  //   x01: 'button_click',
  //   x02: JSON.stringify({ button_id: 'save_btn' })
  // });
}

// Example 12: Performance Monitoring
function performanceMonitoringExample() {
  'use strict';
  
  // Monitor page load performance
  namespace.logger.timeStart('page_load');
  
  // Monitor specific operations
  namespace.logger.timeStart('data_fetch');
  namespace.logger.timeStart('ui_update');
  
  // Simulate operations
  setTimeout(function() {
    namespace.logger.timeStop('data_fetch', 'performance_monitoring');
    
    setTimeout(function() {
      namespace.logger.timeStop('ui_update', 'performance_monitoring');
      namespace.logger.timeStop('page_load', 'performance_monitoring');
    }, 200);
  }, 300);
}

// Export examples for use in other files
window.LoggerExamples = {
  basic: basicLoggerExample,
  apex: apexLoggerExample,
  timing: timingLoggerExample,
  error: errorLoggerExample,
  context: contextLoggerExample,
  batch: batchLoggerExample,
  environment: environmentLoggerExample,
  customLevels: customLevelsExample,
  integration: integrationExample,
  advancedConfig: advancedConfigurationExample,
  dynamicActions: apexDynamicActionsExample,
  performance: performanceMonitoringExample
};
