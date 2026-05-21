export type ApplicationForm = {
    state_code: string;
    district_code: string;
    mandal_code: string;
    panchayat_code: string;
    village_code: string;
    habitation_code: string;

    applicant_name: string;
    swdh_name: string;
    category_code: string;
    caste_code: string;
    year_code: string;
    survey_no: string;
    appl_type: string;
    gender: string;
    so_wo_do_ho: string;

    h_no: string;
    street_location: string;
    email_id: string;
    pin_code: string;
    mobile_no: string;
    std_code: string;
    phone_resi: string;

    applicant_age: number;
    qualification_code: string;
    land_area_own: string;

    ll_state_code: string;
    ll_district_code: string;
    ll_mandal_code: string;
    ll_panchayat_code: string;
    ll_village_code: string;
    ll_habitation_code: string;

    pan_card_no: string;
    kissan_card_no: string;
    ration_no: string;
    ellection_no: string;
    aadhaar_no: string;
    income: string;

    dept_code: string;
    bank_code: string;
    branch_code: string;
    branch_ECS_code: string;
    account_no: string;

    uniqueid1: string;
    uniqueid2: string;
    year_main: string;
    scheme_nonmfmb: string;

    message: string;
    appl_reg_no: string;

    photo_uri?: string;
    photo_file?: {
        uri: string;
        name: string;
        type: string;
    };

};
