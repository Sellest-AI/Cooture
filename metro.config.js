const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add extra node_modules to prevent issues with barrel exports
config.resolver.extraNodeModules = {
  'global': require('path').resolve(__dirname, 'expo/global'),
};

module.exports = withNativeWind(config, { input: './expo/global.css' });