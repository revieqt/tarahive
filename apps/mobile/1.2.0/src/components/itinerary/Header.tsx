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
import { ItineraryViewType } from "@/types/itineraryTypes"
import { formatDateToString } from "@/utils/formatDateToString";

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

        { !createMode && <TText style={styles.metaText}>Created by revie.dev · Private</TText>}

        {
          !canEdit ? <>
            <View style={styles.details}>
              <TIcon name="pencil" size={15} color='white'/>
              <TText style={styles.detailsText}>{type}</TText>
            </View>

            <View style={styles.details}>
              <TIcon name="calendar" size={15} color='white'/>
              <TText style={styles.detailsText}>
                {startDate ? formatDateToString(startDate) : ''} - {endDate ? formatDateToString(endDate) : ''}
              </TText>
            </View>
            
          </> : <>
            <DropDownField
              placeholder="Type"
              value={type}
              onValueChange={onTypeChange}
              enabled={editable}
              values={ITINERARY_TYPES}
              custom
              customLabelStyle={styles.detailsText}
              customButtonStyle={styles.headerButton}
            />   

            <View style={styles.headerButton}>
              <DatePickerField
                  placeholder="Start Date"
                  value={startDate}
                  onChange={onStartDateChange}
                  disabled={!editable}
                  minimumDate={new Date()}
                  maximumDate={endDate || undefined}
                  custom
                  customLabelStyle={[styles.detailsText, styles.underline]}
              />

              <TIcon name="chevron-right" size={15} color="#fff"/>

              <DatePickerField
                  placeholder="End Date"
                  value={endDate}
                  onChange={onEndDateChange}
                  disabled={!editable}
                  minimumDate={startDate || new Date()}
                  custom
                  customLabelStyle={[styles.detailsText, styles.underline]}
              />
            </View> 
          </>
        }

         { canEdit && <TouchableOpacity style={[styles.colorView, {backgroundColor: themeColor}]} onPress={editable ? onThemeColorPress : undefined}/> }
      </View>

      {
        !createMode &&

        <TView style={styles.headerBottom} color='primary'>
          <TouchableOpacity style={[styles.bottomButton, {flex: 1}]}>
            <TIcon name='star-outline' size={20}/>
            <TText>99</TText>
          </TouchableOpacity>

          <View style={styles.divider}/>
          <TouchableOpacity style={styles.bottomButton}>
            <TIcon name='share-variant' size={20}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton}>
            <TIcon name='content-copy' size={20}/>
          </TouchableOpacity>
        </TView>
      }
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 53,
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
  headerButton: {
    borderWidth: 1,
    borderColor: "#ccc4",
    backgroundColor: "#fff4",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    gap: 4,
    marginTop: 4
  },
  underline: {
    textDecorationLine: "underline",
  },
  colorView:{
    width: 25,
    height: 25,
    borderRadius: 30,
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
    position: 'absolute',
    right: 8,
    top: 11
  },
  headerBottom:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 2,
    alignItems: 'center'
  },
  bottomButton:{
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  divider:{
    width: 1,
    backgroundColor: '#ccc4',
    height: '70%'
  },
  details:{
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    marginBottom: 5
  },
  detailsText:{
    color: '#fff',
    opacity: .7,
    fontSize: 12
  },
});
