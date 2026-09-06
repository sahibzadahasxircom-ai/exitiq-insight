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
  
  console.log('Leaveesy Widget: Script element:', script);
  
  if (script) {
    // Try attribute first
    companyId = script.getAttribute('data-company-id');
    console.log('Leaveesy Widget: Company ID from attribute:', companyId);
    
    // If not found, try URL query parameter
    if (!companyId && script.src) {
      try {
        var scriptUrl = new URL(script.src);
        companyId = scriptUrl.searchParams.get('data-company-id');
        console.log('Leaveesy Widget: Company ID from URL param:', companyId);
        console.log('Leaveesy Widget: Script src:', script.src);
      } catch (e) {
        console.error('Leaveesy Widget: Failed to parse script URL:', e);
      }
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
    modal: null,
    
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
    
    showModal: function(url) {
      // Remove existing modal if any
      if (this.modal) {
        document.body.removeChild(this.modal);
      }
      
      // Create modal overlay
      var modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
      
      // Create modal container
      var container = document.createElement('div');
      container.style.cssText = 'background:white;border-radius:12px;max-width:500px;width:90%;max-height:90vh;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);position:relative;';
      
      // Create close button
      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;padding:5px;line-height:1;z-index:10;';
      closeBtn.onclick = function() {
        document.body.removeChild(modal);
        window.leaveesy.modal = null;
      };
      
      // Create iframe
      var iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.cssText = 'width:100%;height:500px;border:none;border-radius:12px;overflow:hidden;';
      
      // Assemble modal
      container.appendChild(closeBtn);
      container.appendChild(iframe);
      modal.appendChild(container);
      
      // Add to DOM
      document.body.appendChild(modal);
      this.modal = modal;
      
      // Listen for messages from iframe
      var messageHandler = function(e) {
        if (e.data && e.data.type === 'leaveesy-continue') {
          console.log('Leaveesy Widget: Received continue message, sessionId:', e.data.sessionId);
          // Close modal
          document.body.removeChild(modal);
          window.leaveesy.modal = null;
          window.removeEventListener('message', messageHandler);
          
          // Navigate to interview
          var script = document.currentScript || document.querySelector('script[src*="widget.js"]');
          var interviewUrl;
          if (script && script.src) {
            var scriptUrl = new URL(script.src);
            interviewUrl = scriptUrl.origin + '/interview/' + e.data.sessionId;
          } else {
            interviewUrl = 'https://leaveesy.vercel.app/interview/' + e.data.sessionId;
          }
          window.location.href = interviewUrl;
        }
      };
      window.addEventListener('message', messageHandler);
      
      // Close on escape key
      var escapeHandler = function(e) {
        if (e.key === 'Escape' && window.leaveesy.modal) {
          document.body.removeChild(window.leaveesy.modal);
          window.leaveesy.modal = null;
          document.removeEventListener('keydown', escapeHandler);
          window.removeEventListener('message', messageHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Close on backdrop click
      modal.onclick = function(e) {
        if (e.target === modal && window.leaveesy.modal) {
          document.body.removeChild(window.leaveesy.modal);
          window.leaveesy.modal = null;
          document.removeEventListener('keydown', escapeHandler);
          window.removeEventListener('message', messageHandler);
        }
      };
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
      console.log('Leaveesy Widget: Sending event to API:', apiUrl);
      console.log('Leaveesy Widget: Request payload:', payload);
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: false
      }).then(function(response) {
        console.log('Leaveesy Widget: Response received, status:', response.status);
        console.log('Leaveesy Widget: Response headers:', response.headers);
        
        if (!response.ok) {
          console.error('Leaveesy Widget: Failed to send event, status:', response.status);
          return;
        }
        
        // Parse response to get interview session ID
        return response.text().then(function(text) {
          console.log('Leaveesy Widget: Raw response text:', text);
          try {
            var data = JSON.parse(text);
            console.log('Leaveesy Widget: Parsed response data:', data);
            console.log('Leaveesy Widget: Event name:', eventName);
            console.log('Leaveesy Widget: Has interviewSessionId:', !!data.interviewSessionId);
            console.log('Leaveesy Widget: interviewSessionId value:', data.interviewSessionId);
            
            // If this is a SignOut event and we got an interview session ID, show pre-form modal
            if (eventName === 'SignOut' && data.interviewSessionId) {
              console.log('Leaveesy Widget: Showing pre-form modal:', data.interviewSessionId);
              
              // Get the leaveesy URL from the script source
              var script = document.currentScript || document.querySelector('script[src*="widget.js"]');
              var leaveesyUrl;
              if (script && script.src) {
                try {
                  var scriptUrl = new URL(script.src);
                  leaveesyUrl = scriptUrl.origin + '/pre-form/' + data.interviewSessionId + '?modal=true';
                } catch (e) {
                  console.error('Leaveesy Widget: Failed to parse script URL:', e);
                  leaveesyUrl = 'https://leaveesy.vercel.app/pre-form/' + data.interviewSessionId + '?modal=true';
                }
              } else {
                leaveesyUrl = 'https://leaveesy.vercel.app/pre-form/' + data.interviewSessionId + '?modal=true';
              }
              
              console.log('Leaveesy Widget: Pre-form URL:', leaveesyUrl);
              
              // Create and show modal
              window.leaveesy.showModal(leaveesyUrl);
            } else {
              console.log('Leaveesy Widget: Not showing modal - conditions not met');
              console.log('Leaveesy Widget: eventName:', eventName, 'interviewSessionId:', data.interviewSessionId);
            }
          } catch (parseError) {
            console.error('Leaveesy Widget: Failed to parse JSON response:', parseError);
          }
        });
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
