module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        blocklist: null,
        allowlist: ["GOOGLE_API_KEY"],
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
