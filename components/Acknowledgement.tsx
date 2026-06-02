import useFarmer from "@/components/context/FarmerContext";
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


export default function Acknowledgement({
  onExit,
  onApply
}: {
  onExit: () => void;
  onApply: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [ackData, setAckData] = useState<any[]>([]);
  const [apiError, setApiError] = useState("");
  const [error, setError] = useState("");
  const [applicantTypeMap, setApplicantTypeMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const { farmer, updateFarmer } = useFarmer();


  const [currentDateTime] = useState(new Date());
  const farmeratDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const farmeratTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
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

    if (!farmer.appl_reg_no || farmer.appl_reg_no.length < 10) {
      setApiError("Please enter a valid Registration ID");
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const res = await fetch(
        `https://localhost:7065/api/UIHis/getbeneficiarydetails_sch?kon=34&appl_reg_no=${farmer.appl_reg_no}&year=25`
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

    const row = ackData[0];

    await generateAcknowledgementPDF({
      registrationId: farmer.appl_reg_no,
      applicantName: row.applicant_name,
      relationName: row.swdh_name,

      applicantType:
        applicantTypeMap[row.appl_type] ?? row.appl_type,

      applicantCategory:
        categoryMap[row.category_code] ?? row.category_code,

      componentType: row.component_type_name,
      component: row.component_name,
      subComponent: row.sub_component_name,
      cropItem: row.crop_item_name,
      landArea: row.land_area,
      surveyNo: row.survey_no,
      generatedOn: new Date().toLocaleString(),
    });

  }


    // const update = (key: keyof typeof farmer, value: string) => {
    //   updateFarmer({ [key]: value } as any);
    // };

    return (
      <ScrollView style={styles.container}>
        {/* <Header /> */}
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
            <Text style={styles.welcome}>WELCOME TO : {farmer.applicant_name}</Text>
            <Text style={styles.regId}>Registration ID: {farmer.appl_reg_no}</Text>
          </View>

          <Text style={styles.dateText}>
            Date: {farmeratDate(currentDateTime)} • {farmeratTime(currentDateTime)}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Enter Your Application / Registration Number
          </Text>

          <TextInput
            value={farmer.appl_reg_no}
            // editable={false}
            onChangeText={(text) => updateFarmer({ appl_reg_no: text })}
            placeholder="Enter Application Registration Number"
            autoCapitalize="characters"
            style={styles.input}
          />



          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onFetch}>
              <Text style={styles.btnText}>Fetch Acknowledgement</Text>
            </TouchableOpacity>

            
            <TouchableOpacity style={styles.exitBtn} onPress={()=>{router.push("/(tabs)/farmer/farmerHome")}}>
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