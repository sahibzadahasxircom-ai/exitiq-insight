/**
 * Leaveesy Widget
 * Embed this script on your website to track cancellation events
 * Usage: <script src="/widget.js" data-company-id="YOUR_COMPANY_ID"></script>
 */

(function() {
  'use strict';

  // Get company ID from script tag (attribute or query param)
  var script = document.currentScript || document.querySelector('script[src*="widget.js"]');
  var companyId = null;
  
  if (script) {
    // Try attribute first
    companyId = script.getAttribute('data-company-id');
    
    // If not found, try URL query parameter
    if (!companyId && script.src) {
      var scriptUrl = new URL(script.src);
      companyId = scriptUrl.searchParams.get('data-company-id');
    }
  }

  if (!companyId) {
    console.error('Leaveesy Widget: data-company-id attribute or query parameter is required');
    return;
  }

  // Initialize leaveesy global object
  window.leaveesy = window.leaveesy || {
    initialized: false,
    companyId: companyId,
    queue: [],
    
    init: function(options) {
      this.initialized = true;
      this.options = options || {};
      
      // Process queued events
      while (this.queue.length > 0) {
        var event = this.queue.shift();
        this.track(event.name, event.data);
      }
      
      // Dispatch ready event
      var event = new CustomEvent('leaveesyReady');
      window.dispatchEvent(event);
      
      console.log('Leaveesy Widget initialized for company:', companyId);
    },
    
    track: function(eventName, data) {
      if (!this.initialized) {
        this.queue.push({ name: eventName, data: data });
        return;
      }
      
      // Send event to backend
      var payload = {
        company_id: this.companyId,
        event_name: eventName,
        event_data: data || {},
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent
      };
      
      // Determine API URL from widget script source (cross-origin support)
      var script = document.currentScript || document.querySelector('script[src*="widget.js"]');
      var apiUrl;
      if (script && script.src) {
        var scriptUrl = new URL(script.src);
        apiUrl = scriptUrl.origin + '/api/widget/events';
      } else {
        apiUrl = (window.location.origin || 'http://localhost:8080') + '/api/widget/events';
      }
      
      // Use fetch with proper headers for JSON content type
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).then(function(response) {
        if (!response.ok) {
          console.error('Leaveesy Widget: Failed to send event, status:', response.status);
        }
      }).catch(function(error) {
        console.error('Leaveesy Widget: Failed to send event', error);
      });
      
      console.log('Leaveesy Widget: Tracked event', eventName, payload);
    }
  };

  // Auto-initialize if data-company-id is present
  if (companyId) {
    window.leaveesy.init();
  }

})();
