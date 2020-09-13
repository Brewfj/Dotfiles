(function(){

  window.FireRTC.OAuth = {
    authorize: function(username, password, callback) {
      var accessToken = null;
      var data = {
        grant_type: 'password',
        username: username,
        password: password
      };

      $.ajax({
        type: 'POST',
        url: window.utils.absoluteURI('oauth/token'),
        data: data,
        success: function(data, textStatus, jqXHR) {
          chrome.storage.local.set({'accessToken': data.access_token}, function() {
            console.debug('Token saved', data.access_token);
          });
          chrome.storage.local.set({'username': username}, function() {
            console.debug('Username saved', username);
          });
          accessToken = data.access_token;
        },
        error: function(request, textStatus, err) {
          window.utils.flash('error', request.status + ": " + request.statusText);
        }
      }).done(function(data) {
        if($.isFunction(callback))
          callback(accessToken);
      });
    }
  }

  return FireRTC.OAuth;
})();
