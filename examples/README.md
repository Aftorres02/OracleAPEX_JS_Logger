# Examples

Simple, focused examples demonstrating specific features of Oracle APEX JS Logger.

## How to run

1. Open `index.html` in your browser
2. Or include individual example files in your APEX application

## Available examples

- **01-basic-logging.js** - Simple log, warning, and error calls
- **02-module-logger.js** - Module-scoped logger pattern
- **03-configuration.js** - Different configuration scenarios
- **04-timing.js** - Performance timing measurements
- **05-server-logging.js** - Server integration with APEX

## Using in APEX

Copy the example code into your APEX page JavaScript or upload as static files:

```html
<!-- In APEX Page Properties > JavaScript > File URLs -->
#APP_FILES#js/logger-config.js
#APP_FILES#js/logger-utils.js
#APP_FILES#js/logger.js
```

Then use the example patterns in your page JavaScript or dynamic actions.
