import React, { useState, useRef } from "react";
import { View, StyleSheet, TextInput, Animated, TouchableOpacity, ScrollView } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import BackButton from "@/shared/components/common/BackButton";
import DropDownField from "@/shared/components/ui/DropDownField";
import DatePickerField from "@/shared/components/ui/DatePickerField";
import { ITINERARY_TYPES } from "@/shared/constants/Itinerary";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { formatDateToString } from "@/shared/utils/formatDateToString";

const COLLAPSED_HEIGHT = 90;
const EXPANDED_HEIGHT = 175;

export default function ItinerarySettingsScreen() {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [type, setType] = useState('Solo');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  const toggleHeader = () => {
    const toExpanded = !isExpanded;

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: toExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: toExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsExpanded(toExpanded);
  };

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TView style={{ flex: 1 }}>
      <Animated.View style={[styles.header, { height: animatedHeight, backgroundColor: primaryColor }]}>
        <View style={styles.headerTitleContainer}>
          <BackButton />
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: textColor }]}
          />
          <TouchableOpacity onPress={toggleHeader} style={styles.collapseButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <TIcon name="chevron-up" size={20} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {isExpanded ? (
          <>
            <DropDownField
              placeholder="Type"
              value={type}
              onValueChange={setType}
              values={ITINERARY_TYPES}
              style={{ backgroundColor: 'transparent', fontFamily: 'PoppinsRegular' }}
            />
            <View style={styles.headerTitleContainer}>
              <DatePickerField
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                minimumDate={new Date()}
                maximumDate={endDate || undefined}
                style={{ backgroundColor: 'transparent', flex: 1 }}
              />
              <DatePickerField
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                minimumDate={startDate || new Date()}
                style={{ backgroundColor: 'transparent', flex: 1 }}
              />
            </View>
          </>
        ) : (
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity style={[styles.headerTab, { backgroundColor: accentColor + '40' }]} onPress={toggleHeader}>
              <TIcon name="pencil" size={15} />
              <TText style={{ fontSize: 12 }}>{type}</TText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerTab, { backgroundColor: accentColor + '40' }]} onPress={toggleHeader}>
              <TIcon name="calendar" size={15} />
              <TText style={{ fontSize: 12 }}>
                {!startDate || !endDate ? "Set Date" : `${formatDateToString(startDate)} - ${formatDateToString(endDate)}`}
              </TText>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <View>
        <TView style={styles.toolbar} color="primary" shadow>
          <View style={styles.toolbarButtonsContainer}>
            <TouchableOpacity>
              <TIcon name="format-bold" size={20} />
            </TouchableOpacity>
            <TouchableOpacity>
              <TIcon name="format-italic" size={20} />
            </TouchableOpacity>
            <TouchableOpacity>
              <TIcon name="format-underline" size={20} />
            </TouchableOpacity>
            <TouchableOpacity>
              <TIcon name="format-list-bulleted" size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addLocationButton, { backgroundColor: accentColor }]}
          >
            <TIcon name="plus" size={15} color="white" />
            <TText style={{ color: 'white', fontSize: 12 }}>Add Location</TText>
          </TouchableOpacity>
        </TView>

        <ScrollView contentContainerStyle={{ padding: 10, paddingTop: 70 }}>
          <TText>
            Content goes here...
          </TText>

        </ScrollView>
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc4",
    paddingHorizontal: '3%',
    paddingTop: 10,
    paddingBottom: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  titleInput: {
    fontFamily: 'Baloo',
    fontSize: 24,
    borderColor: 'transparent',
    height: 30,
    flex: 1,
    marginLeft: -10,
  },
  collapseButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  headerTab: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 7,
    position: "absolute",
    top: 10,
    left: '3%',
    right: '3%',
    borderRadius: 15,
  },
  addLocationButton: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
  },
  toolbarButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});