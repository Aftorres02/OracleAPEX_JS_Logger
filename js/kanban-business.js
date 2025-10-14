/*
 * ==========================================================================
 * KANBAN BUSINESS LOGIC
 * ==========================================================================
 *
 * @description Lógica de negocio para el tablero Kanban
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */

// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module kanbanBusiness
 * ==========================================================================
 */
namespace.kanbanBusiness = (function(namespace, $, undefined) {
  'use strict';

  // Configuration constants
  var CONFIG = {
    API_ENDPOINT: '/api/tickets/'
  };

  // Create module-specific debug logger
  var log = namespace.utilities.createDebugLogger('KanbanBusiness');

  /* ================================================================ */
  /**
   * Get tickets for a specific column via AJAX
   * @param {string} columnId - The column ID
   * @param {Function} callback - Callback function to handle tickets data
   */
  var getTicketsForColumn = function(columnId, callback) {
    log('Getting tickets for column:', columnId);

    apex.server.process(
      "get_tickets",
      {
        x01: columnId
      },
      {
        success: function(pData) {
          log('Response for column', columnId, ':', pData);

          if (pData.success) {
            callback(pData.tickets || []);
          }
          else {
            log('Error getting tickets for column', columnId, ':', pData.error_msg);
            callback([]);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          log('AJAX error getting tickets for column', columnId, ':', textStatus, errorThrown);
          callback([]);
        }
      }
    );
  };

  /* ================================================================ */
  /**
   * Create HTML for a ticket card
   * @param {Object} ticket - Ticket data object
   * @returns {string} - HTML string for the ticket
   */
  var createTicketHTML = function(ticket) {
    var ticketNumber = ticket.TICKET_NUMBER;

    return `
      <div class="ticket-header">
        <div class="ticket-number-container">
          <div class="ticket-number">${ticketNumber}</div>
          <span class="copy-ticket-btn" onclick="namespace.ticketUtilities.copyToClipboard('${ticketNumber}', event, 'Kanban')">
            <i class="fa fa-copy"></i>
          </span>
        </div>
        <div class="priority-tag ${ticket.PRIORITY.toLowerCase()}">${ticket.PRIORITY}</div>
      </div>
      <div class="ticket-title">${ticket.TITLE}</div>
      <div class="ticket-footer">
        <span class="assignee">${ticket.ASSIGNED_TO || 'Unassigned'}</span>
        <span class="created-date">${ticket.CREATED_DATE || '15/01/2024 14:30'}</span>
      </div>
    `;
  };

  /* ================================================================ */
  /**
   * Update ticket status in database after drag and drop
   * @param {string} ticketId - The ticket ID
   * @param {string} newColumnId - The new column ID
   * @param {Function} callback - Callback function to execute after update
   */
  var updateTicketStatus = function(ticketId, newColumnId, callback) {
    log('Updating ticket status:', ticketId, 'to column:', newColumnId);

    // Llamada AJAX a tu endpoint
    apex.server.process(
      "move_ticket_ajax",
      {
        x01: ticketId, // Ticket ID
        x02: newColumnId,  // New Column ID
      },
      {
        success: function(pData) {
          log('return ajax', pData);
          if (pData.success) {
            apex.message.showPageSuccess('Ticket moved successfully');
            log('Ticket status updated successfully');
            
            // Execute callback if provided
            if (typeof callback === 'function') {
              callback(true, pData);
            }
          } else {
            log(`Error updating ticket status: ${ticketId} to column: ${newColumnId}`);
            
            // Execute callback with error if provided
            if (typeof callback === 'function') {
              callback(false, pData);
            }
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          log('AJAX error updating ticket status:', textStatus, errorThrown);
          
          // Execute callback with error if provided
          if (typeof callback === 'function') {
            callback(false, { error: textStatus, details: errorThrown });
          }
        }
      }
    );
  };

  /* ================================================================ */
  /**
   * Show processing indicator on ticket
   * @param {string} ticketId - The ticket ID
   */
  var showProcessingIndicator = function(ticketId) {
    var ticketElement = document.querySelector('[data-ticket-id="' + ticketId + '"]');
    if (ticketElement) {
      ticketElement.classList.add('processing');
      ticketElement.setAttribute('title', 'Processing...');
    }
  };

  /* ================================================================ */
  /**
   * Hide processing indicator on ticket
   * @param {string} ticketId - The ticket ID
   */
  var hideProcessingIndicator = function(ticketId) {
    var ticketElement = document.querySelector('[data-ticket-id="' + ticketId + '"]');
    if (ticketElement) {
      ticketElement.classList.remove('processing');
      ticketElement.removeAttribute('title');
    }
  };

  /* ================================================================ */
  /**
   * Show success feedback on ticket
   * @param {string} ticketId - The ticket ID
   */
  var showSuccessFeedback = function(ticketId) {
    var ticketElement = document.querySelector('[data-ticket-id="' + ticketId + '"]');
    if (ticketElement) {
      ticketElement.classList.add('success-feedback');
      setTimeout(function() {
        ticketElement.classList.remove('success-feedback');
      }, 2000);
    }
  };

  /* ================================================================ */
  /**
   * Revert ticket position with error feedback
   * @param {string} ticketId - The ticket ID
   * @param {string} errorMessage - Error message to display
   */
  var revertTicketPosition = function(ticketId, errorMessage) {
    var ticketElement = document.querySelector('[data-ticket-id="' + ticketId + '"]');
    if (ticketElement) {
      // Add error feedback class
      ticketElement.classList.add('error-feedback');
      
      // Show error message
      apex.message.showErrors(errorMessage || 'Failed to move ticket. Reverting position.');
      
      // Trigger revert animation
      setTimeout(function() {
        ticketElement.classList.add('reverting');
        
        // After animation, remove error classes
        setTimeout(function() {
          ticketElement.classList.remove('error-feedback', 'reverting');
        }, 500);
      }, 100);
    }
  };





  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    getTicketsForColumn: getTicketsForColumn,
    createTicketHTML: createTicketHTML,
    updateTicketStatus: updateTicketStatus,
    showProcessingIndicator: showProcessingIndicator,
    hideProcessingIndicator: hideProcessingIndicator,
    showSuccessFeedback: showSuccessFeedback,
    revertTicketPosition: revertTicketPosition
  };

})(namespace, apex.jQuery);
