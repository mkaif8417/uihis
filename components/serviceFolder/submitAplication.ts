import { api } from "./api";
import { SubmitApplicationRequest } from "@/types/SubmitApplicationRequest";

export const submitApplication = async (
  payload: SubmitApplicationRequest
) => {
  try {
    const response = await api.post(
      "/AddBeneficiary?kon=08",
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error("SUBMIT ERROR:", {
      status: error?.response?.status,
      data: error?.response?.data,
    });

    throw error;
  }
};
