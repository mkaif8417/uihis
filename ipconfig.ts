import { Platform } from "react-native";

const LOCAL_IP = "192.168.1.100";
const PORT = "5065";

const getBaseURL = (): string => {
  if (Platform.OS === "web") {
    return `http://localhost:${PORT}/api`;
  }

  return `http://${LOCAL_IP}:${PORT}/api`;
};

export const BASE_URL: string = getBaseURL();