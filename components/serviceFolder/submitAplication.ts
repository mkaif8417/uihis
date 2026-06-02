import { SubmitApplicationRequest } from "@/types/SubmitApplicationRequest";
import { api } from "./api";

export const submitApplication = async (
  payload: SubmitApplicationRequest
) => {
  try {
    const response = await api.post(
      "/AddBeneficiary?kon=34",
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
