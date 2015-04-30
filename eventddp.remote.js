/**
 * RemoteEventDDP
 * 
 * Allows to use EventDDP as client on the server
 */


RemoteEventDDP = function(prefix, url) {
  var self = this;

  if (!(self instanceof RemoteEventDDP)) {
    return new RemoteEventDDP(prefix, url);
  }

  if (prefix !== '' + prefix) {
    throw new Error('RemoteEventDDP expects prefix to be type String');
  }

  if(url !== '' + url) {
    throw new Error('RemoteEventDDP expects url to be type String');
  }

  connection = DDP.connect(url);

  if (!connection) {
    throw new Error('RemoteEventDDP failed to connect to ' + url);
  }

  // Set prefix
  self.prefix = prefix;

  // Set connection
  self.connection = connection;

  // Fire up an event emitter
  self.eventEmitter = new EventEmitter();

  var _eventName = _prefixedName.call(self, 'events');

  var ok = connection.registerStore(_eventName, {
    beginUpdate: function (batchSize, reset) {},
    update: function (msg) {
      if (msg.msg == 'added') {
        self.eventEmitter.emit.apply(self.eventEmitter, msg.fields.args);
      }
    },
    endUpdate: function () {},
    saveOriginals: function () {},
    retrieveOriginals: function () {}
  });

  if (!ok) {
    throw new Error("There is already a RemoteEventDDP named '" + prefix + "'");
  }

  // Initialize
  self.setClient({});
};


RemoteEventDDP.prototype.setClient = function(options) {
  var self = this;

  // Prevent later mutation
  self._client = _.clone(options);

  // If already subscribed then release
  if (self.sub) {
    self.sub.stop();
  }

  // Subscribe to events
  self.sub = self.connection.subscribe(_prefixedName.call(self, 'events'), self._client);

  return self;
};

RemoteEventDDP.prototype.addListener = function(name, f) {
  var self = this;

  self.eventEmitter.addListener(name, f);

  return self;
};

RemoteEventDDP.prototype.emit = function(/* arguments */) {
  var self = this;

  // Get the method name for the event emitter
  var eventName = _prefixedName.call(self, 'emit');

  // Convert arguments to array
  var args = _.toArray(arguments);

  // Get event name
  var name = args.shift();

  // Add client metadata
  args.unshift(self._client);

  // Add the event name as first argument
  args.unshift(name);

  // Getting:
  // [name, client, args...]

  // Emit event on server
  self.connection.apply(eventName, args);
};


// TODO:
// * Clean up subscriptions in eventSubscriptions calling their `stop` methods
// * Clean up event listeners
// * UnregisterStore
// * Test

