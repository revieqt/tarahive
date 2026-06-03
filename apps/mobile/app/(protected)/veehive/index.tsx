import React from "react";
import { StyleSheet} from "react-native";
import { TView } from "@/shared/components/ui/Themed";
import HiveBg from "@/shared/components/common/HiveBg";
import Header from "@/shared/components/common/Header";

export default function VeehiveScreen() {

  return (
    <TView style={styles.container}>
      <HiveBg />
      <Header title='Veehive' subtitle='Vehicle Rental' />

    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});