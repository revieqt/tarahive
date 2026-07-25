import React from "react";
import { View, StyleSheet } from "react-native";
import Skeleton from "../ui/Skeleton";

export default function CalendarCardSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton style={styles.container}/>
      <Skeleton style={styles.titleSkeleton}/>
      <Skeleton style={styles.dateSkeleton}/>
      <Skeleton style={styles.statusSkeleton}/>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    height: 65,
    marginBottom: 10,
  },
  titleSkeleton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: '30%',
    height: 15,
  },
  dateSkeleton: {
    position: 'absolute',
    top: 29,
    left: 10,
    width: 160,
    height: 12,
  },
  statusSkeleton: {
    position: 'absolute',
    top: 45,
    left: 10,
    width: 60,
    height: 12,
  },
});