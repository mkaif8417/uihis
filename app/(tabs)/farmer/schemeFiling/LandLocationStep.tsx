import { useSchemeForm } from "@/components/context/SchemeFormContext";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LandLocationStep() {
  const { form, updateForm } = useSchemeForm();
  const [draft, setDraft] = useState(() => ({
    ...form,
    address: {
      state: "34",
      district: "",
      mandal: "",
      panchayat: "",
      village: "",
      habitation: "",
      ...(form.address || {}),
    },
  }));

  console.log("landLoc stp rndrd")
  /* ------------------ DROPDOWN STATE ------------------ */
  const [districts, setDistricts] = useState<[string, string][]>([]);
  const [mandals, setMandals] = useState<[string, string][]>([]);
  const [panchayats, setPanchayats] = useState<[string, string][]>([]);
  const [villages, setVillages] = useState<[string, string][]>([]);

  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingMandal, setLoadingMandal] = useState(false);
  const [loadingPanchayat, setLoadingPanchayat] = useState(false);
  const [loadingVillage, setLoadingVillage] = useState(false);

  /* ------------------ HELPERS ------------------ */
  const updateAddress = (key: string, value: string) => {
    setDraft((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };


  /* ------------------ FETCH DISTRICTS ------------------ */
  useEffect(() => {
    let active = true;
    setLoadingDistrict(true);
    setDistricts([]);

    fetch(
      "https://localhost:7065/api/UIHis/getDistricts?kon=34&state_code=08"
    )
      .then(res => res.json())
      .then(data => {
        if (!active || !Array.isArray(data)) return;
        setDistricts(data.map((d: any) => [d.district_code, d.district_name]));
      })
      .catch(() => setDistricts([]))
      .finally(() => active && setLoadingDistrict(false));

    return () => {
      active = false;
    };
  }, []);

  /* ------------------ FETCH MANDALS ------------------ */
  useEffect(() => {
    if (!draft.address.district) return;

    let active = true;
    setLoadingMandal(true);
    setMandals([]);
    setPanchayats([]);
    setVillages([]);

    setDraft((prev: any) => {
      if (
        prev.address.mandal === "" &&
        prev.address.panchayat === "" &&
        prev.address.village === ""
      ) return prev;

      return {
        ...prev,
        address: {
          ...prev.address,
          mandal: "",
          panchayat: "",
          village: "",
        },
      };
    });


    fetch(
      `https://localhost:7065/api/UIHis/getMandals?kon=34&state_code=08&district_code=${draft.address.district}`
    )
      .then(res => res.json())
      .then(data => {
        if (!active || !Array.isArray(data)) return;
        setMandals(data.map((m: any) => [m.mandal_code, m.mandal_name]));
      })
      .catch(() => setMandals([]))
      .finally(() => active && setLoadingMandal(false));

    return () => {
      active = false;
    };
  }, [draft.address.district]);

  /* ------------------ FETCH PANCHAYATS ------------------ */
  useEffect(() => {
    if (!draft.address.mandal) return;

    let active = true;
    setLoadingPanchayat(true);
    setPanchayats([]);
    setVillages([]);

    setDraft((prev: any) => {
      if (
        prev.address.panchayat === "" &&
        prev.address.village === ""
      ) return prev;

      return {
        ...prev,
        address: {
          ...prev.address,
          panchayat: "",
          village: "",
        },
      };
    });


    fetch(
      `https://localhost:7065/api/UIHis/getPanchayats?kon=34&state_code=08&district_code=${draft.address.district}&mandal_code=${draft.address.mandal}`
    )
      .then(res => res.json())
      .then(data => {
        if (!active || !Array.isArray(data)) return;
        setPanchayats(data.map((p: any) => [p.panchayat_code, p.panchayat_name]));
      })
      .catch(() => setPanchayats([]))
      .finally(() => active && setLoadingPanchayat(false));

    return () => {
      active = false;
    };
  }, [draft.address.mandal]);

  /* ------------------ FETCH VILLAGES ------------------ */
  useEffect(() => {
    if (!draft.address.panchayat) return;

    let active = true;
    setLoadingVillage(true);
    setVillages([]);

    setDraft((prev: any) => {
      if (
        prev.address.village === ""
      ) return prev;

      return {
        ...prev,
        address: {
          ...prev.address,
          village: "",
        },
      };
    });


    fetch(
      `https://localhost:7065/api/UIHis/getVillages?kon=34&state_code=08&district_code=${draft.address.district}&mandal_code=${draft.address.mandal}&panchayat_code=${draft.address.panchayat}`
    )
      .then(res => res.json())
      .then(data => {
        if (!active || !Array.isArray(data)) return;
        setVillages(data.map((v: any) => [v.village_code, v.village_name]));
      })
      .catch(() => setVillages([]))
      .finally(() => active && setLoadingVillage(false));

    return () => {
      active = false;
    };
  }, [draft.address.panchayat]);

  /* ------------------ NEXT ------------------ */
  const onNext = () => {
    const a = draft.address;
    if (!a.state || !a.district || !a.mandal || !a.panchayat || !a.village) {
      Alert.alert("Required", "Please complete land location details");
      return;
    }
    updateForm(draft);
    router.push("/(tabs)/farmer/schemeFiling/ReviewStep");
  };

  /* ------------------ UI ------------------ */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Land Location</Text>

      <Label text="State" />
      <DisabledInput value="HARYANA" />

      <Label text="District" />
      <PickerBox
        value={draft.address.district}
        onChange={v => updateAddress("district", v)}
        items={[["", loadingDistrict ? "Loading..." : "--Select District--"], ...districts]}
      />

      <Label text="Mandal" />
      <PickerBox
        value={draft.address.mandal}
        disabled={!draft.address.district || loadingMandal}
        onChange={v => updateAddress("mandal", v)}
        items={[["", loadingMandal ? "Loading..." : "--Select Mandal--"], ...mandals]}
      />

      <Label text="Panchayat" />
      <PickerBox
        value={draft.address.panchayat}
        disabled={!draft.address.mandal || loadingPanchayat}
        onChange={v => updateAddress("panchayat", v)}
        items={[["", loadingPanchayat ? "Loading..." : "--Select Panchayat--"], ...panchayats]}
      />

      <Label text="Village" />
      <PickerBox
        value={draft.address.village}
        disabled={!draft.address.panchayat || loadingVillage}
        onChange={v => updateAddress("village", v)}
        items={[["", loadingVillage ? "Loading..." : "--Select Village--"], ...villages]}
      />

      <Label text="Habitation" optional />
      <PickerBox
        value={draft.address.habitation}
        onChange={v => updateAddress("habitation", v)}
        items={[
          ["", "--Select Habitation--"],
          ["1", "Habitation 1"],
          ["2", "Habitation 2"],
          ["3", "Habitation 3"],
        ]}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ------------------ UI HELPERS ------------------ */
const Label = ({ text, optional }: { text: string; optional?: boolean }) => (
  <Text style={styles.label}>
    {text}
    {!optional && <Text style={styles.required}> *</Text>}
  </Text>
);

const DisabledInput = ({ value }: { value: string }) => (
  <View style={[styles.input, { backgroundColor: "#eee" }]}>
    <Text>{value}</Text>
  </View>
);

const PickerBox = ({
  value,
  onChange,
  items,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  items: [string, string][];
  disabled?: boolean;
}) => (
  <View style={[styles.pickerWrapper, disabled && { opacity: 0.6 }]}>
    <Picker selectedValue={value} onValueChange={onChange} enabled={!disabled}>
      {items.map(([val, label]) => (
        <Picker.Item key={val} label={label} value={val} />
      ))}
    </Picker>
  </View>
);

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  label: { marginTop: 12, fontWeight: "500" },
  required: { color: "#d32f2f" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
  },
  btnRow: { flexDirection: "row", marginTop: 20, gap: 12 },
  backBtn: { flex: 1, padding: 12, backgroundColor: "#9e9e9e", borderRadius: 6 },
  nextBtn: { flex: 1, padding: 12, backgroundColor: "#2e7d32", borderRadius: 6 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
