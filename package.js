Package.describe({
  name: "raix:eventddp",
  version: '0.0.2',
  summary: "A server and client event package, events via ddp.",
  git: "https://github.com/raix/Meteor-EventDDP.git"
});

Package.onUse(function (api) {

  api.versionsFrom('1.0');

  api.use(['underscore', 'ddp', 'raix:eventemitter@0.1.2']);

  api.use(['random', 'minimongo'], 'server')

  api.addFiles('eventddp.common.js', ['client', 'server']);

  api.addFiles('eventddp.client.js', 'client');

  api.addFiles('eventddp.server.js', 'server');

  api.export('EventDDP')
});


Package.onTest(function (api) {
  api.use(['raix:eventddp']);
  api.use('test-helpers', ['server', 'client']);
  api.use('tinytest');

  api.addFiles('eventddp.tests.client.js', 'client');
  api.addFiles('eventddp.tests.server.js', 'server');
});
