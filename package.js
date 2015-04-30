Package.describe({
  name: "flyandi:eventddp",
  version: '0.0.3',
  summary: "A server and client event package, events via ddp.",
  git: "https://github.com/flyandi/Meteor-EventDDP.git"
});

Package.onUse(function (api) {

  api.versionsFrom('1.0');

  api.use(['underscore', 'ddp', 'raix:eventemitter@0.1.2']);

  api.use(['random', 'minimongo'], 'server')

  api.addFiles('eventddp.common.js', ['client', 'server']);

  api.addFiles('eventddp.client.js', 'client');

  api.addFiles('eventddp.server.js', 'server');

  api.addFiles('eventddp.remote.js', 'server');

  api.export('EventDDP');
  api.export('RemoteEventDDP', 'server');
});


Package.onTest(function (api) {
  api.use(['flyandi:eventddp']);
  api.use('test-helpers', ['server', 'client']);
  api.use('tinytest');

  api.addFiles('eventddp.tests.client.js', 'client');
  api.addFiles('eventddp.tests.server.js', 'server');
});
