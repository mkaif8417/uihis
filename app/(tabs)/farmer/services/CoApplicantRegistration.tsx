import useFarmer from "@/components/context/FarmerContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, Image, ScrollView,
    StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API = axios.create({
    baseURL: "https://localhost:7065/api/UIHis",
});

export default function CoApplicantRegistration() {
    const { farmer } = useFarmer();

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<any>(null);

    const [form, setForm] = useState<any>({
        appl_reg_no: "",
        applicant_name: "",
        survey_no: "",
        land_extent: "",
        ll_state_code: "",
        ll_district_code: "",
        ll_mandal_code: "",
        ll_panchayat_code: "",
        ll_village_code: "",

        coApplicant: "",
        owner1: "",
        owner2: "",
        khata_no: "",

        bank_state: "",
        bank_district: "",
        bank_code: "",
        branch_code: "",
        ifsc: "",
        account_no: "",
    });

    const [states, setStates] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [banks, setBanks] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        loadByMobile();
    }, []);

    const loadByMobile = async () => {
        try {
            // console.log(farmer.mobile_no)
            setLoading(true);
            const res = await API.get("/getbeneficiarydetailsmob", {
                params: {
                    kon: "34",
                    mobileno: farmer.mobile_no,
                    year: "25",
                },
            });

            setForm((p: any) => ({
                ...p,
                appl_reg_no: res.data[0]?.appl_reg_no || "",
            }));
        } catch (e) {
            Alert.alert("Error", "Failed to load registration number");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- FETCH DETAILS ---------------- */
    const fetchDetails = async () => {
        if (!form.appl_reg_no) return;
        try {
            setLoading(true);
            const res = await API.get(`/getbeneficiarydetails?kon=34&appl_reg_no=${form.appl_reg_no}&year=25`);

            const d = res.data;
            // console.log(d[0])

            setForm((p: any) => ({
                ...p,
                applicant_name: d[0].applicant_name,
                survey_no: d[0].survey_no,
                land_extent: d[0].land_area_own,
                ll_state_code: d[0].ll_state_code,
                ll_district_code: d[0].ll_district_code,
                ll_mandal_code: d[0].ll_mandal_code,
                ll_panchayat_code: d[0].ll_panchayat_code,
                ll_village_code: d[0].ll_village_code,
            }));

            loadStates();
            loadBanks();
        } catch {
            Alert.alert("Error", "Unable to fetch beneficiary details");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- BANK CASCADE ---------------- */
    const loadStates = async () => {
        const res = await API.get("/GetStates", { params: { kon: "34" } });
        setStates(res.data || []);
    };

    const loadDistricts = async (state: string) => {
        const res = await API.get("/getDistricts", {
            params: { kon: "34", state_code: state },
        });
        setDistricts(res.data || []);
    };

    const loadBanks = async () => {
        const res = await API.get("/getBanks", { params: { kon: "34" } });
        setBanks(res.data || []);
    };

    const loadBranches = async (district: string, bank: string) => {
        const res = await API.get("/getBranches", {
            params: { kon: "34", district, bank_code: bank },
        });
        setBranches(res.data || []);
    };

    const loadIFSC = async () => {
        try {
            const res = await API.get("/getIFSCcodes", {
                params: {
                    kon: "34",
                    bank_code: form.bank_code,
                    branch_code: form.branch_code,
                    state_code: form.bank_state,
                    district_code: form.bank_district,
                },
                responseType: "text", // 🔥 IMPORTANT
            });

            console.log("RAW IFSC RESPONSE:", res.data);

            // backend returns plain text IFSC
            const ifsc = String(res.data).trim();

            setForm((p: any) => ({
                ...p,
                ifsc,
            }));
        } catch (err) {
            console.log("IFSC ERROR:", err);
            setForm((p: any) => ({ ...p, ifsc: "" }));
        }
    };

    /* ---------------- IMAGE ---------------- */
    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!res.canceled) setImage(res.assets[0]);
    };

    const loadIFSCWithValues = async (
        bank_code: string,
        branch_code: string,
        state_code: string,
        district_code: string
    ) => {
        try {
            const res = await API.get("/getIFSCcodes", {
                params: {
                    kon: "34",
                    bank_code,
                    branch_code,
                    state_code,
                    district_code,
                },
                responseType: "text",
            });

            const ifsc = String(res.data).trim();
            setForm((p: any) => ({ ...p, ifsc }));
        } catch {
            setForm((p: any) => ({ ...p, ifsc: "" }));
        }
    };

    /* ---------------- SUBMIT ---------------- */
    const submit = async () => {
        if (isSubmitDisabled) {
            Alert.alert("Validation", "Please complete all mandatory fields");
            return;
        }

        const fd = new FormData();

        fd.append("appl_reg_no", form.appl_reg_no);
        fd.append("Name", form.applicant_name);

        fd.append("ll_state_code", form.ll_state_code);
        fd.append("ll_district_code", form.ll_district_code);
        fd.append("ll_mandal_code", form.ll_mandal_code);
        fd.append("ll_panchayat_code", form.ll_panchayat_code);
        fd.append("ll_village_code", form.ll_village_code);

        fd.append("survey_no", form.survey_no);
        fd.append("land_extent", form.land_extent);

        fd.append("CoApplicant", form.coApplicant);
        fd.append("Nomiee_Account", form.account_no);
        fd.append("Nomiee_Bank", form.bank_code);
        fd.append("Nomiee_Branch", form.branch_code);
        fd.append("Nomiee_Ifsc", form.ifsc);

        const appendIf = (key: string, value: any) => {
            if (value && String(value).trim() !== "") {
                fd.append(key, String(value));
            }
        };

        appendIf("CoApplicant1", form.owner1);
        appendIf("CoApplicant2", form.owner2);
        appendIf("khata_no", form.khata_no);

        const imageToSend = image?.uri
            ? {
                uri: image.uri,
                type: "image/jpeg",
                name: "coapplicant.jpg",
            }
            : {
                uri: Image.resolveAssetSource(
                    require("../../../../assets/images/blank.jpg")
                ).uri,
                type: "image/jpg",
                name: "blank.jpg",
            };

        fd.append("Nomiee_image", imageToSend as any);

        console.log(fd)

        try {
            setLoading(true);

            await API.post(
                "/AddBenLanddetailsWithPhoto",
                fd,
                { params: { kon: "34" } }
            );

            Alert.alert("Success", "Co-Applicant registered successfully");
        } catch (err: any) {
            console.log("STATUS:", err?.response?.status);
            console.log("DATA:", err?.response?.data);
            Alert.alert("Error", "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled =
        !form.appl_reg_no ||
        !form.applicant_name ||
        !form.coApplicant ||
        !form.bank_state ||
        !form.bank_district ||
        !form.bank_code ||
        !form.branch_code ||
        !form.ifsc ||
        !form.account_no ||
        loading;

    /* ---------------- UI ---------------- */
    if (loading) return <ActivityIndicator size="large" />;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Header />
                <Text style={styles.title}>Co-Applicant & Multiple Owner Registration</Text>

                <TextInput style={styles.input} value={form.appl_reg_no} editable={false} />
                <TouchableOpacity style={styles.btn} onPress={fetchDetails}>
                    <Text style={styles.btnTxt}>Fetch Details</Text>
                </TouchableOpacity>

                <Label text={"Applicant name"} />
                <TextInput style={styles.input} value={form.applicant_name} editable={false} />
                <Label text={"Survey number"} />
                <TextInput style={styles.input} value={form.survey_no} editable={false} />
                <Label text={"Land extent"} />
                <TextInput style={styles.input} value={form.land_extent} editable={false} />
                <Label text={"State"} />
                <TextInput style={styles.input} value={form.ll_state_code} editable={false} />
                <Label text={"District"} />
                <TextInput style={styles.input} value={form.ll_district_code} editable={false} />
                <Label text={"Mandal"} />
                <TextInput style={styles.input} value={form.ll_mandal_code} editable={false} />
                <Label text={"Panchayat"} />
                <TextInput style={styles.input} value={form.ll_panchayat_code} editable={false} />
                <Label text={"Village"} />
                <TextInput style={styles.input} value={form.ll_village_code} editable={false} />

                <TextInput
                    style={styles.input}
                    placeholder="Co-Applicant Name *"
                    value={form.coApplicant}
                    onChangeText={(v) => setForm({ ...form, coApplicant: v })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Land owner 1"
                    value={form.owner1}
                    onChangeText={(v) => setForm({ ...form, owner1: v })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Land owner 2"
                    value={form.owner2}
                    onChangeText={(v) => setForm({ ...form, owner2: v })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Khata Number"
                    value={form.khata_no}
                    onChangeText={(v) => setForm({ ...form, khata_no: v })}
                />

                {/* ---------------- BANK DETAILS ---------------- */}

                <Text style={styles.section}>Co-Applicant Bank Details</Text>

                {/* STATE */}
                <View style={styles.pickerWrap}>
                    <Picker
                        selectedValue={form.bank_state}
                        onValueChange={(v) => {
                            setForm({
                                ...form,
                                bank_state: v,
                                bank_district: "",
                                bank_code: "",
                                branch_code: "",
                                ifsc: "",
                            });
                            loadDistricts(v);
                        }}
                    >
                        <Picker.Item label="Select State *" value="" />
                        {states.map((s) => (
                            <Picker.Item key={s.state_code} label={s.state_name} value={s.state_code} />
                        ))}
                    </Picker>
                </View>

                {/* DISTRICT */}
                <View style={styles.pickerWrap}>
                    <Picker
                        selectedValue={form.bank_district}
                        enabled={!!form.bank_state}
                        onValueChange={(v) => {
                            setForm({
                                ...form,
                                bank_district: v,
                                bank_code: "",
                                branch_code: "",
                                ifsc: "",
                            });
                        }}
                    >
                        <Picker.Item label="Select District *" value="" />
                        {districts.map((d) => (
                            <Picker.Item key={d.district_code} label={d.district_name} value={d.district_code} />
                        ))}
                    </Picker>
                </View>

                {/* BANK */}
                <View style={styles.pickerWrap}>
                    <Picker
                        selectedValue={form.bank_code}
                        enabled={!!form.bank_district}
                        onValueChange={(v) => {
                            setForm({
                                ...form,
                                bank_code: v,
                                branch_code: "",
                                ifsc: "",
                            });
                            loadBranches(form.bank_district, v);
                        }}
                    >
                        <Picker.Item label="Select Bank *" value="" />
                        {banks.map((b) => (
                            <Picker.Item key={b.bank_code} label={b.bank_name} value={b.bank_code} />
                        ))}
                    </Picker>
                </View>

                {/* BRANCH */}
                <View style={styles.pickerWrap}>
                    <Picker
                        selectedValue={form.branch_code}
                        enabled={!!form.bank_code}
                        onValueChange={(v) => {
                            setForm((prev: any) => {
                                const updated = { ...prev, branch_code: v };
                                loadIFSCWithValues(
                                    updated.bank_code,
                                    v,
                                    updated.bank_state,
                                    updated.bank_district
                                );
                                return updated;
                            });
                        }}
                    >
                        <Picker.Item label="Select Branch *" value="" />
                        {branches.map((b) => (
                            <Picker.Item key={b.branch_code} label={b.branch_name} value={b.branch_code} />
                        ))}
                    </Picker>
                </View>

                {/* IFSC (AUTO) */}
                <TextInput
                    style={styles.input}
                    placeholder="IFSC Code"
                    value={form.ifsc}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Account Number *"
                    value={form.account_no}
                    onChangeText={(v) => setForm({ ...form, account_no: v })}
                />

                <TouchableOpacity style={styles.btn} onPress={pickImage}>
                    <Text style={styles.btnTxt}>Upload Photo (Optional)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={isSubmitDisabled}
                    onPress={submit}
                    style={[
                        styles.btn,
                        {
                            backgroundColor: isSubmitDisabled ? "#9e9e9e" : "green",
                            opacity: isSubmitDisabled ? 0.6 : 1,
                        },
                    ]}
                >
                    <Text style={styles.btnTxt}>
                        {isSubmitDisabled ? "Complete required fields" : "Submit"}
                    </Text>
                </TouchableOpacity>
                <Footer />
            </ScrollView>
        </SafeAreaView>
    );
}

const Label = ({ text, optional }: { text: string; optional?: boolean }) => (
    <Text style={styles.label}>
        {text}
        {!optional && <Text style={styles.required}> *</Text>}
    </Text>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { padding: 14 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
    },
    label: {
        fontSize: 13,
        color: "#333",
        marginTop: 12,
        marginBottom: 4,
        fontWeight: "500",
    },
    required: {
        color: "#d32f2f",
    },
    btn: {
        backgroundColor: "#1976d2",
        padding: 12,
        borderRadius: 6,
        alignItems: "center",
        marginBottom: 12,
    },
    btnTxt: { color: "#fff", fontWeight: "600" },
    section: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 10,
    },

    pickerWrap: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        marginBottom: 10,
    },
});