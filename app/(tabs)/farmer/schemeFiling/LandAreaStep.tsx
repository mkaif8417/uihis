import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PickerBox from '@/components/PickerBox';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import useSchemeForm from '../../../../components/context/SchemeFormContext';
import SchemeStepper from './../../../../components/SchemeStepper';


export default function LandAreaStep() {
  console.log("land area stp rndrd")
  const [sources, setSources] = useState<[string, string][]>([]);
  const [soilTypes, setSoilTypes] = useState<[string, string][]>([]);
  const [landTypes, setLandTypes] = useState<[string, string][]>([]);
  const [waterPumps, setWaterPumps] = useState<[string, string][]>([]);

  const { form, updateForm } = useSchemeForm();
  const [draft, setDraft] = useState(() => ({ ...form }));


  const update = (key: string, value: string) => {
    setDraft((prev: any) => ({ ...prev, [key]: value }));
  };



  useEffect(() => {
    let active = true;

    fetch(`https://localhost:7065/api/UIHis/getSourceIrrigations?kon=34`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const list = data.map((b: any) => [b.source_code, b.source_name]);
        setSources(list);
      })
      .catch(() => {
        if (!active) return;
        setSources([]);
      });

    fetch(`https://localhost:7065/api/UIHis/getSoilTypes?kon=34`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const list = data.map((b: any) => [b.soiltype_code, b.soiltype_name]);
        setSoilTypes(list);
      })
      .catch(() => {
        if (!active) return;
        setSoilTypes([]);
      });

    fetch(`https://localhost:7065/api/UIHis/getLandTypes?kon=34`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const list = data.map((b: any) => [b.landtype_code, b.landtype_name]);
        setLandTypes(list);
      })
      .catch(() => {
        if (!active) return;
        setLandTypes([]);
      });

    setWaterPumps([["01", "Electrical Pump"]]);

    return () => {
      active = false;
    };
  }, []);


  return (
    <ScrollView style={styles.container}>
      <Header />
      {/* Stepper */}
      <SchemeStepper currentStep={1} />

      <Text style={styles.title}>Land Area and Other Details</Text>

      <View style={styles.card}>
        <Label text="Unit" />
        <TextInput style={styles.input} onChangeText={v => update('unit', v)} />

        <Label text="Total Land Area / Nos." />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          onChangeText={v => update('totalArea', v)}
        />

        <Label text="Land Survey No" />
        <TextInput
          style={styles.input}
          onChangeText={v => update('surveyNo', v)}
        />

        <Label text="Land Eligibility" />
        <TextInput
          style={styles.input}
          onChangeText={v => update('eligibility', v)}
        />

        <Label text="Land / Items Applied In" />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          onChangeText={v => update('appliedArea', v)}
        />



        <Label text="Source of Irrigation" />
        <PickerBox value={draft.irrigationSource} onChange={(v) => update('irrigationSource', v)}
          items={[
            ["", "-- Select Component Type --"],
            ...sources
          ]}
        />



        <Label text="Soil Type" />
        <PickerBox value={draft.soilType} onChange={(v) => update('soilType', v)}
          items={[
            ["", "-- Select Soil Type --"],
            ...soilTypes
          ]}
        />



        <Label text="Land Type" />
        <PickerBox value={draft.landType} onChange={(v) => update('landType', v)}
          items={[
            ["", "-- Select Land Type --"],
            ...landTypes
          ]}
        />



        <Label text="Water Pumps" />
        <PickerBox value={draft.waterPump} onChange={(v) => update('waterPump', v)}
          items={[
            ["", "-- Select Water Pump --"],
            ...waterPumps
          ]}
        />

        <RadioGroup
          label="Having Vermi Compost Unit"
          value={draft.vermiCompost}
          onChange={(v: string) => update('vermiCompost', v)}
        />

        <RadioGroup
          label="Drip / Sprinkler Irrigation Available"
          value={draft.dripIrrigation}
          onChange={(v: string) => update('dripIrrigation', v)}
        />

        <RadioGroup
          label="Applied for M.I.P of Drip Irrigation"
          value={draft.mipApplied}
          onChange={(v: string) => update('mipApplied', v)}
        />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            if (!draft.totalArea || !draft.appliedArea) {
              Alert.alert("Required", "Please enter land area details");
              return;
            }

            if (Number(draft.appliedArea) > Number(draft.totalArea)) {
              Alert.alert("Invalid", "Applied area cannot exceed total area");
              return;
            }
             updateForm(draft);
            router.push("/(tabs)/farmer/schemeFiling/LandLocationStep");
          }}

        >
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </ScrollView>
  );
}

/* ---- Reusable Components ---- */

const Label = ({ text }: any) => (
  <Text style={styles.label}>{text}</Text>
);

const RadioGroup = ({ label, value, onChange }: any) => (
  <View style={{ marginTop: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioRow}>
      <Radio label="Yes" checked={value === '1'} onPress={() => onChange('1')} />
      <Radio label="No" checked={value === '0'} onPress={() => onChange('0')} />
    </View>
  </View>
);

const Radio = ({ label, checked, onPress }: any) => (
  <TouchableOpacity style={styles.radio} onPress={onPress}>
    <View style={[styles.radioOuter, checked && styles.radioActive]}>
      {checked && <View style={styles.radioInner} />}
    </View>
    <Text>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  title: { fontSize: 18, fontWeight: '700', margin: 12 },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  label: { fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  radioRow: { flexDirection: 'row', marginTop: 6 },
  radio: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#2e7d32' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
  },
  backBtn: {
    backgroundColor: '#9e9e9e',
    padding: 14,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
