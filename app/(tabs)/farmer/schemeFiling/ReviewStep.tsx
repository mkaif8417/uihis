import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useSchemeForm from '../../../../components/context/SchemeFormContext';
import SchemeStepper from './../../../../components/SchemeStepper';



export default function ReviewStep({ navigation }: any) {
  const { form, submitSchemeFiling } = useSchemeForm();
  const [loading, setLoading] = React.useState(false);
  console.log("review stp rndrd", form)

  return (
    <ScrollView style={styles.container}>

      <Header />
      {/* Stepper */}
      <SchemeStepper currentStep={3} />

      <Text style={styles.title}>Review And Edit</Text>

      {/* -------- Component Details -------- */}
      <Card
        title="Component Details"
        onEdit={() => router.push("/(tabs)/farmer/schemeFiling/compDtls")}
      >
        <Row label="Application Number" value={form.applicationNo} />
        <Row label="Department" value={form.department} />
        <Row label="Scheme" value={form.scheme} />
        <Row label="Component Type" value={form.componentType} />
        <Row label="Component" value={form.component} />
        <Row label="Sub Component" value={form.subComponent} />
        <Row label="Agency" value={form.agency} />
        <Row label="Crop Item" value={form.cropItem} />
      </Card>

      {/* -------- Land Area & Other Details -------- */}
      <Card
        title="Land Area and Other Details"
        onEdit={() => router.push("/(tabs)/farmer/schemeFiling/LandAreaStep")}
      >
        <Row label="Unit Code" value={form.unit} />
        <Row label="Source of Irrigation" value={form.irrigationSource} />
        <Row label="Soil Type" value={form.soilType} />
        <Row label="Water Pump" value={form.waterPump} />
        <Row label="Land Type" value={form.landType} />
        <Row label="Survey No" value={form.surveyNo} />
        <Row label="Land Eligibility" value={form.eligibility} />
        <Row label="Land Area" value={form.totalArea} />
        <Row label="Land Area Applied" value={form.appliedArea} />
      </Card>

      {/* -------- Land Location -------- */}
      <Card
        title="Land Location"
        onEdit={() => router.push("/(tabs)/farmer/schemeFiling/LandLocationStep")}
      >
        <Row label="State" value={form.address.state || ""} />
        <Row label="District" value={form.address.district || ""} />
        <Row label="Panchayat" value={form.address.panchayat || ""} />
        <Row label="Village" value={form.address.village || ""} />
        <Row label="Habitation" value={form.address.habitation || ""} />
      </Card>

      {/* -------- Footer Buttons -------- */}
      <View style={styles.btnRow}>
        <ActionButton
          title="Back"
          color="#9e9e9e"
          onPress={() => router.back()}
        />

        <ActionButton
          title="Add Scheme"
          color="#2e7d32"
          onPress={async () => {
            if (
              !form.scheme ||
              !form.component ||
              !form.totalArea ||
              !form.appliedArea ||
              !form.address?.district ||
              !form.address?.village
            ) {
              Alert.alert("Incomplete", "Please complete all required details");
              return;
            }

            try {
              setLoading(true);
              const message = await submitSchemeFiling();
              Alert.alert("Success", message);
              router.replace("/(tabs)/farmer/farmerHome")
            } catch (err: any) {
              Alert.alert("Error", err.message);
            } finally {
              setLoading(false);
            }
          }}
        />

        <ActionButton
          title="Exit"
          color="#d32f2f"
          onPress={() => navigation.popToTop()}
        />
      </View>

      <Footer />
    </ScrollView>
  );
}

/* ---------------- Reusable Components ---------------- */

const Card = ({ title, children, onEdit }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.grid}>{children}</View>
  </View>
);

const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '—'}</Text>
  </View>
);

const ActionButton = ({ title, color, onPress }: any) => (
  <TouchableOpacity
    style={[styles.actionBtn, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.btnText}>{title}</Text>
  </TouchableOpacity>
);

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  title: { fontSize: 18, fontWeight: '700', margin: 12 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  editBtn: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: { color: '#fff', fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  row: {
    width: '50%',
    paddingVertical: 6,
  },
  label: { fontWeight: '600' },
  value: { marginTop: 2 },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
