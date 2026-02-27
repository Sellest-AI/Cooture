const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
const originalResolveRequest = config.resolver.resolveRequest;

// Exclude the .history folder from Metro bundler/watchers (handles Unix and Windows paths)
config.resolver.blockList = [/.*[\/\\]\.history[\/\\].*/];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib' || moduleName.endsWith('/tslib')) return {
    filePath: path.resolve(__dirname, './node_modules/tslib/tslib.js'),
    type: 'sourceFile',
  };
  if (originalResolveRequest) return originalResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './expo/global.css' });