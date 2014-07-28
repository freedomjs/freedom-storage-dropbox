/*globals freedom:true */
/*jslint indent:2, white:true, sloppy:true, browser:true */
var global = {};

function DropboxStorageProvider() {
  global.provider = this;
  this.records = {};
  if (typeof freedom.storage !== 'undefined') {
    this.ERRCODE = freedom.storage().ERRCODE;
  } else if (typeof freedom.storebuffer !== 'undefined') {
    this.ERRCODE = freedom.storebuffer().ERRCODE;
  }

  this.db = {};
  this.db.credentials = null;
  this.db.client = null;
  this.db.datastoreManager = null;
  this.db.datastore = null;
  this.db.table = null;


  this.view = freedom['core.view']();
  this.view.once('message', this._onCredentials.bind(this));
  this.view.open('dropboxlogin', { file: 'login.html' }).then(function() {
    this.view.show();
  }.bind(this));

  console.log("Dropbox Storage Provider, running in worker " + self.location.href);
}

DropboxStorageProvider.prototype.keys = function(continuation) {
  //this.store.keys().then(continuation);
  if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = [];
  var records = this.db.table.query();
  for (var i=0; i<records.length; i++) {
    retValue.push(records[i].get("key"));
  }
  continuation(retValue);
};

DropboxStorageProvider.prototype.get = function(key, continuation) {
  //this.store.get(key).then(continuation);
  if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = null;
  var record = this.db.table.get(key);
  if (record !== null) {
    retValue = record.get("value");
  }
  continuation(retValue);
};

DropboxStorageProvider.prototype.set = function(key, value, continuation) {
  //this.store.set(key, value).then(continuation);
  if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = null;
  this.records[key] = this.db.table.get(key);
  if (this.records[key] === null) {
    this.records[key] = this.db.table.getOrInsert(key, {
      key: key,
      value: value,
      timestamp: new Date()
    });
  } else {
    retValue = this.records[key].get("value");
    this.records[key].set("value", value);
    this.records[key].set("timestamp", new Date());
  }

  continuation(retValue);
};

DropboxStorageProvider.prototype.remove = function(key, continuation) {
  //this.store.remove(key).then(continuation);
  if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = null;
  var record = this.db.table.get(key);
  if (record !== null) {
    retValue = record.get("value");
    record.deleteRecord();
  }
  if (this.records.hasOwnProperty(key)) {
    delete this.records[key];
  }

  continuation(retValue);
};

DropboxStorageProvider.prototype.clear = function(continuation) {
  //this.store.clear().then(continuation);
  if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }
  this.records = {};
  var records = this.db.table.query();
  for (var i=0; i<records.length; i++) {
    records[i].deleteRecord();
  }
  continuation();
};

/** INTERNAL METHODS **/
DropboxStorageProvider.prototype._onCredentials = function(msg) {
  if (msg.cmd && msg.message && msg.cmd == 'auth') {
    this.db.credentials = msg.message;
    this.db.client = new Dropbox.Client(this.db.credentials);
    this.db.datastoreManager = this.db.client.getDatastoreManager();
    this.db.datastoreManager.openDefaultDatastore(function(error, ds) {
      if (error) {
        console.error(error);
      }
      this.db.datastore = ds;
      this.db.table = ds.getTable('freedom-storage');
    }.bind(this));
  } else {
    console.log("Unknown message from view: " + JSON.stringify(msg));
  }
};

DropboxStorageProvider.prototype._createError = function(code) {
  // console.log("Creating error: " + code);
  return {
    errcode: code, 
    message: this.ERRCODE[code]
  };
};

/** REGISTER PROVIDER **/
if (typeof freedom !== 'undefined') {
  freedom.storage().provideAsynchronous(DropboxStorageProvider);
}
