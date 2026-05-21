import { api } from "./api";

export const getBanks = async () => {
  const res = await api.get("/api/General/GetBanks");
  return res.data.Payload;
};

export const getBranches = async (
  state: string,
  district: string,
  bank: string
) => {
  const res = await api.get(
    `/api/General/GetBranches?state_code=${state}&district_code=${district}&bank_code=${bank}`
  );
  return res.data.Payload;
};

export const getIfsc = async (
  bank: string,
  branch: string,
  state: string,
  district: string
) => {
  const res = await api.get(
    `/api/General/GetIFSC?bank_code=${bank}&branch_code=${branch}&state_code=${state}&district_code=${district}`
  );
  return res.data;
};
