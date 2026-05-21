import { api } from "./api";

export const getStates = async () => {
  const res = await api.get("/api/General/GetStates");
  return res.data.Payload;
};

export const getDistricts = async (state: string) => {
  const res = await api.get(
    `/api/General/GetDistricts?state_code=${state}`
  );
  return res.data.Payload;
};

export const getBlocks = async (
  state: string,
  district: string
) => {
  const res = await api.get(
    `/api/General/GetMandals?state_code=${state}&district_code=${district}`
  );
  return res.data.Payload;
};

export const getPanchayats = async (
  state: string,
  district: string,
  mandal: string
) => {
  const res = await api.get(
    `/api/General/GetPanchayats?state_code=${state}&district_code=${district}&mandal_code=${mandal}`
  );
  return res.data.Payload;
};

export const getVillages = async (
  state: string,
  district: string,
  mandal: string,
  panchayat: string
) => {
  const res = await api.get(
    `/api/General/GetVillages?state_code=${state}&district_code=${district}&mandal_code=${mandal}&panchayat_code=${panchayat}`
  );
  return res.data.Payload;
};
