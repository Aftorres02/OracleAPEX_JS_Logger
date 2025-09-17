# Contributing Guidelines

Thank you for your interest in contributing to the Oracle APEX JS Logger project! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 12.0.0 or higher
- Git
- A text editor or IDE
- Basic knowledge of JavaScript and Oracle APEX

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/oracle-apex-js-logger.git
   cd oracle-apex-js-logger
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Project Structure

```
oracle-apex-js-logger/
├── src/                    # Source files
│   ├── logger.js          # Main logger class
│   ├── logger-config.js   # Configuration management
│   └── logger-utils.js    # Utility functions
├── examples/              # Usage examples
├── docs/                  # Documentation
├── tests/                 # Test files (future)
├── README.md              # Main documentation
├── package.json           # NPM package configuration
└── LICENSE                # MIT License
```

---

## Development Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check the issue tracker for bugs and feature requests
- Comment on the issue to indicate you're working on it

### 2. Make Changes

- Follow the coding standards outlined below
- Write clear, readable code
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

- Test in different browsers
- Test with different APEX versions
- Verify all functionality works as expected

### 4. Submit a Pull Request

- Create a clear, descriptive title
- Provide a detailed description of changes
- Reference any related issues
- Include screenshots if applicable

---

## Coding Standards

### JavaScript Standards

#### General Guidelines

- Use **2 spaces** for indentation (no tabs)
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Use **PascalCase** for constructors
- Use **UPPER_CASE** for constants

#### Code Style

```javascript
// Good
var userName = 'john_doe';
var MAX_RETRY_COUNT = 3;

function processUserData(userData) {
  if (!userData) {
    return null;
  }
  
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email
  };
}

// Bad
var user_name = "john_doe";
var maxRetryCount = 3;

function processUserData(userData){
if(!userData)return null;
return {id:userData.id,name:userData.name,email:userData.email};
}
```

#### Function Documentation

```javascript
/**
 * Process user data and return formatted result
 * @param {Object} userData - The user data object
 * @param {string} userData.id - User ID
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @returns {Object|null} - Formatted user data or null
 */
function processUserData(userData) {
  // Implementation
}
```

#### Error Handling

```javascript
// Good
try {
  var result = riskyOperation();
  namespace.logger.info('Operation successful', 'operation');
  return result;
} catch (error) {
  namespace.logger.error('Operation failed', 'operation', {
    error: error.message,
    stack: error.stack
  });
  throw error;
}

// Bad
var result = riskyOperation(); // No error handling
```

### APEX Integration Standards

#### Namespace Usage

```javascript
// Good - Use namespace consistently
namespace.logger.info('Message', 'scope');
namespace.loggerConfig.getEnvConfig('production');
namespace.loggerUtils.formatTimestamp(new Date());

// Bad - Direct access
logger.info('Message', 'scope');
```

#### APEX Context

```javascript
// Good - Check APEX availability
if (typeof apex !== 'undefined' && apex.env) {
  var context = {
    user: apex.env.APP_USER,
    page: apex.env.APP_PAGE_ID,
    session: apex.env.APP_SESSION
  };
} else {
  var context = {
    user: 'UNKNOWN',
    page: 0,
    session: 0
  };
}

// Bad - Assume APEX is available
var context = {
  user: apex.env.APP_USER,
  page: apex.env.APP_PAGE_ID,
  session: apex.env.APP_SESSION
};
```

### Documentation Standards

#### README Updates

- Keep the README simple and focused
- Update installation instructions if needed
- Add new features to the features list
- Update examples if applicable

#### API Documentation

- Document all public methods
- Include parameter types and descriptions
- Include return value descriptions
- Provide usage examples

#### Code Comments

```javascript
/**
 * Check if a log level should be logged based on current configuration
 * @param {string|number} level - The log level to check
 * @returns {boolean} - Whether the level should be logged
 */
var _shouldLog = function(level) {
  var levelNum = typeof level === 'string' ? LOG_LEVELS[level.toUpperCase()] : level;
  var configNum = LOG_LEVELS[config.level.toUpperCase()];
  return levelNum <= configNum;
};
```

---

## Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Follow coding standards**
4. **Write clear commit messages**

### Commit Message Format

```
type(scope): brief description

Detailed description of changes

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(logger): add context management functions

Add pushContext and popContext functions to loggerUtils module
for better context management in logging.

Fixes #45
```

```
fix(config): handle invalid log levels gracefully

Add validation for log levels in setLevel function to prevent
errors when invalid levels are provided.

Fixes #67
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested with APEX 20.1
- [ ] Tested with APEX 21.1
- [ ] Tested with APEX 22.1

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Added tests for new functionality (if applicable)

## Related Issues
Fixes #123
```

---

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details**:
   - Browser and version
   - APEX version
   - Operating system
5. **Code samples** if applicable
6. **Screenshots** if helpful

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed implementation** (if you have ideas)
4. **Alternatives considered**

### Issue Template

```markdown
## Bug Report / Feature Request

### Description
[Clear description of the issue or feature request]

### Steps to Reproduce (for bugs)
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What you expected to happen]

### Actual Behavior
[What actually happened]

### Environment
- Browser: [e.g., Chrome 91]
- APEX Version: [e.g., 21.1]
- OS: [e.g., Windows 10]

### Additional Context
[Any other relevant information]
```

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Test changes
# ... run tests ...

# Commit changes
git add .
git commit -m "feat(logger): add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request
```

### 2. Bug Fixes

```bash
# Create bug fix branch
git checkout -b fix/bug-description

# Make changes
# ... edit files ...

# Test fix
# ... run tests ...

# Commit changes
git add .
git commit -m "fix(logger): fix bug description"

# Push branch
git push origin fix/bug-description

# Create pull request
```

### 3. Documentation Updates

```bash
# Create docs branch
git checkout -b docs/update-documentation

# Make changes
# ... edit documentation ...

# Commit changes
git add .
git commit -m "docs: update documentation"

# Push branch
git push origin docs/update-documentation

# Create pull request
```

---

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number updated
- [ ] CHANGELOG updated
- [ ] Release notes prepared
- [ ] Tag created
- [ ] Package published (if applicable)

---

## Getting Help

If you need help with contributing:

1. **Check existing issues** for similar problems
2. **Read the documentation** in the `docs/` folder
3. **Ask questions** in GitHub Discussions
4. **Contact maintainers** if needed

---

## Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for each release
- **GitHub contributors** page

Thank you for contributing to the Oracle APEX JS Logger project! 🎉
