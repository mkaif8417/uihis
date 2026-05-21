import { View, Text, TextInput, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import React, { forwardRef, useImperativeHandle, useRef } from "react";

type LandValue = {
  totalLandArea: string;
  landSurveyNo: string;
  district: string;
  block: string;
  panchayat: string;
  village: string;
  habitation?: string;
  sameAsAboveAddress?: boolean;
};

const LandDetails = forwardRef(function LandDetails({
  value,
  addressInfo,
  onChange,
  onValidityChange
}: {
  value: LandValue;
  addressInfo: any;
  onChange: (data: LandValue, isValid: boolean) => void;
  onValidityChange?: (valid: boolean) => void;
}, ref) {
  const [errors, setErrors] = useState<any>({});
  const [districts, setDistricts] = useState<[string, string][]>([]);
  const [blocks, setBlocks] = useState<[string, string][]>([]);
  const [panchayats, setPanchayats] = useState<[string, string][]>([]);
  const [villages, setVillages] = useState<[string, string][]>([]);
  const [local, setLocal] = useState<LandValue>(value);
  const lastValidRef = useRef<boolean | null>(null);


  const landAreaRegex = /^\d{1,4}(\.\d{1,3})?$/;

  const getErrors = (v: LandValue) => {
    const e: any = {};
    if (!landAreaRegex.test(v.totalLandArea))
      e.totalLandArea = "Invalid land area";
    if (!v.landSurveyNo?.trim())
      e.landSurveyNo = "Survey number required";
    if (!v.sameAsAboveAddress) {
      if (!v.district) e.district = "Select district";
      if (!v.block) e.block = "Select block";
      if (!v.panchayat) e.panchayat = "Select panchayat";
      if (!v.village) e.village = "Select village";
    }
    return e;
  };

  useEffect(() => {
    const e = getErrors(local);
    setErrors(e);

    const isValid = Object.keys(e).length === 0;
    if (isValid !== lastValidRef.current) {
      lastValidRef.current = isValid;
      onValidityChange?.(isValid);
    }
  }, [local]);

  useImperativeHandle(ref, () => ({
    commit() {
      const e = getErrors(local);
      const valid = Object.keys(e).length === 0;
      setErrors(e);
      onChange(local, valid);
    }

  }));

  /* Fetch districts */
  useEffect(() => {
    fetch(
      "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getDistricts?kon=08&state_code=08"
    )
      .then(res => res.json())
      .then(data =>
        setDistricts(
          data.map((d: any) => [d.district_code, d.district_name])
        )
      );
  }, []);

  /* Fetch blocks */
  useEffect(() => {
    if (!local.district) return;
    setBlocks([]);
    fetch(
      `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getMandals?kon=08&state_code=08&district_code=${local.district}`
    )
      .then(res => res.json())
      .then(data =>
        setBlocks(data.map((b: any) => [b.mandal_code, b.mandal_name]))
      );
  }, [local.district]);

  /* Fetch panchayats */
  useEffect(() => {
    if (!local.block) return;
    setPanchayats([]);
    fetch(
      `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getPanchayats?kon=08&state_code=08&district_code=${local.district}&mandal_code=${local.block}`
    )
      .then(res => res.json())
      .then(data =>
        setPanchayats(
          data.map((p: any) => [p.panchayat_code, p.panchayat_name])
        )
      );
  }, [local.block]);

  /* Fetch villages */
  useEffect(() => {
    if (!local.panchayat) return;
    setVillages([]);
    fetch(
      `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getVillages?kon=08&state_code=08&district_code=${local.district}&mandal_code=${local.block}&panchayat_code=${local.panchayat}`
    )
      .then(res => res.json())
      .then(data =>
        setVillages(
          data.map((v: any) => [v.village_code, v.village_name])
        )
      );
  }, [local.panchayat]);

  /* Same as above address */
  useEffect(() => {
    if (!local.sameAsAboveAddress) return;

    setLocal(prev => ({
      ...prev,
      district: addressInfo.district,
      block: addressInfo.mandal,
      panchayat: addressInfo.panchayat,
      village: addressInfo.village,
    }));
  }, [local.sameAsAboveAddress]);

  useEffect(() => {
    if (local.sameAsAboveAddress) return;

    setLocal(prev => ({
      ...prev,
      district: "",
      block: "",
      panchayat: "",
      village: "",
    }));
  }, [local.sameAsAboveAddress]);


  /* ✅ ONLY place where parent is updated */
  const update = (k: keyof LandValue, v: any) => {
    setLocal(prev => ({ ...prev, [k]: v }));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Land Details</Text>

      <Label text="Total Land Area (Ha.)" />
      <Input
        value={local.totalLandArea}
        onChange={v => update("totalLandArea", v)}
      />
      {errors.totalLandArea && <Error text={errors.totalLandArea} />}

      <Label text="Survey No" />
      <Input
        value={local.landSurveyNo}
        onChange={v => update("landSurveyNo", v)}
      />
      {errors.landSurveyNo && <Error text={errors.landSurveyNo} />}

      <Checkbox
        label="Same as above address"
        checked={local.sameAsAboveAddress}
        onChange={(v: boolean) => update("sameAsAboveAddress", v)}
      />

      <>
        <Label text="District" />

        {local.sameAsAboveAddress ? (
          <Input value={local.district} disabled />
        ) : (
          <PickerBox
            value={local.district}
            onChange={v => update("district", v)}
            items={[["", "--Select District--"], ...districts]}
          />
        )}


        <Label text="Block" />

        {local.sameAsAboveAddress ? (
          <Input value={local.block} disabled />
        ) : (
          <PickerBox
            value={local.block}
            onChange={v => update("block", v)}
            disabled={!local.district}
            items={[["", "--Select Block--"], ...blocks]}
          />
        )}


        <Label text="Panchayat" />

        {local.sameAsAboveAddress ? (
          <Input value={local.panchayat} disabled />
        ) : (
          <PickerBox
            value={local.panchayat}
            onChange={v => update("panchayat", v)}
            disabled={!local.block}
            items={[["", "--Select Panchayat--"], ...panchayats]}
          />
        )}


        <Label text="Village" />

        {local.sameAsAboveAddress ? (
          <Input value={local.village} disabled />
        ) : (
          <PickerBox
            value={local.village}
            onChange={v => update("village", v)}
            disabled={!local.panchayat}
            items={[["", "--Select Village--"], ...villages]}
          />
        )}

      </>
    </View>
  );
})

export default LandDetails

const Label = ({ text, optional }: any) => (
  <Text style={styles.label}>
    {text}
    {!optional && <Text style={styles.required}> *</Text>}
  </Text>
);

const Input = ({
  value,
  onChange,
  max,
  disabled,
}: {
  value: string;
  onChange?: (value: string) => void;
  max?: number;
  disabled?: boolean;
}) => (
  <TextInput
    value={value}
    editable={!disabled}
    maxLength={max}
    onChangeText={onChange}
    style={[styles.input, disabled && { backgroundColor: "#eee" }]}
  />
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


const Checkbox = ({ label, checked, onChange, disabled }: any) => (
  <Pressable
    onPress={() => !disabled && onChange(!checked)}
    style={{ flexDirection: "row", marginVertical: 6 }}
  >
    <Text>{checked ? "☑" : "☐"} {label}</Text>
  </Pressable>
);

const Error = ({ text }: any) => (
  <Text style={{ color: "#d32f2f", fontSize: 12 }}>{text}</Text>
);

const Hr = () => <View style={{ height: 1, backgroundColor: "#ccc", marginVertical: 12 }} />;


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  required: {
    color: "#d32f2f",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e5e2a",          // govt green
    marginTop: 12,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cfd8dc",
  },

});