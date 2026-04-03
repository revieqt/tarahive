// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for expo-router
config.resolver.sourceExts.push('cjs');

module.exports = config;
