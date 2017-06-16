Package.describe({
  name: 'astrocoders:meteor-frenet',
  version: '0.0.1',
  summary: 'Get Frenet shipping costs without complications',
  git: '',
  documentation: 'README.md',
})

Npm.depends({
  request: '2.81.0'
})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3')

  api.use([
    'ecmascript',
    'check',
    'stevezhu:lodash@3.10.1',
  ], 'server');

  api.addFiles('meteor-frenet.js', 'server')

  api.export('Frenet')
})
