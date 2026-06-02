import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SchemeStepper from '@/components/SchemeStepper';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import useSchemeForm from '../../../../components/context/SchemeFormContext';

export default function ComponentDetailsStep() {
  console.log("component details stp rndrd")
  // const [departments, setDepartments] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<[string, string][]>([]);
  const [componentTypes, setComponentTypes] = useState<[string, string][]>([]);
  const [components, setComponents] = useState<[string, string][]>([]);
  const [subComponents, setSubComponents] = useState<[string, string][]>([]);
  const [crops, setCrops] = useState<[string, string][]>([]);

  const [loadingCompTypes, setLoadingCompTypes] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [loadingSubComponents, setLoadingSubComponents] = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(false);

  const { form, updateForm } = useSchemeForm();

  const [draft, setDraft] = useState(() => ({ ...form }));

  useEffect(() => {
    setSchemes([
      ["05", "HMNEHS (MIDH)"],
      ["07", "NHM (MIDH)"],
      ["31", "IHD-SP (HRY)"],
      ["32", "SCSP (HRY)"],
      ["33", "Silk Samagra (HRY)"],
      ["34", "Polynet"],
      ["35", "COE"],
      ["40", "RKVY"],
    ]);
  }, []);

  useEffect(() => {
    if (!draft.scheme) return;
    let active = true;
    setLoadingCompTypes(true);
    setComponentTypes([]);

    fetch(
      `https://localhost:7065/api/AdminApi/GetComponentTypesByDeptAndSch?kon=34&deptCode=${draft.department}&schCode=${draft.scheme}`
    )
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const list = data.map((b: any) => [
          b.component_type_code,
          b.component_type_name
        ]);
        setComponentTypes(list);
      })
      .catch(() => {
        if (!active) return;
        setComponentTypes([])
      })
      .finally(() => {
        if (!active) return;
        setLoadingCompTypes(false)
      });

    return () => {
      active = false; // 👈 cleanup
    };
  }, [draft.scheme]);


  useEffect(() => {
    if (!draft.componentType) return;
    let active = true;
    setLoadingComponents(true)
    setComponents([])
    setSubComponents([])
    setCrops([])


    const fetchData = () => {
      try {
        fetch(`https://localhost:7065/api/UIHis/getcomponents?kon=34&component_type_code=${draft.componentType}`)
          .then(res => res.json())
          .then(data => {
            if (!active) return;
            // console.log(data)
            const list = data.map((b: any) => [b.component_code, b.component_name]);
            setComponents(list);
          })
          .catch(() => {
            if (!active) return;
            setComponents([])
          })
          .finally(() => {
            if (!active) return;
            setLoadingComponents(false)
          })
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()

    return () => {
      active = false;
    };
  }, [draft.componentType]);

  useEffect(() => {
    if (!draft.component) return;
    let active = true

    setLoadingSubComponents(true)
    setSubComponents([])
    setCrops([])


    const fetchData = () => {
      try {
        fetch(`https://localhost:7065/api/UIHis/getsubcomponents?kon=34&component_type_code=${draft.componentType}&component_code=${draft.component}`)
          .then(res => res.json())
          .then(data => {
            if (!active) return;
            // console.log(data)
            const list = data.map((b: any) => [b.sub_component_code, b.sub_component_name]);
            setSubComponents(list);
          })
          .catch(() => {
            if (!active) return;
            setSubComponents([])
          })
          .finally(() => {
            if (!active) return;
            setLoadingSubComponents(false)
          })
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()

    return () => {
      active = false; // 👈 cleanup
    };
  }, [draft.component]);

  useEffect(() => {
    if (!draft.subComponent) return;
    let active = true;

    setLoadingCrops(true)
    setCrops([])


    const fetchData = () => {
      try {
        fetch(`https://localhost:7065/api/UIHis/getcrops?kon=34&component_type_code=${draft.componentType}&component_code=${draft.component}&sub_component_code=${draft.subComponent}&year_code=25`)
          .then(res => res.json())
          .then(data => {
            if (!active) return;
            // console.log(data)
            const list = data.map((b: any) => [b.crop_Code, b.crop_Name]);
            setCrops(list);
          })
          .catch(() => {
            if (!active) return;
            setCrops([])
          })
          .finally(() => {
            if (!active) return;
            setLoadingCrops(false)
          })
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()

    return () => {
      active = false; // 👈 cleanup
    };
  }, [draft.subComponent]);


  return (
    <ScrollView style={styles.container}>
      <Header />
      <SchemeStepper currentStep={0} />
      <Text style={styles.title}>Component Details</Text>

      <View style={styles.card}>
        <Label text="Department" />
        <Picker selectedValue={draft.department} onValueChange={(v) => setDraft((prev: any) => ({ ...prev, "department": v }))
        }>
          <Picker.Item label="-- Select Department --" value="" />
          <Picker.Item label="Horticulture" value="01" />
        </Picker>

        <Label text="Scheme" />
        <PickerBox value={draft.scheme} onChange={(v) => setDraft((prev: any) => ({ ...prev, "scheme": v }))}
          items={[
            ["", "--Select Scheme--"],
            ...schemes
          ]}
        />

        <Label text="Component Type" />
        <PickerBox value={draft.componentType} onChange={(v) => setDraft((prev: any) => ({ ...prev, "componentType": v }))}
          disabled={!draft.scheme}
          items={[
            ["", loadingCompTypes ? "Loading component types..." : "-- Select Component Type --"],
            ...componentTypes
          ]}
        />

        <Label text="Component" />
        <PickerBox value={draft.component} onChange={(v) => setDraft((prev: any) => ({ ...prev, "component": v }))}
          disabled={!draft.componentType}
          items={[
            ["", loadingComponents ? "Loading components..." : "-- Select Component --"],
            ...components
          ]}
        />

        <Label text="Sub-Component" />
        <PickerBox value={draft.subComponent} onChange={(v) => setDraft((prev: any) => ({ ...prev, "subComponent": v }))}
          disabled={!draft.component}
          items={[
            ["", loadingSubComponents ? "Loading sub-components..." : "-- Select Sub-Component --"],
            ...subComponents
          ]}
        />

        <Label text="Crop / Item" />
        <PickerBox value={draft.cropItem} onChange={(v) => setDraft((prev: any) => ({ ...prev, "cropItem": v }))}
          disabled={!draft.subComponent}
          items={[
            ["", loadingCrops ? "Loading crops..." : "-- Select Crop --"],
            ...crops
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => {
          if (!draft.scheme || !draft.componentType || !draft.component) {
            Alert.alert("Required", "Please complete component details");
            return;
          }
          updateForm(draft);
          router.push("/(tabs)/farmer/schemeFiling/LandAreaStep")
        }}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
      <Footer />
    </ScrollView>
  );
}

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
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      enabled={!disabled}
    >
      {items.map(([val, label]) => (
        <Picker.Item key={val} label={label} value={val} />
      ))}
    </Picker>
  </View>
);

const Label = ({ text }: any) => (
  <Text style={styles.label}>{text}</Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    margin: 12
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginTop: 10
  },
  nextBtn: {
    backgroundColor: '#2e7d32',
    margin: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
});
