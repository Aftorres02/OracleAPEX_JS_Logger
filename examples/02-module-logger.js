/**
 * ==========================================================================
 * Example 2: Module Logger Pattern
 * ==========================================================================
 * Demonstrates creating scoped loggers for different modules
 */

// Initialize namespace
var namespace = namespace || {};

// Configure logger
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableConsole: true
});

/* ================================================================ */
// Example Module 1: Shopping Cart
/* ================================================================ */
namespace.cartModule = (function (namespace) {
  'use strict';

  // Create module-scoped logger (always name it "logger")
  var logger = namespace.logger.createModuleLogger('CartModule');
  
  // Set persistent context for all cart logs
  logger.setExtra({ 
    module: 'shopping-cart',
    version: '1.0'
  });

  var addItem = function(productId, quantity) {
    logger.log('Item added to cart', { productId: productId, quantity: quantity });
  };

  var removeItem = function(productId) {
    logger.warning('Item removed from cart', { productId: productId });
  };

  var checkout = function() {
    logger.log('Checkout initiated');
    // Simulate error
    logger.error('Payment gateway unavailable');
  };

  return {
    addItem: addItem,
    removeItem: removeItem,
    checkout: checkout
  };
})(namespace);

/* ================================================================ */
// Example Module 2: User Authentication
/* ================================================================ */
namespace.authModule = (function (namespace) {
  'use strict';

  // Create module-scoped logger
  var logger = namespace.logger.createModuleLogger('AuthModule');
  logger.setExtra({ feature: 'authentication' });

  var login = function(username) {
    logger.log('Login attempt started', { username: username });
  };

  var logout = function(username) {
    logger.log('User logged out', { username: username });
  };

  return {
    login: login,
    logout: logout
  };
})(namespace);

/* ================================================================ */
// Usage
/* ================================================================ */
namespace.cartModule.addItem('PROD-123', 2);
namespace.cartModule.removeItem('PROD-456');
namespace.cartModule.checkout();

namespace.authModule.login('john.doe');
namespace.authModule.logout('john.doe');
