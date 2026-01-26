const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude the .history folder from Metro bundler/watchers (handles Unix and Windows paths)
config.resolver.blockList = [/.*[\/\\]\.history[\/\\].*/];

// Add extra node_modules to prevent issues with barrel exports
config.resolver.extraNodeModules = {
  'global': path.resolve(__dirname, 'expo/global'),
};

module.exports = withNativeWind(config, { input: './expo/global.css' });