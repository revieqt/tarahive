import React from "react";
import { View, StyleSheet, FlatList} from "react-native";
import { TIcon, TView } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/common/Header";
import RoundButton from "@/components/ui/RoundButton";
import { router } from "expo-router";
import { useGetUserItineraries } from "@/hooks/itinerary/useGetUserItineraries";
import EmptyMessage from "@/components/common/EmptyMessage";
import ItineraryCardSkeleton from "@/components/feedback/CalendarCardSkeleton";
import StickyScrollView from "@/components/ui/StickyScrollView";
import OptionsPopup from "@/components/ui/OptionsPopup";
import ItineraryCard from "@/components/itinerary/ItineraryCard";

export default function ItineraryScreen() {
  const { t } = useLanguage();
  const { itineraries, isLoading, isError } = useGetUserItineraries('active');

  return (
    <TView style={{ flex: 1 }}>
      <StickyScrollView 
        style={{flex: 1}}
        contentContainerStyle={{padding: '3%', flex: 1}}
        title="Itinerary"
        subtitle="Manage your travel plans"
      >
        <Header title={t('itinerary.main.title')} subtitle={t('itinerary.main.subtitle')} style={{zIndex: 10}}/>
        <View style={styles.moreButtonContainer}>
          <OptionsPopup
            options={[
              { label: "Itinerary Archives", iconName: "archive", onPress: () => router.push('itinerary/archives')},
              { label: "Help", iconName: "help-circle" },
            ]}
            style={styles.moreButton}
          >
            <TIcon name="dots-vertical" size={20}/>
          </OptionsPopup>
        </View>
        {isLoading ? (
          <>
            <ItineraryCardSkeleton />
            <ItineraryCardSkeleton />
          </>
        ) : isError || !itineraries || itineraries.length === 0 ? (
          <View style={styles.errorContainer}>
            <EmptyMessage
              title={isError ? 'Failed to load itineraries' : 'No itineraries yet'}
              description={isError ? 'Please try again later' : 'Nothing to see here!'}
              iconName='inbox'
            />
          </View>
        ) : (
          <FlatList
            data={itineraries}
            renderItem={({ item }) => <ItineraryCard itinerary={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </StickyScrollView>

      <RoundButton
        iconName='plus'
        onPress={() => router.push('/itinerary/create')}
        style={styles.addButton}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: 50,
  },
  listContent: {
    gap: 8,
  },
  moreButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 1000,
  },
  moreButton:{
    padding: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: '3%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});