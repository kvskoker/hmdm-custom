const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
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
      eager: true, // Load eagerly so it's available for plugins
    },
  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing'],
});
