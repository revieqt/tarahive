import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, Image} from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import Header from "@/components/common/Header";
import RoundButton from "@/components/ui/RoundButton";
import { router } from "expo-router";
import { useGetUserItineraries } from "@/hooks/itinerary/useGetUserItineraries";
import { Itinerary, getStatusColor } from "@/types/itineraryTypes";
import { formatDateToString } from "@/utils/formatDateToString";
import EmptyMessage from "@/components/common/EmptyMessage";
import ItineraryCardSkeleton from "@/components/feedback/CalendarCardSkeleton";
import StickyScrollView from "@/components/ui/StickyScrollView";
import { LinearGradient } from "expo-linear-gradient";
import OptionsPopup from "@/components/ui/OptionsPopup";

const ItineraryOptions = [
  { value: 'active', icon: 'cards-heart', label: 'Active' },
  { value: 'done', icon: 'check-circle', label: 'Completed' },
  { value: 'cancelled', icon: 'close-circle', label: 'Cancelled' },
];

export default function ItineraryScreen() {
  const { t } = useLanguage();
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'done' | 'cancelled'>('active');
  const { itineraries, isLoading, isError } = useGetUserItineraries(selectedStatus);

  const handleItineraryPress = (id: string) => {
    router.push(`/itinerary/${id}`);
  };

  const renderItineraryCard = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      onPress={() => handleItineraryPress(item.id)}
      style={[styles.itineraryCard, { backgroundColor: primaryColor, borderColor: getStatusColor(item.status) }]}
    >
        <TText style={styles.cardTitle} numberOfLines={1}>{item.title}</TText>
        <TText style={styles.dateText}>
          {formatDateToString(new Date(item.startDate))} - {formatDateToString(new Date(item.endDate))}
        </TText>

        <View style={styles.cardTabs}>
          <TView style={[styles.cardBubble, {backgroundColor: accentColor + '80'}]}>
            <TText style={styles.cardBubbleText}>{item.type}</TText>
          </TView>
        </View>

      <OptionsPopup
        options={[
          {
            label: "Privacy and Access",
            iconName: "account-lock",
            onPress: () => router.push({ pathname: "/share"})
          },
          {
            label: "Create Room with this Itinerary",
            iconName: "tooltip-account",
            onPress: () => router.push({ pathname: "/share"})
          },
          {
            label: "Mark Itinerary as Complete",
            iconName: "check-circle",
            onPress: () => router.push({ pathname: "/share"})
          },
          {
            label: "Cancel Itinerary",
            iconName: "close-circle",
            onPress: () => router.push({ pathname: "/share"})
          },
          {
            label: "Delete Itinerary",
            iconName: "trash-can",
            onPress: () => router.push({ pathname: "/share"})
          },
        ]}
        style={styles.optionsButton}
      >
        <TIcon name="dots-vertical" size={20}/>
      </OptionsPopup>
      
    </TouchableOpacity>
  );

  return (
    <TView style={{ flex: 1 }}>
      <StickyScrollView 
        style={{flex: 1}}
        contentContainerStyle={{padding: '3%', flex: 1}}
        title="Itinerary"
        subtitle="Manage your travel plans"
      >
        <Header title='Itinerary' subtitle='Manage your travel plans'/>
        <View style={styles.tabsContainer}>
          {ItineraryOptions.map((option, index) => (
            <TouchableOpacity
              style={[styles.tabs, selectedStatus === option.value && { borderBottomColor: accentColor, borderBottomWidth: 2 }]}
              onPress={() => setSelectedStatus(option.value as 'active' | 'done' | 'cancelled')}
            >
              <TIcon name={option.icon} size={13} color={selectedStatus === option.value ? accentColor : 'gray'} />
              <TText style={{ color: selectedStatus === option.value ? accentColor : 'gray', fontSize: 11 }}>{option.label}</TText>
            </TouchableOpacity>
          ))}
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
            renderItem={renderItineraryCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </StickyScrollView>

      <RoundButton
        iconName='plus'
        onPress={() => router.push('/itinerary/create')}
        style={[styles.addButton, styles.shadow]}
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
  itineraryCard: {
    borderRadius: 15,
    padding: '3%',
    gap: 3,
  },
  shadow:{
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.7,
  },
  cardTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  cardBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardBubbleText: {
    fontSize: 11,
    color: '#fff'
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  tabs: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 20,
    paddingBottom: 12,
    gap: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: '3%',
  },
  optionsButton: {
    borderColor: '#ccc3',
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -10,
    bottom: -10,
    top: -78,
    width: 30
  },
});