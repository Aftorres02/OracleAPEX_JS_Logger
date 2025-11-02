/**
 * ==========================================================================
 * Example 4: Performance Timing
 * ==========================================================================
 * Demonstrates timing functions for performance monitoring
 */

// Initialize namespace
var namespace = namespace || {};

// Configure logger
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableServer: false  // Console-only for this example
});

/* ================================================================ */
// Example 1: Simple timing (console only)
/* ================================================================ */
function simpleTimingExample() {
  namespace.logger.timeStart('page_load');
  
  // Simulate work
  setTimeout(function() {
    // timeStop automatically logs the elapsed time
    namespace.logger.timeStop('page_load', 'Performance');
    // Output: [timestamp] INFO [Performance] page_load completed in 1000.00ms
  }, 1000);
}

/* ================================================================ */
// Example 2: Multiple timers
/* ================================================================ */
function multipleTimersExample() {
  // Start multiple timers
  namespace.logger.timeStart('database_query');
  namespace.logger.timeStart('api_call');
  namespace.logger.timeStart('render');
  
  setTimeout(function() {
    namespace.logger.timeStop('database_query', 'Database');
  }, 500);
  
  setTimeout(function() {
    namespace.logger.timeStop('api_call', 'API');
  }, 800);
  
  setTimeout(function() {
    namespace.logger.timeStop('render', 'UI');
  }, 1200);
}

/* ================================================================ */
// Example 3: Server timing (send to database)
/* ================================================================ */
function serverTimingExample() {
  // Enable server logging
  namespace.loggerConfig.configure({ enableServer: true });
  
  var logger = namespace.logger.createModuleLogger('Production');
  logger.timeStart('critical_operation');
  
  setTimeout(function() {
    var elapsed = logger.timeStop('critical_operation');
    // Log timing to server
    logger.logServer('Critical operation completed', { elapsed: elapsed });
  }, 2000);
}

/* ================================================================ */
// Example 4: Using elapsed time for conditional logic
/* ================================================================ */
function conditionalTimingExample() {
  namespace.logger.timeStart('api_request');
  
  // Simulate API call
  setTimeout(function() {
    // Capture elapsed time for conditional logic
    var elapsed = namespace.logger.timeStop('api_request', 'API');
    
    // Use the elapsed value for decisions
    if (elapsed > 2000) {
      namespace.logger.warning('API request too slow', 'Performance', {
        threshold: 2000,
        actual: elapsed
      });
    } else {
      namespace.logger.log('API request within acceptable time', 'Performance');
    }
  }, 2500);
}

/* ================================================================ */
// Example 5: Module logger with timing
/* ================================================================ */
namespace.performanceModule = (function (namespace) {
  'use strict';
  
  var logger = namespace.logger.createModuleLogger('PerformanceModule');
  
  var measureDataLoad = function() {
    logger.timeStart('data_load');
    
    // Simulate AJAX call
    setTimeout(function() {
      // timeStop automatically logs
      logger.timeStop('data_load');
      logger.log('Data loaded successfully');
    }, 1500);
  };
  
  var measureImageProcess = function() {
    logger.timeStart('image_process');
    
    // Simulate image processing
    setTimeout(function() {
      // Use elapsed for conditional warning
      var elapsed = logger.timeStop('image_process');
      
      if (elapsed > 1000) {
        logger.warning('Image processing slow', { elapsed: elapsed });
      }
    }, 1100);
  };
  
  return {
    measureDataLoad: measureDataLoad,
    measureImageProcess: measureImageProcess
  };
})(namespace);

/* ================================================================ */
// Example 6: Nested timing operations
/* ================================================================ */
function nestedTimingExample() {
  var logger = namespace.logger.createModuleLogger('CheckoutModule');
  
  logger.timeStart('checkout_total');
  
  // Step 1: Validate cart
  logger.timeStart('validate_cart');
  setTimeout(function() {
    logger.timeStop('validate_cart');
    
    // Step 2: Process payment
    logger.timeStart('process_payment');
    setTimeout(function() {
      logger.timeStop('process_payment');
      
      // Step 3: Send confirmation
      logger.timeStart('send_confirmation');
      setTimeout(function() {
        logger.timeStop('send_confirmation');
        
        // Total time
        logger.timeStop('checkout_total');
      }, 300);
    }, 1000);
  }, 200);
}

/* ================================================================ */
// Run examples
/* ================================================================ */
simpleTimingExample();
// multipleTimersExample();
// serverTimingExample();
// conditionalTimingExample();
// namespace.performanceModule.measureDataLoad();
// namespace.performanceModule.measureImageProcess();
// nestedTimingExample();
