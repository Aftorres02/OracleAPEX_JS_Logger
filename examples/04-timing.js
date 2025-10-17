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
  enableConsole: true,
  enableServer: false
});

/* ================================================================ */
// Example 1: Simple timing (console only)
/* ================================================================ */
function simpleTimingExample() {
  namespace.logger.timeStart('page_load');
  
  // Simulate work
  setTimeout(function() {
    var elapsed = namespace.logger.timeStop('page_load', 'Performance');
    console.log('Elapsed time:', elapsed, 'ms');
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
  
  namespace.logger.timeStart('critical_operation');
  
  setTimeout(function() {
    // This will send timing to server via APEX process
    namespace.logger.timeStopServer('critical_operation', 'Production');
  }, 2000);
}

/* ================================================================ */
// Example 4: Module logger with timing
/* ================================================================ */
namespace.performanceModule = (function (namespace) {
  'use strict';
  
  var logger = namespace.logger.createModuleLogger('PerformanceModule');
  
  var measureDataLoad = function() {
    logger.timeStart('data_load');
    
    // Simulate AJAX call
    setTimeout(function() {
      logger.timeStop('data_load');
      logger.log('Data loaded successfully');
    }, 1500);
  };
  
  var measureImageProcess = function() {
    logger.timeStart('image_process');
    
    // Simulate image processing
    setTimeout(function() {
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
// Example 5: Nested timing operations
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
// namespace.performanceModule.measureDataLoad();
// namespace.performanceModule.measureImageProcess();
// nestedTimingExample();
