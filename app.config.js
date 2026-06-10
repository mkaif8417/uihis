export default ({ config }) => ({
  ...config,
  extra: {
    secretKey: process.env.EXPO_PUBLIC_SECRET_KEY,
    secretIv:  process.env.EXPO_PUBLIC_SECRET_IV,
    apiUrl:    process.env.EXPO_PUBLIC_API_BASE_URL,  // ← was EXPO_PUBLIC_API_URL, fix this
  },
});