// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',            // NativeWind v4 is a preset
    ],
    plugins: [
      'react-native-reanimated/plugin', // keep LAST
    ],
  };
};
