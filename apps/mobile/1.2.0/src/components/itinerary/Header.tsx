import React from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import DatePickerField from "@/components/ui/DatePickerField";
import DropDownField from "@/components/ui/DropDownField";
import OptionsPopup from "@/components/ui/OptionsPopup";
import { ITINERARY_TYPES } from "@/constants/Itinerary";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { ItineraryViewType } from "@/types/itineraryTypes"

type ItineraryHeaderProps = {
  itineraryId?: string;
  title: string;
  onTitleChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  startDate: Date | null;
  onStartDateChange: (value: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (value: Date | null) => void;
  themeColor?: string;
  onThemeColorPress?: () => void;
  viewType?: ItineraryViewType;
  createMode?: boolean;
  editable?: boolean;
};

export default function ItineraryHeader({
  itineraryId,
  title,
  onTitleChange,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  themeColor,
  onThemeColorPress,
  viewType = 'viewer',
  createMode = false,
  editable = true,
}: ItineraryHeaderProps) {
  const canEdit = viewType === "owner" || viewType === "editor";
  const sharePath = itineraryId ? `itinerary/${itineraryId}` : "itinerary/";

  return (
    <TView style={styles.header}>
      <View
        style={[styles.titleContainer, {backgroundColor: themeColor}]}
      >
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={onTitleChange}
          editable={editable}
          style={styles.titleInput}
          placeholderTextColor="#fff7"
        />

        { !createMode && <>
          <TText style={styles.metaText}>Created by revie.dev · Private</TText>

          <OptionsPopup
            options={[
              {
                label: "Share",
                iconName: "share-variant",
                onPress: () =>
                  router.push({
                    pathname: "/share",
                    params: { path: sharePath },
                  }),
              },
              
              {
                label: "Make a Copy",
                iconName: "content-copy",
                onPress: () =>
                  router.push({
                    pathname: "/share",
                    params: { path: sharePath },
                  }),
              },
              ...(viewType === "owner"
                ? [
                    {
                      label: "Privacy and Access",
                      iconName: "account-lock",
                      onPress: () =>
                        router.push({
                          pathname: "/share",
                          params: { path: sharePath },
                        }),
                    },
                    {
                      label: "Create Room with this Itinerary",
                      iconName: "tooltip-account",
                      onPress: () =>
                        router.push({
                          pathname: "/share",
                          params: { path: sharePath },
                        }),
                    },
                    {
                      label: "Mark Itinerary as Complete",
                      iconName: "check-circle",
                      onPress: () =>
                        router.push({
                          pathname: "/share",
                          params: { path: sharePath },
                        }),
                    },
                    {
                      label: "Cancel Itinerary",
                      iconName: "close-circle",
                      onPress: () =>
                        router.push({
                          pathname: "/share",
                          params: { path: sharePath },
                        }),
                    },
                    {
                      label: "Delete Itinerary",
                      iconName: "trash-can",
                      onPress: () =>
                        router.push({
                          pathname: "/share",
                          params: { path: sharePath },
                        }),
                    },
                  ]
                : []),
            ]}
            style={styles.optionsButton}
          >
            <TIcon name="dots-vertical" size={20} color="white" />
          </OptionsPopup>
        </> 
        }

            

            
      </View>
      <View style={styles.headerBottom}>
            <ScrollView
            contentContainerStyle={styles.headerButtonContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.headerButton}>
            <TIcon name="calendar" size={15} />
            <DatePickerField
                placeholder="Start Date"
                value={startDate}
                onChange={onStartDateChange}
                disabled={!editable}
                minimumDate={new Date()}
                maximumDate={endDate || undefined}
                custom
                customLabelStyle={[styles.headerButtonText, styles.underline]}
            />

            <TIcon name="chevron-right" size={15} />

            <DatePickerField
                placeholder="End Date"
                value={endDate}
                onChange={onEndDateChange}
                disabled={!editable}
                minimumDate={startDate || new Date()}
                custom
                customLabelStyle={[styles.headerButtonText, styles.underline]}
            />
            </View>

            <DropDownField
            placeholder="Type"
            value={type}
            onValueChange={onTypeChange}
            enabled={editable}
            values={ITINERARY_TYPES}
            custom
            customLabelStyle={styles.headerButtonText}
            customButtonStyle={styles.headerButton}
            customIconName="pencil"
            />
        </ScrollView>

        { canEdit && <TouchableOpacity style={[styles.colorView, {backgroundColor: themeColor}]} onPress={editable ? onThemeColorPress : undefined}/> }
        
      </View>
      
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc4",
    marginBottom: 12
  },
  titleContainer: {
    padding: 8,
  },
  titleInput: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "bold",
    height: 30,
    color: "#fff",
    width: "92%",
  },
  metaText: {
    opacity: 0.7,
    color: "white",
    fontSize: 10,
  },
  optionsButton: {
    position: "absolute",
    right: 0,
    top: -31,
  },
  headerButtonContainer: {
    margin: 5,
    height: 30,
    gap: 4,
  },
  headerButton: {
    borderWidth: 1,
    borderColor: "#ccc4",
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    flexDirection: "row",
    borderRadius: 40,
    gap: 4,
  },
  headerButtonText: {
    fontSize: 12,
    opacity: 0.7,
  },
  underline: {
    textDecorationLine: "underline",
  },
  colorView:{
    width: 25,
    height: 25,
    borderRadius: 30,
    marginTop: 7,
    marginHorizontal: 7,
    borderColor: '#ccc',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  headerBottom:{
    flexDirection: 'row'
  }
});
