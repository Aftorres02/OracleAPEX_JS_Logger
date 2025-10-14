// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module ticketUtilities
 * ==========================================================================
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */
namespace.ticketUtilities = (function (namespace, $, undefined) {
  'use strict';

  // Create module-specific debug logger
  var log = namespace.utilities.createDebugLogger('TicketUtilities');





  /* ================================================================ */
  /**
   * Copy text to clipboard with modern API
   * @param {string} text - The text to copy
   * @param {Event} event - The click event (optional, for visual feedback)
   * @returns {Promise<boolean>} - Success status
   */
  var copyToClipboard = function (text, event) {
    log('Copying to clipboard:', text);

    var feedbackOptions = {
      buttonSelector: '.copy-ticket-btn'
    };

    namespace.utilities.copyToClipboard(text, event, feedbackOptions);
  };





  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    copyToClipboard: copyToClipboard
  };

})(namespace, apex.jQuery);
