export default ({ config }) => ({
  ...config,  // ← this pulls everything from your app.json automatically
  extra: {
    secretKey: process.env.EXPO_PUBLIC_SECRET_KEY,
    secretIv:  process.env.EXPO_PUBLIC_SECRET_IV,
    apiUrl:    process.env.EXPO_PUBLIC_API_URL,
  },
});