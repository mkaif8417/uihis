import useFarmer  from "@/components/context/FarmerContext";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  onEdit: (stepIndex: number) => void;
  onBack: () => void;
  onSubmit: () => void;
};
export default function Review({
  onEdit,
  onBack,
  onSubmit,
}: Props) {
  const [accepted, setAccepted] = useState(false);
  const { farmer } = useFarmer();
  const maskAadhaar = (v?: string) =>
  v && v.length === 12 ? `XXXX-XXXX-${v.slice(-4)}` : show(v);

  const show = (v?: string) => (v && v !== "" ? v : "Not provided");

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Review Your Information</Text>

        {/* PERSONAL INFO */}
        <Section title="Personal Information" onEdit={() => onEdit(0)}>
          <Item label="Application Type" value={show(farmer.appl_type)} />
          <Item label="Applicant Name" value={show(farmer.applicant_name)} />
          <Item label="Relation Name" value={show(farmer.swdh_name)} />
          <Item label="Relation" value={show(farmer.so_wo_do_ho)} />
          <Item label="Gender" value={show(farmer.gender)} />
          <Item label="Social status" value={show(farmer.caste_code)} />
          <Item label="Email" value={show(farmer.email_id)} />
          <Item label="Age" value={show(String(farmer.applicant_age))} />
          <Item label="Aadhaar" value={maskAadhaar(farmer.aadhaar_no)} />
          <Item label="Category" value={show(farmer.category_code)} />
        </Section>

        {/* ADDRESS INFO */}
        <Section title="Address Information" onEdit={() => onEdit(1)}>
          <Item label="State" value={show(farmer.state_name)} />
          <Item label="District" value={show(farmer.district_name)} />
          <Item label="Mandal" value={show(farmer.mandal_name)} />
          <Item label="Panchayat" value={show(farmer.panchayat_name)} />
          <Item label="Village" value={show(farmer.village_name)} />
          <Item label="Habitation" value={show(farmer.habitation_name)} />
          <Item label="Street" value={show(farmer.street_location)} />
          <Item label="House no" value={show(farmer.h_no)} />
          <Item label="Pin code" value={show(farmer.pin_code)} />
          <Item label="Mobile No" value={show(farmer.mobile_no)} />
        </Section>

        {/* BANK INFO */}
        <Section title="Bank Information" onEdit={() => onEdit(2)}>
          <Item label="Bank Name" value={show(farmer.bank_code)} />
          <Item label="Branch Name" value={show(farmer.branch_code)} />
          <Item label="IFSC code" value={show(farmer.branch_ECS_code)} />
          <Item label="Account No" value={show(farmer.account_no)} />
        </Section>

        {/* LAND INFO */}
        <Section title="Land Details" onEdit={() => onEdit(3)}>
          <Item label="Land Area" value={`${show(farmer.land_area)} Ha`} />
          <Item label="Survey No" value={show(farmer.survey_no)} />
          <Item label="Land District Code" value={show(farmer.ll_district_code)} />
          <Item label="Land Mandal Code" value={show(farmer.ll_mandal_code)} />
          <Item label="Land Village Code" value={show(farmer.ll_village_code)} />
        </Section>

        {/* DECLARATION */}
        <View style={styles.declaration}>
          <Text style={styles.declarationTitle}>Declaration</Text>
          <Text style={styles.declarationText}>
            I hereby declare that the information provided is true and correct.
          </Text>

          <Pressable
            onPress={() => setAccepted(!accepted)}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, accepted && styles.checked]} />
            <Text>I accept the terms and conditions</Text>
          </Pressable>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Pressable style={styles.btnSecondary} onPress={onBack}>
            <Text>Back</Text>
          </Pressable>

          <Pressable
            style={[styles.btnPrimary, !accepted && { opacity: 0.5 }]}
            disabled={!accepted}
            onPress={onSubmit}
          >
            <Text style={{ color: "#fff" }}>Submit Application</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- REUSABLE ---------- */

const Section = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onEdit && (
        <Pressable onPress={onEdit}>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
      )}
    </View>
    {children}
  </View>
);

const Item = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 8,
  },
  note: {
    backgroundColor: "#f1f8e9",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  section: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  edit: {
    color: "#1976d2",
    fontWeight: "600",
  },
  item: {
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  declaration: {
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
  },
  declarationTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  declarationText: {
    fontSize: 13,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  checked: {
    backgroundColor: "#2e7d32",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  btnSecondary: {
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  btnPrimary: {
    padding: 12,
    backgroundColor: "#2e7d32",
    borderRadius: 6,
  },
});
