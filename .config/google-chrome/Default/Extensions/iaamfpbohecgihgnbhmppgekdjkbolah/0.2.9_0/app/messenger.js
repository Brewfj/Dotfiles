(function(){

  window.FireRTC.Messenger = {
    notifId: null,
    init: function() {
      window.addEventListener('message', this.handleMessage);
    },
    handleMessage: function(e) {
      console.debug('received message', e.data);
      switch(e.data.type) {
        case 'incomingCall':
          FireRTC.Notifications.displayIncomingCallNotif(e.data.message, e.data.avatar, function(id) {
            window.FireRTC.Messenger.notifId = id;
          });
          break;
        case 'accepted':
          if (window.FireRTC.Messenger.notifId) {
            chrome.notifications.clear(window.FireRTC.Messenger.notifId, function(wasCleared){});
          }
          break;
        case 'rejected':
          if(window.FireRTC.Messenger.notifId) {
            chrome.notifications.clear(window.FireRTC.Messenger.notifId, function(wasCleared){});
          }
          break;
      }
    }
  }

  return FireRTC.Messenger;
})();
