// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module utilities
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */
// Create object for utility functions
namespace.utilities = (function (namespace, $, undefined) {
    'use strict';

    // Debug configuration - Set to true to enable detailed logging
    var debugMode = false;





    /* ================================================================ */
    /**
     * Debug logging function - only logs when debugMode is true
     * @author Angel O. Flores Torres
     * @created 2024
     *
     * @param {string} message - The message to log
     * @param {...any} args - Additional arguments to log
     */
    var log = function (message, ...args) {
        if (debugMode) {
            console.log(`[Utilities]`, message, ...args);
        }
    };





    /* ================================================================ */
    /**
     * Set debug mode globally
     * @author Angel O. Flores Torres
     * @created 2024
     *
     * @param {boolean} enabled - Whether to enable debug mode
     */
    var setDebugMode = function (enabled) {
        debugMode = enabled;
        console.log('Utilities', 'Debug mode ' + (enabled ? 'enabled' : 'disabled'));
    };





    /* ================================================================ */
    /**
     * Get debug mode status
     * @returns {boolean} - Current debug mode status
     */
    var getDebugMode = function () {
        return debugMode;
    };





    /* ================================================================ */
    /**
     * Create a debug logger function for a specific module
     * @param {string} moduleName - The module name for context
     * @returns {Function} - Pre-configured debug log function
     */
    var createDebugLogger = function (moduleName) {
        return function (message, ...args) {
            if (debugMode) {
                console.log(`[${moduleName}]`, message, ...args);
            }
        };
    };





    /* ================================================================ */
    /**
     * Copy text to clipboard with modern API
     * @param {string} text - The text to copy
     * @param {Event} event - The click event (optional, for visual feedback)
     * @param {string} feedbackOptions - The options for the copy to clipboard
     * @returns {Promise<boolean>} - Success status
     */
    var copyToClipboard = function (text, event, feedbackOptions) {
        log('Copying to clipboard:', text);

        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(function () {
                if (event) {
                    showCopyFeedback(event, feedbackOptions);
                }
                log('Text copied successfully');
                return true;
            }).catch(function (err) {
                log('Clipboard failed:', err);
                return false;
            });
        } else {
            log('Clipboard API not supported');
            return Promise.resolve(false);
        }
    };






    /* ================================================================ */
    /**
     * Show visual feedback when copying text
     * @param {Event} event - The click event
     * @param {Object} feedbackOptions - Configuration options
     * @param {string} options.buttonSelector - CSS selector for the button (default: '.copy-btn, .copy-ticket-btn')
     * @param {string} options.iconSelector - CSS selector for the icon (default: 'i')
     * @param {string} options.successIcon - Icon class for success state (default: 'fa fa-check')
     * @param {string} options.successColor - Color for success state (default: '#28a745')
     * @param {number} options.duration - Duration in milliseconds (default: 1000)
     */
    var showCopyFeedback = function (event, feedbackOptions) {
        log('Showing copy feedback');

        // Default options
        var defaults = {
            buttonSelector: '.copy-btn, .copy-ticket-btn, [data-copy-feedback]',
            iconSelector: 'i',
            successIcon: 'fa fa-check',
            successColor: '#28a745',
            duration: 1000
        };

        // Merge options with defaults
        var config = Object.assign({}, defaults, feedbackOptions || {});

        // Find the button element
        var btn = event.target.closest(config.buttonSelector);
        if (!btn) {
            log('No button found with selector:', config.buttonSelector);
            return;
        }

        // Find the icon element
        var icon = btn.querySelector(config.iconSelector);
        if (!icon) {
            log('No icon found with selector:', config.iconSelector);
            return;
        }

        // Store original state
        var originalClass = icon.className;
        var originalColor = btn.style.color;

        // Apply success state
        icon.className = config.successIcon;
        btn.style.color = config.successColor;

        // Restore original state after duration
        setTimeout(function () {
            icon.className = originalClass;
            btn.style.color = originalColor;
        }, config.duration);
    };





    /* ================================================================ */
    /* Return public API */
    /* ================================================================ */
    return {
        // Debug functions
        log: log,
        createDebugLogger: createDebugLogger,
        setDebugMode: setDebugMode,
        getDebugMode: getDebugMode,

        // Clipboard functions
        copyToClipboard: copyToClipboard
    };

})(namespace, window.jQuery || window.$ || function () { });
