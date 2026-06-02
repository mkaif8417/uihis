import axios from 'axios';
import { createContext, useContext, useState } from 'react';

const API = axios.create({
  baseURL: "https://localhost:7065/api/UIHis",
});

const SchemeFormContext = createContext<any>(null);

export const SchemeFormProvider = ({ children }: any) => {
  const [form, setForm] = useState({

    registrationId: "",
    /* Step 1 */
    department: '',
    year: '25',
    scheme: '',
    componentType: '',
    component: '',
    subComponent: '',
    cropItem: '',

    /* Step 2 */
    unit: '',
    totalArea: '',
    appliedArea: '',
    surveyNo: '',
    soilType: '',
    irrigationSource: '',
    landType: '',
    waterPump: '',
    vermiCompost: '',
    dripIrrigation: '',
    mipApplied: '',
    agency_ppo: 'test',

    /* Step 3 */
    address: {
      state: '08',
      district: '',
      mandal: '',
      panchayat: '',
      village: '',
      habitation: '',
    }
  });

  const updateForm = (data: any) => {
  console.log("CONTEXT BEFORE:", form);
  setForm(prev => {
    const next = typeof data === "function" ? data(prev) : data;
    console.log("CONTEXT AFTER:", next);
    return next;
  });
};


  const mapFormToBackendPayload = (form: any) => {
    return {
      appl_reg_no: form.registrationId,
      dept_code: form.department,
      year_code: form.year,
      scheme_code: form.scheme,
      component_type_code: form.componentType,
      component_code: form.component,
      sub_component_code: form.subComponent,
      crop_item_code: form.cropItem,

      unit_code: form.unit,
      land_area_own: form.totalArea,
      land_area: form.appliedArea,
      survey_no: form.surveyNo,
      soiltype_code: form.soilType,
      irrigation_source_code: form.irrigationSource,
      landtype_code: form.landType,
      pumps: form.waterPump,
      vermi_compost: form.vermiCompost,
      drip_irrigation: form.dripIrrigation,
      applied_apmip: form.mipApplied,

      ll_state_code: form.address.state,
      ll_district_code: form.address.district,
      ll_mandal_code: form.address.mandal,
      ll_panchayat_code: form.address.panchayat,
      ll_village_code: form.address.village,
      ll_habitation_code: form.address.habitation,
      agency_ppo: form.agency_ppo,
    };
  };

    const validateBeforeSubmit = (form: any) => {
      const errors: string[] = [];
  
      // Step 1
      if (!form.department) errors.push("Department is required");
      if (!form.scheme) errors.push("Scheme is required");
      if (!form.component) errors.push("Component is required");
  
      // Step 2
      if (!form.totalArea || Number(form.totalArea) <= 0)
        errors.push("Total land area must be greater than 0");
  
      if (!form.appliedArea || Number(form.appliedArea) <= 0)
        errors.push("Applied land area must be greater than 0");
  
      if (Number(form.appliedArea) > Number(form.totalArea))
        errors.push("Applied area cannot exceed total area");
  
      // Step 3
      if (!form.address.state) errors.push("State is required");
      if (!form.address.district) errors.push("District is required");
      if (!form.address.village) errors.push("Village is required");
  
      if (errors.length > 0) {
        throw new Error(errors[0]); // show first error only
      }
    };

  
  const postSchemeFiling = async (payload: any) => {
    const response = await API.post(
      `/AddScheme?kon=34`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "text", // 👈 IMPORTANT
      }
    );
  
    return response.data; // string
  };

  const submitSchemeFiling = async () => {
    try {
      validateBeforeSubmit(form);

      const payload = mapFormToBackendPayload(form);
      console.log("Payload: ",payload)
      const responseText = await postSchemeFiling(payload);
      return responseText;
    } catch (err: any) {
      console.log("Scheme Filing Error:", err.message);
      throw err;
    }
  };


  return (
    <SchemeFormContext.Provider value={{ form, updateForm, submitSchemeFiling }}>
      {children}
    </SchemeFormContext.Provider>
  );
};
export const useSchemeForm = () => {
  const context = useContext(SchemeFormContext);
  if (!context) {
    console.warn("SchemeFormProvider missing! Using fallback.");
    return { form: {}, updateForm: () => { }, submitSchemeFiling: async () => { } };
  }
  return context;
};

export default useSchemeForm