import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function FarmerServices() {
  const router = useRouter()
  const goToLogin = () => {
    router.push("/farmer/FarmerLogin");
  };

  const openPortal = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Login Card */}
        <View style={styles.loginCard}>
          <Image
            source={require("../assets/images/Farmer.jpg")}
            style={styles.image}
          />

          <Pressable style={styles.loginBtn} onPress={goToLogin}>
            <Text style={styles.loginText}>FARMER LOGIN</Text>
          </Pressable>
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Services to Farmer</Text>
        <View style={styles.services}>
        {[
          "Farmer Registration",
          "Application Acknowledgement",
          "Apply For Horticulture Schemes",
          "Upload Documents",
          "Report a Problem",
        ].map((item, index) => (
          <Pressable key={index} style={styles.serviceItem} onPress={goToLogin}>
            <Text style={styles.serviceText}>{item}</Text>
          </Pressable>
        ))}
        </View>

        {/* Portals */}
        <Text style={styles.sectionTitle}>Portals</Text>

        {[
          { name: "BBY", url: "http://bby.hortharyana.gov.in" },
          { name: "MBBY", url: "http://mbby.hortharyana.gov.in" },
          { name: "MFMB", url: "http://fasal.haryana.gov.in" },
          { name: "KAUSHAL", url: "http://kaushal.hortharyana.gov.in" },
        ].map((portal) => (
          <Pressable
            key={portal.name}
            style={styles.portalBtn}
            onPress={() => openPortal(portal.url)}
          >
            <Text style={styles.portalText}>{portal.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Safe Area */
  safeArea: {
    flex: 1,
    backgroundColor: "#9cc39c",
  },
  /* Screen Container */
  container: {
    padding: 16,
    paddingBottom: 30,
  },

  services: {
    borderRadius: 10,
  },

  /* Login Card */
  loginCard: {
    backgroundColor: "#f1f8f4",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 3, // Android shadow
  },

  image: {
    width: 350,
    height: 280,
    resizeMode: "cover",
  },

  loginBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    alignItems: "center",
  },

  loginText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  /* Section Headings */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
    marginTop: 18,
  },

  /* Service List */
  serviceItem: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  serviceText: {
    fontSize: 15,
    color: "#2e7d32",
  },

  /* Portal Buttons */
  portalBtn: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },

  portalText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1b5e20",
  },
});
