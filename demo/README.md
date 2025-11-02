# Demo - Full Reference Implementation

This folder contains complete, production-ready modules demonstrating best practices for using Oracle APEX JS Logger in real-world applications.

## Files

- **payment-module.js** - Complete payment processing module with comprehensive logging
- **demo.html** - Interactive demo page to test the payment module

## Features Demonstrated

- Module logger pattern with persistent context
- Console-only vs server logging
- Performance timing with `timeStart()`/`timeStop()`
- Error handling and validation logging
- Business event logging for audit trails

## Running the Demo

1. Open `demo.html` in your browser
2. Or include `payment-module.js` in your APEX application

## Using in APEX

```html
<!-- Upload to Static Application Files -->
#APP_FILES#js/logger-config.js
#APP_FILES#js/logger.js
#APP_FILES#js/payment-module.js
```

```javascript
// Configure for your environment
namespace.loggerConfig.configure({
  level: 'INFORMATION',
  enableServer: true
});

// Use the payment module
var paymentData = {
  orderId: "ORD-123",
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
```

## Note

This is a reference implementation. Adapt the patterns to your specific needs.
