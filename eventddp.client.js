EventDDP = function(prefix, connection) {
  var self = this;

  if (!(self instanceof EventDDP)) {
    return new EventDDP(prefix, connection);
  }

  if (prefix !== '' + prefix) {
    throw new Error('EventDDP expects prefix to be type String');
  }

  if (!connection) {
    // Default to Meteor connection
    connection = Meteor.connection;
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
    throw new Error("There is already a EventDDP named '" + prefix + "'");
  }

  // Initialize
  self.setClient({});
};


EventDDP.prototype.setClient = function(options) {
  var self = this;

  if ('userId' in options) {
    throw new Error('EventDDP.setClient - userId is set by server');
  }

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

EventDDP.prototype.addListener = function(name, f) {
  var self = this;

  self.eventEmitter.addListener(name, f);

  return self;
};

EventDDP.prototype.once = function(name, f) {
  var self = this;

  self.eventEmitter.once(name, f);

  return self;
};

EventDDP.prototype.removeListener = function(name, f) {
  var self = this;

  self.eventEmitter.removeListener(name, f);

  return self;
};


EventDDP.prototype.emit = function(/* arguments */) {
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
