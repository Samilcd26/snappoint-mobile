const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { createExtraNodeModules } = require('./alias.config');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Metro yapılandırmasına alias ekleyelim
config.resolver.extraNodeModules = createExtraNodeModules();

module.exports = withNativeWind(config, { input: './global.css' });
