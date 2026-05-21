// export const getBeneficiaryByMobile = (mobile: string) =>
//   api.get(`/getbeneficiarydetailsmob`, {
//     params: { kon: '08', mobileno: mobile, year: '25' },
//   });

// export const getBeneficiaryDetails = (applNo: string) =>
//   api.get(`/getbeneficiarydetails`, {
//     params: { kon: '08', appl_reg_no: applNo, year: '25' },
//   });

// export const getStates = () =>
//   api.get(`/GetStates`, { params: { kon: '08' } });

// export const getDistricts = (state: string) =>
//   api.get(`/getDistricts`, { params: { kon: '08', state_code: state } });

// export const getBanks = () =>
//   api.get(`/getBanks`, { params: { kon: '08' } });

// export const getBranches = (district: string, bank: string) =>
//   api.get(`/getBranches`, {
//     params: { kon: '08', district, bank_code: bank },
//   });

// export const getIFSC = (payload) =>
//   api.get(`/getIFSCcodes`, {
//     params: { kon: '08', ...payload },
//   });

// export const submitCoApplicant = (formData: FormData) =>
//   api.post(`/AddBenLanddetailsWithPhoto?kon=08`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });