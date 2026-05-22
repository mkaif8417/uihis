import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ← add this
import Footer from "./Footer";
import Header from "./Header";
import Menu from "./Menu";

export default function ScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => setMenuOpen(!menuOpen)} />

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      <View style={styles.content}>{children}</View>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});