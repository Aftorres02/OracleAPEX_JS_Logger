# Tests

This folder contains both manual and automated tests.

## Manual Testing

**logger-test.html** - Interactive manual test page

Run the manual test page:
```bash
open test/logger-test.html
```

Features tested:
- ✓ Basic logging (log, error, warning)
- ✓ Log level configuration
- ✓ Module logger API
- ✓ Data sanitization (sensitive field masking)
- ✓ Performance timing
- ✓ Configuration validation
- ✓ Server error handling and fallback
- ✓ Circular reference handling

## Automated Tests

**Status: To Be Implemented**

### Planned Test Framework

- **Jest** or **Mocha** for unit testing
- **QUnit** or **Jasmine** for browser-based tests
- Code coverage reports with Istanbul/NYC

### Planned Test Files

```
test/
├── logger-test.html        # Manual test page (current)
├── logger.test.js          # Unit tests for logger.js
├── logger-config.test.js   # Unit tests for logger-config.js
├── logger-utils.test.js    # Unit tests for logger-utils.js
└── integration.test.js     # Integration tests
```

### Running Tests (Future)

```bash
npm install
npm test
npm run test:coverage
```

## Contributing

When adding automated tests, ensure:
1. Each test is isolated and independent
2. Mock external dependencies (APEX, console)
3. Test both success and failure paths
4. Include edge cases
5. Maintain >80% code coverage
