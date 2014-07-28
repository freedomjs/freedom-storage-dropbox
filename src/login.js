window.addEventListener('load', function() {
  var form = document.getElementById('loginform');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var credentials = {
      key: form.appkey.value,
      token: form.accesstoken.value,
      location: window.location.href
    };
    parent.postMessage({cmd: 'auth', message: credentials}, '*');
    return false;
  }, true);
}, true);

window.addEventListener('message', function(msg) {
}, true);

document.getElementById('loginbutton').addEventListener('click', function() {
  console.log('CLICK');
});
