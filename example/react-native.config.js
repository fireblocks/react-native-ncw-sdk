const path = require('path');
const pak = require('../package.json');

module.exports = {
  dependencies: {
    [pak.name]: {
      root: path.join(__dirname, '..'),
    },
  },
  project: {
    android: {
      unstable_reactLegacyComponentNames: ['CameraView'],
    },
    ios: {
      unstable_reactLegacyComponentNames: ['CameraView'],
    },
  },
};
