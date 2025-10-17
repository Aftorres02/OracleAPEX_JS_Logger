/**
 * ==========================================================================
 * Example 5: Server Logging (APEX Integration)
 * ==========================================================================
 * Demonstrates sending logs to APEX server for database storage
 */

// Initialize namespace
var namespace = namespace || {};

// Configure for server logging
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableConsole: true,
  enableServer: true,      // Enable server logging
  retryCount: 2            // Retry failed calls twice
});

/* ================================================================ */
// Example 1: Simple server logging
/* ================================================================ */
function simpleServerLog() {
  // This sends log to APEX process LOG_ENTRY with parameters:
  // x01: level, x02: text, x03: module, x04: extra (JSON)
  // x05: timestamp, x06: user, x07: page, x08: session
  
  namespace.logger.logServer('User action logged', 'UserActivity', {
    action: 'form_submit',
    page: 'P10_EMPLOYEE_FORM',
    recordId: 12345
  });
}

/* ================================================================ */
// Example 2: Critical business events
/* ================================================================ */
function logBusinessEvents() {
  var logger = namespace.logger.createModuleLogger('OrderModule');
  
  // Log order creation to database
  logger.logServer('Order created', {
    orderId: 'ORD-98765',
    customerId: 'CUST-123',
    amount: 299.99,
    status: 'pending'
  });
  
  // Log order status change
  logger.logServer('Order status changed', {
    orderId: 'ORD-98765',
    oldStatus: 'pending',
    newStatus: 'shipped',
    timestamp: new Date().toISOString()
  });
}

/* ================================================================ */
// Example 3: Error tracking
/* ================================================================ */
function logErrorsToServer() {
  var logger = namespace.logger.createModuleLogger('ErrorTracking');
  
  try {
    // Simulate error
    throw new Error('Database connection failed');
  } catch (error) {
    // Log error to server for monitoring
    logger.logServer('Critical error occurred', {
      error: error.message,
      stack: error.stack,
      page: apex.env.APP_PAGE_ID,
      user: apex.env.APP_USER
    });
  }
}

/* ================================================================ */
// Example 4: Performance monitoring
/* ================================================================ */
function logPerformanceToServer() {
  var logger = namespace.logger.createModuleLogger('PerformanceMonitoring');
  
  logger.timeStart('report_generation');
  
  // Simulate report generation
  setTimeout(function() {
    // Send timing to server for performance tracking
    logger.timeStopServer('report_generation');
  }, 3500);
}

/* ================================================================ */
// Example 5: Audit trail
/* ================================================================ */
function logAuditTrail() {
  var logger = namespace.logger.createModuleLogger('AuditTrail');
  
  // Log data changes for audit
  logger.logServer('Employee record updated', {
    recordId: 'EMP-456',
    changedFields: ['salary', 'department'],
    oldValues: { salary: 50000, department: 'IT' },
    newValues: { salary: 55000, department: 'Engineering' },
    changedBy: apex.env.APP_USER,
    timestamp: new Date().toISOString()
  });
}

/* ================================================================ */
// Example 6: Fallback behavior when server fails
/* ================================================================ */
function serverFallbackExample() {
  // The logger automatically handles server failures:
  // 1. Retries based on retryCount config
  // 2. Falls back to console logging
  // 3. Continues without breaking your app
  
  namespace.logger.logServer('This will retry if server fails', 'Resilience', {
    testMode: true
  });
  
  // Check console for: "Logger server failed, using console fallback"
}

/* ================================================================ */
// Example 7: APEX Dynamic Action integration
/* ================================================================ */
// Use this in APEX Dynamic Action > Execute JavaScript Code:
/*
function logDynamicAction() {
  var logger = namespace.logger.createModuleLogger('DynamicAction');
  
  // Log the dynamic action execution
  logger.logServer('Dynamic action executed', {
    actionName: this.action.action,
    triggeringElement: this.triggeringElement.id,
    browserEvent: this.browserEvent.type,
    data: this.data || {}
  });
}
*/

/* ================================================================ */
// Run examples (requires APEX environment with LOG_ENTRY process)
/* ================================================================ */
// simpleServerLog();
// logBusinessEvents();
// logErrorsToServer();
// logPerformanceToServer();
// logAuditTrail();
// serverFallbackExample();
