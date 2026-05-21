import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import useFarmer from "./context/FarmerContext";
import { forwardRef, useImperativeHandle, useRef } from "react";

/* ------------------ REQUIRED FIELDS ------------------ */
const REQUIRED = [
    "district",
    "block",
    "panchayat",
    "village",
    "houseNo",
    "streetLocation",
    "pinCode",
] as const;

const AddressInfo = forwardRef(function AddressInfo({
    onValidityChange,
    onChange,
}: {
    onValidityChange?: (valid: boolean) => void;
    onChange: (data: any, isValid: boolean) => void;
}, ref) {
    const { farmer } = useFarmer();
    console.log("addrs info rndrd")
    /* ------------------ LOCAL DRAFT STATE ------------------ */
    const [form, setForm] = React.useState(() => ({
        state: "08",
        district: "",
        block: "",
        panchayat: "",
        village: "",
        habitation: "",
        houseNo: "",
        streetLocation: "",
        addressInLocalLanguage: "",
        pinCode: "",
    }));

    /* ------------------ INIT FROM PARENT (ONCE) ------------------ */
    const lastValidRef = useRef<boolean | null>(null);

    /* ------------------ DROPDOWN DATA ------------------ */
    const [districts, setDistricts] = React.useState<[string, string][]>([]);
    const [blocks, setBlocks] = React.useState<[string, string][]>([]);
    const [panchayats, setPanchayats] = React.useState<[string, string][]>([]);
    const [villages, setVillages] = React.useState<[string, string][]>([]);

    const [loadingDistrict, setLoadingDistrict] = React.useState(false);
    const [loadingBlock, setLoadingBlock] = React.useState(false);
    const [loadingPanchayat, setLoadingPanchayat] = React.useState(false);
    const [loadingVillage, setLoadingVillage] = React.useState(false);

    /* ------------------ FETCH HELPERS ------------------ */
    const safeFetch = async (
        url: string,
        setter: React.Dispatch<React.SetStateAction<[string, string][]>>,
        loader?: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        let active = true;
        loader?.(true);
        setter([]);

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (active) setter(data.map((d: any) => Object.values(d).slice(0, 2)));
        } catch {
            if (active) setter([]);
        } finally {
            if (active) loader?.(false);
        }

        return () => {
            active = false;
        };
    };

    /* ------------------ FETCH DISTRICTS ------------------ */
    React.useEffect(() => {
        console.log("distritcs ldng")
        safeFetch(
            "https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getDistricts?kon=08&state_code=08",
            setDistricts,
            setLoadingDistrict
        );
    }, []);

    /* ------------------ FETCH BLOCKS ------------------ */
    React.useEffect(() => {
        if (!form.district) return;
        console.log("mandals ldng")

        setForm(prev => {
            if (!prev.block && !prev.panchayat && !prev.village) return prev;
            return { ...prev, block: "", panchayat: "", village: "" };
        });

        safeFetch(
            `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getMandals?kon=08&state_code=08&district_code=${form.district}`,
            setBlocks,
            setLoadingBlock
        );
    }, [form.district]);

    /* ------------------ FETCH PANCHAYATS ------------------ */
    React.useEffect(() => {
        if (!form.block) return;
        console.log("panchyts ldng")
        setForm(prev => {
            if (!prev.panchayat && !prev.village) return prev;
            return { ...prev, panchayat: "", village: "" };
        });

        safeFetch(
            `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getPanchayats?kon=08&state_code=08&district_code=${form.district}&mandal_code=${form.block}`,
            setPanchayats,
            setLoadingPanchayat
        );
    }, [form.block]);

    /* ------------------ FETCH VILLAGES ------------------ */
    React.useEffect(() => {
        if (!form.panchayat) return;
        console.log("villages ldng")
        setForm(prev => {
            if (!prev.village) return prev;
            return { ...prev, village: "" };
        });

        safeFetch(
            `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getVillages?kon=08&state_code=08&district_code=${form.district}&mandal_code=${form.block}&panchayat_code=${form.panchayat}`,
            setVillages,
            setLoadingVillage
        );
    }, [form.panchayat]);

    /* ------------------ SAFE UPDATE ------------------ */
    const update = (key: keyof typeof form, val: string) => {
        setForm(prev => ({ ...prev, [key]: val }));
    };

    useImperativeHandle(ref, () => ({
        commit() {
            const valid = REQUIRED.every(k => {
                if (k === "pinCode") return /^\d{6}$/.test(form.pinCode);
                return form[k as keyof typeof form]?.toString().trim();
            });

            onChange(form, valid);
        },
    }));

    // useEffect(() => {
    //     const valid = REQUIRED.every(k => {
    //         if (k === "pinCode") return /^\d{6}$/.test(form.pinCode);
    //         return form[k]?.toString().trim();
    //     });

    //     if (valid !== lastValidRef.current) {
    //         lastValidRef.current = valid;
    //         onValidityChange?.(valid);
    //     }
    // }, [form]);

    /* ------------------ UI ------------------ */
    return (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>Address For Correspondence</Text>

            <Label text="State" />
            <Input value="HARYANA" importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
                disabled />

            <Label text="District" />
            <PickerBox
                value={form.district}
                onChange={v => update("district", v)}
                items={[["", loadingDistrict ? "Loading..." : "--Select District--"], ...districts]}
            />

            <Label text="Mandal" />
            <PickerBox
                value={form.block}
                disabled={!form.district || loadingBlock}
                onChange={v => update("block", v)}
                items={[["", loadingBlock ? "Loading..." : "--Select Mandal--"], ...blocks]}
            />

            <Label text="Panchayat" />
            <PickerBox
                value={form.panchayat}
                disabled={!form.block || loadingPanchayat}
                onChange={v => update("panchayat", v)}
                items={[["", loadingPanchayat ? "Loading..." : "--Select Panchayat--"], ...panchayats]}
            />

            <Label text="Village" />
            <PickerBox
                value={form.village}
                disabled={!form.panchayat || loadingVillage}
                onChange={v => update("village", v)}
                items={[["", loadingVillage ? "Loading..." : "--Select Village--"], ...villages]}
            />

            <Label text="Habitation" optional />
            <PickerBox
                value={form.habitation}
                onChange={v => update("habitation", v)}
                items={[
                    ["", "--Select Habitation--"],
                    ["01", "Habitation 1"],
                    ["02", "Habitation 2"],
                    ["03", "Habitation 3"],
                ]}
            />

            <Label text="House No" />
            <Input value={form.houseNo} onChange={v => update("houseNo", v)} importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
            />

            <Label text="Street / Location" />
            <Input value={form.streetLocation} onChange={v => { update("streetLocation", v) }}
                importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
            />

            <Label text="Address in Local Language" optional />
            <Input value={form.addressInLocalLanguage} onChange={v => update("addressInLocalLanguage", v)} importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
            />

            <Label text="PIN Code" />
            <Input value={form.pinCode} onChange={v => update("pinCode", v)} keyboard="numeric"
                importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
            />

            <Label text="Mobile No" />
            <Input value={farmer.mobile_no} importantForAutofill="no"
                autoComplete="off"
                textContentType="none"
                disabled />
        </View>
    );
})

export default AddressInfo;

/* ------------------ SMALL COMPONENTS ------------------ */
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
    importantForAutofill,
    autoComplete,
    disabled,
    textContentType
}: {
    value: string;
    onChange?: (v: string) => void;
    keyboard?: any;
    max?: number;
    autoComplete: string;
    importantForAutofill: string;
    disabled?: boolean;
    textContentType: string
}) => (
    <TextInput
        style={[styles.input, disabled && { backgroundColor: "#eeeeee" }]}
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
        <Picker selectedValue={value} onValueChange={onChange} enabled={!disabled}>
            {items.map(([val, label]) => (
                <Picker.Item key={val} label={label} value={val} />
            ))}
        </Picker>
    </View>
);

/* ------------------ STYLES ------------------ */

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