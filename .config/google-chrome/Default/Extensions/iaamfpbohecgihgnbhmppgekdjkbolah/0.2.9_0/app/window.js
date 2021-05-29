if(!window.firertc)
  window.firertc = {};

window.onload = function() {
  window.firertc.user = new window.FireRTC.models.UserModel();

  FireRTC.Messenger.init();
  FireRTC.Notifications.init();

  initWebView();
  initListeners();

  window.firertc.windowView = new window.FireRTC.views.WindowView({ model: window.firertc.user });
  window.firertc.windowView.render();
}

window.setWebViewCallee = function(callee) {
  var wv = webView();

  if(!callee && window.utils.requestedUrl())
    callee = window.utils.calleeFromUri(window.utils.requestedUrl());

  if(callee)
    wv.contentWindow.postMessage({ type: 'setCallee', body: { callee: callee } }, window.utils.baseURI());
}

window.setCallee = function(callee) {
  window.requestedCallee = callee;
  setWebViewCallee(window.requestedCallee);
}

function initWebViewListeners(wv) {
  wv.addEventListener('permissionrequest', handlePermissionRequest);
  wv.addEventListener('contentload', handleContentLoad);
  wv.addEventListener('newwindow', handleNewWindow);
  wv.addEventListener('dialog', handleDialog);

  return wv;
}

function requestUrl() {
  return window.launchURL;
}

function webView() {
  return $('#firertc')[0];
}

function initWebView() {
  var wv = webView();

  wv = initWebViewListeners(wv);

  return wv;
}

function handlePermissionRequest(e) {
  if(e.permission === 'media') {
    e.request.allow();
  }
}

function handleNewWindow(e) {
  e.preventDefault();

  var uri = window.utils.uri(e.targetUrl);

  if(uri && typeof(uri) != 'undefined' && uri.domain() === 'firertc.com')
    uri = uri.subdomain('phone').toString();

  if(uri && window.firertc.user && window.firertc.user.token())
    uri = uri + '?access_token=' + window.firertc.user.token();

  chrome.browser.openTab({ url: uri });
}

function handleContentLoad(e) {
  var win = e.target.contentWindow;

  win.postMessage('initial message', FireRTC.origin)
}

function handleDialog(dialog) {
  switch(dialog.messageType) {
    case 'alert':
      console.debug('alert');
      break;
    case 'confirm':
      console.debug('confirm');
      showConfirmNotification(dialog.messageText);
      break;
    case 'prompt':
      console.debug('prompt');
      break;
  }
}

function initListeners() {
  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if(message && message.data && message.data.action == 'call')
        setCallee(message.data.callee);
      sendResponse({ status: 'successful' });
    }
  );
}
