(function(){

  window.FireRTC.models.UserModel = Backbone.Model.extend({
    initialize: function() {
      var t = this;

      chrome.storage.local.get('accessToken', function(storage) {
        if(storage.accessToken) {
          t.tokenInfo(storage.accessToken, function(info) {
            if(info && info.expires_in_seconds > 0) {
              t.setToken(storage.accessToken);
            }
          });
        }
      });

      chrome.storage.local.get('username', function(storage) {
        if(storage.username) {
          t.set('username', storage.username);
        }
      });
    },
    setToken: function(token) {
      return this.set('token', token);
    },
    token: function() {
      return this.get('token');
    },
    signOut: function() {
      var t = this;

      $.ajax({
          url: window.utils.absoluteURI('oauth/revoke'),
          data: {
            access_token: t.token(),
            token: t.token()
          },
          type: 'POST',
          success: function(data, textStatus, jqXHR) {
            t.setToken(null);
            t.trigger('tokenRevoked');
          },
          error: function(jqXHR, textStatus, err) {
            console.error('Sign out Error: ', textStatus);
          }
        });
    },
    tokenInfo: function(token, callback) {
      var t = this;

      $.ajax({
          url: window.utils.absoluteURI('oauth/token/info'),
          data: {
            access_token: token
          },
          type: 'GET',
          success: function(data, textStatus, jqXHR) {
            if(data.expires_in_seconds <= 0) {
              t.setToken(null);
              t.trigger('tokenRevoked');
            }
            callback(data);
          },
          error: function(jqXHR, textStatus, err) {
            t.setToken(null);
            t.trigger('tokenRevoked');
            callback(null);
          }
        });
    }
  });

})();
