import React from "react";
import { View, Switch as RNSwitch, StyleSheet } from "react-native";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText } from "@/shared/components/ui/Themed";

type SwitchProps = {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({ label, description, value, onValueChange }) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  return (
    <View style={styles.container}>
      <View>
        {description && <TText style={{opacity: 0.5, fontSize: 9, fontWeight: 'normal'}}>{description}</TText>}
        {label && <TText>{label}</TText>}
      </View>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? accentColor : secondaryColor}
        trackColor={{ false: '#ccc', true: accentColor + '70' }}
      />
    </View>
  );
};

export default Switch;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
  },
});