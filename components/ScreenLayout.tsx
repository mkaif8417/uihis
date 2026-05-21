import { View, StyleSheet } from "react-native";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Menu from "./Menu";

export default function ScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    
    <View style={styles.container}>
      <Header onMenuPress={() => setMenuOpen(!menuOpen)} />

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      <View style={styles.content}>{children}</View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
