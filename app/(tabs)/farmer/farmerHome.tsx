import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useFarmer from "@/components/context/FarmerContext";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function FarmerHome() {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const [applicantData, setApplicantData] = useState<any>([]);
  const [flag, setFlag] = useState(false);
  const [error, setError] = useState("");

  const { farmer, resetFarmer, updateFarmer } = useFarmer();

  const onSchemeFilingPress = () => {
    router.push("/(tabs)/farmer/schemeFiling/SchemeFilingHome");
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetailsmob?kon=08&mobileno=${farmer.mobile_no}&year=25`
        );

        if (!res.ok) {
          setError("Server responded with error");
          return;
        }

        const result = await res.json();

        if (!Array.isArray(result) || result.length === 0) {
          setError("No beneficiary data found");
          return;
        }

        if (!active) return;

        updateFarmer({
          applicant_name: result[0].applicant_name,
          swdh_name: result[0].swdh_name,
          appl_reg_no: result[0].appl_reg_no,
        });

      
        setApplicantData(result[0]);
      } catch (err) {
        console.log(err);
        setError("Network error");
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: flag ? 210 : 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: flag ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(chevronAnim, {
        toValue: flag ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [flag]);

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

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

  const navigate = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Title Bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>
            Farmer Registration and Scheme Filling Module
          </Text>
        </View>

        {/* Top Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>State: Haryana</Text>
          <Text style={styles.infoText}>
            Welcome: {farmer.applicant_name ?? "Loading..."}
          </Text>
          <Text style={styles.infoText}>
            Registration ID: {farmer?.appl_reg_no ?? "--"}
          </Text>
          <Text style={styles.infoText}>
            Date: {formatDate(currentDateTime)} • {formatTime(currentDateTime)}
          </Text>

          <Pressable
            style={styles.logoutBtn}
            onPress={() => {
              resetFarmer();
              router.replace("/home");
            }}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        {/* Menu Actions */}
        <Text style={styles.sectionTitle}>Farmer Services</Text>

        <View style={styles.menuGrid}>

          {/* Application Registration — same menuCard style, with chevron */}
          <Pressable
            style={styles.menuCard}
            onPress={() => setFlag((prev) => !prev)}
          >
            <View style={styles.menuCardRow}>
              <Text style={styles.menuText}>Application Registration</Text>
              <Animated.Text
                style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}
              >
                ▼
              </Animated.Text>
            </View>
          </Pressable>

          {/* Dropdown sub-items */}
          <Animated.View
            style={{
              overflow: "hidden",
              maxHeight: heightAnim,
              opacity: opacityAnim,
            }}
          >
            {/* Divider */}
            <View style={styles.subDivider} />

            <TouchableOpacity
              onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}
            >
              <View style={styles.subCard}>
                <View style={styles.subDot} />
                <Text style={styles.subText}>Non Project Based</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}
            >
              <View style={styles.subCard}>
                <View style={styles.subDot} />
                <Text style={styles.subText}>Project Based</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}
            >
              <View style={[styles.subCard, { marginBottom: 10 }]}>
                <View style={styles.subDot} />
                <Text style={styles.subText}>Horticulture Training Schemes</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Remaining menu items */}
          <Pressable
            style={styles.menuCard}
            onPress={onSchemeFilingPress}
          >
            <Text style={styles.menuText}>Scheme Filling / New Registration</Text>
          </Pressable>

          <Pressable
            style={styles.menuCard}
            onPress={() => navigate("/farmer/services/ApplicationAcknowledgement")}
          >
            <Text style={styles.menuText}>Application Acknowledgement</Text>
          </Pressable>

          <Pressable
            style={styles.menuCard}
            onPress={() => navigate("/farmer/photoCapture")}
          >
            <Text style={styles.menuText}>Photo Capture</Text>
          </Pressable>

          <Pressable
            style={styles.menuCard}
            onPress={() => navigate("/farmer/services/UpdateMobileNumberScreen")}
          >
            <Text style={styles.menuText}>Request to Change Mobile Number</Text>
          </Pressable>

          <Pressable style={styles.menuCard} 
             onPress={() => navigate("/farmer/services/UploadDocs")}
          >
          
            <Text style={styles.menuText}>Upload Documents</Text>
          </Pressable>

          <Pressable
            style={styles.menuCard}
            onPress={() => navigate("/farmer/services/CoApplicantRegistration")}
          >
            <Text style={styles.menuText}>
              Co-Applicant / Multiple Owner Registration
            </Text>
          </Pressable>

          <Pressable
            style={styles.menuCard}
            onPress={() => navigate("/farmer/services/ApplicationStatus")}
          >
            <Text style={styles.menuText}>Application Status</Text>
          </Pressable>

          <Pressable style={styles.menuCard}>
            <Text style={styles.menuText}>
              PB – Scheme Filling / New Registration
            </Text>
          </Pressable>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f6f5" },
  container: { paddingBottom: 20 },
  titleBar: { borderRadius: 15, backgroundColor: "#33691e", padding: 14 },
  titleText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  infoCard: { backgroundColor: "#0a1d40", margin: 12, padding: 14, borderRadius: 8, elevation: 2 },
  infoText: { fontSize: 14, marginBottom: 4, color: "#fff" },
  logoutBtn: { marginTop: 10, backgroundColor: "#c62828", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1b5e20", marginLeft: 12, marginTop: 10, marginBottom: 8 },
  menuGrid: { paddingHorizontal: 12 },
  menuCard: { width: "100%", backgroundColor: "#fff", padding: 14, borderRadius: 8, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: "#7cb342" },
  menuCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuText: { fontSize: 15, color: "#1b5e20", flexShrink: 1 },
  chevron: { fontSize: 12, color: "#7cb342", marginLeft: 8 },
  subDivider: { height: 1, backgroundColor: "#e8f5e9", marginBottom: 6, marginHorizontal: 4 },
  subCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f8e9", paddingVertical: 11, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, marginLeft: 10, borderLeftWidth: 4, borderLeftColor: "#aed581", gap: 10 },
  subDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#7cb342" },
  subText: { fontSize: 14, color: "#33691e" },
});