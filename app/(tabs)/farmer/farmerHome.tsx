import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated, Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFarmer from "../../../components/context/FarmerContext";
import useSchemeForm from "../../../components/context/SchemeFormContext";


export default function FarmerHome() {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  console.log("farmer home stp rndrd")
  const [applicantData, setApplicantData] = useState<any>([]);
  const [flag, setFlag] = useState(false);
  const [error, setError] = useState("");
  const { form, updateForm } = useSchemeForm();
  const { farmer, resetFarmer, updateFarmer } = useFarmer();

  const onSchemeFilingPress = () => {
    // console.log(applicantData[0].appl_reg_no)
    // updateForm("registrationId", applicantData[0].appl_reg_no);
    router.push("/(tabs)/farmer/schemeFiling/SchemeFilingHome")
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

        updateForm((prev: any) => ({
          ...prev,
          registrationId: result[0].appl_reg_no,
        }));

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
        toValue: flag ? 200 : 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // height needs false
      }),
      Animated.timing(opacityAnim, {
        toValue: flag ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [flag]);

  // console.log("outside: ",form.registrationId)

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
              router.replace("/home")
            }}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        {/* Menu Actions */}
        <Text style={styles.sectionTitle}>Farmer Services</Text>

        <Animated.View
          style={{
            overflow: "hidden",
            maxHeight: heightAnim,
            opacity: opacityAnim,
          }}
        >
          <TouchableOpacity onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}>
            <View style={styles.drpdwn}>
              <Text style={styles.ddTxt}>Non Project based</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}>
            <View style={styles.drpdwn}>
              <Text style={styles.ddTxt}>Project based</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate("/farmer/applReg/nonPrjctBsd")}>
            <View style={styles.drpdwn}>
              <Text style={styles.ddTxt}>Horticulture training schemes</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.menuGrid}>

          <View>
            <Pressable
              style={styles.menuCard}
              onPress={() => {
                setFlag(prev => !prev);
              }}
            >

              <Text style={styles.menuText}>Application Registration</Text>
            </Pressable>

            <Pressable
              style={styles.menuCard}
              onPress={() => {
                onSchemeFilingPress()
              }}
            >
              <Text style={styles.menuText}>Scheme Filling / New Registration</Text>
            </Pressable>
            <Pressable
              style={styles.menuCard}
              onPress={() => {
                navigate("/farmer/services/ApplicationAcknowledgement")
              }}
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
              onPress={() => {
                navigate('/farmer/services/UpdateMobileNumberScreen')
              }}
            >
              <Text style={styles.menuText}>Request to Change Mobile Number</Text>
            </Pressable>
            <Pressable
              style={styles.menuCard}
            // onPress={() => {
            //   navigate('/farmer/schemeFiling/SchemeFilingHome')
            // }}
            >
              <Text style={styles.menuText}>Upload Documents</Text>
            </Pressable>
            <Pressable
              style={styles.menuCard}
              onPress={() => {
                navigate('/farmer/services/CoApplicantRegistration')
              }}
            >
              <Text style={styles.menuText}>Co-Applicant / Multiple Owner Registration</Text>
            </Pressable>
            <Pressable
              style={styles.menuCard}
            onPress={() => {
              navigate('/farmer/services/ApplicationStatus')
            }}
            >
              <Text style={styles.menuText}>Application Status</Text>
            </Pressable>
            <Pressable
              style={styles.menuCard}
            // onPress={() => {
            //   navigate('/farmer/schemeFiling/SchemeFilingHome')
            // }}
            >
              <Text style={styles.menuText}>PB – Scheme Filling / New Registration</Text>
            </Pressable>
          </View>
        </View>
        <Footer />
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f5",
  },

  container: {
    paddingBottom: 20,
  },

  titleBar: {
    borderRadius: 15,
    backgroundColor: "#33691e",
    padding: 14,
  },

  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  infoCard: {
    backgroundColor: "#0a1d40ff",
    margin: 12,
    padding: 14,
    borderRadius: 8,
    elevation: 2,
  },

  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#fff",
  },

  logoutBtn: {
    marginTop: 10,
    backgroundColor: "#c62828",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b5e20",
    marginLeft: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  drpdwn: {
    backgroundColor: "#f3f7f5",   // soft green-white
    borderLeftWidth: 4,
    borderLeftColor: "#2f6f4e",   // govt green accent
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
    elevation: 2,                // Android shadow
  },

  ddTxt: {
    fontSize: 14,
    color: "#1f3d2b",
    fontWeight: "500",
  },


  menuGrid: {
    paddingHorizontal: 12,
  },

  menuCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    borderLeftWidth: 5,
    borderLeftColor: "#7cb342",
  },

  menuText: {
    fontSize: 15,
    color: "#1b5e20",
  },
});
