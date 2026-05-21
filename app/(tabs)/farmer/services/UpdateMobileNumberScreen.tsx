import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import Captcha from "@/components/Captcha";
import useFarmer from "@/components/context/FarmerContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { navigate } from "expo-router/build/global-state/routing";
import Footer from "@/components/Footer";
import Header from "@/components/Header";


const KON = "08";
const YEAR = "25";



export default function UpdateMobileNumberScreen() {
    const [loading, setLoading] = useState(false);
    const { farmer, updateFarmer } = useFarmer()

    const [applRegNo, setApplRegNo] = useState("");
    const [existingMobile, setExistingMobile] = useState("");
    const [applicantName, setApplicantName] = useState("");
    const [relationName, setRelationName] = useState("");
    const [captchaValue, setCaptchaValue] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");



    const [newMobile, setNewMobile] = useState("");

    const isCaptchaValid =
        captchaInput.length > 0 && captchaInput === captchaValue;

    const isMobileValid = newMobile.length === 10;

    const canSubmit = isCaptchaValid && isMobileValid && !loading;

    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaValue(result);
        setCaptchaInput("");
    };

    useEffect(() => {
        generateCaptcha();
        setExistingMobile(farmer.mobile_no)
    }, []);

    useEffect(() => {
        if (existingMobile) {
            loadBeneficiaryDetails();
        }
    }, [existingMobile]);



    const loadBeneficiaryDetails = async () => {

        console.log("Calling API with mobile:", existingMobile);
        try {
            setLoading(true);

            const res = await axios.get(
                `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetailsmob?kon=${KON}&mobileno=${existingMobile}&year=${YEAR}`
            );

            const data = res.data;
            // console.log(data)
            // Adjust keys if backend response differs
            setApplRegNo(data[0].appl_reg_no);
            setApplicantName(data[0].applicant_name);
            setRelationName(data[0].swdh_name);

        } catch (err) {
            Alert.alert("Error", "Failed to load beneficiary details");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UPDATE MOBILE NUMBER ---------------- */
    const updateMobileNumber = async () => {
        // console.log(applRegNo)
        if (newMobile.length !== 10) {
            Alert.alert("Validation", "Enter valid 10-digit mobile number");
            return;
        }

        if (captchaInput !== captchaValue) {
            Alert.alert("Captcha Error", "Captcha does not match");
            generateCaptcha();
            return;
        }

        try {
            setLoading(true);
            console.log(applRegNo)

            const res = await axios.post(
                `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/UpdateMobileNumber?kon=08&applRegNo=${applRegNo}&mobileNo=${newMobile}`,
                null, // no body
                {
                    responseType: "text", // 🔑 important
                }
            );
            console.log(res)

            Alert.alert("Success", res.data || "Mobile number updated successfully");

            // OPTIONAL: update context
            updateFarmer({ mobile_no: newMobile });

        } catch (err: any) {
            console.log("UPDATE ERROR:", err?.response?.data || err.message);
            Alert.alert("Error", "Failed to update mobile number");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Header/>
                <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
                    Update Mobile Number
                </Text>

                {/* READ-ONLY FIELDS */}
                <Label text="Application Registration Number" />
                <ReadOnlyInput value={applRegNo} />

                <Label text="Applicant Name" />
                <ReadOnlyInput value={applicantName} />

                <Label text="Relation Name" />
                <ReadOnlyInput value={relationName} />

                <Label text="Existing Mobile Number" />
                <ReadOnlyInput value={existingMobile} />

                {/* NEW MOBILE */}
                <Label text="New Mobile Number" />
                <TextInput
                    value={newMobile}
                    onChangeText={setNewMobile}
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                />

                <Label text="Enter Captcha" />

                <Captcha value={captchaValue} />

                <TextInput
                    value={captchaInput}
                    onChangeText={(text) => setCaptchaInput(text.toUpperCase())}
                    style={styles.input}
                    autoCapitalize="characters"
                />

                <TouchableOpacity onPress={generateCaptcha}>
                    <Text style={{ color: "#1976d2", marginTop: 6 }}>
                        Reload Captcha
                    </Text>
                </TouchableOpacity>

                {/* ACTION BUTTONS */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            canSubmit ? styles.primary : styles.disabled,
                        ]}
                        onPress={updateMobileNumber}
                        disabled={!canSubmit}
                    >
                        <Text style={styles.btnText}>Update Mobile Number</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.danger]}
                        onPress={() => setNewMobile("")}
                    >
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.secondary]}
                        onPress={() => navigate("/(tabs)/farmer/farmerHome")}
                    >
                        <Text style={styles.btnText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </ScrollView>
        </SafeAreaView>
    );
}

/* ---------------- REUSABLE UI ---------------- */

const Label = ({ text }: { text: string }) => (
    <Text style={{ marginTop: 12, marginBottom: 4, fontWeight: "600" }}>
        {text}
    </Text>
);

const ReadOnlyInput = ({ value }: { value: string }) => (
    <TextInput
        value={value}
        editable={false}
        style={[styles.input, styles.readonly]}
    />
);

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 6,
        backgroundColor: "#fff",
    },


    readonly: {
        backgroundColor: "#f2f2f2",
    },

    disabled: {
        backgroundColor: "#bdbdbd",
    },

    button: {
        flex: 1,
        padding: 14,
        borderRadius: 6,
        alignItems: "center", // ✅ now correctly typed
    },


    primary: {
        backgroundColor: "#1976d2",
    },


    danger: {
        backgroundColor: "#d32f2f",
    },

    secondary: {
        backgroundColor: "#4a4848",
    },


    btnText: {
        color: "#fff",
        fontWeight: "600", // ✅ valid RN union value
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
    },


    label: {
        marginTop: 12,
        marginBottom: 4,
        fontWeight: "600",
    },
});