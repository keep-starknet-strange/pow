/* eslint-disable */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)
config.resolver.unstable_conditionNames = [ 'browser', 'require', 'react-native', ]

module.exports = withNativeWind(config, { input: './app/global.css' })
