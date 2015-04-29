var _createHandleEmit = function(client, publish) {
  var self = this;
  var firstRun = true;

  return function(matcher, args) {

    if (matcher !== null) {

      // Check if doc match selector
      if (!matcher.documentMatches(client).result) return;
    }
    // Remove from patch mem - this also sends a message to the client
    // but its ignored.
    // It would be nice if we had a simple "emit" maybe intercept the
    // socket api instead?
    if (!firstRun)
      publish.removed(self._eventName, 'emit');

    // Send event new data
    publish.added(self._eventName, 'emit', {
      args: args
    });

    // Not the first run
    firstRun = false;
  };
};

var _createServerMethod = function() {
  var self = this;
  var m = {};

  // Set the emit method
  m[_prefixedName.call(self, 'emit')] = function(/* client, args */) {
    // Convert args to array
    var args = _.toArray(arguments);

    // Check event name
    check(args[0], String);

    // Check client object
    check(args[1], Object);
    // If args are two or more then ok?
    if (args.length > 1) {
      // Set the userId
      _.extend(args[1], { userId: this.userId });

      // Emit the event
      self.eventEmitter.emit.apply(self.eventEmitter, args);
    }
  };

  return m;
};

EventDDP = function(prefix) {
  var self = this;

  if (!(self instanceof EventDDP)) {
    return new EventDDP(prefix);
  }

  if (prefix !== '' + prefix) {
    throw new Error('EventDDP expects prefix to be type String');
  }

  // Set prefix
  self.prefix = prefix;

  // Fire up an event emitter
  self.eventEmitter = new EventEmitter();

  // Set prefixed event name
  self._eventName = _prefixedName.call(self, 'events');

  // Start listening for client emitters
  Meteor.methods(_createServerMethod.call(self));

  // Start publish method
  Meteor.publish(self._eventName, function(client) {
    var publish = this;

    // Handle normal emit
    var handle = _createHandleEmit.call(self, client, publish);

    // Add listener for the ddpEvent
    // TODO: Isolate this in an internal emitter?
    self.eventEmitter.addListener('ddpEvent', handle);

    // Let the publish be ready
    publish.ready();

    // Clean up the internal event listener
    publish.onStop(function() {
      // Release handle
      self.eventEmitter.removeListener('ddpEvent', handle);
    });

  });
};

EventDDP.prototype.addListener = function(name, f) {
  var self = this;

  // Add event listener
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


EventDDP.prototype.emit = function(name /* arguments */) {
  var self = this;

  // Emit ddp event
  self.eventEmitter.emit('ddpEvent', null, _.toArray(arguments));

  return self;
};

EventDDP.prototype.matchEmit = function(name, selector /* arguments */) {
  var self = this;

  // Argument to array
  var args = _.toArray(arguments);

  // Remove the selector
  args.splice(1, 1);

  // Run selector on client object if not satisfied then return
  var matcher = new Minimongo.Matcher(selector);

  // Emit ddp event
  self.eventEmitter.emit('ddpEvent', matcher, args);

  return self;
};

