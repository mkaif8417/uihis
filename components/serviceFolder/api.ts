import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:7065/api/UIHis", // from swagger
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
