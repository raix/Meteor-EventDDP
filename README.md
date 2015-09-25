raix:eventddp
==============

This package adds events over ddp, so you can emit and listen to events from client and server.


```js
  var ddpEvents = new EventDDP('raix:push', Meteor.connection);

  ddpEvents.addListener('push', function(message) {
    // Got message
    // Use the notification api to display a nice native notification?
    alert(message);
  });

  ddpEvents.setClient({
    // Setting userId here throws an error
    // userId: '',
    // This is an example of metadata
    appId: '2222',
    foo: 'bar'
  });

  ddpEvents.emit('token', token);
```


On the server:
```js
  var ddpEvents = new EventDDP('raix:push');

  // Added list of userId's - the selector is optional - if omitted then broadcast
  ddpEvents.matchEmit('push', {
    $and: [
      userId: ['fsDFf7fsfdfs'],
      appId: '2222',
      foo: 'bar'
    ]
  }, 'Hello');

  ddpEvents.addListener('token', function(client, token) {
    if (client.userId) {
        // check client.appId
        // check client.foo
    }
  });
```


### How does this work?

This is a simple walkthrough the core features:

Example:
```js
em = new EventDDP('test');

if (Meteor.isClient) {
  em.addListener('hello', function() {
    console.log('SERVER HI', _.toArray(arguments));
  }); 
}

if (Meteor.isServer) {
  em.addListener('hello', function(/* client */) {
    console.log('HELLO', _.toArray(arguments));
  });
}
```

Now emitting an event on the server or client will trigger the event listener eg.:

Browser console:
```js
  em.emit('hello');
  // server --> HELLO [ { userId: null } ]
```
Notice that the first argument in the server listener is the client details.

We can set additional metadata on the client object if we want:
*(Browser console)*
```js
  em.setClient({ foo: 'bar' });
  em.emit('hello');
  // server --> HELLO [ { foo: 'bar', userId: null } ]
```
*Note userId is set by the server*

We can also emit events from the server:
*($ meteor shell)*
```js
   em.emit('hello');
   // client --> SERVER HI []
```

We can also use the `matchEmit` to do a client specific emit:
*($ meteor shell)*
```js
  // Match the client metadata
  em.matchEmit('hello', { foo: 'bar' });
  // client --> SERVER HI []
```

The `matchEmit` relies on the existing document matching in the `MiniMongo` package.

Example of how the matcher works, you might find it useful in other projects:
```js
  // $ meteor add minimongo
  var match = new Minimongo.Matcher({ a: { $gt: 5 } });
  match.documentMatches({ a: 1 }); // { result: false }
  match.documentMatches({ a: 6 }); // { result: true }
```

### TODO:
* [ ] Write the full api
* [ ] Write complete test coverage

Kind regards Morten
