// app/(tabs)/farmer/services/registration.service.ts
import { FarmerDTO } from "../context/FarmerContext";

export function buildRegistrationPayload(farmer: FarmerDTO) {
  if (!farmer) {
  console.warn("Farmer is empty, cannot build payload");
  return;
}
  return {
    state_code: farmer.state_code,
    district_code: farmer.district_code,
    mandal_code: farmer.mandal_code,
    panchayat_code: farmer.panchayat_code,
    village_code: farmer.village_code,
    habitation_code: farmer.habitation_code,

    applicant_name: farmer.applicant_name,
    swdh_name: farmer.swdh_name,
    so_wo_do_ho: farmer.so_wo_do_ho,

    category_code: farmer.category_code,
    caste_code: farmer.caste_code,
    gender: farmer.gender,
    applicant_age: Number(farmer.applicant_age),

    year_code: "25",
    year_main: "2025-26",
    dept_code: "01",

    survey_no: farmer.survey_no,
    land_area_own: farmer.land_area_own,

    appl_type: farmer.appl_type,

    h_no: farmer.h_no,
    street_location: farmer.street_location,
    pin_code: farmer.pin_code,

    email_id: farmer.email_id,
    mobile_no: farmer.mobile_no,

    aadhaar_no: farmer.aadhaar_no,
    ellection_no: farmer.ellection_no,

    pan_card_no: farmer.pan_card_no ?? "",
    kissan_card_no: farmer.kissan_card_no ?? "",
    ration_no: farmer.ration_no ?? "",

    qualification_code: farmer.qualification_code,
    income: farmer.income,

    ll_state_code: farmer.ll_state_code,
    ll_district_code: farmer.ll_district_code,
    ll_mandal_code: farmer.ll_mandal_code,
    ll_panchayat_code: farmer.ll_panchayat_code,
    ll_village_code: farmer.ll_village_code,
    ll_habitation_code: farmer.ll_habitation_code,

    bank_code: farmer.bank_code,
    branch_code: farmer.branch_code,
    branch_ECS_code: farmer.branch_ECS_code,
    account_no: farmer.account_no,

    scheme_nonmfmb: "N",
    message: "Application Submitted",
    appl_reg_no: farmer.appl_reg_no,

    uniqueid1: "",
    uniqueid2: "",
  };
}