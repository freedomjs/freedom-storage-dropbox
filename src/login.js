window.addEventListener('load', function() {
  var form = document.getElementById('loginform');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var credentials = {
      key: form.appkey.value,
      token: form.accesstoken.value
    };
    parent.postMessage({cmd: 'auth', message: credentials}, '*');
    return false;
  }, true);
}, true);

window.addEventListener('message', function(msg) {
}, true);
