import { api } from "./api";

export const getActiveSeason = async () => {
  const res = await api.get(
    "/api/ekharid/GetActiveSeasonAsync"
  );
  return res.data.Payload.Table[0]?.SessionID;
};

export const getFarmerDetail = async (mfmb: string) => {
  const res = await api.get(
    `/api/EKharid/GetFarmerDetailMBBY?mfmb=${mfmb}`
  );
  return res.data.Payload?.Table?.[0];
};

export const getLandDetails = async (
  mfmb: string,
  season: string
) => {
  const res = await api.get(
    `/api/EKharid/GetFarmerLandCropDetailMBBY?mfmb=${mfmb}&season=${season}`
  );
  return res.data;
};
