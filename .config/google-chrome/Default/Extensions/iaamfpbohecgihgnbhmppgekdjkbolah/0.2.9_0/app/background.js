var masterWindow = null;

function launch(launchData) {
  console.debug('launchData', launchData);

  options = {
    id: 'firertc-app',
    outerBounds: {
      minWidth: 400,
      width: 400,
      maxWidth: 400,
      minHeight: 710,
      height: 710,
      maxHeight: 710
    },
    frame: {
      type: 'none'
    }
  };

  chrome.app.window.create('/app/window.html', options, function(createdWindow) {
    masterWindow = initWindow(createdWindow, launchData);
  });
};

function initWindow(w, launchData) {
  var win = w.contentWindow;

  win.launchURL = launchData.url;

  win.setCallee();

  return w;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
  }
});

chrome.identity.onSignInChanged.addListener(function(account, signedIn) {
  console.debug('Account', account);
  console.debug('SignedIn', signedIn);
});

chrome.app.runtime.onLaunched.addListener(launch);
chrome.app.runtime.onRestarted.addListener(launch);

chrome.runtime.onStartup.addListener(function() {
  console.debug('onStartup');
});

chrome.runtime.onInstalled.addListener(function(details) {
  console.debug('onInstalled', details);
});

chrome.runtime.onSuspend.addListener(function() {
  console.debug('onSuspend');
});

chrome.runtime.onSuspendCanceled.addListener(function() {
  console.debug('onSuspendCanceled');
});

chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.debug('onUpdateAvailable', details);
});

chrome.runtime.onConnect.addListener(function(port) {
  console.debug('onConnect', port);
});

chrome.runtime.onConnectExternal.addListener(function(port) {
  console.debug('onConnectExternal', port);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.debug('onMessage', message, sender);
});

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
  console.debug('onMessageExternal', message, sender);

  if(message && message.data && message.data.action == 'call')
    chrome.runtime.sendMessage({ data: message.data });

  sendResponse({ status: 'successful' });
});

chrome.runtime.onRestartRequired.addListener(function(reason) {
  console.debug('onRestartRequired', reason);
});
