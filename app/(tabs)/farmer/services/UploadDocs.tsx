// import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useFarmer from "@/components/context/FarmerContext";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// imports for preview of files
import * as WebBrowser from "expo-web-browser";
import { Image, Modal } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type ComponentItem = {
    appl_reg_no: string;
    comp: string;
    compn: string;
    land_area: number;
};

type DocumentControl = {
    document_name: string;
    fileId: string;
    file_Upload_Timimgs: string | null;
    type1: string;
    canUploadFile: boolean;
    isDisabled: boolean;
    gpslat: string | null;
    gpslong: string | null;
};

type DocsResponse = {
    applicantname: string;
    controls: DocumentControl[];
    data: ComponentItem[];
    finYear: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KON = "34";





function getSchemeLabel(compn: string): string {
    if (compn.startsWith("NHM") || compn.startsWith("56")) return "NHM (MIDH)";
    if (compn.startsWith("IHD") || compn.startsWith("E2")) return "IHD";
    const match = compn.match(/^([A-Z\-()/ ]+)/);
    return match ? match[1].trim() : compn.slice(0, 20);
}

function isUploaded(control: DocumentControl): boolean {
    return !!(
        control.file_Upload_Timimgs &&
        control.file_Upload_Timimgs.trim() !== "" &&
        (control.gpslat !== null || control.gpslong !== null)
    );
}

function parseUploadDate(timings: string | null): string | null {
    if (!timings) return null;
    const match = timings.match(/Date of Upload\s*:\s*([\d\-: ]+)/);
    return match ? match[1].trim() : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadDocs() {
    const { farmer } = useFarmer();

    const [regNo, setRegNo] = useState<string>("");
    const [components, setComponents] = useState<ComponentItem[]>([]);
    const [selectedComp, setSelectedComp] = useState<ComponentItem | null>(null);
    const [compDropdownOpen, setCompDropdownOpen] = useState(false);

    const [docs, setDocs] = useState<DocumentControl[]>([]);
    const [applicantName, setApplicantName] = useState<string>("");
    const [finYear, setFinYear] = useState<string>("");

    // ── Document dropdown & navigation state ─────────────────────────────────
    const [docDropdownOpen, setDocDropdownOpen] = useState(false);
    const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

    const [loadingReg, setLoadingReg] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [errorReg, setErrorReg] = useState("");
    const [errorDocs, setErrorDocs] = useState("");

    const currentDoc = docs.length > 0 ? docs[selectedDocIndex] : null;
    // preview modal state start
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ uri: string; mimeType?: string } | null>(null);
    // preview modal state end
    //Uploading all docs start
    const [uploadingAll, setUploadingAll] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});
    //Uploading all docs end

    // ── Reset doc index whenever the docs list changes ────────────────────────
    useEffect(() => {
        setSelectedDocIndex(0);
        setDocDropdownOpen(false);
    }, [docs]);

    // ── Step 1: Fetch registration info ───────────────────────────────────────
    useEffect(() => {
        const fetchReg = async () => {
            setLoadingReg(true);
            setErrorReg("");
            try {
                const res = await fetch(
                    // originally from Horti API, but using localhost for development/testing:
                    // `https:/hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetailsmob?kon=${KON}&mobileno=${farmer.mobile_no}&year=25`
                    `https://localhost:7065/api/UIHis/getbeneficiarydetailsmob?kon=${KON}&mobileno=${farmer.mobile_no}&year=26`,

                    {
                        headers: {
                            "Authorization": "Bearer YOUR_TOKEN_HERE",
                        }
                    }


                );
                if (!res.ok) throw new Error("Server error");
                const result = await res.json();
                if (!Array.isArray(result) || result.length === 0) {
                    setErrorReg("No registration data found.");
                    return;
                }
                setRegNo(result[0].appl_reg_no);
            } catch {
                setErrorReg("Failed to fetch registration info.");
            } finally {
                setLoadingReg(false);
            }
        };
        fetchReg();
    }, [farmer.mobile_no]);

    // ── Step 2: Fetch component list once regNo is known ──────────────────────
    useEffect(() => {
        if (!regNo) return;
        const fetchComponents = async () => {
            try {
                const res = await fetch(
                    // originally from Horti API, but using localhost for development/testing:
                    // `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PL?BenRegNo=${regNo}&kon=${KON}`
                    `https://localhost:7065/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PL?BenRegNo=${regNo}&kon=${KON}`
                    // https://localhost:7065/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PL?BenRegNo=N243401010001&kon=34
                    


                );
                if (!res.ok) throw new Error("Server error");
                const result: DocsResponse = await res.json();
                console.log("API Response:", JSON.stringify(result));
                setComponents(result.data ?? []);
                setFinYear(result.finYear ?? "");
                setApplicantName(result.applicantname ?? "");
            } catch {
                // silent
            }
        };
        fetchComponents();
    }, [regNo]);

    // ── Step 3: Fetch docs for a selected component ───────────────────────────
    const fetchDocs = async (comp: ComponentItem) => {
        setLoadingDocs(true);
        setErrorDocs("");
        setDocs([]);
        try {
            const res = await fetch(
                // originally from Horti API, but using localhost for development/testing:

                // `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PLch?BenRegNo=${comp.appl_reg_no}&kon=${KON}&comp=${comp.comp}`
                `https://localhost:7065/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PLch?BenRegNo=${comp.appl_reg_no}&kon=${KON}&comp=${comp.comp}`

            );
            if (!res.ok) throw new Error("Server error");
            const result: DocsResponse = await res.json();
            setDocs(result.controls ?? []);
            setApplicantName(result.applicantname ?? applicantName);
            setFinYear(result.finYear ?? finYear);
        } catch {
            setErrorDocs("Failed to fetch documents. Please try again.");
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleSelectComp = (comp: ComponentItem) => {
        setSelectedComp(comp);
        setCompDropdownOpen(false);
        fetchDocs(comp);
    };

    const handlePrev = () => {
        if (selectedDocIndex > 0) setSelectedDocIndex((i) => i - 1);
    };

    const handleNext = () => {
        if (selectedDocIndex < docs.length - 1) setSelectedDocIndex((i) => i + 1);
    };
    const [selectedFiles, setSelectedFiles] = useState<Record<string, {
        uri: string;
        name: string;
        mimeType?: string;
        size?: number;
        rawFile?: File;
    }>>({});

    const uploadedCount = docs.filter(isUploaded).length;
   const selectedCount = uploadedCount;

    const totalCount = docs.length;

    const allDocsHaveFiles = docs.every(
        doc => isUploaded(doc) || selectedFiles[doc.fileId]
    );

    const missingDocs = docs.filter(
        doc => !isUploaded(doc) && !selectedFiles[doc.fileId]
    );
 

    // ---------------------------------------bkc
const getFileSize = async (uri: string): Promise<number> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.size;
    } catch {
        return 0;
    }
};

const MAX_FILE_SIZE =1048576; // 1 MB 1048576

const handleSelectFile = async (doc: DocumentControl) => {
    const isImage = doc.type1?.toLowerCase().includes("image");

    if (isImage) {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Denied", "Allow access to your gallery to select images.");
            return;
        }

      const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
});

if (result.canceled || !result.assets[0]) return;
const asset = result.assets[0];

// ✅ On Expo Web, asset.file is the real browser File object
const rawFile = (asset as any).file as File | undefined;
const imageSize = rawFile?.size ?? asset.fileSize ?? 0;

if (imageSize > MAX_FILE_SIZE) {
    Alert.alert("File Too Large",
        `Selected image is ${(imageSize / 1024 / 1024).toFixed(2)} MB.\nMaximum allowed size is 1 MB.`
    );
    return;
}

setSelectedFiles(prev => ({
    ...prev,
    [doc.fileId]: {
        uri: asset.uri,
        name: asset.fileName ?? `image_${doc.fileId}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        size: imageSize,
        rawFile,   // ← STORE IT
    },
}));

    } else {
       const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
});

if (result.canceled || !result.assets[0]) return;
const asset = result.assets[0];

// ✅ On Expo Web, asset.file is the real browser File object
const rawFile = (asset as any).file as File | undefined;
const pdfSize = rawFile?.size ?? asset.size ?? 0;

if (pdfSize > MAX_FILE_SIZE) {
    Alert.alert("File Too Large",
        `${asset.name} is ${(pdfSize / 1024 / 1024).toFixed(2)} MB.\nMaximum allowed size is 1 MB.`
    );
    return;
}

setSelectedFiles(prev => ({
    ...prev,
    [doc.fileId]: {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/pdf",
        size: pdfSize,
        rawFile,   // ← STORE IT
    },
}));
    }
};

// ✅ this closes handleSelectFile
const handleUploadAll = async () => {
    if (missingDocs.length > 0) {
        Alert.alert(
            "Missing Files ❌",
            `Please select files for:\n${missingDocs.map(d => `• ${d.document_name.trim()}`).join("\n")}`
        );
        return;
    }

    // Get IP
    let ipAddress = "0.0.0.0";
    try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ipAddress = ipData.ip ?? "0.0.0.0";
    } catch { }

    setUploadingAll(true);

    const docsToUpload = docs.filter(doc => !isUploaded(doc) && selectedFiles[doc.fileId]);

    let successCount = 0;
    let failedDocs: string[] = [];

    for (const doc of docsToUpload) {
        const file = selectedFiles[doc.fileId];
        setUploadProgress(prev => ({ ...prev, [doc.fileId]: 'uploading' }));

        try {
            // ✅ CRITICAL: use rawFile (real browser File object), NOT blob: URI
            if (!file.rawFile) {
                throw new Error("No raw file available — please re-select the file.");
            }

            const formData = new FormData();
            formData.append("files", file.rawFile, file.name);  // ✅ real File object
            formData.append("fileIds",   doc.fileId);
            formData.append("regno",     selectedComp!.appl_reg_no);
            formData.append("statecd",   KON);
            formData.append("dcomp",     selectedComp!.comp);
            formData.append("kon",       KON);
            formData.append("latitude",  doc.gpslat  ?? "0");
            formData.append("longitude", doc.gpslong ?? "0");
            formData.append("ipaddress", ipAddress);

            // ✅ Log actual file size to confirm it's real
            console.log(`Uploading: ${file.name}, size: ${file.rawFile.size} bytes`);

  const res = await fetch("https://localhost:7065/api/UIHis/Hos_Scheme_Scandocs_others_Upload_uploadAllDocumentsll", {
  method: "POST",
  body: formData,
});

const result = await res.json().catch(() => ({}));

const message =
  result?.message ||
  result?.Message ||
  "";

console.log("Status:", res.status);
console.log("Response:", result);

if (res.ok) {
  setUploadProgress(prev => ({
    ...prev,
    [doc.fileId]: "done",
  }));

  successCount++;
  continue;
}

// Temporary compatibility with existing ASP.NET API
const uploadSucceeded =
  typeof message === "string" &&
  (
    message.toLowerCase().includes("upload sucess") ||
    message.toLowerCase().includes("upload success")
  );

if (uploadSucceeded) {
  console.warn(
    "API returned error status but success message:",
    message
  );

  setUploadProgress(prev => ({
    ...prev,
    [doc.fileId]: "done",
  }));

  successCount++;
  continue;
}

throw new Error(message || `Server error: ${res.status}`);


        } catch (err) {
            console.error(`Failed to upload ${doc.document_name}:`, err);
            setUploadProgress(prev => ({ ...prev, [doc.fileId]: 'error' }));
            failedDocs.push(doc.document_name.trim());
        }
    }

    setUploadingAll(false);

    if (failedDocs.length === 0) {
        Alert.alert(
            "Upload Complete ✅",
            `All ${successCount} document(s) uploaded successfully!`,
            [{
                text: "OK", onPress: () => {
                    fetchDocs(selectedComp!);
                    setSelectedFiles({});
                    setUploadProgress({});
                }
            }]
        );
    } else {
        Alert.alert(
            "Partial Upload ⚠️",
            `${successCount} uploaded.\n\nFailed:\n${failedDocs.map(d => `• ${d}`).join("\n")}`
        );
    }
};
    // -------------------------bkc
    const handleUpload = async (doc: DocumentControl) => {
        const file = selectedFiles[doc.fileId];
        if (!file) return;

        console.log("=== UPLOAD READY ===");
        console.log("Document:", doc.document_name);
        console.log("FileId:", doc.fileId);
        console.log("File:", file.name);
        console.log("Size:", ((file.size ?? 0) / 1024).toFixed(0), "KB");
        console.log("BenRegNo:", selectedComp?.appl_reg_no);
        console.log("KON:", KON);
        console.log("====================");

        Alert.alert("Upload Ready ✅", "Waiting for upload API from senior.");
    };
    const handlePreview = async (doc: DocumentControl) => {
        const file = selectedFiles[doc.fileId];
        if (!file) return;

        const isImage = doc.type1?.toLowerCase().includes("image") ||
            file.mimeType?.startsWith("image/");

        if (isImage) {
            // Show image in a modal
            setPreviewFile({ uri: file.uri, mimeType: file.mimeType });
            setPreviewVisible(true);
        } else {
            // Open PDF using WebBrowser (opens in device browser/PDF viewer)
            await WebBrowser.openBrowserAsync(file.uri);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            {/* ── Image Preview Modal ── */}
            <Modal
                visible={previewVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalClose} onPress={() => setPreviewVisible(false)}>
                        <Text style={styles.modalCloseText}>✕  Close</Text>
                    </Pressable>
                    {previewFile && (
                        <Image
                            source={{ uri: previewFile.uri }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
            <ScrollView contentContainerStyle={styles.container}>

                {/* ── Title Bar ── */}
                <View style={styles.titleBar}>
                    <Text style={styles.titleText}>Upload Documents</Text>
                </View>

                {/* ── Registration Info Card ── */}
                <View style={styles.regCard}>
                    {loadingReg ? (
                        <ActivityIndicator color="#fff" />
                    ) : errorReg ? (
                        <Text style={styles.regError}>{errorReg}</Text>
                    ) : (
                        <>
                            <View style={styles.regRow}>
                                <Text style={styles.regLabel}>Applicant Name</Text>
                                <Text style={styles.regValue}>{applicantName || farmer.applicant_name || "—"}</Text>
                            </View>
                            <View style={styles.dividerLine} />
                            <View style={styles.regRow}>
                                <Text style={styles.regLabel}>Application Registration No.</Text>
                                <View style={styles.regNoBox}>
                                    <Text style={styles.regNoText}>{regNo || "—"}</Text>
                                </View>
                            </View>
                            {finYear ? (
                                <>
                                    <View style={styles.dividerLine} />
                                    <View style={styles.regRow}>
                                        <Text style={styles.regLabel}>Financial Year</Text>
                                        <Text style={styles.regValue}>{finYear}</Text>
                                    </View>
                                </>
                            ) : null}
                        </>
                    )}
                </View>

                {/* ── Component Selector ── */}
                {!loadingReg && !errorReg && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Component / Scheme</Text>
                        <TouchableOpacity
                            style={styles.dropdownTrigger}
                            onPress={() => setCompDropdownOpen((p) => !p)}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[styles.dropdownTriggerText, !selectedComp && { color: "#9e9e9e" }]}
                                numberOfLines={2}
                            >
                                {selectedComp
                                    ? `${getSchemeLabel(selectedComp.compn)} — ${selectedComp.compn}`
                                    : "— Select a component —"}
                            </Text>
                            <Text style={styles.dropdownChevron}>{compDropdownOpen ? "▲" : "▼"}</Text>
                        </TouchableOpacity>

                        {compDropdownOpen && (
                            <View style={styles.dropdownList}>
                                {components.length === 0 ? (
                                    <Text style={styles.dropdownEmpty}>No components available</Text>
                                ) : (
                                    components.map((comp, idx) => {
                                        const isSelected = selectedComp?.comp === comp.comp;
                                        return (
                                            <TouchableOpacity
                                                key={comp.comp}
                                                style={[
                                                    styles.dropdownItem,
                                                    idx < components.length - 1 && styles.dropdownItemBorder,
                                                    isSelected && styles.dropdownItemSelected,
                                                ]}
                                                onPress={() => handleSelectComp(comp)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.dropdownItemLeft}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isSelected ? "#20ae0b" : "#aed581" }} />
                                                        <View style={styles.schemeBadge}>
                                                            <Text style={styles.schemeBadgeText}>{getSchemeLabel(comp.compn)}</Text>
                                                        </View>
                                                    </View>
                                                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={3}>
                                                        {comp.compn}
                                                    </Text>
                                                </View>
                                                <Text style={styles.dropdownItemArea}>
                                                    {comp.land_area} {comp.land_area === 1 ? "Acre" : "Acres"}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* ── Documents Section ── */}
                {selectedComp && (
                    <View style={styles.section}>
                        {/* Header with progress */}
                        <View style={styles.docsHeader}>
                            <Text style={styles.sectionTitle}>Required Documents</Text>
                            {totalCount > 0 && (
                                <View style={styles.progressBadge}>
                                    <Text style={styles.progressBadgeText}>
                                          {uploadedCount}/{totalCount} uploaded
                                    </Text>
                                </View>
                            )}
                        </View>

                        {loadingDocs ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator color="#33691e" size="large" />
                                <Text style={styles.loadingText}>Fetching documents…</Text>
                            </View>
                        ) : errorDocs ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorDocs}</Text>
                                <Pressable style={styles.retryBtn} onPress={() => fetchDocs(selectedComp)}>
                                    <Text style={styles.retryText}>Retry</Text>
                                </Pressable>
                            </View>
                        ) : docs.length === 0 ? (
                            <Text style={styles.emptyText}>No documents found.</Text>
                        ) : (
                            <>
                                {/* ── Document Dropdown ── */}
                                <TouchableOpacity
                                    style={styles.docDropdownTrigger}
                                    onPress={() => setDocDropdownOpen((p) => !p)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.docDropdownLeft}>
                                        {currentDoc && (
                                            <View style={[
                                                styles.docStatusDot,
                                                {
                                                    backgroundColor: isUploaded(currentDoc)
                                                        ? "#7cb342"  // green — uploaded to server
                                                        : selectedFiles[currentDoc.fileId]
                                                            ? "#FFA500"  // orange — file selected but not uploaded
                                                            : "#e0e0e0"  // grey — nothing
                                                }
                                            ]} />
                                        )}
                                        <Text style={styles.docDropdownTriggerText} numberOfLines={2}>
                                            {currentDoc
                                                ? `${selectedDocIndex + 1}. ${currentDoc.document_name.trim()}`
                                                : "— Select a document —"}
                                        </Text>
                                    </View>
                                    <Text style={styles.dropdownChevron}>{docDropdownOpen ? "▲" : "▼"}</Text>
                                </TouchableOpacity>

                                {docDropdownOpen && (
                                    <View style={styles.dropdownList}>
                                        {docs.map((doc, idx) => {
                                            const uploaded = isUploaded(doc);
                                            const isSelected = idx === selectedDocIndex;
                                            return (
                                                <TouchableOpacity
                                                    key={doc.fileId}
                                                    style={[
                                                        styles.docDropdownItem,
                                                        idx < docs.length - 1 && styles.dropdownItemBorder,
                                                        isSelected && styles.dropdownItemSelected,
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedDocIndex(idx);
                                                        setDocDropdownOpen(false);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={[
                                                        styles.docStatusDot,
                                                        {
                                                            backgroundColor: uploaded
                                                                ? "#7cb342"
                                                                : selectedFiles[doc.fileId]
                                                                    ? "#FFA500"
                                                                    : "#e0e0e0",
                                                            marginTop: 2
                                                        }
                                                    ]} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.docDropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={2}>
                                                            {idx + 1}. {doc.document_name.trim()}
                                                        </Text>
                                                        {uploaded && (
                                                            <Text style={styles.docDropdownUploadedTag}>✓ Uploaded</Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* ── Selected Document Card ── */}
                                {currentDoc && (
                                    <View style={styles.docCard}>
                                        <View style={[
                                            styles.docStatusStrip,
                                            { backgroundColor: isUploaded(currentDoc) ? "#7cb342" : "#e0e0e0" }
                                        ]} />
                                        <View style={styles.docBody}>
                                            {/* Index + Name */}
                                            <View style={styles.docNameRow}>
                                                <View style={styles.docIndex}>
                                                    <Text style={styles.docIndexText}>{selectedDocIndex + 1}</Text>
                                                </View>
                                                <Text style={styles.docName}>{currentDoc.document_name.trim()}</Text>
                                            </View>

                                            {/* Meta row */}
                                            <View style={styles.docMetaRow}>
                                                <View style={styles.fileTypeBadge}>
                                                    <Text style={styles.fileTypeBadgeText}>
                                                      {currentDoc.type1?.toLowerCase().includes("image") ? "📷 Image" : "📄 PDF"} · max 1 MB
                                                    </Text>
                                                </View>
                                                {isUploaded(currentDoc) && (
                                                    <View style={styles.uploadedBadge}>
                                                        <Text style={styles.uploadedBadgeText}>✓ Uploaded</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Upload date */}
                                            {parseUploadDate(currentDoc.file_Upload_Timimgs) && (
                                                <Text style={styles.uploadDate}>
                                                    Uploaded on: {parseUploadDate(currentDoc.file_Upload_Timimgs)}
                                                </Text>
                                            )}

                                            {/* GPS info */}
                                            {currentDoc.gpslat && currentDoc.gpslat !== "0" && (
                                                <Text style={styles.gpsInfo}>
                                                    📍 GPS: {currentDoc.gpslat}, {currentDoc.gpslong}
                                                </Text>
                                            )}


                                            {/* ── Three Action Buttons ── */}
                                            {/* View File — remove the ... placeholder */}
                                            <View style={styles.actionRow}>
                                                <Pressable
                                                    style={({ pressed }) => [
                                                        styles.actionBtn,
                                                        styles.selectBtn,
                                                        pressed && { opacity: 0.8 },
                                                        currentDoc.isDisabled && styles.actionBtnDisabled,
                                                    ]}
                                                    disabled={currentDoc.isDisabled}
                                                    onPress={() => handleSelectFile(currentDoc)}
                                                >
                                                    <Text style={[styles.actionBtnText, currentDoc.isDisabled && styles.actionBtnTextDisabled]}>
                                                        Select File
                                                    </Text>
                                                </Pressable>

                                                {/* ── NEW: Preview Button ── */}
                                                <Pressable
                                                    style={({ pressed }) => [
                                                        styles.actionBtn,
                                                        styles.previewBtn,
                                                        pressed && { opacity: 0.8 },
                                                        !selectedFiles[currentDoc.fileId] && styles.actionBtnDisabled,
                                                    ]}
                                                    disabled={!selectedFiles[currentDoc.fileId]}
                                                    onPress={() => handlePreview(currentDoc)}
                                                >
                                                    <Text style={[styles.actionBtnText, !selectedFiles[currentDoc.fileId] && styles.actionBtnTextDisabled]}>
                                                        Preview 👁
                                                    </Text>
                                                </Pressable>

                                                <Pressable
                                                    style={({ pressed }) => [
                                                        styles.actionBtn,
                                                        styles.uploadBtn,
                                                        pressed && { opacity: 0.8 },
                                                        (currentDoc.isDisabled || !selectedFiles[currentDoc.fileId]) && styles.actionBtnDisabled,
                                                    ]}
                                                    disabled={currentDoc.isDisabled || !selectedFiles[currentDoc.fileId]}
                                                    onPress={() => handleUpload(currentDoc)}
                                                >
                                                    <Text style={[styles.actionBtnText, (currentDoc.isDisabled || !selectedFiles[currentDoc.fileId]) && styles.actionBtnTextDisabled]}>
                                                        Upload ↑
                                                    </Text>
                                                </Pressable>
                                            </View>

                                            {/* Selected file name preview */}
                                            {selectedFiles[currentDoc.fileId] && (
                                                <View style={styles.selectedFileRow}>
                                                    <Text style={styles.selectedFileIcon}>
                                                        {currentDoc.type1?.toLowerCase().includes("image") ? "🖼️" : "📄"}
                                                    </Text>
                                                    <Text style={styles.selectedFileName} numberOfLines={1}>
                                                        {selectedFiles[currentDoc.fileId].name}
                                                    </Text>
                                                    <Text style={styles.selectedFileSize}>
                                                        {((selectedFiles[currentDoc.fileId].size ?? 0) / 1024).toFixed(0)} KB
                                                    </Text>
                                                </View>

                                            )}
                                        </View>
                                    </View>
                                )}

                                {/* ── Previous / Next Navigation ── */}
                                <View style={styles.navRow}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.navBtn,
                                            styles.navBtnOutline,
                                            selectedDocIndex === 0 && styles.navBtnDisabled,
                                            pressed && selectedDocIndex > 0 && { opacity: 0.8 },
                                        ]}
                                        disabled={selectedDocIndex === 0}
                                        onPress={handlePrev}
                                    >
                                        <Text style={[
                                            styles.navBtnTextOutline,
                                            selectedDocIndex === 0 && styles.navBtnTextDisabled,
                                        ]}>
                                            ◀ Previous
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.navBtn,
                                            styles.navBtnFill,
                                            selectedDocIndex === docs.length - 1 && styles.navBtnDisabled,
                                            pressed && selectedDocIndex < docs.length - 1 && { opacity: 0.8 },
                                        ]}
                                        disabled={selectedDocIndex === docs.length - 1}
                                        onPress={handleNext}
                                    >
                                        <Text style={[
                                            styles.navBtnTextFill,
                                            selectedDocIndex === docs.length - 1 && styles.navBtnTextDisabled,
                                        ]}>
                                            Next ▶
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* ── Progress Dots ── */}
                                <View style={styles.dotsRow}>
                                    {docs.map((_, idx) => (
                                        <Pressable
                                            key={idx}
                                            onPress={() => setSelectedDocIndex(idx)}
                                            style={[
                                                styles.dot,
                                                idx === selectedDocIndex ? styles.dotActive : styles.dotInactive,
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.docCounter}>
                                    Document {selectedDocIndex + 1} of {docs.length}
                                </Text>


                                {/* ── Upload All Files ── */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.uploadAllBtn,
                                        (!allDocsHaveFiles || uploadingAll) && styles.actionBtnDisabled,
                                        pressed && allDocsHaveFiles && !uploadingAll && { opacity: 0.85 },
                                    ]}
                                    disabled={!allDocsHaveFiles || uploadingAll}
                                    onPress={handleUploadAll}
                                >
                                    {uploadingAll ? (
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                            <ActivityIndicator color="#fff" size="small" />
                                            <Text style={styles.uploadAllBtnText}>Uploading...</Text>
                                        </View>
                                    ) : (
                                        <Text style={[
                                            styles.uploadAllBtnText,
                                            !allDocsHaveFiles && { color: "#eeeeee" }
                                        ]}>
                                            Upload All Files
                                        </Text>
                                    )}
                                </Pressable>

                                {/* ── Per-doc upload progress indicators ── */}
                                {uploadingAll && (
                                    <View style={styles.progressList}>
                                        {docs.filter(doc => !isUploaded(doc)).map(doc => {
                                            const status = uploadProgress[doc.fileId];
                                            const icon =
                                                status === 'uploading' ? '⏳' :
                                                    status === 'done' ? '✅' :
                                                        status === 'error' ? '❌' : '🔘';
                                            return (
                                                <View key={doc.fileId} style={styles.progressItem}>
                                                    <Text style={styles.progressIcon}>{icon}</Text>
                                                    <Text style={styles.progressDocName} numberOfLines={1}>
                                                        {doc.document_name.trim()}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* <Footer /> */}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f4f6f5" },
    container: { paddingBottom: 24 },

    titleBar: { backgroundColor: "#33691e", padding: 14, borderRadius: 15 },
    titleText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },

    regCard: { backgroundColor: "#0a1d40", margin: 12, padding: 16, borderRadius: 10, elevation: 3 },
    regRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
    regLabel: { color: "#aed581", fontSize: 13, flex: 1, flexShrink: 1 },
    regValue: { color: "#fff", fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1 },
    regNoBox: { backgroundColor: "#1b5e20", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#7cb342" },
    regNoText: { color: "#fff", fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
    dividerLine: { height: 1, backgroundColor: "#1e3a6e", marginVertical: 6 },
    regError: { color: "#ef9a9a", fontSize: 14 },

    section: { paddingHorizontal: 12, marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#1b5e20", marginBottom: 10 },

    // Component dropdown
    dropdownTrigger: { backgroundColor: "#fff", borderRadius: 8, borderLeftWidth: 5, borderLeftColor: "#7cb342", paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1, marginBottom: 4 },
    dropdownTriggerText: { fontSize: 14, color: "#1b5e20", flex: 1, paddingRight: 8 },
    dropdownChevron: { fontSize: 12, color: "#7cb342" },
    dropdownList: { backgroundColor: "#fff", borderRadius: 8, elevation: 4, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#e8f5e9" },
    dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f8e9" },
    dropdownItemSelected: { backgroundColor: "#f1f8e9" },
    dropdownItemLeft: { flex: 1, paddingRight: 10 },
    dropdownItemText: { fontSize: 13, color: "#33691e", marginTop: 4 },
    dropdownItemTextSelected: { fontWeight: "600" },
    dropdownItemArea: { fontSize: 12, color: "#7cb342", fontWeight: "600" },
    dropdownEmpty: { padding: 16, color: "#9e9e9e", textAlign: "center" },
    schemeBadge: { alignSelf: "flex-start", backgroundColor: "#e8f5e9", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
    schemeBadgeText: { fontSize: 11, color: "#2e7d32", fontWeight: "700" },

    // Docs header
    docsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    progressBadge: { backgroundColor: "#1b5e20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    progressBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

    loadingBox: { alignItems: "center", paddingVertical: 30, gap: 10 },
    loadingText: { color: "#558b2f", fontSize: 14 },
    errorBox: { backgroundColor: "#ffebee", borderRadius: 8, padding: 16, alignItems: "center" },
    errorText: { color: "#c62828", fontSize: 14, marginBottom: 10, textAlign: "center" },
    retryBtn: { backgroundColor: "#c62828", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
    retryText: { color: "#fff", fontWeight: "bold" },
    emptyText: { color: "#9e9e9e", textAlign: "center", paddingVertical: 20 },

    // Document dropdown
    docDropdownTrigger: { backgroundColor: "#fff", borderRadius: 8, borderLeftWidth: 5, borderLeftColor: "#aed581", paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1, marginBottom: 8 },
    docDropdownLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8, paddingRight: 8 },
    docDropdownTriggerText: { fontSize: 14, color: "#212121", flex: 1 },
    docStatusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    docDropdownItem: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 10 },
    docDropdownItemText: { fontSize: 13, color: "#33691e" },
    docDropdownUploadedTag: { fontSize: 10, color: "#2e7d32", fontWeight: "600", marginTop: 2 },

    // Doc card
    docCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, marginBottom: 10, overflow: "hidden", elevation: 1 },
    docStatusStrip: { width: 5 },
    docBody: { flex: 1, padding: 12 },
    docNameRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
    docIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#e8f5e9", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
    docIndexText: { fontSize: 11, color: "#2e7d32", fontWeight: "700" },
    docName: { fontSize: 13, color: "#212121", flex: 1, lineHeight: 19 },
    docMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" },
    fileTypeBadge: { backgroundColor: "#f5f5f5", borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
    fileTypeBadgeText: { fontSize: 11, color: "#616161" },
    uploadedBadge: { backgroundColor: "#e8f5e9", borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
    uploadedBadgeText: { fontSize: 11, color: "#2e7d32", fontWeight: "600" },
    uploadDate: { fontSize: 11, color: "#757575", marginBottom: 4 },
    gpsInfo: { fontSize: 11, color: "#757575", marginBottom: 4 },

    // Three action buttons
    actionRow: { flexDirection: "row", gap: 6, marginTop: 8 },
    actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 6, alignItems: "center", justifyContent: "center" },
    selectBtn: { backgroundColor: "#33691e" },
    viewBtn: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#1565c0" },
    uploadBtn: { backgroundColor: "#1b5e20" },
    actionBtnDisabled: { backgroundColor: "#bdbdbd" },
    actionBtnOutlineDisabled: { borderColor: "#bdbdbd", backgroundColor: "#fff" },
    actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
    actionBtnTextDisabled: { color: "#eeeeee" },
    viewBtnText: { color: "#1565c0", fontWeight: "bold", fontSize: 12 },
    viewBtnTextDisabled: { color: "#bdbdbd" },

    // Navigation
    navRow: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 12 },
    navBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
    navBtnOutline: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#7cb342" },
    navBtnFill: { backgroundColor: "#33691e" },
    navBtnDisabled: { backgroundColor: "#f5f5f5", borderColor: "#e0e0e0" },
    navBtnTextOutline: { color: "#33691e", fontWeight: "bold", fontSize: 14 },
    navBtnTextFill: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    navBtnTextDisabled: { color: "#bdbdbd" },

    // Progress dots
    dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 4 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotActive: { backgroundColor: "#33691e" },
    dotInactive: { backgroundColor: "#c8e6c9" },
    docCounter: { textAlign: "center", color: "#757575", fontSize: 12, marginBottom: 10 },

    // Upload all
    uploadAllBtn: { backgroundColor: "#1b5e20", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 6, marginBottom: 16, elevation: 2 },
    uploadAllBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
    //--------------bkc
    selectedFileRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f8e9",
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
        gap: 6,
    },
    selectedFileIcon: { fontSize: 14 },
    selectedFileName: {
        flex: 1,
        fontSize: 11,
        color: "#33691e",
        fontWeight: "600",
    },
    selectedFileSize: {
        fontSize: 11,
        color: "#757575",
    },
    // Preview button
    previewBtn: { backgroundColor: "#1565c0" },

    // Image preview modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalClose: {
        position: "absolute",
        top: 50,
        right: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    modalCloseText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    modalImage: {
        width: "95%",
        height: "80%",
    },
    progressList: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        marginBottom: 12,
        elevation: 1,
        gap: 8,
    },
    progressItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    progressIcon: {
        fontSize: 14,
    },
    progressDocName: {
        fontSize: 12,
        color: "#424242",
        flex: 1,
    },
});