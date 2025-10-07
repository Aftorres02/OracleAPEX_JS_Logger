# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with organized folders
- Comprehensive API documentation
- Configuration guide with environment-specific settings
- Oracle APEX integration guide with Oracle Logger PL/SQL API integration
- Contributing guidelines
- MIT License
- Package.json with proper metadata
- Support for Oracle Logger PL/SQL API integration
- SQL queries for viewing and maintaining logs
- Prerequisites section for Oracle Logger installation

### Changed
- Reorganized project structure for better maintainability
- Simplified README.md following community standards
- Moved example file to dedicated examples folder
- Updated documentation to be more community-friendly
- **BREAKING**: Server-side integration now uses Oracle Logger PL/SQL API instead of custom tables
- Updated APEX process to use `apex.server.process()` instead of direct AJAX
- Enhanced server-side process to map JavaScript log levels to Oracle Logger constants

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Oracle APEX JS Logger
- Core logging functionality with Oracle Logger compatibility
- Multiple log levels (ERROR, WARNING, INFO, DEBUG, TIMING, etc.)
- Performance timing functions
- Context management with push/pop functionality
- Buffer management for server-side logging
- APEX integration with automatic context detection
- Environment-based configuration
- Console and server logging options
- Utility functions for formatting and data handling
- Comprehensive examples and usage patterns

### Features
- **Logger Module**: Main logging functionality
  - `log()`, `error()`, `warning()`, `info()`, `debug()` methods
  - `timeStart()` and `timeStop()` for performance timing
  - `setLevel()`, `getLevel()` for level management
  - `configure()` for runtime configuration
  - `flush()`, `clearBuffer()`, `getBufferSize()` for buffer management

- **Logger Config Module**: Configuration management
  - Environment-specific configurations (development, testing, production)
  - Log level validation and management
  - APEX configuration keys
  - Server and console configuration options

- **Logger Utils Module**: Utility functions
  - Timestamp formatting
  - Browser and performance information
  - Context management (push/pop)
  - Message sanitization
  - Unique ID generation
  - Advanced timing functions

### Technical Details
- Compatible with Oracle APEX 20.1+
- Modern JavaScript (ES6+) with fallbacks
- Namespace-based architecture to avoid conflicts
- Graceful degradation when APEX is not available
- Comprehensive error handling
- No external dependencies (except jQuery in APEX)

### Documentation
- Complete API reference
- Configuration guide with best practices
- Oracle APEX integration guide
- Usage examples and patterns
- Troubleshooting guide

---

## Version History

### v1.0.0 (Initial Release)
- Complete logging library implementation
- Oracle Logger API compatibility
- APEX integration features
- Comprehensive documentation
- Community-ready project structure

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
