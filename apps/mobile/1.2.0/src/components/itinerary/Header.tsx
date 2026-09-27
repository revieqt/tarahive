import React, {useState} from "react";
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
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import BackButton from "../common/BackButton";

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
  const textColor = useThemeColor({}, "text");
  const [tab, setTab] = useState(1);

  return (
    <TView color='primary'>
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

        
        <TText style={styles.metaText}>{ !createMode && 'Created by revie.dev · Private'}</TText>

        <BackButton type="close" color="white" style={styles.closeButton}/>
      
        <View style={{flexDirection: 'row'}}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{flexDirection: 'row'}}
            style={{flex: 1}}
          >
            { viewType === 'owner' &&
              <>
                <TouchableOpacity 
                  style={[styles.tabs, tab === 1 && {borderColor: '#fff', opacity: 1}]}
                  onPress={() => setTab(1)}
                >
                  <TText style={styles.tabsText}>Details</TText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tabs, tab === 2 && {borderColor: '#fff', opacity: 1}]}
                  onPress={() => setTab(2)}
                >
                  <TText style={styles.tabsText}>Status</TText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tabs, tab === 3 && {borderColor: '#fff', opacity: 1}]}
                  onPress={() => setTab(3)}
                >
                  <TText style={styles.tabsText}>Privacy</TText>
                </TouchableOpacity>
              </>
            }
          </ScrollView>

          <View style={styles.moreOptionsContainer}>
            <TouchableOpacity>
              <TIcon name='share' size={18} color='white'/>
            </TouchableOpacity>

            <TouchableOpacity>
              <TIcon name='content-copy' size={15} color='white'/>
            </TouchableOpacity>

            { canEdit && <TouchableOpacity style={[styles.colorView, {backgroundColor: themeColor}]} onPress={editable ? onThemeColorPress : undefined}/> }
          </View>

          
        </View>
        
      </View>

      {
        !createMode &&

        <ScrollView contentContainerStyle={styles.bottomOptions} horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
      }
    </TView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: '3%',
    paddingTop: 8
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
  closeButton:{
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '3%'
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
    marginTop: 4,
  },
  underline: {
    textDecorationLine: "underline",
  },
  detailsText:{
    fontSize: 12
  },
  tabs:{
    paddingHorizontal: 8,
    borderBottomWidth: 3,
    paddingTop: 9,
    borderColor: 'transparent',
    opacity: .5
  },
  tabsText:{
    color: '#fff',
    fontSize: 12
  },
  moreOptionsContainer:{
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#fff4',
    marginBottom: 4,
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 7
  },
  colorView:{
    width: 20,
    height: 20,
    borderRadius: 30,
    borderColor: '#fff',
    borderWidth: 3,
  },
  bottomOptions:{
    gap: 4,
    padding: 4
  }
});
