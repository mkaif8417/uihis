import axios from "axios";

export const api = axios.create({
  baseURL: "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis", // from swagger
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
