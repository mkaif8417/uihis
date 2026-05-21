import { View, Text, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import React, { forwardRef, useImperativeHandle } from "react";

/* Required fields (Angular parity) */
const REQUIRED_FIELDS = [
  "district",
  "bankName",
  "branchName",
  "ifscCode",
  "accountNo",
] as const;
const BankInfo = forwardRef(function BankInfo({
  onValidityChange,
  onChange,
}: {
  onChange: (data: any, isValid: boolean) => void;
  onValidityChange?: (valid: boolean) => void;
}, ref) {
  /* ---------------- HOOKS FIRST ---------------- */
  const [form, setForm] = useState({
    state: "08", // Haryana
    district: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    accountNo: "",
  });

  const [districts, setDistricts] = useState<[string, string][]>([]);
  const [branches, setBranches] = useState<[string, string][]>([]);
  // const [ifsc, setifsc] = useState<string>("")
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingifsc, setLoadingifsc] = useState(false);
  const [error, setError] = useState("");
  const banks: [string, string][] = [
    ["", "--Select Bank--"],
    ["002", "Abu Dhabi Commercial Bank"],
    ["003", "Allahabad Bank"],
    ["004", "Andhra Bank"],
    ["005", "Axis Bank"],
    ["007", "Bank Of Baroda"],
    ["008", "Bank Of India"],
    ["009", "Bank Of Maharashtra"],
    ["011", "Canara Bank"],
    ["013", "Central Bank Of India"],
    ["014", "Citibank"],
    ["016", "Corporation Bank"],
    ["019", "Dena Bank"],
    ["023", "Hdfc Bank Ltd"],
    ["024", "Hsbc"],
    ["025", "Icici Bank Ltd"],
    ["026", "Idbi Bank Ltd"],
    ["027", "Indian Bank"],
    ["028", "Indian Overseas Bank"],
    ["029", "Indusind Bank Ltd"],
    ["030", "Ing Vysya Bank"],
    ["031", "Karnataka Bank Ltd"],
    ["032", "Karur Vysya Bank"],
    ["033", "Kotak Mahindra Bank"],
    ["035", "Oriental Bank Of Commerce"],
    ["036", "Punjab And Maharashtra Co-Op Bank Ltd"],
    ["037", "Punjab And Sind Bank"],
    ["038", "Punjab National Bank"],
    ["039", "Reserve Bank Of India"],
    ["040", "South Indian Bank"],
    ["041", "Standard Chartered Bank"],
    ["042", "State Bank Of Bikaner And Jaipur"],
    ["043", "State Bank Of Hyderabad"],
    ["044", "State Bank Of India"],
    ["045", "State Bank Of Mysore"],
    ["046", "State Bank Of Patiala"],
    ["047", "State Bank Of Travancore"],
    ["048", "Syndicate Bank"],
    ["049", "Tamilnad Mercantile Bank Ltd"],
    ["053", "The Federal Bank Ltd"],
    ["054", "The Jammu And Kashmir Bank Ltd"],
    ["063", "Union Bank Of India"],
    ["065", "Vijaya Bank"],
    ["066", "Yes Bank Ltd"],
    ["067", "State Bank Of Saurashtra"],
    ["068", "Gujarat State Cooperative Bank Ltd"],
    ["071", "Nutan Nagarik Sahakari Bank Ltd"],
    ["072", "The Ahmedabad Merc Coop Bk Ltd"],
    ["091", "Pnb Garamin Bank"],
    ["092", "Rajasthan Gramin Bank"],
    ["093", "The Nainital Bank Limited"],
    ["094", "Puducherry State Cooperative B"],
    ["095", "Puduvai Bharathiyar Grama Bank"],
    ["096", "pandian gramma bank"],
    ["097", "Pune DCC Bank"],
    ["098", "Cardamom Merchants Banks"],
    ["099", "Union Raitha Seva Sahakara Ban"],
    ["100", "Karnataka Vikasa Grameena Bank"],
    ["101", "KCC Bank"],
    ["105", "Urban Co-operative Bank"],
    ["119", "UCO Bank"],
    ["120", "United Bank of India"],
    ["130", "CENTURION BANK"],
    ["135", "STATE BANK OF INDORE"],
    ["153", "Federal Bank"],
    ["154", "Gurugram Gramin Bank"],
    ["169", "REPCO"],
    ["193", "Gurgaon Grameena Bank"],
    ["194", "Haryana Gramin Bank"],
    ["195", "The Jhajjar Central Cooperativ"],
    ["196", "The Gurgaon Central Coop-Bank"],
    ["197", "The Gurgaon Central Coop-Bank"],
    ["198", "The Gurgaon Central Coop-Bank"],
    ["199", "The sonipat central co-op bank"],
    ["200", "Sarva Haryana Gramin Bank"],
    ["201", "The Gurgaon Central Co- operat"],
    ["202", "Bhiwani Central Cooperative"],
    ["203", "6. The Jind Central Co-op Bank"],
    ["204", "The hisar central co-op bank"],
    ["205", "Hisar central co-op.bank"],
    ["206", "The Faridabad Central Coop Ban"],
    ["207", "THE PANCHKULA CENTRAL CO. BANK"],
    ["208", "The Karnal Central co-op bank"],
    ["209", "The Sirsa central Co-operative"],
    ["210", "The Yamuna Nagar Central Co-Op"],
    ["211", "the bhiwani central co-op bank"],
    ["212", "Jammu and Kashmir Bank"],
    ["213", "The Fatehabad Central Co-op Ba"],
    ["214", "The Jind Central Co-Op Bank Lt"],
    ["215", "THE PANCHKULA CENTRAL CO.OP. B"],
    ["216", "INDUSLAND BANK"],
    ["217", "The ambala central co-oprative"],
    ["218", "The Karnal Central Co-op Bank"],
    ["219", "The Panipat Urban co. ban"],
    ["220", "The Panipat Urban co. bank"],
    ["221", "the mahendragarh central co-op"],
    ["222", "The Panipat Central Co.Op. Ban"],
    ["223", "the kurukshetra co-po bank"],
    ["224", "GRAMIN BANK"],
    ["225", "The Kendariya Sahkari Bank Ltd"],
    ["226", "Central Cooperative bank"],
    ["227", "Central Cooperative bank"],
    ["228", "Central Cooperative bank"],
    ["229", "The Jhajjar Kendriya Sehkari B"],
    ["230", "The Karur Vysya Bank Limited"],
    ["231", "The Rohtak Central Cooperative"],
    ["232", "The Jind Central Co-op.Bank Lt"],
    ["233", "deutsche bank"],
    ["234", "The Jhajjar Central Co-Op Bank"],
    ["235", "Zee"],
    ["236", "THE BAGHAT URBNA CO-OP.BANK LT"],
    ["237", "Oriental bank of India"],
    ["238", "RATNAKAR BANK"],
    ["239", "Baroda Rajasthan Kshetriya Gra"],
    ["240", "POST OFFICE SAVINGS BANK"],
    ["241", "IDFC, Bank"],
    ["242", "Sutlej Gramin Bank"],
    ["243", "THE SONEPAT URBAN CO-OP BANK L"],
    ["244", "The Gurgaon Central Co- Operat"],
    ["245", "Dak Ghar Bachat Bank"],
    ["246", "AU Small Financial Bank"],
    ["247", "The Muktsar Central Co-Operati"],
    ["248", "UJJIVAN Small Finance bank"],
    ["249", "The Kaithal Central Co-op Bank"],
    ["250", "Catholic Syrian Bank Ltd"],
    ["251", "Capital small finance Bank Ltd"],
    ["252", "The Haryana State Co-op. Apex"],
    ["253", "Equitas Bank"],
    ["254", "PANIPAT URBANCOOP BANK GT ROAD"],
    ["255", "PANIPAT URBAN COOP BANK"],
    ["256", "DCB"],
    ["257", "FINO Bank"],
    ["258", "THE DELHI STATE CO-OPERATIVE"],
    ["259", "THE CHANDIGARH STATE CO-OPBANK"],
    ["260", "The Rewari Central Cooperative"],
    ["261", "Sarv Haryana Gramin Bank"],
    ["262", "PARDB"],
    ["263", "Jana Small Finance Bank"],
    ["264", "Bandhan Bank"],
    ["309", "HARCO BANK"],
    ["310", "Equitas Small Finance Bank"],
    ["311", "IDFC FIRST BANK"],
    ["312", "INDIAN POST PAYMENT BANK(IPPB)"],
    ["313", "PLDB"],
    ["314", "UTKARSH SMALL FINANCE BANK"],
    ["315", "The Cooperative Bank"],
  ];


  useEffect(() => {
    setLoadingDistrict(true);
    setDistricts([]);
    const fetchData = async () => {
      try {
        await fetch(`https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getDistricts?kon=08&state_code=08`)
          .then(res => res.json())
          .then(data => {
            // Expected: [{ code: "01", name: "District A" }]
            // console.log(data)
            const list = data.map((d: any) => [d.district_code, d.district_name]);
            setDistricts(list);
          })
          .catch(() => setDistricts([]))
          .finally(() => setLoadingDistrict(false));
        // console.log(districts)
      }

      catch (error) {
        console.log(error);
        setError("Network error");
      }
    }
    fetchData()

  }, []);

  useEffect(() => {
    if (!form.branchName || !form.bankName || !form.district) return;
    setLoadingifsc(true);

    setForm(prev => ({
      ...prev,
      ifscCode: "",
    }));

    const fetchIfsc = async () => {
      try {
        const res = await fetch(
          `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getIFSCcodes?kon=08&bank_code=${form.bankName}&branch_code=${form.branchName}&state_code=08&district_code=${form.district}`,
          {
            method: "GET",
          }
        );

        const text = await res.text();     // <-- FIXED
        // console.log("IFSC:", text);

        setForm(prev => ({ ...prev, ifscCode: text }));

        setLoadingifsc(false);

      } catch (error) {
        console.log(error);
        setError("Network error");
        setLoadingifsc(false);
      }
    };

    fetchIfsc();
  }, [form.branchName]);

  /* -------- Bank → Branch cascade -------- */
  useEffect(() => {
    if (!form.bankName || !form.district) return;

    setLoadingBranch(true);
    setBranches([]);

    // Reset dependent fields (Angular behavior)
    setForm(prev => ({
      ...prev,
      branchName: "",
      ifscCode: "",
    }));

    const fetchBranches = async () => {
      try {
        fetch(
          `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getBranches?kon=08&district=${form.district}&bank_code=${form.bankName}`
        )
          .then(res => res.json())
          .then(data => {
            // expected: [{ branchCode, branchName, ifsc }]
            const list = data.map((b: any) => [b.branch_code, b.branch_name]);
            setBranches(list);
          })
          .catch(() => setBranches([]))
          .finally(() => setLoadingBranch(false));
      } catch (error) {
        console.log(error)
        setError("Network error")
      }

    }

    fetchBranches();

  }, [form.bankName, form.district]);

  useImperativeHandle(ref, () => ({
    commit() {
      onChange(form, true);
    },
  }));

  const update = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const valid = REQUIRED_FIELDS.every(
      k => form[k as keyof typeof form]?.toString().trim()
    );

    onValidityChange?.(valid);
  }, [form]);


  /* ---------------- UI ---------------- */
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Bank Information / Details</Text>

      {/* State (disabled) */}
      <Label text="State" />
      <Input value="HARYANA" disabled />

      {/* District */}
      <Label text="District" />
      <PickerBox
        value={form.district}
        onChange={v => update("district", v)}
        items={[
          ["", loadingDistrict ? "Loading districts..." : "--Select District--"],
          ...districts,
        ]}
      />

      {/* Bank Name */}
      <Label text="Bank Name" />
      <PickerBox
        value={form.bankName}
        onChange={v => update("bankName", v)}
        items={banks}
      />

      {/* Branch Name */}
      <Label text="Branch Name" />
      <PickerBox
        value={form.branchName}
        disabled={!form.bankName || loadingBranch}
        onChange={v => update("branchName", v)}
        items={[
          [
            "",
            loadingBranch ? "Loading branches..." : "--Select Branch--",
          ],
          ...branches,
        ]}
      />

      {/* IFSC */}
      <Label text="IFSC Code" />
      <Input
        value={form.ifscCode}
        onChange={v => update("ifscCode", v)}
        max={15}
        disabled
      />

      {/* Account No */}
      <Label text="Account Number" />
      <Input
        value={form.accountNo}
        onChange={v => update("accountNo", v)}
        max={20}
        keyboard="numeric"
      />
    </View>
  );
})

export default BankInfo;


const Label = ({ text }: { text: string }) => (
  <Text style={styles.label}>
    {text}
    <Text style={styles.required}> *</Text>
  </Text>
);

const Input = ({
  value,
  onChange,
  keyboard = "default",
  max,
  disabled,
}: {
  value: string;
  onChange?: (v: string) => void;
  keyboard?: any;
  max?: number;
  disabled?: boolean;
}) => (
  <TextInput
    style={[
      styles.input,
      disabled && { backgroundColor: "#eeeeee" },
    ]}
    value={value}
    editable={!disabled}
    keyboardType={keyboard}
    maxLength={max}
    onChangeText={onChange}
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
});