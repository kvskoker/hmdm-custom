const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'devicelog',

  exposes: {
    './routes': './projects/devicelog/src/app/app.routes.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@angular/material': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
      eager: false,
    },
    'hmdm-ui-kit': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
      eager: false, // Import from host
    },
  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  publicPath: 'auto',
});
