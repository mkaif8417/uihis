import Captcha from "@/components/Captcha";
import ScreenLayout from "@/components/ScreenLayout";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import useFarmer from "../../../components/context/FarmerContext";

const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


function FarmerLogin() {

    const [mfmb, setMfmb] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sentotp, setSentOtp] = useState("");

    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [error, setError] = useState("");
    const { farmer, updateFarmer } = useFarmer()

    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    const sendOtp = async () => {
        if (mobile.length !== 10) {
            setError("Enter valid mobile number");
            return;
        }

        try {
            const res = await fetch(
                `https://localhost:7065/api/UIHis/getotp?userid=${mobile}`,
                {
                    method: "GET",
                }
            );

            const text = await res.text();

            if (!res.ok) {
                setError("Server error");
                return;
            }

            if (text && text.length == 6) {
                setSentOtp(text)
                setOtpSent(true);
                setOtp(text)
                setError("");
                alert("OTP sent successfully");
            } else {
                setError(text || "Failed to send OTP");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const verifyOtp = async () => {
        if (otp.length !== 6) {
            setError("Enter valid OTP");
            return;
        }
        if (otp !== sentotp) {
            setError("Invalid OTP");
        }
        else {
            const res = await fetch(
                `https://localhost:7065/api/UIHis/getbeneficiarydetailsmob?kon=34&mobileno=${mobile}&year=25`,
                { method: "GET" }
            );
            const result = await res.json();
            if (!Array.isArray(result) || result.length === 0) {
                setError("No beneficiary data found");
                return;
            }

            updateFarmer({
                applicant_name: result[0].applicant_name,
                swdh_name: result[0].swdh_name,
                appl_reg_no: result[0].appl_reg_no,
                mobile_no: mobile,
            });
            setTimeout(() => {
                router.replace("/farmer/farmerHome");
            }, 0);
        }
    };

    return (
        <ScreenLayout>
            {/* ✅ SafeAreaView removed — ScreenLayout already handles safe area */}
            <ScrollView contentContainerStyle={styles.container}>
                {/* Welcome */}
                <Text style={styles.welcome}>WELCOME TO HARYANA</Text>

                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require("../../../assets/images/loginlogo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.headerText}>Farmer LOGIN</Text>
                </View>

                <View style={styles.divider} />

                {/* MFMB No */}
                <TextInput
                    placeholder="Enter MFMB No (Optional)"
                    keyboardType="number-pad"
                    value={mfmb}
                    onChangeText={setMfmb}
                    style={styles.input}
                />

                {/* Mobile No */}
                <TextInput
                    placeholder="Enter Registered Mobile No"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={setMobile}
                    style={styles.input}
                />

                {/* Warning */}
                <Text style={styles.warning}>
                    Change Mobile No, If shown no is not Valid. Before clicking GET OTP..
                </Text>

                {/* Get OTP */}
                <Pressable
                    style={[
                        styles.primaryBtn,
                        otpSent && { backgroundColor: "#9e9e9e" },
                    ]}
                    disabled={otpSent}
                    onPress={sendOtp}
                >
                    <Text style={styles.btnText}>
                        {otpSent ? "OTP Sent" : "Get OTP"}
                    </Text>
                </Pressable>

                {/* OTP Input */}
                <TextInput
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    style={styles.input}
                />

                {/* OTP Info */}
                <Text style={styles.otpInfo}>
                    OTP Valid For 10 Minutes. Wait for SMS OTP
                </Text>
                <Text style={styles.otpInfo}>
                    {sentotp}
                </Text>

                {/* CAPTCHA */}
                <View style={styles.captchaWrapper}>
                    <Captcha value={captcha} />

                    <Pressable
                        style={styles.reloadBtn}
                        onPress={() => {
                            setCaptcha(generateCaptcha());
                            setCaptchaInput("");
                            setError("");
                        }}
                    >
                        <Text style={styles.reloadText}>↻</Text>
                    </Pressable>
                </View>

                <TextInput
                    placeholder="Enter CAPTCHA"
                    value={captchaInput}
                    onChangeText={setCaptchaInput}
                    style={styles.input}
                />

                {/* Login Button */}
                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => {
                        if (captchaInput.toUpperCase() !== captcha) {
                            setError("Invalid CAPTCHA");
                            return;
                        }
                        verifyOtp()
                    }}
                >
                    <Text style={styles.btnText}>Login</Text>
                </Pressable>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
    },

    welcome: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1b5e20",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    logo: {
        width: 40,
        height: 40,
        marginRight: 8,
    },

    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },

    divider: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#999",
        marginVertical: 10,
    },

    input: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 12,
        marginVertical: 6,
        fontSize: 14,
    },

    warning: {
        fontSize: 12,
        color: "red",
        marginVertical: 6,
    },

    primaryBtn: {
        width: "100%",
        backgroundColor: "#2e7d32",
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center",
        marginVertical: 8,
    },

    btnText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 15,
    },

    otpInfo: {
        paddingBottom: 25,
        fontSize: 12,
        color: "red",
        marginVertical: 6,
    },

    errorText: {
        color: "red",
        fontSize: 13,
        marginTop: 6,
    },

    captchaWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
        height: 20,
        marginVertical: 10,
    },

    reloadBtn: {
        marginLeft: 10,
        padding: 20,
        backgroundColor: "#c8e6c9",
        borderRadius: 6,
    },

    reloadText: {
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default FarmerLogin;