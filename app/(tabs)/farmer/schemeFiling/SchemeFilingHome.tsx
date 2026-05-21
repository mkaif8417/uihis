import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import useSchemeForm from '../../../../components/context/SchemeFormContext';
import useFarmer from '@/components/context/FarmerContext';

const steps = [
    'Component Details',
    'Land Area & Other Details',
    'Land Location',
    'Review & Edit',
];

export default function SchemeFilingHome() {
    const [regNo, setRegNo] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [applicant, setApplicant] = useState<any>(null);
    const [schemes, setSchemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [ackData, setAckData] = useState<any[]>([]);
    const { form } = useSchemeForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [stepValid, setStepValid] = useState<boolean[]>(
        Array(steps.length).fill(false)
    );


    const { farmer } = useFarmer()
    useEffect(() => {
        // login time (static once)
        const now = new Date();
        setDateTime(now.toLocaleString());
        setRegNo(farmer.appl_reg_no)
        // console.log("in scheme filing", farmer.appl_reg_no)
    }, []);

    const fetchDetails = async () => {
        console.log("regNo: ", regNo)
        try {
            await fetch(`https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetails?kon=08&appl_reg_no=${regNo}`)
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
                    setApplicant(data[0])
                    // console.log(applicant)
                })
                .catch(err => console.log(err))

            setSchemes([]);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch details');
        }
    };

    const onFetch = async () => {
        console.log(regNo)
        try {
            setLoading(true);

            const res = await fetch(
                `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetails_sch?kon=08&appl_reg_no=${regNo}&year=25`
            );

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                setAckData([]);
                return;
            }

            setAckData(data);
        } catch (e) {
            console.log("Failed to fetch acknowledgement.", e)
        } finally {
            setLoading(false);
        }
    };

    const goNext = () => setCurrentStep(s => s + 1);
    const goBack = () => setCurrentStep(s => s - 1);

    return (
        <ScrollView style={styles.container}>
            <Header />
            {/* <SchemeStepper currentStep={0} /> */}
            {/* Title Bar */}
            <View style={styles.titleBar}>
                <Text style={styles.titleText}>
                    Farmer&apos;s Scheme Filling / Registration
                </Text>
            </View>

            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topText}>State: Haryana</Text>
                <Text style={styles.topText}>
                    WELCOME TO : Test{'\n'}
                    RegistrationID: {regNo}
                </Text>
                <Text style={styles.topText}>Date: {dateTime}</Text>
            </View>

            {/* Fetch Form */}
            <View style={styles.card}>
                <Text style={styles.label}>
                    Enter Your Application / Registration Number
                </Text>

                <TextInput
                    style={styles.input}
                    value={regNo}
                    editable={false}
                />

                <View style={styles.row}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={onFetch}>
                        <Text style={styles.btnText}>Fetch Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dangerBtn}
                        onPress={() => router.push("/(tabs)/farmer/farmerHome")}
                    >
                        <Text style={styles.btnText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Applicant Info */}
            {applicant && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Applicant Information</Text>

                    <InfoRow label="Applicant Name" value={applicant.applicant_name} />
                    <InfoRow label="Relation Name" value={applicant.swdh_name} />
                    <InfoRow label="Applicant Type" value={applicant.appl_type} />
                    <InfoRow label="Category" value={applicant.category_code} />
                    <InfoRow label="Land Survey No" value={applicant.survey_no} />
                </View>
            )}

            {/* Scheme Table */}

            {
                ackData.length == 0 && (
                    <Text style={styles.addText}>No scheme data available</Text>
                )
            }

            {ackData.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Scheme Details</Text>

                    {ackData.map((item, index) => (
                        <View key={index} style={styles.schemeCard}>
                            <InfoRow label="Scheme" value={item.component_type_name} />
                            <InfoRow label="Component" value={item.component_name} />
                            <InfoRow label="Sub Component" value={item.sub_component_name} />
                            <InfoRow label="Crop Name" value={item.crop_item_name} />
                            <InfoRow label="Land Area Applied" value={item.land_area} />
                        </View>
                    ))}
                </View>
            )}

            {/* Add Scheme */}
            <Text style={styles.addText}>Do You Want To Add Scheme</Text>

            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.push("/(tabs)/farmer/schemeFiling/compDtls")}
                >
                    <Text style={styles.btnText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dangerBtn}
                    onPress={() => Alert.alert('No pressed')}
                >
                    <Text style={styles.btnText}>No</Text>
                </TouchableOpacity>
            </View>
            <Footer />
        </ScrollView>
    );
}

/* Small reusable row */
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "-"}</Text>
    </View>
);


const styles = StyleSheet.create({
    container: {
        margin: 5,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    titleBar: {
        borderRadius: 13,
        backgroundColor: '#2e7d32',
        padding: 14,
    },
    titleText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    section: {
        margin: 16,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingTop: 12,
    },
    schemeCard: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    topBar: {
        borderRadius: 15,
        backgroundColor: '#d3ebd5',
        padding: 12,
    },
    topText: {
        fontSize: 14,
        marginBottom: 4,
        // borderRadius: 20,
    },
    card: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 10,
        borderRadius: 8,
        elevation: 2,
    },
    label: {
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        backgroundColor: '#eee',
    },
    value: {
        fontWeight: "500",
        color: "#000",
        flex: 1,
        textAlign: "right",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 6,
    },
    primaryBtn: {
        backgroundColor: '#2045dcff',
        padding: 10,
        borderRadius: 6,
        minWidth: '45%',
        alignItems: 'center',
    },
    dangerBtn: {
        backgroundColor: '#c62828',
        padding: 10,
        borderRadius: 6,
        minWidth: '45%',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    infoLabel: {
        fontWeight: '600',
        color: '#555',
    },
    infoValue: {
        color: '#000',
    },
    noData: {
        textAlign: 'center',
        color: '#777',
        marginVertical: 10,
    },
    addText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 10,
        marginTop: 10,
    },
});
