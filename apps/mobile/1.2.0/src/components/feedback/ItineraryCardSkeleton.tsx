import React from "react";
import { View, StyleSheet } from "react-native";
import Skeleton from "../ui/Skeleton";

export default function ItineraryCardSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton style={styles.container}/>
      <Skeleton style={styles.titleSkeleton}/>
      <Skeleton style={styles.dateSkeleton}/>
      <Skeleton style={styles.statusSkeleton}/>
      <Skeleton style={styles.typeSkeleton}/>
      <Skeleton style={styles.descriptionSkeleton}/>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    height: 120,
  },
  titleSkeleton: {
    position: 'absolute',
    top: 17,
    left: 15,
    width: '50%',
    height: 20,
  },
  dateSkeleton: {
    position: 'absolute',
    top: 44,
    left: 15,
    width: 160,
    height: 15,
  },
  statusSkeleton: {
    position: 'absolute',
    top: 64,
    left: 15,
    width: 60,
    height: 20,
  },
  typeSkeleton: {
    position: 'absolute',
    top: 64,
    left: 80,
    width: 60,
    height: 18,
  },
  descriptionSkeleton: {
    position: 'absolute',
    top: 91,
    left: 15,
    width: '80%',
    height: 15,
  },
});