import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

type HeaderProps = {
  onMenuPress?: () => void;
};

export default function Header({ onMenuPress }: HeaderProps) {
  return (
    <View>
      {/* Header Image */}
      <Image
        source={require("../assets/images/header-banner.jpg")}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Menu Bar (below image) */}
      {onMenuPress && (
        <View style={styles.menuBar}>
          <TouchableOpacity onPress={onMenuPress}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 120,
  },
  menuBar: {
    height: 44,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#c8e6c9",
  },
  menuIcon: {
    fontSize: 22,
    color: "#2e7d32",
  },
});
