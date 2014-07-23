/*globals freedom:true */
/*jslint indent:2, white:true, sloppy:true, browser:true */
var global = {};

function DropboxStorageProvider() {
  global.provider = this;
  this.store = {};
  this.credentials = null;
  this.client = null;

  this.view = freedom['core.view']();
  this.view.once('message', this.onCredentials.bind(this));
  this.view.open('dropboxlogin', { file: 'login.html' }).then(function() {
    this.view.show();
  }.bind(this));

  console.log("Shared Storage Provider, running in worker " + self.location.href);
}

DropboxStorageProvider.prototype.onCredentials = function(msg) {
  if (msg.cmd && msg.message && msg.cmd == 'auth') {
    this.credentials = msg.message;
    this.client = new Dropbox.Client(this.credentials);
  } else {
    console.log("Unknown message from view: " + JSON.stringify(msg));
  }
};

DropboxStorageProvider.prototype.keys = function(continuation) {
  //this.store.keys().then(continuation);
};

DropboxStorageProvider.prototype.get = function(key, continuation) {
  //this.store.get(key).then(continuation);
};

DropboxStorageProvider.prototype.set = function(key, value, continuation) {
  //this.store.set(key, value).then(continuation);
};

DropboxStorageProvider.prototype.remove = function(key, continuation) {
  //this.store.remove(key).then(continuation);
};

DropboxStorageProvider.prototype.clear = function(continuation) {
  //this.store.clear().then(continuation);
};

/** REGISTER PROVIDER **/
if (typeof freedom !== 'undefined') {
  freedom.storage().provideAsynchronous(DropboxStorageProvider);
}
