# Oracle APEX JS Logger: Logging Made Simple for Production Apps

If you build Oracle APEX applications, you know the pain: JavaScript errors happen silently in production. Users report "the page doesn't work" but you have no way to see what's happening in their browser. Regular `console.log()` only works when DevTools is open—and users don't have that.

**Meet Oracle APEX JS Logger**—a simple, powerful logging library designed specifically for APEX that gives you visibility into production JavaScript, just like you have with PL/SQL server-side logging.

## The Problem: Invisible JavaScript

Your typical Oracle APEX app has two worlds:

1. **Server-side (PL/SQL)** — You have Oracle Logger, DBMS_OUTPUT, full visibility into what's happening
2. **Client-side (JavaScript)** — Silent failures, no trace when things go wrong

This creates a frustrating debugging experience:
- A user reports an issue, but you can't reproduce it
- You see the error in DevTools, but production users don't have it open
- No audit trail for user actions
- No performance metrics for slow operations
- Sensitive data might accidentally get logged

## The Solution: Structured Logging for APEX

Oracle APEX JS Logger bridges that gap. It's a lightweight library that provides:

✅ **Colored console output** for development  
✅ **Database storage** for production monitoring  
✅ **Automatic data masking** for sensitive fields  
✅ **Performance timing** to find bottlenecks  
✅ **Module-scoped loggers** for clean organization  
✅ **Environment-aware** configuration  
✅ **Graceful fallbacks** if server logging fails  

## Getting Started in 2 Steps

### Step 1: Add the Files

Upload the library files to your APEX application:

```html
#APP_FILES#js/logger-config.js
#APP_FILES#js/logger.js
```

### Step 2: Start Logging

```javascript
// Basic usage
namespace.logger.log('Application started', 'AppMain');

// With data
namespace.logger.log('User action', 'UI', {
  action: 'button_click',
  pageId: apex.env.APP_PAGE_ID
});

// For production events
namespace.logger.logServer('Payment processed', 'Payments', {
  orderId: 'ORD-123',
  amount: 99.99
});
```

That's it! No configuration needed to get started.

## Core Features with Examples

### 1. Three Log Levels with Colors

The logger provides three log levels that automatically output in different colors:

**Information (Blue)**
```javascript
namespace.logger.log('User logged in', 'Auth', { userId: 123 });
```

**Warning (Orange)**
```javascript
namespace.logger.warning('API slow', 'Network', { responseTime: 3500 });
```

**Error (Red)**
```javascript
namespace.logger.error('Validation failed', 'Form', { field: 'email' });
```

### 2. Automatic Data Masking

Security is built-in. Sensitive fields are automatically masked:

```javascript
namespace.logger.log('Login attempt', 'Auth', {
  username: 'john.doe',
  password: 'secret123',  // Automatically becomes: ***MASKED***
  token: 'abc123'         // Automatically becomes: ***MASKED***
});
```

### 3. Performance Timing

Measure how long operations take:

```javascript
// Start timing
namespace.logger.timeStart('page-load');

// ... do work ...

// Stop and log elapsed time
var elapsed = namespace.logger.timeStop('page-load', 'Performance');
// Output: "page-load completed in 125.43ms"
```

### 4. Module-Scoped Loggers

Create a logger for your module with persistent context:

```javascript
// Create a module logger
var logger = namespace.logger.createModuleLogger('PaymentModule');

// Set context that applies to all logs from this module
logger.setExtra({ version: '2.0', feature: 'checkout' });

// Now all logs automatically include the context
logger.log('Processing payment', { amount: 99.99 });
logger.error('Payment failed', { reason: 'insufficient_funds' });

// Clear context when done
logger.clearExtra();
```

### 5. Console vs Server Logging

Two logging modes for different needs:

**Console-only** (development)
```javascript
namespace.logger.log('Debug info', 'MyModule', { data: 'value' });
```

**Console + Database** (production)
```javascript
namespace.logger.logServer('Important event', 'Business', { 
  orderId: 'ORD-123',
  action: 'order_shipped' 
});
```

### 6. Environment-Based Configuration

Configure once, behave differently per environment:

```javascript
// Development: verbose console output
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.loggerConfig.configure(devConfig);

// Production: errors only, with server logging
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.loggerConfig.configure(prodConfig);
```

## Real-World Example: Payment Module

Here's how a complete module looks with integrated logging:

```javascript
namespace.paymentModule = (function(namespace) {
  'use strict';
  
  // Create module logger
  var logger = namespace.logger.createModuleLogger('PaymentModule');
  logger.setExtra({ version: '2.1.0' });

  var processPayment = function(paymentData) {
    // Start timing
    logger.timeStart('payment-processing');
    
    // Log with context
    logger.log('Payment started', {
      orderId: paymentData.orderId,
      amount: paymentData.amount
    });
    
    try {
      // ... process payment ...
      
      // Stop timing and log to server for monitoring
      var elapsed = logger.timeStop('payment-processing');
      
      // Log business event to database
      logger.logServer('Payment successful', {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        elapsed: elapsed
      });
      
      return { success: true };
    } catch (error) {
      // Log error to server for production monitoring
      logger.logServer('Payment failed', {
        error: error.message,
        orderId: paymentData.orderId
      });
      
      throw error;
    }
  };
  
  return { processPayment: processPayment };
})(namespace);
```

## Configuration Made Simple

Default configuration works out of the box, but you can customize everything:

```javascript
namespace.loggerConfig.configure({
  // Control what shows in console
  level: 'WARNING',  // OFF | ERROR | WARNING | INFORMATION
  
  // Enable database logging via APEX process
  enableServer: true,
  
  // Retry failed server calls
  retryCount: 2,
  
  // Security
  enableDataMasking: true,
  sensitiveFields: ['password', 'token', 'ssn', 'credit_card'],
  
  // Limits
  maxDataSize: 5000  // Prevent huge payloads
});
```

## Production Setup

To store logs in your database, create an APEX process named `JS_LOGGER`:

```sql
BEGIN
  DECLARE
    v_level NUMBER;
  BEGIN
    CASE :x01
      WHEN 'ERROR'    THEN v_level := 2;
      WHEN 'WARNING'  THEN v_level := 4;
      WHEN 'INFORMATION' THEN v_level := 8;
      ELSE v_level := 8;
    END CASE;
    
    logger.log(
      p_text => :x02,
      p_module => :x03,
      p_level => v_level,
      p_extra => :x04
    );
  END;
END;
```

The logger automatically sends 8 parameters (level, text, module, extra, timestamp, user, page, session) to this process.

## Why Use This Library?

**Simple:** Just two files, no dependencies  
**Lightweight:** ~10KB minified, zero overhead when disabled  
**Production-ready:** Automatic retries, graceful fallbacks  
**Secure:** Built-in data masking  
**Organized:** Module-scoped loggers keep logs clean  
**Documented:** Examples for every feature  
**Open source:** MIT licensed  

## Learn More

- **Examples:** 5 focused examples covering all features
- **Demo:** Complete payment module implementation
- **GitHub:** Full source code and documentation

---

**Oracle APEX JS Logger** — Bring production-grade logging to your client-side JavaScript. Never lose visibility into what's happening in your users' browsers again.

