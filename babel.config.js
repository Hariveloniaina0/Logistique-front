module.exports = function (api) {
  api.cache(true);
  let plugins = [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: true,
      allowUndefined: false,
    }],
    ['react-native-reanimated/plugin'],
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
