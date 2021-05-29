(function(){

  window.FireRTC.views.RegistrationView = Backbone.View.extend({
    el: '.registration-container',
    events: {},
    initialize: function() {
      this.initEvents();
    },
    initEvents: function() {

    },
    render: function() {
      this.$el.show();

      return this;
    },
  });

})();
