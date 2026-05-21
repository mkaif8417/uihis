import Acknowledgement from "@/components/Acknowledgement";
import AddressInfo from "@/components/AddressInfo";
import BankInfo from "@/components/BankInfo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LandDetails from "@/components/LandDetails";
import PersonalInfo from "@/components/PersonalInfo";
import PhotoUpload from "@/components/PhotoUpload";
import Review from "@/components/Review";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useFarmer from "../../../../components/context/FarmerContext";
import { buildRegistrationPayload } from "../../../../components/serviceFolder/registration.service";
import { useMemo } from "react";

const steps = [
  "Personal Info",
  "Address",
  "Bank Details",
  "Land Details",
  "Upload Photo",
  "Review",
  "Acknowledgement",
];

export default function NonProjectBased() {

  const [currentStep, setCurrentStep] = useState(0);
  const personalRef = useRef<{ commit: () => void } | null>(null);
  const addressRef = useRef<{ commit: () => void } | null>(null);
  const bankRef = useRef<{ commit: () => void } | null>(null);
  const landRef = useRef<{ commit: () => void } | null>(null);
  const photoRef = useRef<{ commit: () => void } | null>(null);

  // console.log("NonProjectBased rendered");
  const { farmer, updateFarmer } = useFarmer();
  const [stepValid, setStepValid] = useState<boolean[]>(
    Array(steps.length).fill(false)
  );

  const memoizedLandValue = useMemo(() => ({
    totalLandArea: farmer.land_area,
    landSurveyNo: farmer.survey_no,
    district: farmer.district_code,
    block: farmer.mandal_code,
    panchayat: farmer.panchayat_code,
    village: farmer.village_code,
    habitation: farmer.street_location,
    sameAsAboveAddress: false,
  }), [farmer.land_area, farmer.survey_no, farmer.district_code, farmer.mandal_code, farmer.panchayat_code, farmer.village_code, farmer.street_location]);

  // Pass memoizedLandValue to the prop instead


  // const updateStep = (
  //   data: Partial<typeof farmer>,
  //   valid: boolean,
  //   stepIndex: number
  // ) => {
  //   updateFarmer(data);

  //   setStepValid(prev => {
  //     const copy = [...prev];
  //     copy[stepIndex] = valid;
  //     return copy;
  //   });
  // };


  const submitApplication = async () => {
    const payload = buildRegistrationPayload(farmer);
    console.log("POST PAYLOAD:", payload);

    await fetch(
      `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/AddBeneficiary?kon=08`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setCurrentStep(6);
  }

  const goNext = () => {
    if (currentStep === 0) personalRef.current?.commit();
    if (currentStep === 1) addressRef.current?.commit();
    if (currentStep === 2) bankRef.current?.commit();
    if (currentStep === 3) landRef.current?.commit();
    if (currentStep === 4) photoRef.current?.commit();

    setCurrentStep(s => s + 1);
  };

  const goBack = () => setCurrentStep(s => s - 1);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Application Registration – Non Project Based
        </Text>

        {/* Stepper */}
        <Stepper
          steps={steps}
          currentStep={currentStep}
          stepValid={stepValid}
          onStepPress={(i) => {
            setCurrentStep(i);
          }}
        />

        {/* Step Content */}
        {currentStep === 0 && <PersonalInfo
          onValidityChange={(valid) => {
            setStepValid(s => {
              const c = [...s];
              c[0] = valid;
              return c;
            });
          }}
          ref={personalRef}
        />}

        {currentStep === 1 && <AddressInfo
          ref={addressRef}
          onChange={(d, v) => {
            updateFarmer({
              state_code: d.state,
              state_name: d.state,
              district_code: d.district,
              district_name: d.district,
              mandal_code: d.block,
              mandal_name: d.block,
              panchayat_code: d.panchayat,
              panchayat_name: d.panchayat,
              habitation_code: d.habitation,
              habitation_name: d.habitation,
              village_code: d.village,
              village_name: d.village,
              street_location: d.streetLocation,
              h_no: d.houseNo,
              pin_code: d.pinCode,
            });
          }}
          onValidityChange={(v) =>
            setStepValid(s => {
              const c = [...s];
              c[1] = v;
              return c;
            })
          }
        />}

        {currentStep === 2 && <BankInfo
          ref={bankRef}
          onChange={(d, v) => {
            updateFarmer({
              bank_code: d.bankName,
              branch_code: d.branchName,
              branch_ECS_code: d.ifsc,
              account_no: d.accountNo,
            });
          }}
          onValidityChange={(v) =>
            setStepValid(s => {
              const c = [...s];
              c[2] = v;
              return c;
            })
          }
        />
        }
        {currentStep === 3 && <LandDetails
          ref={landRef}
          value={memoizedLandValue}
          addressInfo={{
            district: farmer.district_name,
            mandal: farmer.mandal_name,
            panchayat: farmer.panchayat_name,
            village: farmer.village_name,
            habitation: farmer.habitation_name,
          }}
          onChange={(d, valid) => {
            updateFarmer({
              land_area_own: d.totalLandArea,
              survey_no: d.landSurveyNo,
              ll_district_code: d.district,
              ll_mandal_code: d.block,
              ll_panchayat_code: d.panchayat,
              ll_village_code: d.village,
              ll_habitation_code: d.habitation ?? "",
            });

            setStepValid(s => {
              const c = [...s];
              c[3] = valid;
              return c;
            });
          }}
        />}

        {currentStep === 4 && <PhotoUpload
          ref={photoRef}
          value={farmer.photo}
          onChange={(d) => updateFarmer({ photo: d })}
          onBack={() => setCurrentStep(3)}
          onNext={() => setCurrentStep(5)}
        />}

        {currentStep === 5 && <Review
          onEdit={setCurrentStep}
          onBack={goBack}
          onSubmit={() => {
            console.log("FINAL PAYLOAD:", farmer);
            submitApplication();
          }}
        />}

        {currentStep == 6 && <Acknowledgement
          onExit={() => router.replace("/farmer/farmerHome")}
          onApply={() => router.push("/(tabs)/farmer/schemeFiling/SchemeFilingHome")}
        />}


        {/* FOOTER BUTTONS (Angular form-actions) */}
        <View style={styles.actions}>
          {currentStep > 0 && (
            <Pressable style={styles.backBtn} onPress={goBack}>
              <Text>Back</Text>
            </Pressable>
          )}
          {currentStep < steps.length - 1 && (
            <Pressable
              style={[
                styles.nextBtn,
                !stepValid[currentStep] && styles.disabledBtn,
              ]}
              disabled={!stepValid[currentStep]}
              onPress={goNext}
            >
              <Text>Next</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}


function Stepper({
  currentStep,
  steps,
  stepValid,
  onStepPress,
}: {
  steps: string[];
  currentStep: number;
  stepValid: boolean[];
  onStepPress: (index: number) => void;
}) {
  if (!Array.isArray(stepValid)) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {steps.map((label, index) => {

          return (
            <Pressable
              key={index}
              onPress={() => onStepPress(index)}
              style={{ alignItems: "center", marginRight: 18, opacity: 1 }}
            >
              <View
                style={[
                  styles.circle,
                  index === currentStep && styles.activeCircle,
                  stepValid[index] && styles.doneCircle,
                ]}
              >
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepLabel}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f6f5" },
  container: { padding: 12 },

  disabledBtn: {

  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
  },

  doneCircle: {
    backgroundColor: "#388e3c",
  },


  stepper: {
    flexDirection: "row",
    marginBottom: 12,
  },

  stepItem: {
    alignItems: "center",
    marginRight: 16,
  },

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#cfd8dc",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    backgroundColor: "#2f6f4e",
  },

  circleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  stepLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },

  activeLabel: {
    color: "#2f6f4e",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    elevation: 2,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1b5e20",
  },

  label: {
    fontSize: 13,
    marginTop: 10,
    color: "#333",
  },

  fakeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    backgroundColor: "#f9f9f9",
    color: "#777",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  backBtn: {
    backgroundColor: "#9e9e9e",
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },

  nextBtn: {
    backgroundColor: "#2f6f4e",
    padding: 12,
    borderRadius: 6,
    flex: 1,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
