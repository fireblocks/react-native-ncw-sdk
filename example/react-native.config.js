const path = require('path');
const pak = require('../package.json');

module.exports = {
  dependencies: {
    [pak.name]: {
      root: path.join(__dirname, '..'),
    },
  },
  reactNativeDir: path.join(__dirname, '../node_modules/react-native'),
  project: {
    android: {
      unstable_reactLegacyComponentNames: ['CameraView'],
    },
    ios: {
      unstable_reactLegacyComponentNames: ['CameraView'],
    },
  },
};
