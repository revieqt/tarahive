import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { TText, TIcon } from "../ui/Themed";

interface PasswordValidationCardProps {
  password: string;
  confirmPassword?: string;
  withConfirmation?: boolean;
}

export default function PasswordValidationCard({ 
  password, 
  confirmPassword, 
  withConfirmation,
}: PasswordValidationCardProps) {
  const accentColor = useThemeColor({}, 'accent');
  const isValidLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password !== "" && confirmPassword !== "" && password === confirmPassword;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TIcon name={isValidLength ? "check-circle" : "close"} color={isValidLength ? accentColor : undefined} size={16}/>
        <TText style={styles.text}>must be at least 8 characters long</TText>
      </View>

      <View style={styles.row}>
        <TIcon name={hasUppercase ? "check-circle" : "close"} color={hasUppercase ? accentColor : undefined} size={16}/>
        <TText style={styles.text}>has at least one uppercase letter</TText>
      </View>

      <View style={styles.row}>
        <TIcon name={hasLowercase ? "check-circle" : "close"} color={hasLowercase ? accentColor : undefined} size={16}/>
        <TText style={styles.text}>has at least one lowercase letter</TText>
      </View>

      <View style={styles.row}>
        <TIcon name={hasNumber ? "check-circle" : "close"} color={hasNumber ? accentColor : undefined} size={16}/>
        <TText style={styles.text}>has at least one number</TText>
      </View>

      <View style={styles.row}>
        <TIcon name={hasSpecialChar ? "check-circle" : "close"} color={hasSpecialChar ? accentColor : undefined} size={16}/>
        <TText style={styles.text}>has at least one special character</TText>
      </View>

      {withConfirmation && (
        <View style={styles.row}>
          <TIcon name={passwordsMatch ? "check-circle" : "close"} color={passwordsMatch ? accentColor : undefined} size={16}/>
          <TText style={styles.text}>passwords match</TText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 16,
    overflow: "hidden",
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    opacity: 0.7,
  },
});