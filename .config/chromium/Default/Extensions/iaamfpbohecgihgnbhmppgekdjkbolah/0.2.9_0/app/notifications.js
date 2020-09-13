(function(){

  window.FireRTC.Notifications = {
    notifId: null,
    init: function() {
      chrome.notifications.onButtonClicked.addListener(this.incomingCallListener);
    },
    incomingCallListener: function(notifId, buttonIndex) {
      var webView = $('#firertc')[0];

      switch(buttonIndex) {
        case 0:
          console.debug(notifId, 'accepted');
          webView.contentWindow.postMessage({ type:'acceptCall' }, window.utils.baseURI());
          chrome.notifications.clear(notifId, function(wasCleared){});
          break;
        case 1:
          console.debug(notifId, 'denied');
          webView.contentWindow.postMessage({ type:'denyCall' }, window.utils.baseURI());
          chrome.notifications.clear(notifId, function(wasCleared){});
          break;
      }
    },
    displayIncomingCallNotif: function(message, iconUrl, callback) {
      var options = options || {
        type: 'basic',
        title: 'Incoming Call:',
        message:  message,
        buttons: [
          { title: 'Accept' },
          { title: 'Deny' }
        ]
      };
      window.utils.urlToBlobUrl(iconUrl, function(url) {
        options.iconUrl = url;

        chrome.notifications.create('incomingCall', options, function(id){
          window.FireRTC.Notifications.notifId = id;
          if(_.isFunction(callback)) {
            callback(id);
          }
        });
      });
    }
  };

  return FireRTC.Notifications;
})();
