/*
 * ==========================================================================
 * KANBAN BOARD NAMESPACE
 * ==========================================================================
 *
 * @description Namespace para funcionalidades del tablero Kanban
 * @author Angel O. Flores Torres
 * @created 2024
 * @version 1.0
 */

// Global Variables
var currentUser = apex.env.APP_USER || 'SYSTEM';

// Initialize namespace
var namespace = namespace || {};

/**
 * ==========================================================================
 * @module kanban
 * ==========================================================================
 */
namespace.kanban = (function(namespace, $, undefined) {
  'use strict';

  // Private variables
  var _currentDragTicket = null;
  var isInitialized = false;
  var MODULE_NAME = 'Kanban';

  // Configuration constants
  var CONFIG = {
    COLUMN_CLASS: '.column-5a',
    CONTAINER_CLASS: '.tickets-container-5a',
    TICKET_CLASS: '.ticket-card',
    DRAG_OVER_CLASS: 'drag-over',
    DRAGGING_CLASS: 'dragging'
  };

  // Create module-specific debug logger
  var log = namespace.utilities.createDebugLogger(MODULE_NAME);




  /* ================================================================ */
  /**
   * Find all kanban columns
   * @returns {jQuery} - jQuery collection of columns
   */
  var _findColumns = function() {
    return $(CONFIG.COLUMN_CLASS);
  };




  /* ================================================================ */
  /**
   * Find tickets container within a column
   * @param {jQuery} column - The column element
   * @returns {jQuery} - jQuery collection of container
   */
  var _findContainer = function(column) {
    return column.find(CONFIG.CONTAINER_CLASS);
  };





  /* ================================================================ */
  /**
   * Make a ticket element draggable
   * @param {HTMLElement} ticketElement - The ticket DOM element
   * @param {Object} ticketData - Ticket data object
   */
  var _makeTicketDraggable = function(ticketElement, ticketData) {

    ticketElement.draggable = true;
    ticketElement.setAttribute('data-ticket-id', ticketData.TICKET_ID);

    ticketElement.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', ticketData.TICKET_ID);
      e.dataTransfer.effectAllowed = 'move';
      this.classList.add(CONFIG.DRAGGING_CLASS);
      _currentDragTicket = ticketData.TICKET_ID;
      log('Drag started for ticket:', ticketData.TICKET_ID);
    });

    ticketElement.addEventListener('dragend', function(e) {
      this.classList.remove(CONFIG.DRAGGING_CLASS);
      _currentDragTicket = null;
      log('Drag ended for ticket:', ticketData.TICKET_ID);
    });
  };





  /* ================================================================ */
  /**
   * Make a column element droppable for tickets
   * @param {HTMLElement} columnElement - The column DOM element
   * @param {string} columnId - The column ID
   */
  var _makeColumnDroppable = function(columnElement, columnId) {


    /* ------------------------------------------------------------ */
    columnElement.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.classList.add(CONFIG.DRAG_OVER_CLASS);

      // Agregar clase al contenedor también
      var container = this.querySelector(CONFIG.CONTAINER_CLASS);
      if (container) {
        container.classList.add('drag-over');
      }
    });





    /* ------------------------------------------------------------ */
    columnElement.addEventListener('dragleave', function(e) {
      this.classList.remove(CONFIG.DRAG_OVER_CLASS);

      // Remover clase del contenedor
      var container = this.querySelector(CONFIG.CONTAINER_CLASS);
      if (container) {
        container.classList.remove('drag-over');
      }
    });




    /* ------------------------------------------------------------ */
    columnElement.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove(CONFIG.DRAG_OVER_CLASS);

      // Remover clase del contenedor
      var container = this.querySelector(CONFIG.CONTAINER_CLASS);
      if (container) {
        container.classList.remove(CONFIG.DRAG_OVER_CLASS);
      }

      var ticketId = e.dataTransfer.getData('text/plain');
      var ticketElement = document.querySelector('[data-ticket-id="' + ticketId + '"]');

      if (ticketElement && ticketElement !== this) {
        var ticketsContainer = this.querySelector(CONFIG.CONTAINER_CLASS);

        if (ticketsContainer) {
          log('Dropping ticket', ticketId, 'into column', columnId);

          // Verificar si el ticket ya está en esta columna
          var originalColumn = ticketElement.closest(CONFIG.COLUMN_CLASS);
          if (originalColumn === this) {
            log('Ticket already in this column, no need to move');
            return; // No hacer nada si es la misma columna
          }

          // Store original position for potential rollback
          var originalContainer = originalColumn ? originalColumn.querySelector(CONFIG.CONTAINER_CLASS) : null;
          var originalPosition = originalContainer ? Array.from(originalContainer.children).indexOf(ticketElement) : -1;

          // 1. Mover visualmente inmediatamente (Optimistic Update)
          var dropY = e.clientY;
          var containerRect = ticketsContainer.getBoundingClientRect();

          // Encontrar el ticket más cercano a la posición del drop
          var existingTickets = ticketsContainer.querySelectorAll(CONFIG.TICKET_CLASS);
          var insertBeforeElement = null;

          existingTickets.forEach(function(existingTicket) {
            var ticketRect = existingTicket.getBoundingClientRect();
            var ticketCenter = ticketRect.top + (ticketRect.height / 2);

            if (dropY < ticketCenter && !insertBeforeElement) {
              insertBeforeElement = existingTicket;
            }
          });

          // Insertar en la posición correcta
          if (insertBeforeElement) {
            ticketsContainer.insertBefore(ticketElement, insertBeforeElement);
          } else {
            ticketsContainer.appendChild(ticketElement);
          }

          // 2. Mostrar indicador de procesamiento
          namespace.kanbanBusiness.showProcessingIndicator(ticketId);

          // 3. Llamar a la API con callback para manejar resultado
          namespace.kanbanBusiness.updateTicketStatus(
            ticketId,
            columnId,
            function(success, data) {
              // Ocultar indicador de procesamiento
              namespace.kanbanBusiness.hideProcessingIndicator(ticketId);

              if (success) {
                // 4. Mostrar feedback de éxito
                namespace.kanbanBusiness.showSuccessFeedback(ticketId);
                log('Ticket moved successfully to column:', columnId);
              } else {
                // 5. Revertir posición visualmente con animación
                log('Failed to move ticket, reverting position');

                // Revertir a la posición original
                if (originalContainer && originalPosition >= 0) {
                  if (originalPosition === 0) {
                    originalContainer.insertBefore(ticketElement, originalContainer.firstChild);
                  } else {
                    var beforeElement = originalContainer.children[originalPosition - 1];
                    originalContainer.insertBefore(ticketElement, beforeElement.nextSibling);
                  }
                }

                // Mostrar feedback de error y animación de revert
                var errorMsg = data.error_msg || data.error || 'Failed to move ticket';
                namespace.kanbanBusiness.revertTicketPosition(ticketId, errorMsg);
              }
            }
          );
        }
      }
    });
  };















  /* ================================================================ */
  /**
   * Render tickets for a specific column (common function for init and update)
   * @param {string} columnId - The column ID
   * @param {Array} tickets - Array of ticket data
   * @param {boolean} makeDraggable - Whether to make tickets draggable
   */
  var renderTicketsForColumn = function(columnId, tickets, makeDraggable) {
    var columnElement = document.querySelector('[data-column-id="' + columnId + '"]');
    if (!columnElement) {
      log('Column element not found for ID:', columnId);
      return;
    }

    var ticketsContainer = columnElement.querySelector('.tickets-container-5a');
    if (!ticketsContainer) {
      log('Tickets container not found in column:', columnId);
      return;
    }

    // Clear existing tickets
    ticketsContainer.innerHTML = '';

    // Add new tickets
    if (tickets && tickets.length > 0) {
      log('Adding', tickets.length, 'tickets to column:', columnId);

      tickets.forEach(function(ticket) {
        var ticketElement = $('<div>', {
          class: 'ticket-card',
          'data-ticket-id': ticket.TICKET_ID
        });

        var ticketHTML = namespace.kanbanBusiness.createTicketHTML(ticket);
        ticketElement.html(ticketHTML);
        ticketsContainer.appendChild(ticketElement[0]);

        // Make ticket draggable if requested
        if (makeDraggable) {
          _makeTicketDraggable(ticketElement[0], ticket);
        }
      });
    } else {
      log('No tickets found for column:', columnId);
    }

    // Update ticket count
    var ticketCountElement = columnElement.querySelector('.ticket-count-5a');
    if (ticketCountElement) {
      ticketCountElement.textContent = tickets.length;
    }

    log('Tickets rendered for column:', columnId, 'Count:', tickets.length);
  };







  /* ================================================================ */
  /**
   * Load data for all columns (common function for init and refresh)
   * @returns {boolean} - Success status
   */
  var _loadColumnData = function() {
    var columns = _findColumns();

    if (columns.length === 0) {
      log('No columns found');
      return false;
    }

    log('Found', columns.length, 'columns');

    // Process all columns to load data
    columns.each(function(index) {
      var column = $(this);
      var columnId = column.data('column-id');
      var container = _findContainer(column);

      if (container.length === 0) {
        log('No container found for column:', columnId);
        return;
      }

      log('Loading data for column:', columnId);

      // Get tickets for this column using callback
      namespace.kanbanBusiness.getTicketsForColumn(columnId, function(ticketsData) {
        // Use the local function to render tickets
        renderTicketsForColumn(columnId, ticketsData, true);
      });
    });

    return true;
  };





  /* ================================================================ */
  /**
   * Refresh kanban board data (for board switching)
   * @returns {boolean} - Success status
   */
  var refresh = function() {
    log('Refreshing kanban board data...');
    var result = _loadColumnData();
    
    if (result) {
      // Reconfigure event listeners for columns after refresh
      log('Reconfiguring event listeners after refresh...');
      var columns = _findColumns();
      columns.each(function(index) {
        var column = $(this);
        var columnId = column.data('column-id');

        log('Re-setting up event listeners for column:', columnId);
        // Make the column droppable again
        _makeColumnDroppable(column[0], columnId);
      });
    }
    
    log('Kanban board data refresh completed');
    return result;
  };





  /* ================================================================ */
  /**
   * Initialize kanban board functionality
   * @returns {boolean} - Success status
   */
  var initialize = function() {

    if (isInitialized) {
      log('Already initialized, refreshing data instead...');
      return refresh();
    }

    log('Initializing kanban board...');

    // Load data for all columns
    if (!_loadColumnData()) {
      return false;
    }

    // Set up event listeners for all columns (only once)
    var columns = _findColumns();
    columns.each(function(index) {
      var column = $(this);
      var columnId = column.data('column-id');

      log('Setting up event listeners for column:', columnId);
      // Make the column droppable
      _makeColumnDroppable(column[0], columnId);
    });




    isInitialized = true;
    log('Kanban board initialization completed');
    return true;
  };

  /* ================================================================ */
  /**
   * Refresh kanban board after APEX region refresh
   * This function should be called after APEX refreshes the kanban region
   * @returns {boolean} - Success status
   */
  var refreshAfterRegionUpdate = function() {
    log('Refreshing kanban board after region update...');
    
    // Reset initialization flag to force full reinitialization
    isInitialized = false;
    
    // Call initialize which will handle both data loading and event listeners
    return initialize();
  };

  /* ================================================================ */
  /* Return public API */
  /* ================================================================ */
  return {
    initialize: initialize,
    refresh: refresh,
    refreshAfterRegionUpdate: refreshAfterRegionUpdate,
    _makeTicketDraggable: _makeTicketDraggable,
    renderTicketsForColumn: renderTicketsForColumn
  };

})(namespace, apex.jQuery);

/**
 * ==========================================================================
 * INITIALIZATION
 * ==========================================================================
 */
/* apex.jQuery(document).ready(function() {
  namespace.kanban.initialize();
});
 */


