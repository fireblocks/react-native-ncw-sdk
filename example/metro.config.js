const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const parentNodeModules = path.resolve(__dirname, '..', 'node_modules');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '..')],

  resolver: {
    nodeModulesPaths: [
      parentNodeModules,
      path.resolve(__dirname, 'node_modules'),
    ],
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
