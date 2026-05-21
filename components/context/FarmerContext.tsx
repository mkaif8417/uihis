// context/FarmerContext.tsx
import React, { createContext, useContext, useState } from "react";

/** 🔹 Backend-aligned Farmer DTO */
export type FarmerDTO = {
  state_code: string; //
  applicant_name: string; //
  name_in_local_language: string;
  applicant_age: number; //
  swdh_name: string; //
  ellection_no: string; //
  aadhaar_no: string; //
  appl_reg_no: string;
  email_id: string; //
  mobile_no: string;
  gender: string; //

  bank_code: string; //
  branch_code: string; // 

  component_type_name: string;
  component_name: string;
  sub_component_name: string;
  crop_item_name: string;

  land_area: string;
  land_area_own: string;
  survey_no: string;

  street_location: string; //
  state_name: string; //
  district_name: string; //
  mandal_name: string; //
  panchayat_name: string; //
  village_name: string; //
  habitation_name: string; //

  ll_state_code: string; //
  ll_district_code: string; // 
  ll_mandal_code: string; //
  ll_panchayat_code: string; //
  ll_village_code: string; //
  ll_habitation_code: string; //

  district_code: string; //
  mandal_code: string; // 
  panchayat_code: string; // 
  village_code: string; //
  habitation_code: string; //

  category_code: string; //
  caste_code: string; //
  appl_type: string; //
  status: string;
  mfmb: string; //
  
  year_code: string;  
  year_main: string;   
  dept_code: string;  

  so_wo_do_ho: string; //
  h_no: string; //

  qualification_code: string; //
  income: string; //

  pan_card_no: string; //
  kissan_card_no: string; //
  ration_no: string; //

  std_code: string;
  phone_resi: string;

  branch_ECS_code: string; //
  account_no: string; //

  scheme_nonmfmb: string; 
  uniqueid1: string;
  uniqueid2: string;
  pin_code: string; //

  message: string;

  photo?: any;
};

type FarmerContextType = {
  farmer: FarmerDTO;
  updateFarmer: (data: Partial<FarmerDTO>) => void;
  resetFarmer: () => void;
};

const initialFarmerState: FarmerDTO = {
  applicant_name: "",
  name_in_local_language: "",
  habitation_code: "",
  qualification_code: "",
  pan_card_no: "",
  kissan_card_no: "",
  ration_no: "",
  so_wo_do_ho: "",
  applicant_age: 0,
  email_id: "",
  swdh_name: "",
  ellection_no: "",
  aadhaar_no: "",
  appl_reg_no: "",
  mobile_no: "",
  gender: "",
  income: "",
  state_code: "",

  bank_code: "",
  branch_code: "",

  year_code: "25",
  year_main: "2024-25",
  dept_code: "01",
  scheme_nonmfmb: "N",
  message: "Application Submitted",
  std_code: "",
  phone_resi: "",
  uniqueid1: "",
  uniqueid2: "",
  branch_ECS_code: "",
  pin_code: "",
  account_no: "",

  component_type_name: "",
  component_name: "",
  sub_component_name: "",
  crop_item_name: "",

  land_area: "",
  land_area_own: "",
  survey_no: "",

  street_location: "",
  state_name: "",
  district_name: "",
  mandal_name: "",
  panchayat_name: "",
  village_name: "",
  habitation_name: "",

  ll_state_code: "",
  ll_district_code: "",
  ll_mandal_code: "",
  ll_panchayat_code: "",
  ll_village_code: "",
  ll_habitation_code: "",

  district_code: "",
  mandal_code: "",
  panchayat_code: "",
  village_code: "",
  h_no: "",

  category_code: "",
  caste_code: "",
  appl_type: "",
  status: "",
  mfmb: "",
};

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<FarmerDTO>(initialFarmerState);

  const updateFarmer = React.useCallback((data: Partial<FarmerDTO>) => {
    console.log("update farmer called")
    setFarmer(prev => ({ ...prev, ...data }));
  }, []);


  const resetFarmer = () => {
    setFarmer(initialFarmerState);
  };

  return (
    <FarmerContext.Provider value={{ farmer, updateFarmer, resetFarmer }}>
      {children}
    </FarmerContext.Provider>
  );
};

const useFarmer = () => {
  const ctx = useContext(FarmerContext);
  if (!ctx) {
    throw new Error("useFarmer must be used within FarmerProvider");
  }
  return ctx;
};

export default useFarmer