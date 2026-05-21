import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      enabled={!disabled}
    >
      {items.map(([val, label]) => (
        <Picker.Item key={val} label={label} value={val} />
      ))}
    </Picker>
  </View>
);

export default PickerBox

const styles = StyleSheet.create({
    pickerWrapper: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
})