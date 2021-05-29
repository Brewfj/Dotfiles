(function(){

  window.FireRTC.views.WindowView = Backbone.View.extend({
    el: '.window-container',
    events: {
      'click a.close-app': 'handleCloseApp',
      'click a.minimize-app': 'handleMinimizeApp',
      'click a.sign-out-link': 'signOut',
      'click a.auth-required': 'checkAccessToken'
      //'click a.support-link': 'checkAccessToken'
    },
    initialize: function() {
      this.registrationView = new FireRTC.views.RegistrationView({ model: this.model, el: this.$el.find('.registration-container') });
      this.sessionView = new FireRTC.views.SessionView({ model: this.model, el: this.$el.find('.session-container') });

      this.listenTo(this.model, 'change:token', this.handleAuthorization.bind(this));
      this.listenTo(this.model, 'tokenRevoked', this.handleSignOut.bind(this));
    },
    render: function() {
      this.sessionView.show();

      return this;
    },
    webView: function() {
      return this.$el.find('#firertc');
    },
    handleCloseApp: function(event) {
      chrome.app.window.current().close();
    },
    handleMinimizeApp: function(event) {
      chrome.app.window.current().minimize();
    },
    signOut: function(event) {
      this.model.signOut();
    },
    handleSignOut: function(event) {
      var options = { since: 0 };
      var typeSet = {
        cache: true,
        appcache: true,
        cookies: true,
        fileSystems: true,
        indexedDB: true,
        localStorage: true,
        webSQL: true
      };

      chrome.storage.local.remove('accessToken');
      this.webView()[0].clearData(options, typeSet, function() {});

      this.webView().hide();
      this.$el.find('.dropdown-toggle').hide();
      this.$el.find('.close-app.top').show();
      this.$el.find('.logo-container img').attr('src', '/assets/images/firertc-icon-grey-32.png');
      this.sessionView.show();
    },
    checkAccessToken: function(event) {
      event.preventDefault();
      var t = this;
      var targetUrl = $(event.currentTarget).attr('href');
      var params = window.utils.uri(targetUrl).query(true);

      this.model.tokenInfo(params.access_token, function(info) {
        if(info && info.expires_in_seconds > 0) {
          window.open(targetUrl);
        }
      });
    },
    handleAuthorization: function(user, token, options) {
      if(!token)
        return;

      this.$el.find('a.invitation-link')[0].href = 'https://phone.firertc.com/auth/invitation/new?access_token=' + token;
      this.$el.find('a.change-password-link')[0].href = 'https://phone.firertc.com/auth/edit?access_token=' + token;
      this.$el.find('a.settings-link')[0].href = 'https://phone.firertc.com/settings?access_token=' + token;

      this.loadWebView(token);

      this.sessionView.hide({
        complete: function() {
          this.$el.find('.close-app.top').hide();
          this.$el.find('.logo-container img').attr('src', '/assets/images/firertc-icon-32.png');
          this.webView().show();
          this.$el.find('.dropdown-toggle').show();
        }.bind(this)
      });
    },
    loadWebView: function(token) {
      var src = (window.utils.absoluteURI('phone') + '?access_token=' + token);
      var callee = null;

      if(window.requestedCallee)
        callee = window.requestedCallee;

      if(!callee && window.utils.requestedUrl())
        callee = window.utils.calleeFromUri(window.utils.requestedUrl());

      if(callee)
        src = (src + '&callee=' + callee);

      this.webView()[0].src = src;
    },
    recentsContainer: function() {
      return this.phoneContainer().find('.recents-container');
    },
    phoneContainer: function() {
      return this.webView().find('.phone-container');
    },
    setCallee: function(callee) {
      this.phoneContainer().find('.phone').data('callee', callee);
    }
  });

})();
