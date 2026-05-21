import { View, Image, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/UIHis_footer_with_agri.jpg")}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 25,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
