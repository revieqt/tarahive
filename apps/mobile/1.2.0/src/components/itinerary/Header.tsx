import React, {useState} from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
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
  style?: ViewStyle | ViewStyle[];
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
  style
}: ItineraryHeaderProps) {
  const canEdit = viewType === "owner" || viewType === "editor";
  const textColor = useThemeColor({}, "text");
  const [tab, setTab] = useState(1);

  return (
    <TView color='primary' style={style}>
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
            <TouchableOpacity 
              style={[styles.tabs, tab === 1 && {borderColor: '#fff', opacity: 1}]}
              onPress={() => setTab(1)}
            >
              <TText style={styles.tabsText}>Details</TText>
            </TouchableOpacity>

            { !createMode  &&
              <TouchableOpacity 
                style={[styles.tabs, tab === 2 && {borderColor: '#fff', opacity: 1}]}
                onPress={() => setTab(2)}
              >
                <TText style={styles.tabsText}>Status</TText>
              </TouchableOpacity>
            }

            { (!createMode && canEdit) &&
              <TouchableOpacity 
                style={[styles.tabs, tab === 3 && {borderColor: '#fff', opacity: 1}]}
                onPress={() => setTab(3)}
              >
                <TText style={styles.tabsText}>Privacy</TText>
              </TouchableOpacity>
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


      <ScrollView contentContainerStyle={styles.bottomOptions} horizontal showsHorizontalScrollIndicator={false}>
        { tab === 1 && <>
          <View style={styles.headerButton}>
            <TIcon name="calendar" size={12}/>

            <DatePickerField
              placeholder="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              disabled={!editable}
              minimumDate={new Date()}
              maximumDate={endDate || undefined}
              custom
              customLabelStyle={styles.detailsText}
            />

            <TIcon name="chevron-right" size={12}/>

            <DatePickerField
              placeholder="End Date"
              value={endDate}
              onChange={onEndDateChange}
              disabled={!editable}
              minimumDate={startDate || new Date()}
              custom
              customLabelStyle={styles.detailsText}
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
            customIconName="pencil"
            customIconSize={12}
          />
          </>
        }

        { tab === 2 && <>
          <TouchableOpacity style={[styles.headerButton, {backgroundColor: '#5BCB78'}]}>
            <TIcon name="check" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>Mark as Complete</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerButton, {backgroundColor: '#F5C84B'}]}>
            <TIcon name="close" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>Cancel Itinerary</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerButton, {backgroundColor: '#F06A6A'}]}>
            <TIcon name="close" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>Delete Itinerary</TText>
          </TouchableOpacity>
        </>
        }

        { tab === 3 && <>
          <TouchableOpacity style={styles.headerButton}>
            <TIcon name="lock" size={12}/>
            <TText style={styles.detailsText}>Private</TText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <TIcon name="account" size={12}/>
            <TText style={styles.detailsText}>Collaborators</TText>
          </TouchableOpacity>
        </>
        }
        
      </ScrollView>
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
    backgroundColor: "#ccc2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 20,
    gap: 2,
    opacity: .8
  },
  detailsText:{
    fontSize: 11,
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
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: '3%',
  }
});
