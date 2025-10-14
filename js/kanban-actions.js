// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module kanbanActions
 * ==========================================================================
 */
// Create object for kanban actions
namespace.kanbanActions = (function(namespace, $, undefined) {
  'use strict';

  // Flag to prevent multiple initializations
  var isInitialized = false;
  var MODULE_NAME = 'KanbanActions';
  
  // Flag to prevent multiple modal openings
  var isModalOpening = false;

  // Create module-specific debug logger
  var log = namespace.utilities.createDebugLogger(MODULE_NAME);

  /* ================================================================ */
  /**
   * Initialize kanban event listeners
   */
  var init = function() {
    if (isInitialized) {
      log('Already initialized, skipping...');
      return;
    }

    _setupEventListeners();
    isInitialized = true;
    log('Kanban actions initialized');
  };

  /* ================================================================ */
  /**
   * Setup event listeners for the kanban board
   */
  var _setupEventListeners = function() {
    log('Setting up event listeners');
    // Event delegation for dynamic elements
    document.addEventListener('click', function(event) {
      // Check click on ticket counter
      if (event.target.classList.contains('ticket-count-5a') ||
          event.target.closest('.ticket-count-5a')) {
        event.preventDefault();
        _handleTicketCountClick(event);
      }

      // Check click on ticket creation icon
      if (event.target.classList.contains('ticket-creation-5a') ||
          event.target.closest('.ticket-creation-5a')) {
        event.preventDefault();
        _handleTicketCreationClick(event);
      }

      // Check click on ticket number
      if (event.target.classList.contains('ticket-number') ||
          event.target.closest('.ticket-number')) {
        event.preventDefault();
        _handleTicketNumberClick(event);
      }
    });
  };





  /* ================================================================ */
  /**
   * Handle click on ticket counter
   * @param {Event} event - The click event
   */
  var _handleTicketCountClick = function(event) {
    const columnId = event.target.closest('.column-5a').getAttribute('data-column-id');
    const columnName = event.target.closest('.column-5a').querySelector('.column-title-5a').textContent;

    log('Ticket counter clicked for column:', columnId, columnName);

    // Show ticket details or statistics
    showTicketDetails(columnId, columnName);
  };






  /* ================================================================ */
  /**
   * Handle click on ticket creation icon
   * @param {Event} event - The click event
   */
  var _handleTicketCreationClick = function(event) {
    const columnId = event.target.closest('.column-5a').getAttribute('data-column-id');
    const columnName = event.target.closest('.column-5a').querySelector('.column-title-5a').textContent;

    log('Creating new ticket for column:', columnId, columnName);

    // Open modal or form to create new ticket
    addTicket(columnId, columnName, event);
  };





  /* ================================================================ */
  /**
   * Handle click on ticket number
   * @param {Event} event - The click event
   */
  var _handleTicketNumberClick = function(event) {
    const ticketElement = event.target.closest('.ticket-card');
    const ticketId = ticketElement.getAttribute('data-ticket-id');
    const ticketNumber = event.target.textContent;

    // Open ticket details or navigate to ticket page
    openTicketDetails(ticketId, ticketNumber);
  };





  /* ================================================================ */
  /**
   * Show ticket details or statistics for a column
   * @param {string} columnId - The column ID
   * @param {string} columnName - The column name
   */
  var showTicketDetails = function(columnId, columnName) {
    // Implement your logic here to show ticket details
    // For example:
    // - Show column statistics
    // - Filter tickets by status
    // - Show time summary

    log(`Showing details for column: ${columnName} (ID: ${columnId})`);

    // Example: Show statistics
    // apex.message.showPageSuccess(`Showing details for ${columnName}`);
  };






  /* ================================================================ */
  /**
   * Show a modal or form to add a new ticket
   * @param {string} columnId - The column ID
   * @param {string} columnName - The column name
   */
  var addTicket = function(columnId, columnName, event) {
    // Prevent multiple modal openings
    if (isModalOpening) {
      log('Modal already opening, ignoring duplicate request');
      return;
    }

    isModalOpening = true;
    log(`Adding ticket to column: ${columnName} (ID: ${columnId})`);


    var customParams = ['ADD_TICKET_MODAL_TITLE', columnId];

    apex.server.process(
      "get_url_ajax",
      {
        x01: 10300,
        x02: 1010,
        x07: 'P1010_BOARD_COLUMN_ID', //items
        x08: columnId, // values
        f01: customParams
      },
      {
        success: function(pData) {

          log(`pData: ${pData}`);

          if (pData.success) {

            // Get the triggering element for the dialog
            var triggeringElement = event.target.closest('.ticket-creation-5a');

            // Open modal using dialog instead of redirect
            apex.navigation.dialog(
              pData.url,
              {
                title: pData.modal_title,
                //height: 600,
                //width: 800,
                modal: true,
                resizable: true
              },
              '',
              $(triggeringElement)
            );

            // Listen for dialog close event to refresh only the specific column
            // Create cleanup function that auto-removes itself after execution
            var cleanupListener = function() {
              log('Modal closed, updating column:', columnId);
              namespace.kanbanBusiness.getTicketsForColumn(columnId, function(tickets) {
                namespace.kanban.renderTicketsForColumn(columnId, tickets, true);
              });
              // Reset the modal opening flag
              isModalOpening = false;
              // Auto-remove this listener after execution
              //$(triggeringElement).off('apexafterclosedialog', cleanupListener);
              $(triggeringElement).off('apexafterclosecanceldialog', cleanupListener);
            };

            // Add listener with reference to the cleanup function
            // Use apexafterclosecanceldialog to capture ALL dialog closure scenarios
            // including Escape key and X button clicks
            $(triggeringElement).on('apexafterclosecanceldialog', cleanupListener);
          } else {
            log(`Error adding ticket to column: ${columnName} (ID: ${columnId})`);
            // Reset the flag on error
            isModalOpening = false;
          }
        },
        error: function() {
          log(`AJAX error when adding ticket to column: ${columnName} (ID: ${columnId})`);
          // Reset the flag on error
          isModalOpening = false;
        }
      }
    );
  };





  /* ================================================================ */
  /**
   * Open ticket details or navigate to ticket page
   * @param {string} ticketId - The ticket ID
   * @param {string} ticketNumber - The ticket number
   */
  var openTicketDetails = function(ticketId, ticketNumber) {
    // Implement your logic here
    // For example:
    // - Navigate to ticket details page
    // - Open ticket details modal
    // - Show ticket information

    log(`Opening ticket details for: ${ticketNumber} (ID: ${ticketId})`);
  };








  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    // Core functions
    init: init,
    showTicketDetails: showTicketDetails,
    addTicket: addTicket,
    openTicketDetails: openTicketDetails
  };

})(namespace, window.jQuery || window.$ || function(){});


