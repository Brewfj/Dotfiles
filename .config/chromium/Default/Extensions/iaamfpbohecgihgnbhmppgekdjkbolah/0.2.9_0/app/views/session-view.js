(function(){

  window.FireRTC.views.SessionView = Backbone.View.extend({
    el: '.session-container',
    events: {
      'submit form#new-session': 'authorize'
    },
    initialize: function() {
      this.listenTo(this.model, 'change:username', this.inputUsername.bind(this));
    },
    render: function() {
      return this;
    },
    show: function(options) {
      var options = options || {};
      this.$el.show('fade', options);
    },
    hide: function(options) {
      var options = options || {};
      //this.$el.find('input#password').val('');
      this.$el.hide('fade', options);
    },
    inputUsername: function(model, username, options) {
      this.$el.find('input#email').val(username);
    },
    authorize: function(event) {
      event.preventDefault();
      var t = this;
      var username = this.$el.find('input#email').first().val();
      var password = this.$el.find('input#password').first().val();

      if(!this.model.token()) {
        FireRTC.OAuth.authorize(username, password, function(token) {
          t.model.setToken(token);
        });
      }
    }
  });

})();
