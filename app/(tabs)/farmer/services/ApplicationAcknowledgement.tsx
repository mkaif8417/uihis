import Captcha from "@/components/Captcha";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { generateAcknowledgementPDF } from "@/utils/ackPdf";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import useSchemeForm from "../../../../components/context/SchemeFormContext";

const generateCaptcha = (length = 5) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
};

export default function ApplicationAcknowledgement() {
    const [loading, setLoading] = useState(false);
    const [ackData, setAckData] = useState<any[]>([]);
    const [apiError, setApiError] = useState("");
    const [captchaValue, setCaptchaValue] = useState(generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState("");
    const [error, setError] = useState("");
    const [applicantTypeMap, setApplicantTypeMap] = useState<Record<string, string>>({});
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
    const { form, updateForm } = useSchemeForm() || { form: {}, updateForm: () => { } };

    if (!form) {
        return <Text>Loading...</Text>;
    }

    const registrationId = form?.registrationId || "";
    const applicantName = form?.applicant_name || "";
    const dateTime = "25 Jan 2026 04:18:08";

    const [currentDateTime] = useState(new Date());
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };


    const refreshCaptcha = () => {
        setCaptchaValue(generateCaptcha());
        setCaptchaInput("");
        setError("");
    };

    const safeJsonFetch = async (url: string) => {
        const res = await fetch(url);
        const text = await res.text();

        if (!text || text.trim().length === 0) {
            console.warn("Empty response from:", url);
            return [];
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Invalid JSON from:", url);
            console.error(text);
            return [];
        }
    };

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [typeData, catData] = await Promise.all([
                    safeJsonFetch(
                        "https://localhost:7065/api/UIHis/getApplicantTypes?kon=34"
                    ),
                    safeJsonFetch(
                        "https://localhost:7065/api/UIHis/GetCategories?kon=34"
                    ),
                ]);

                const typeMap: Record<string, string> = {};
                typeData.forEach((t: any) => {
                    typeMap[t.type_code] = t.type_name;
                });

                const catMap: Record<string, string> = {};
                catData.forEach((c: any) => {
                    catMap[c.category_code] = c.category_name;
                });

                setApplicantTypeMap(typeMap);
                setCategoryMap(catMap);

            } catch (err) {
                console.error("Failed to load master data", err);
            }
        };

        fetchMasters();
    }, []);

    const onFetch = async () => {
        if (captchaInput.trim() !== captchaValue) {
            setError("Invalid captcha. Please try again.");
            refreshCaptcha();
            return;
        }

        if (!form.registrationId || form.registrationId.length < 10) {
            setApiError("Please enter a valid Registration ID");
            return;
        }

        try {
            setLoading(true);
            setApiError("");

            const res = await fetch(
                `https://localhost:7065/api/UIHis/getbeneficiarydetails_sch?kon=34&appl_reg_no=${form.registrationId}&year=25`
            );

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                setApiError("No acknowledgement data found.");
                setAckData([]);
                return;
            }

            setAckData(data);
        } catch (e) {
            setApiError("Failed to fetch acknowledgement.");
        } finally {
            setLoading(false);
        }
    };

    const onPrintAcknowledgement = async () => {
        if (!ackData.length) {
            alert("Please fetch acknowledgement first");
            return;
        }

        const data = ackData[0];

        await generateAcknowledgementPDF({ 
            registrationId: form.registrationId,
            applicantName: data.applicant_name,
            relationName: data.swdh_name,
            applicantType: applicantTypeMap[data.appl_type] || data.appl_type,
            applicantCategory: categoryMap[data.category_code] || data.category_code,
            componentType: data.component_type_name,
            component: data.component_name,
            subComponent: data.sub_component_name,
            cropItem: data.crop_item_name,
            landArea: data.land_area,
            surveyNo: data.survey_no,
            generatedOn: new Date().toLocaleString(),
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Header />
            {/* Title Bar */}
            <View style={styles.titleBar}>
                <Text style={styles.title}>
                    Application Acknowledgement For Registration and Scheme Filing
                </Text>
            </View>

            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.stateText}>State: Haryana</Text>

                <View style={styles.centerInfo}>
                    <Text style={styles.welcome}>WELCOME TO : {applicantName}</Text>
                    <Text style={styles.regId}>Registration ID: {registrationId}</Text>
                </View>

                <Text style={styles.dateText}>
                    Date: {formatDate(currentDateTime)} • {formatTime(currentDateTime)}
                </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
                <Text style={styles.label}>
                    Enter Your Application / Registration Number
                </Text>

                <TextInput
                    value={form.registrationId}
                    onChangeText={(text) => updateForm("registrationId", text)}

                    placeholder="Enter Application Registration Number"
                    autoCapitalize="characters"
                    style={styles.input}
                />

                {/* CAPTCHA */}
                <View style={styles.captchaBox}>
                    <View style={styles.captchaHeader}>
                        <Text style={styles.captchaTitle}>Captcha Verification</Text>
                        <TouchableOpacity onPress={refreshCaptcha}>
                            <Text style={styles.reload}>↻</Text>
                        </TouchableOpacity>
                    </View>

                    <Captcha value={captchaValue} />

                    <TextInput
                        placeholder="Enter captcha here..."
                        value={captchaInput}
                        onChangeText={setCaptchaInput}
                        style={styles.input}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={onFetch}>
                        <Text style={styles.btnText}>Fetch Acknowledgement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => {
                            updateForm("registrationId", "");
                            setAckData([]);
                            setCaptchaInput("");
                            setError("");
                        }}
                    >
                        <Text style={styles.secondaryText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exitBtn}>
                        <Text style={styles.exitText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && <Text>Fetching acknowledgement...</Text>}
            {apiError ? <Text style={{ color: "red" }}>{apiError}</Text> : null}

            {ackData.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <InfoRow label="Name" value={ackData[0].applicant_name} />
                    <InfoRow label="Relation Name" value={`S/O - ${ackData[0].swdh_name}`} />
                    <InfoRow
                        label="Applicant Type"
                        value={applicantTypeMap[ackData[0].type_name] || ackData[0].type_name}
                    />

                    <InfoRow
                        label="Applicant Category"
                        value={categoryMap[ackData[0].category_code] || ackData[0].category_code}
                    />
                    <InfoRow label="Survey No" value={ackData[0].survey_no} />
                    <InfoRow label="Land Area" value={ackData[0].land_area} />
                </View>
            )}


            {/* Scheme Details */}
            {ackData.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Scheme Details</Text>

                    {ackData.map((item, index) => (
                        <View key={index} style={styles.schemeCard}>
                            <InfoRow label="Scheme" value={item.component_type_name} />
                            <InfoRow label="Component" value={item.component_name} />
                            <InfoRow label="Sub Component" value={item.sub_component_name} />
                            <InfoRow label="Crop Name" value={item.crop_item_name} />
                            <InfoRow label="Land Area Applied" value={item.land_area} />
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[styles.printBtn, { marginTop: 16 }]}
                onPress={onPrintAcknowledgement}
            >
                <Text style={styles.btnText}>Print / Download Acknowledgement</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.exitBtn, { marginTop: 16 }]}
                onPress={() => router.back()}
            >
                <Text style={styles.btnText}>Exit</Text>
            </TouchableOpacity>
            <Footer />
        </ScrollView>
    );
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || "-"}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f8",
    },

    titleBar: {
        backgroundColor: "#1b5e20",
        padding: 14,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    section: {
        margin: 16,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingTop: 12,
    },
    sectionTitle: {
        fontWeight: "700",
        marginBottom: 8,
        fontSize: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    rowLabel: {
        fontWeight: "600",
        color: "#555",
        flex: 1,
    },
    rowValue: {
        flex: 1,
        textAlign: "right",
    },
    schemeCard: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    topBar: {
        backgroundColor: "#e8f5e9",
        padding: 12,
    },
    stateText: {
        fontWeight: "600",
        color: "#1b5e20",
    },
    centerInfo: {
        marginVertical: 6,
    },
    welcome: {
        fontWeight: "600",
    },
    regId: {
        fontWeight: "700",
        color: "#2e7d32",
    },
    dateText: {
        fontSize: 12,
        color: "#555",
        marginTop: 4,
    },

    card: {
        backgroundColor: "#fff",
        margin: 12,
        padding: 12,
        borderRadius: 8,
        elevation: 2,
    },

    label: {
        fontWeight: "600",
        marginBottom: 6,
    },
    inputDisabled: {
        backgroundColor: "#eeeeee",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        color: "#000",
        marginBottom: 12,
    },

    captchaBox: {
        marginTop: 10,
    },
    captchaTitle: {
        fontWeight: "600",
        marginBottom: 6,
    },
    captchaPlaceholder: {
        height: 70,
        backgroundColor: "#e0e0e0",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    captchaText: {
        letterSpacing: 6,
        fontWeight: "700",
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
    },

    buttonRow: {
        marginTop: 16,
    },
    primaryBtn: {
        backgroundColor: "#2e7d32",
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    printBtn: {
        justifyContent: "center",
        backgroundColor: "#292b7d",
        width: "50%",
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        textAlign: "center",
    },
    secondaryBtn: {
        backgroundColor: "#eeeeee",
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    secondaryText: {
        textAlign: "center",
        fontWeight: "600",
    },
    exitBtn: {
        backgroundColor: "#c62828",
        padding: 12,
        borderRadius: 6,
    },
    exitText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "700",
    },
    captchaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    reload: {
        fontSize: 20,
        fontWeight: "700",
    },
    error: {
        color: "#c62828",
        marginTop: 6,
        fontWeight: "600",
    },
});