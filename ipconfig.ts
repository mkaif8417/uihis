
const getBaseURL = (): string => {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
};

export const BASE_URL: string = getBaseURL();