import useFarmer from "@/components/context/FarmerContext";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { forwardRef, useImperativeHandle, useRef } from "react";

/* ---------------- REQUIRED FIELDS ---------------- */
const REQUIRED_PERSONAL_FIELDS = [
    "applicantType",
    "applicantCategory",
    "socialStatus",
    "applicantName",
    "relationType",
    "relationName",
    "qualification",
    "gender",
    "age",
    "email",
    "income",
    "aadhaar",
] as const;

const PersonalInfo = forwardRef(function PersonalInfo({
    onValidityChange,
}: {
    onValidityChange: (valid: boolean) => void;
}, ref) {
    const { updateFarmer } = useFarmer();
    console.log("personal info rendered")



    /* ---------------- FORM STATE ---------------- */
    const [form, setForm] = useState({
        applicantType: "",
        applicantCategory: "",
        socialStatus: "",
        applicantName: "",
        localName: "",
        relationType: "",
        relationName: "",
        qualification: "",
        gender: "",
        age: "",
        email: "",
        income: "",
        aadhaar: "",
        rationCard: "",
        voterId: "",
        kisanCard: "",
        pan: "",
        mfmb: "",
        ppp: "",
    });

    /* ---------------- MASTER DATA ---------------- */
    const [applicantTypes, setApplicantTypes] = useState<[string, string][]>([]);
    const [categories, setCategories] = useState<[string, string][]>([]);
    const [castes, setCastes] = useState<[string, string][]>([]);
    const [qualifications, setQualifications] = useState<[string, string][]>([]);
    const lastValidRef = useRef<boolean | null>(null);

    useImperativeHandle(ref, () => ({
        commit() {
            updateFarmer({
                appl_type: form.applicantType,
                category_code: form.applicantCategory,
                caste_code: form.socialStatus,
                applicant_name: form.applicantName,
                name_in_local_language: form.localName,
                so_wo_do_ho: form.relationType,
                swdh_name: form.relationName,
                qualification_code: form.qualification,
                gender: form.gender,
                applicant_age: Number(form.age || 0),
                email_id: form.email,
                income: form.income,
                aadhaar_no: form.aadhaar,
                ration_no: form.rationCard,
                ellection_no: form.voterId,
                kissan_card_no: form.kisanCard,
                pan_card_no: form.pan,
                mfmb: form.mfmb,
                uniqueid1: form.ppp,
            });
        },
    }));


    const updateField = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        console.log("2nd useEffect");
        const valid = REQUIRED_PERSONAL_FIELDS.every(
            k => form[k]?.toString().trim()
        );

        if (valid !== lastValidRef.current) {
            lastValidRef.current = valid;
            onValidityChange(valid);
        }
    }, [form, onValidityChange]);


    useEffect(() => {
        console.log("1st useEffect")
        const safeFetch = async (
            url: string,
            mapFn: (d: any) => [string, string]
        ) => {
            try {
                const res = await fetch(url);
                const text = await res.text();

                if (!text || text.trim() === "") return [];

                const json = JSON.parse(text);
                // console.log("PARSED JSON:", url, json);

                const list =
                    Array.isArray(json) ? json :
                        Array.isArray(json.Table) ? json.Table :
                            Array.isArray(json.data) ? json.data :
                                Array.isArray(json.Result) ? json.Result :
                                    [];

                return list.map(mapFn);
            } catch (e) {
                console.error("safeFetch FAILED:", url, e);
                return [];
            }
        };

        Promise.all([
            safeFetch(
                "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getApplicantTypes?kon=08",
                d => [d.type_code, d.type_name]
            ),
            safeFetch(
                "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/GetCategories?kon=08",
                d => [d.category_code, d.category_name]
            ),
            safeFetch(
                "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/GetCaste?kon=08",
                d => [d.caste_code, d.caste_name]
            ),
            safeFetch(
                "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/GetEduQualification?kon=08",
                d => [d.qualification_code, d.qualification_name]
            ),
        ]).then(([t, c, s, q]) => {
            setApplicantTypes(t);
            setCategories(c);
            setCastes(s);
            setQualifications(q);
        });
    }, []);

    /* ---------------- UI ---------------- */
    return (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>Personal Information / Details</Text>

            <Label text="Applicant Type" />
            <PickerBox
                value={form.applicantType}
                onChange={v => updateField("applicantType", v)}
                items={[["", "-- Select Type --"], ...applicantTypes]}
            />

            <Label text="Applicant Category" />
            <PickerBox
                value={form.applicantCategory}
                onChange={v => updateField("applicantCategory", v)}
                items={[["", "-- Select Category --"], ...categories]}
            />

            <Label text="Social Status" />
            <PickerBox
                value={form.socialStatus}
                onChange={v => updateField("socialStatus", v)}
                items={[["", "-- Select Caste --"], ...castes]}
            />

            <Label text="Applicant Name" />
            <Input value={form.applicantName} onChange={v => updateField("applicantName", v)} />

            <Label text="Name in Local Language" optional />
            <Input value={form.localName} onChange={v => updateField("localName", v)} />

            <Label text="Relation Type" />
            <PickerBox
                value={form.relationType}
                onChange={v => updateField("relationType", v)}
                items={[
                    ["", "-- Select Relation --"],
                    ["S", "S/O"],
                    ["D", "D/O"],
                    ["W", "W/O"],
                    ["H", "H/O"],
                ]}
            />

            <Label text="Relation Name" />
            <Input value={form.relationName} onChange={v => updateField("relationName", v)} />

            <Label text="Educational Qualification" />
            <PickerBox
                value={form.qualification}
                onChange={v => updateField("qualification", v)}
                items={[["", "-- Select Qualification --"], ...qualifications]}
            />

            <Label text="Gender" />
            <PickerBox
                value={form.gender}
                onChange={v => updateField("gender", v)}
                items={[
                    ["", "-- Select Gender --"],
                    ["M", "Male"],
                    ["F", "Female"],
                    ["O", "Other"],
                ]}
            />

            <Label text="Age (in Years)" />
            <Input value={form.age} onChange={v => updateField("age", v)} keyboard="numeric" />

            <Label text="Email ID" />
            <Input value={form.email} onChange={v => updateField("email", v)} />

            <Label text="Income Per Annum" />
            <Input value={form.income} onChange={v => updateField("income", v)} keyboard="numeric" />

            <Label text="Aadhaar No" />
            <TextInput
                value={form.aadhaar}
                keyboardType="numeric"
                maxLength={12}
                onChangeText={(v) => {
                    const cleaned = v.replace(/[^0-9]/g, "");
                    setForm(prev => ({ ...prev, aadhaar: cleaned }));
                }}
            />

            <Label text="Ration Card No" optional />
            <Input value={form.rationCard} onChange={v => updateField("rationCard", v)} />

            <Label text="Voter Card No" optional />
            <Input value={form.voterId} onChange={v => updateField("voterId", v)} />

            <Label text="Kisan Credit Card No" optional />
            <Input value={form.kisanCard} onChange={v => updateField("kisanCard", v)} />

            <Label text="PAN Card No" optional />
            <Input value={form.pan} onChange={v => updateField("pan", v)} />

            <Label text="MFMB No" optional />
            <Input value={form.mfmb} onChange={v => updateField("mfmb", v)} />

            <Label text="PPP ID" optional />
            <Input value={form.ppp} onChange={v => updateField("ppp", v)} />
        </View>
    );
}
)

export default PersonalInfo

/* ---------- SMALL REUSABLE COMPONENTS ---------- */

const Label = ({ text, optional }: { text: string; optional?: boolean }) => (
    <Text style={styles.label}>
        {text}
        {!optional && <Text style={styles.required}> *</Text>}
    </Text>
);

const Input = ({
    value,
    onChange,
    keyboard = "default",
    max,
}: {
    value: string;
    onChange: (v: string) => void;
    keyboard?: any;
    max?: number;
}) => (
    <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        maxLength={max}
    />
);

const PickerBox = ({
    value,
    onChange,
    items,
}: {
    value: string;
    onChange: (v: string) => void;
    items: [string, string][];
}) => (
    <View style={styles.pickerWrapper}>
        <Picker selectedValue={value} onValueChange={onChange}>
            {items.map(([val, label]) => (
                <Picker.Item key={val} label={label} value={val} />
            ))}
        </Picker>
    </View>
);

/* ---------- STYLES ---------- */

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
