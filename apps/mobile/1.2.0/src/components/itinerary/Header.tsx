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
import CopyModal from "@/components/itinerary/CopyModal";
import { ITINERARY_TYPES } from "@/constants/Itinerary";
import { ItineraryGeneralPermissions, ItineraryPrivacy, ItineraryStatus, ItineraryViewType } from "@/types/itineraryTypes"
import BackButton from "../common/BackButton";
import { useLanguage } from "@/context/LanguageContext"

type ItineraryHeaderProps = {
  itineraryId?: string;
  ownerUsername?: string;
  title: string;
  onTitleChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  startDate: Date | null;
  onStartDateChange: (value: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (value: Date | null) => void;
  privacy: ItineraryPrivacy;
  onPrivacyChange: (value: ItineraryPrivacy) => void;
  generalPermissions: ItineraryGeneralPermissions;
  onGeneralPermissionsChange: (key: keyof ItineraryGeneralPermissions, value: boolean) => void;
  status: ItineraryStatus;
  onStatusChange: (status: ItineraryStatus) => void;
  isUpdatingStatus?: boolean;
  themeColor?: string;
  onThemeColorPress?: () => void;
  viewType?: ItineraryViewType;
  createMode?: boolean;
  editable?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export default function ItineraryHeader({
  itineraryId,
  ownerUsername,
  title,
  onTitleChange,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  privacy,
  onPrivacyChange,
  generalPermissions,
  onGeneralPermissionsChange,
  status,
  onStatusChange,
  isUpdatingStatus = false,
  themeColor,
  onThemeColorPress,
  viewType = 'viewer',
  createMode = false,
  editable = true,
  style
}: ItineraryHeaderProps) {
  const canEdit = viewType === "owner" || viewType === "editor";
  const [tab, setTab] = useState(1);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const { t } = useLanguage();
  const privacyLabel = privacy === "collaborators"
    ? "itinerary.privacy.invited"
    : `itinerary.privacy.${privacy}`;
  const privacyIcon = privacy === "public"
    ? "earth"
    : privacy === "collaborators"
      ? "account-lock-open"
      : "lock";

  return (
    <TView style={style}>
      <View
        style={[styles.titleContainer, {backgroundColor: themeColor}]}
      >
        <TextInput
          placeholder={t('itinerary.form.title_placeholder')}
          value={title}
          onChangeText={onTitleChange}
          editable={editable}
          style={styles.titleInput}
          placeholderTextColor="#fff7"
        />

        {!createMode && ownerUsername ? (
          <View style={styles.metaRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={ownerUsername}
              onPress={() =>
                router.push({
                  pathname: '/user/[id]',
                  params: { id: ownerUsername },
                } as any)
              }
            >
              <TText style={styles.metaText}>{ownerUsername}</TText>
            </TouchableOpacity>
            <TText style={styles.metaText}> · {t(privacyLabel)}</TText>
          </View>
        ) : null}

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
              <TText style={styles.tabsText}>{t('itinerary.form.details_tab')}</TText>
            </TouchableOpacity>

            { !createMode  &&
              <TouchableOpacity 
                style={[styles.tabs, tab === 2 && {borderColor: '#fff', opacity: 1}]}
                onPress={() => setTab(2)}
              >
                <TText style={styles.tabsText}>{t('itinerary.form.actions_tab')}</TText>
              </TouchableOpacity>
            }

            { canEdit && !createMode &&
              <TouchableOpacity 
                style={[styles.tabs, tab === 3 && {borderColor: '#fff', opacity: 1}]}
                onPress={() => setTab(3)}
              >
                <TText style={styles.tabsText}>{t('itinerary.form.privacy_tab')}</TText>
              </TouchableOpacity>
            }
          </ScrollView>

          <View style={styles.moreOptionsContainer}>
            <TouchableOpacity>
              <TIcon name='share' size={18} color='white'/>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCopyModalVisible(true)}
              accessibilityLabel={t("itinerary.form.copy_button")}
            >
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
              placeholder={t('itinerary.form.start_placeholder')}
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
              placeholder={t('itinerary.form.end_placeholder')}
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
          <TouchableOpacity
            style={[styles.headerButton, {backgroundColor: '#5BCB78'}, status === ItineraryStatus.DONE && styles.disabledAction]}
            onPress={() => onStatusChange(ItineraryStatus.DONE)}
            disabled={isUpdatingStatus || status === ItineraryStatus.DONE}
          >
            <TIcon name="check" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>{t('itinerary.form.complete_button')}</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, {backgroundColor: '#F5C84B'}, status === ItineraryStatus.CANCELLED && styles.disabledAction]}
            onPress={() => onStatusChange(ItineraryStatus.CANCELLED)}
            disabled={isUpdatingStatus || status === ItineraryStatus.CANCELLED}
          >
            <TIcon name="close" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>{t('itinerary.form.cancel_button')}</TText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <TIcon name="account-group" size={12} color="white"/>
            <TText style={styles.detailsText}>{t('itinerary.form.room_button')}</TText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerButton, {backgroundColor: '#F06A6A'}]}>
            <TIcon name="close" size={12} color="white"/>
            <TText style={[styles.detailsText, {color: '#fff'}]}>{t('itinerary.form.delete_button')}</TText>
          </TouchableOpacity>
        </>
        }

        { tab === 3 && <>
          <OptionsPopup
            options={[
              { label: t("itinerary.privacy.public"), iconName: "earth", onPress: () => onPrivacyChange("public") },
              { label: t("itinerary.privacy.private"), iconName: "lock", onPress: () => onPrivacyChange("private") },
              { label: t("itinerary.privacy.invited"), iconName: "account-lock-open", onPress: () => onPrivacyChange("collaborators") }
            ]}
            style={styles.headerButton}
          >
            <TIcon name={privacyIcon} size={12}/>
            <TText style={styles.detailsText}>{t(privacyLabel)}</TText>
          </OptionsPopup>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              router.push({
                pathname: '/itinerary/[id]/collaborators',
                params: {
                  id: itineraryId || '',
                },
              })
            }
          >
            <TIcon name="account" size={12}/>
            <TText style={styles.detailsText}>{t('itinerary.form.collaborators_button')}</TText>
          </TouchableOpacity>

          <OptionsPopup
            options={[
              {
                label: t("itinerary.form.sharing_enabled"),
                iconName: "share",
                onPress: () => onGeneralPermissionsChange("allowSharing", true),
              },
              {
                label: t("itinerary.form.sharing_disabled"),
                iconName: "share-off",
                onPress: () => onGeneralPermissionsChange("allowSharing", false),
              },
            ]}
            style={styles.headerButton}
            disabled={!editable}
          >
            <TIcon name={generalPermissions.allowSharing ? "share" : "share-off"} size={12}/>
            <TText style={styles.detailsText}>
              {t(generalPermissions.allowSharing ? "itinerary.form.sharing_enabled" : "itinerary.form.sharing_disabled")}
            </TText>
          </OptionsPopup>

          <OptionsPopup
            options={[
              {
                label: t("itinerary.form.allow_others_to_copy"),
                iconName: "content-copy",
                onPress: () => onGeneralPermissionsChange("allowCopying", true),
              },
              {
                label: t("itinerary.form.dont_allow_others_to_copy"),
                iconName: "close",
                onPress: () => onGeneralPermissionsChange("allowCopying", false),
              },
            ]}
            style={styles.headerButton}
            disabled={!editable}
          >
            <TIcon name={generalPermissions.allowCopying ? "content-copy" : "close"} size={12}/>
            <TText style={styles.detailsText}>
              {t(generalPermissions.allowCopying ? "itinerary.form.allow_others_to_copy" : "itinerary.form.dont_allow_others_to_copy")}
            </TText>
          </OptionsPopup>
        </>
        }
      </ScrollView>
      <CopyModal
        visible={copyModalVisible}
        onClose={() => setCopyModalVisible(false)}
        itineraryId={itineraryId}
        title={title}
        themeColor={themeColor}
      />
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  disabledAction: {
    opacity: 0.5,
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
