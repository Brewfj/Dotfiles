window.utils = {};

window.utils.baseURI = function() {
  return 'https://app.firertc.com';
};

window.utils.uri = function(s) {
  return URI(s);
}

window.utils.absoluteURI = function(s) {
  var uri = window.utils.uri(s);

  if(!uri)
    return s;

  if(uri.host() && uri.host() != "")
    return uri.toString();
  else
    return uri.absoluteTo(window.utils.baseURI()).toString();
}

window.utils.toPrettyString = function(object) {
  if(object)
    return JSON.stringify(object, null, 2);
  else
    return '';
}

window.utils.flash = function(severity, message) {
  var flash = $('.flash');

  flash.fadeIn();
  flash.addClass(severity);
  flash.find(".message").text(message);

  setTimeout(function() {
    flash.fadeOut().removeClass(severity);
  }, 5000);
}

window.utils.urlToBlobUrl = function(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function(e) {
    callback(window.URL.createObjectURL(this.response));
  }

  xhr.send();
}

window.utils.requestedUrl = function() {
  var url = window.launchURL;

  if(url)
    return new URI(url);
}

window.utils.queryParams = function(s) {
  qs = s.split('+').join(' ');

  var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;

  while(tokens = re.exec(qs))
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);

  return params;
}

window.utils.calleeFromUri = function(uri) {
  if(uri && uri.query()) {
    var params = window.utils.queryParams(uri.query());

    if(params && params.callee) {
      return params.callee;
    }
  }
}
