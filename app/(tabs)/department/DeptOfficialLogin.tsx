import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

export default function DeptOfficialLogin() {
  const [deptCode, setDeptCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!deptCode || !employeeId || !password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setError("Invalid credentials. Please verify and try again.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>🏛</Text>
            </View>
            <Text style={styles.badgeText}>DEPARTMENTAL PORTAL</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Official Sign In</Text>
          <Text style={styles.subtitle}>Restricted access — authorised personnel only</Text>

          {/* Dept Code + Employee ID */}
          <Text style={styles.label}>DEPARTMENT ID</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { width: "35%" }]}
              placeholder="DEPT"
              placeholderTextColor="#444"
              value={deptCode}
              onChangeText={(v) => setDeptCode(v.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              placeholder="Employee number"
              placeholderTextColor="#444"
              value={employeeId}
              onChangeText={setEmployeeId}
              keyboardType="numeric"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••••"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>

          {/* Error */}
          {error !== "" && <Text style={styles.errorMsg}>{error}</Text>}

          {/* Remember + Forgot */}
          <View style={styles.optionsRow}>
            <View style={styles.rememberRow}>
              <Switch
                value={remember}
                onValueChange={setRemember}
                trackColor={{ false: "#2a2a2a", true: "#b48c50" }}
                thumbColor={remember ? "#e8c97a" : "#555"}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text style={styles.rememberText}>Keep me signed in</Text>
            </View>
            <Pressable>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              pressed && styles.btnPressed,
              loading && styles.btnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#b48c50" />
            ) : (
              <Text style={styles.btnText}>SIGN IN</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SECURE ACCESS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Footer */}
          <Text style={styles.footerNote}>
            This system is monitored. Unauthorised access attempts are logged and reported.
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f1117",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#16181f",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  badgeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(180,140,80,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  badgeIconText: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(180,140,80,0.7)",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    color: "#e8e4dc",
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.32)",
    fontWeight: "300",
    marginBottom: 28,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#e8e4dc",
    fontWeight: "300",
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  eyeText: {
    fontSize: 16,
  },
  errorMsg: {
    fontSize: 12,
    color: "rgba(220,100,80,0.85)",
    marginBottom: 12,
    fontWeight: "300",
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "300",
    marginLeft: 6,
  },
  forgotText: {
    fontSize: 12,
    color: "rgba(180,140,80,0.6)",
    fontWeight: "300",
  },
  btn: {
    backgroundColor: "rgba(180,140,80,0.12)",
    borderWidth: 1,
    borderColor: "rgba(180,140,80,0.35)",
    borderRadius: 3,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    backgroundColor: "rgba(180,140,80,0.22)",
    borderColor: "rgba(180,140,80,0.6)",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: "rgba(180,140,80,0.9)",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  dividerText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
  },
  footerNote: {
    fontSize: 11,
    color: "rgba(255,255,255,0.18)",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});