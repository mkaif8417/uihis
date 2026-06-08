import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://hortnet.hortharyana.gov.in/UIHortHar-API/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});