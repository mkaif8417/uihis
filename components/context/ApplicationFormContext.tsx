import React, { createContext, useContext, useState } from "react";

/* =========================
   TYPES (MATCH SWAGGER)
========================= */

export type ApplicationForm = {
  // Address
  state_code?: string;
  district_code?: string;
  mandal_code?: string;
  panchayat_code?: string;
  village_code?: string;
  habitation_code?: string;

  // Personal
  applicant_name?: string;
  swdh_name?: string;
  category_code?: string;
  caste_code?: string;
  year_code?: string;
  survey_no?: string;
  appl_type?: string;
  gender?: string;
  so_wo_do_ho?: string;
  h_no?: string;
  street_location?: string;
  email_id?: string;
  pin_code?: string;
  mobile_no?: string;
  applicant_age?: number;
  qualification_code?: string;
  income?: string;

  // Land
  land_area_own?: string;
  ll_state_code?: string;
  ll_district_code?: string;
  ll_mandal_code?: string;
  ll_panchayat_code?: string;
  ll_village_code?: string;
  ll_habitation_code?: string;

  // Bank
  bank_code?: string;
  branch_code?: string;
  branch_ECS_code?: string;
  account_no?: string;

  // IDs
  pan_card_no?: string;
  kissan_card_no?: string;
  ration_no?: string;
  ellection_no?: string;
  aadhaar_no?: string;
  uniqueid1?: string; // PPP
  uniqueid2?: string; // MFMB

  // Meta
  scheme_nonmfmb?: string;
  appl_reg_no?: string;

  // Photo (not sent in JSON)
  photo_uri?: string;
  photo_file?: {
    uri: string;
    name: string;
    type: string;
  };
};

/* =========================
   CONTEXT SHAPE
========================= */

type ContextType = {
  form: ApplicationForm;
  updateFields: (data: Partial<ApplicationForm>) => void;
  resetForm: () => void;

  validateForm: () => {
    isValid: boolean;
    errors: string[];
  };

  submitForm: () => Promise<string>;
};

/* =========================
   CONTEXT
========================= */

const ApplicationFormContext = createContext<ContextType | null>(null);

export const useApplicationForm = () => {
  const ctx = useContext(ApplicationFormContext);
  if (!ctx) {
    throw new Error("useApplicationForm must be used inside provider");
  }
  return ctx;
};

/* =========================
   PROVIDER
========================= */

const API_BASE = "https://YOUR_API_BASE_URL/";

export const ApplicationFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [form, setForm] = useState<ApplicationForm>({});

  /* ---------- UPDATE ---------- */
  const updateFields = (data: Partial<ApplicationForm>) => {
    setForm(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setForm({});
  };

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    const errors: string[] = [];

    if (!form.applicant_name) errors.push("Applicant Name");
    if (!form.swdh_name) errors.push("Guardian Name");
    if (!form.gender) errors.push("Gender");
    if (!form.applicant_age) errors.push("Age");
    if (!form.aadhaar_no) errors.push("Aadhaar No");

    if (!form.state_code) errors.push("State");
    if (!form.district_code) errors.push("District");
    if (!form.village_code) errors.push("Village");
    if (!form.mobile_no) errors.push("Mobile No");

    if (!form.bank_code) errors.push("Bank");
    if (!form.branch_code) errors.push("Branch");
    if (!form.account_no) errors.push("Account Number");

    if (!form.land_area_own) errors.push("Land Area");
    if (!form.survey_no) errors.push("Survey No");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /* ---------- SUBMIT ---------- */
  const submitForm = async (): Promise<string> => {
    /* 1️⃣ Submit main form (JSON) */
    const payload = { ...form };
    delete payload.photo_uri;
    delete payload.photo_file;

    const res = await fetch(
      API_BASE + "UIHis/SubmitApplication",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Form submission failed");
    }

    const appl_reg_no = await res.text();

    if (form.photo_file) {
      const fd = new FormData();
      fd.append("appl_reg_no", appl_reg_no);
      fd.append("photo", form.photo_file as any);

      await fetch(
        API_BASE + "UIHis/UploadPhoto",
        {
          method: "POST",
          body: fd,
        }
      );
    }

    updateFields({ appl_reg_no });

    return appl_reg_no;
  };

  return (
    <ApplicationFormContext.Provider
      value={{
        form,
        updateFields,
        resetForm,
        validateForm,
        submitForm,
      }}
    >
      {children}
    </ApplicationFormContext.Provider>
  );
};
