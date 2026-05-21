import { useRouter } from "expo-router";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type AppRoute =
  | "/"
  | "/home";
export default function Menu({ visible, onClose }: Props) {
  const router = useRouter();

  if (!visible) return null;

  const navigate = (path: AppRoute) => {
    onClose();
    router.push(path);
  };

  const openPortal = (url: string) => {
      Linking.openURL(url);
    };

  return ( 
    <View style={styles.menu}>
      <MenuItem title="Home" onPress={() => navigate("/home")} />
      <MenuItem title="About Us" onPress={() => openPortal('https://hortharyana.gov.in/')}/>
      <MenuItem title="Operational Guidelines (2025–26)" onPress={()=> openPortal('https://hortnet.hortharyana.gov.in/assets/pdfs/MIDHGuidelines-OperationalGuideLines(2025-26).pdf')} />
      <MenuItem title="Cost Norms (2025–26)" onPress={()=>openPortal('https://hortnet.hortharyana.gov.in/assets/pdfs/MIDHGuidelines-CostNorms(2025-26).pdf')} />
      <MenuItem title="Components" onPress={() => navigate("/home")}/>
      <MenuItem title="News / Events / Photos" onPress={() => navigate("/home")}/>
      <MenuItem title="Contact" onPress={() => openPortal('https://hortharyana.gov.in/')}/>
    </View>
  );
}

function MenuItem({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#c8e6c9",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 15,
    color: "#1b5e20",
  },
});
