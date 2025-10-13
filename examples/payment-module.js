// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module paymentModule
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 * @description Payment processing module with integrated logging
 */
namespace.paymentModule = (function (namespace, $, undefined) {
  'use strict';

  // ========================================================================
  // MODULE LOGGER SETUP
  // ========================================================================
  
  // Create module-specific logger (PaymentModule becomes the scope automatically)
  var logger = namespace.logger.createModuleLogger('PaymentModule');
  
  // Set persistent extra data for all payment logs
  logger.setExtra({ 
    module: 'payment-processing',
    version: '2.1.0'
  });

  // ========================================================================
  // BUSINESS LOGIC FUNCTIONS
  // ========================================================================

  /* ================================================================ */
  /**
   * Process payment transaction
   * @param {Object} paymentData - Payment information
   * @returns {Promise} - Payment result
   */
  var processPayment = function(paymentData) {
    // Console logging for development
    logger.log("Payment processing started", { 
      orderId: paymentData.orderId,
      amount: paymentData.amount 
    });
    
    return new Promise(function(resolve, reject) {
      try {
        // Start timing for performance monitoring
        logger.timeStart("payment-processing");
        
        // Validate payment data
        var validation = validatePaymentData(paymentData);
        if (!validation.isValid) {
          logger.error("Payment validation failed", { 
            errors: validation.errors,
            orderId: paymentData.orderId 
          });
          reject(new Error("Invalid payment data"));
          return;
        }
        
        // Simulate payment processing
        setTimeout(function() {
          // Stop timing and log to server (for performance monitoring)
          logger.timeStopServer("payment-processing");
          
          // Log successful payment to server (for business monitoring)
          logger.logServer("Payment processed successfully", { 
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            method: paymentData.method,
            timestamp: new Date().toISOString()
          });
          
          resolve({
            success: true,
            transactionId: "TXN_" + Date.now(),
            orderId: paymentData.orderId
          });
          
        }, 2000);
        
      } catch (error) {
        // Log error to server (for production monitoring)
        logger.logServer("Payment processing failed", { 
          orderId: paymentData.orderId,
          error: error.message,
          stack: error.stack
        }, "ERROR");
        
        reject(error);
      }
    });
  };

  /* ================================================================ */
  /**
   * Validate payment data
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} - Validation result
   */
  var validatePaymentData = function(paymentData) {
    logger.log("Starting payment validation");
    
    var errors = [];
    
    if (!paymentData.orderId) {
      logger.warning("Order ID is missing");
      errors.push("Order ID is required");
    }
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      logger.warning("Invalid amount", { amount: paymentData.amount });
      errors.push("Valid amount is required");
    }
    
    if (!paymentData.method) {
      logger.warning("Payment method is missing");
      errors.push("Payment method is required");
    }
    
    var result = {
      isValid: errors.length === 0,
      errors: errors
    };
    
    if (result.isValid) {
      logger.log("Payment validation passed");
    } else {
      logger.error("Payment validation failed", { errors: errors });
    }
    
    return result;
  };

  /* ================================================================ */
  /**
   * Refund payment transaction
   * @param {string} transactionId - Transaction to refund
   * @param {number} amount - Refund amount
   * @returns {Promise} - Refund result
   */
  var refundPayment = function(transactionId, amount) {
    logger.log("Refund processing started", { 
      transactionId: transactionId,
      amount: amount 
    });
    
    return new Promise(function(resolve, reject) {
      try {
        // Start timing
        logger.timeStart("refund-processing");
        
        // Simulate refund processing
        setTimeout(function() {
          // Stop timing and log to server
          logger.timeStopServer("refund-processing");
          
          // Log refund to server (important business event)
          logger.logServer("Refund processed successfully", { 
            originalTransactionId: transactionId,
            refundAmount: amount,
            refundId: "REF_" + Date.now(),
            timestamp: new Date().toISOString()
          });
          
          resolve({
            success: true,
            refundId: "REF_" + Date.now(),
            originalTransactionId: transactionId
          });
          
        }, 1500);
        
      } catch (error) {
        logger.logServer("Refund processing failed", { 
          transactionId: transactionId,
          error: error.message
        }, "ERROR");
        
        reject(error);
      }
    });
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    // Public functions
    processPayment: processPayment,
    refundPayment: refundPayment,
    validatePaymentData: validatePaymentData
  };

})(namespace, window.jQuery || window.$ || function () {});

// ========================================================================
// USAGE EXAMPLE
// ========================================================================

/*

// Enable console logging for development
namespace.logger.enableConsole(true);

// Use the payment module
var paymentData = {
  orderId: "ORD_123",
  amount: 99.99,
  method: "credit_card"
};

namespace.paymentModule.processPayment(paymentData)
  .then(function(result) {
    console.log("Payment successful:", result);
  })
  .catch(function(error) {
    console.error("Payment failed:", error);
  });

// Console output will show:
// [PaymentModule] Payment processing started {orderId: "ORD_123", amount: 99.99}
// [PaymentModule] Starting payment validation
// [PaymentModule] Payment validation passed
// [PaymentModule] Payment processing completed in 2000.00ms
// [PaymentModule] Payment processed successfully {orderId: "ORD_123", amount: 99.99, ...}

// Database will receive:
// - Performance timing data for "payment-processing"
// - Business event: "Payment processed successfully"

*/