import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useFarmer from "@/components/context/FarmerContext";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


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

const KON = "08";

function getSchemeLabel(compn: string): string {
  if (compn.startsWith("NHM") || compn.startsWith("56")) return "NHM (MIDH)";
  if (compn.startsWith("IHD") || compn.startsWith("E2")) return "IHD";
  // Fallback: try to extract scheme prefix
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [docs, setDocs] = useState<DocumentControl[]>([]);
  const [applicantName, setApplicantName] = useState<string>("");
  const [finYear, setFinYear] = useState<string>("");

  const [loadingReg, setLoadingReg] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorReg, setErrorReg] = useState("");
  const [errorDocs, setErrorDocs] = useState("");

  // ── Step 1: Fetch registration info + component list ──────────────────────
  useEffect(() => {
    const fetchReg = async () => {
      setLoadingReg(true);
      setErrorReg("");
      try {
        const res = await fetch(
          `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/getbeneficiarydetailsmob?kon=${KON}&mobileno=${farmer.mobile_no}&year=25`
        );
        if (!res.ok) throw new Error("Server error");
        const result = await res.json();
        if (!Array.isArray(result) || result.length === 0) {
          setErrorReg("No registration data found.");
          return;
        }
        const no = result[0].appl_reg_no;
        setRegNo(no);
      } catch (err) {
        setErrorReg("Failed to fetch registration info.");
      } finally {
        setLoadingReg(false);
      }
    };
    fetchReg();
  }, [farmer.mobile_no]);

  // ── Step 2: Once regNo is known, fetch the first docs call to get components ─
  useEffect(() => {
    if (!regNo) return;
    // We use the NHM comp as default to get the component list (data[])
    const fetchComponents = async () => {
      try {
        const res = await fetch(
          `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PLch?BenRegNo=${regNo}&kon=${KON}&comp=56020126N`
        );
        if (!res.ok) throw new Error("Server error");
        const result: DocsResponse = await res.json();
        setComponents(result.data ?? []);
        setFinYear(result.finYear ?? "");
        setApplicantName(result.applicantname ?? "");
      } catch (err) {
        // silent — components will just be empty
      }
    };
    fetchComponents();
  }, [regNo]);

  // ── Step 3: Fetch docs when a component is selected ───────────────────────
  const fetchDocs = async (comp: ComponentItem) => {
    setLoadingDocs(true);
    setErrorDocs("");
    setDocs([]);
    try {
      const res = await fetch(
        `https://hortnet.hortharyana.gov.in/UIHortHar-API/api/UIHis/Hos_Scheme_Scandocs_others_Upload_PLch?BenRegNo=${comp.appl_reg_no}&kon=${KON}&comp=${comp.comp}`
      );
      if (!res.ok) throw new Error("Server error");
      const result: DocsResponse = await res.json();
      setDocs(result.controls ?? []);
      setApplicantName(result.applicantname ?? applicantName);
      setFinYear(result.finYear ?? finYear);
    } catch (err) {
      setErrorDocs("Failed to fetch documents. Please try again.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectComp = (comp: ComponentItem) => {
    setSelectedComp(comp);
    setDropdownOpen(false);
    fetchDocs(comp);
  };

  const uploadedCount = docs.filter(isUploaded).length;
  const totalCount = docs.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
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
              onPress={() => setDropdownOpen((p) => !p)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownTriggerText,
                  !selectedComp && { color: "#9e9e9e" },
                ]}
                numberOfLines={2}
              >
                {selectedComp
                  ? `${getSchemeLabel(selectedComp.compn)} — ${selectedComp.compn}`
                  : "— Select a component —"}
              </Text>
              <Text style={styles.dropdownChevron}>
                {dropdownOpen ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
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
                          <View style={styles.schemeBadge}>
                            <Text style={styles.schemeBadgeText}>
                              {getSchemeLabel(comp.compn)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              isSelected && styles.dropdownItemTextSelected,
                            ]}
                            numberOfLines={3}
                          >
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

        {/* ── Documents List ── */}
        {selectedComp && (
          <View style={styles.section}>
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
                <Pressable
                  style={styles.retryBtn}
                  onPress={() => selectedComp && fetchDocs(selectedComp)}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : docs.length === 0 ? (
              <Text style={styles.emptyText}>No documents found.</Text>
            ) : (
              docs.map((doc, idx) => {
                const uploaded = isUploaded(doc);
                const uploadDate = parseUploadDate(doc.file_Upload_Timimgs);
                const isImage = doc.type1?.toLowerCase().includes("image");
                return (
                  <View key={doc.fileId} style={styles.docCard}>
                    {/* Status strip on left */}
                    <View
                      style={[
                        styles.docStatusStrip,
                        { backgroundColor: uploaded ? "#7cb342" : "#e0e0e0" },
                      ]}
                    />

                    <View style={styles.docBody}>
                      {/* Index + Name */}
                      <View style={styles.docNameRow}>
                        <View style={styles.docIndex}>
                          <Text style={styles.docIndexText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.docName}>{doc.document_name.trim()}</Text>
                      </View>

                      {/* Meta row */}
                      <View style={styles.docMetaRow}>
                        <View style={styles.fileTypeBadge}>
                          <Text style={styles.fileTypeBadgeText}>
                            {isImage ? "📷 Image" : "📄 PDF"} · max 500 KB
                          </Text>
                        </View>
                        {uploaded && (
                          <View style={styles.uploadedBadge}>
                            <Text style={styles.uploadedBadgeText}>✓ Uploaded</Text>
                          </View>
                        )}
                      </View>

                      {/* Upload date if available */}
                      {uploadDate && (
                        <Text style={styles.uploadDate}>
                          Uploaded on: {uploadDate}
                        </Text>
                      )}

                      {/* GPS info if present */}
                      {doc.gpslat && doc.gpslat !== "0" && (
                        <Text style={styles.gpsInfo}>
                          📍 GPS: {doc.gpslat}, {doc.gpslong}
                        </Text>
                      )}

{/* Action Buttons */}
<View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
  <Pressable
    style={({ pressed }) => [
      styles.chooseBtn,
      pressed && { opacity: 0.8 },
      doc.isDisabled && styles.uploadBtnDisabled,
      { flex: 1 },
    ]}
    disabled={doc.isDisabled}
    onPress={() => {
      Alert.alert("Choose File", `Select file for: ${doc.document_name.trim()}`);
    }}
  >
    <Text style={[styles.chooseBtnText, doc.isDisabled && styles.uploadBtnTextDisabled]}>
      Choose File
    </Text>
  </Pressable>

  <Pressable
    style={({ pressed }) => [
      styles.viewBtn,
      pressed && { opacity: 0.8 },
      !uploaded && styles.viewBtnDisabled,
    ]}
    disabled={!uploaded}
    onPress={() => {
      Alert.alert("View File", `Viewing: ${doc.document_name.trim()}`);
    }}
  >
    <Text style={[styles.viewBtnText, !uploaded && styles.viewBtnTextDisabled]}>
      View File
    </Text>
  </Pressable>
</View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f5",
  },
  container: {
    paddingBottom: 24,
  },

  // Title
  titleBar: {
    backgroundColor: "#33691e",
    padding: 14,
    borderRadius: 15,
  },
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Registration Card
  regCard: {
    backgroundColor: "#0a1d40",
    margin: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  regRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  regLabel: {
    color: "#aed581",
    fontSize: 13,
    flex: 1,
    flexShrink: 1,
  },
  regValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  regNoBox: {
    backgroundColor: "#1b5e20",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#7cb342",
  },
  regNoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#1e3a6e",
    marginVertical: 6,
  },
  regError: {
    color: "#ef9a9a",
    fontSize: 14,
  },

  // Section
  section: {
    paddingHorizontal: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
  },

  // Dropdown trigger
  dropdownTrigger: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#7cb342",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    marginBottom: 4,
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: "#1b5e20",
    flex: 1,
    paddingRight: 8,
  },
  dropdownChevron: {
    fontSize: 12,
    color: "#7cb342",
  },

  // Dropdown list
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8f5e9",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f8e9",
  },
  dropdownItemSelected: {
    backgroundColor: "#f1f8e9",
  },
  dropdownItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#33691e",
    marginTop: 4,
  },
  dropdownItemTextSelected: {
    fontWeight: "600",
  },
  dropdownItemArea: {
    fontSize: 12,
    color: "#7cb342",
    fontWeight: "600",
  },
  dropdownEmpty: {
    padding: 16,
    color: "#9e9e9e",
    textAlign: "center",
  },

  // Scheme badge
  schemeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f5e9",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  schemeBadgeText: {
    fontSize: 11,
    color: "#2e7d32",
    fontWeight: "700",
  },

  // Docs header
  docsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressBadge: {
    backgroundColor: "#1b5e20",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Loading / Error
  loadingBox: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
  },
  loadingText: {
    color: "#558b2f",
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#c62828",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#9e9e9e",
    textAlign: "center",
    paddingVertical: 20,
  },

  // Document card
  docCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 1,
  },
  docStatusStrip: {
    width: 5,
  },
  docBody: {
    flex: 1,
    padding: 12,
  },
  docNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  docIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  docIndexText: {
    fontSize: 11,
    color: "#2e7d32",
    fontWeight: "700",
  },
  docName: {
    fontSize: 13,
    color: "#212121",
    flex: 1,
    lineHeight: 19,
  },
  docMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  fileTypeBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  fileTypeBadgeText: {
    fontSize: 11,
    color: "#616161",
  },
  uploadedBadge: {
    backgroundColor: "#e8f5e9",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  uploadedBadgeText: {
    fontSize: 11,
    color: "#2e7d32",
    fontWeight: "600",
  },
  uploadDate: {
    fontSize: 11,
    color: "#757575",
    marginBottom: 4,
  },
  gpsInfo: {
    fontSize: 11,
    color: "#757575",
    marginBottom: 4,
  },
  uploadBtn: {
    marginTop: 6,
    backgroundColor: "#33691e",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  uploadBtnRe: {
    backgroundColor: "#1565c0",
  },
  uploadBtnDisabled: {
    backgroundColor: "#bdbdbd",
  },
  uploadBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  uploadBtnTextDisabled: {
    color: "#eeeeee",
  },
  
viewBtn: {
  flex: 1,
  marginTop: 0,
  backgroundColor: "#fff",
  borderRadius: 6,
  paddingVertical: 8,
  alignItems: "center",
  borderWidth: 1.5,
  borderColor: "#1565c0",
},
viewBtnDisabled: {
  borderColor: "#bdbdbd",
},
viewBtnText: {
  color: "#1565c0",
  fontWeight: "bold",
  fontSize: 13,
},
viewBtnTextDisabled: {
  color: "#bdbdbd",
},
chooseBtn: {
    backgroundColor: "#33691e",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  chooseBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  uploadAllBtn: {
    backgroundColor: "#1b5e20",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
  },
  uploadAllBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

