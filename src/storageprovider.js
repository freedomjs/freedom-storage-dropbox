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
  this.queue = [];

  this.db = {};
  this.db.credentials = null;
  this.db.client = null;
  this.db.datastoreManager = null;
  this.db.datastore = null;
  this.db.table = null;
  this.db.tableName = "freedom-storage";
  this.db.initializing = false;

  this.view = freedom['core.view']();
  this.view.once('message', this._onCredentials.bind(this));

  if (typeof CONFIG !== 'undefined' && CONFIG.hasOwnProperty("credentials")) {
    //To prevent conflicts between concurrent Chrome/Firefox tests
    this.db.tableName = "test"+Math.random();
    console.log("Integration test: preloaded credentials");
    this._onCredentials({
      cmd: 'auth',
      message: CONFIG.credentials
    });
  } else {
    this.view.open('dropboxlogin', { file: 'login.html' }).then(function() {
      this.view.show();
    }.bind(this));
  }

  // console.log("Dropbox Storage Provider, running in worker " + self.location.href);
}

DropboxStorageProvider.prototype.keys = function(continuation) {
  //this.store.keys().then(continuation);
  // console.log("storage.dropbox.keys: enter");
  if (this.db.initializing) {
    this._pushQueue("keys", null, null, continuation);
    return;
  } else if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = [];
  var records = this.db.table.query();
  for (var i=0; i<records.length; i++) {
    var key = records[i].get("key");
    if (key !== null) {
      retValue.push(key);
    }
  }
  continuation(retValue);
  // console.log("storage.dropbox.keys: return=" + JSON.stringify(retValue));
};

DropboxStorageProvider.prototype.get = function(key, continuation) {
  //this.store.get(key).then(continuation);
  // console.log("storage.dropbox.get: key=" + key);
  if (this.db.initializing) {
    this._pushQueue("get", key, null, continuation);
    return;
  } else if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }

  var retValue = null;
  var record = this.db.table.get(key);
  if (record !== null) {
    retValue = record.get("value");
  }
  continuation(retValue);
  // console.log("storage.dropbox.get: return=" + retValue);
};

DropboxStorageProvider.prototype.set = function(key, value, continuation) {
  //this.store.set(key, value).then(continuation);
  // console.log("storage.dropbox.set: key=" + key + ", value=" + value);
  if (this.db.initializing) {
    this._pushQueue("set", key, value, continuation);
    return;
  } else if (this.db.table === null) {
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
  // console.log("storage.dropbox.set: return=" + retValue);
};

DropboxStorageProvider.prototype.remove = function(key, continuation) {
  //this.store.remove(key).then(continuation);
  // console.log("storage.dropbox.remove: key=" + key);
  if (this.db.initializing) {
    this._pushQueue("remove", key, null, continuation);
    return;
  } else if (this.db.table === null) {
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
  // console.log("storage.dropbox.remove: return=" + retValue);
};

DropboxStorageProvider.prototype.clear = function(continuation) {
  //this.store.clear().then(continuation);
  // console.log("storage.dropbox.clear: enter");
  if (this.db.initializing) {
    this._pushQueue("clear", null, null, continuation);
    return;
  } else if (this.db.table === null) {
    continuation(undefined, this._createError("OFFLINE"));
    return;
  }
  this.records = {};
  var records = this.db.table.query();
  for (var i=0; i<records.length; i++) {
    records[i].deleteRecord();
  }
  continuation();
  // console.log("storage.dropbox.clear: exit");
};

/** INTERNAL METHODS **/
DropboxStorageProvider.prototype._onCredentials = function(msg) {
  if (msg.cmd && msg.message && msg.cmd == 'auth') {
    // console.log("storage.dropbox._onCredentials: received credentials, opening datastore");
    this.db.initializing = true;
    this.db.tableName = msg.message.location;
    delete msg.message.location;
    this.db.tableName = this.db.tableName.replace(/[.\/-\\]/g, "");
    this.db.credentials = msg.message;
    this.db.client = new Dropbox.Client(this.db.credentials);
    this.db.datastoreManager = this.db.client.getDatastoreManager();
    this.db.datastoreManager.openDefaultDatastore(function(error, ds) {
      if (error) {
        console.error(error);
      }
      // console.log("storage.dropbox._onCredentials: Fetching table");
      this.db.datastore = ds;
      this.db.table = ds.getTable(this.db.tableName);
      this.db.initializing = false;
      this._flushQueue();
    }.bind(this));
  } else {
    console.log("Unknown message from view: " + JSON.stringify(msg));
  }
};

DropboxStorageProvider.prototype._createError = function(code) {
  // console.log("storage.dropbox._createError: " + code);
  return {
    errcode: code, 
    message: this.ERRCODE[code]
  };
};

//Insert call into queue
DropboxStorageProvider.prototype._pushQueue = function(method, key, value, continuation) {
  // console.log("Pushing onto queue: " + method);
  this.queue.push({
    cmd: method,
    key: key,
    value: value,
    cont: continuation
  });
};

//Flush commands in queue
DropboxStorageProvider.prototype._flushQueue = function() {
  var i, elt;
  for (i = 0; i < this.queue.length; i += 1) {
    elt = this.queue[i];
    if (elt.cmd === "keys") {
      this.keys(elt.cont);
    } else if (elt.cmd === "get") {
      this.get(elt.key, elt.cont);
    } else if (elt.cmd === "set") {
      this.set(elt.key, elt.value, elt.cont);
    } else if (elt.cmd === "remove") {
      this.remove(elt.key, elt.cont);
    } else if (elt.cmd === "clear") {
      this.clear(elt.cont);
    } else {
      console.error("Dropbox Storage: unrecognized command " + JSON.stringify(elt));
    }
  }
  this.queue = [];
};


/** REGISTER PROVIDER **/
if (typeof freedom !== 'undefined') {
  freedom.storage().provideAsynchronous(DropboxStorageProvider);
}
