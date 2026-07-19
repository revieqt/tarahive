import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, StyleSheet, TextInput, Animated, TouchableOpacity, ScrollView } from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import BackButton from "@/shared/components/common/BackButton";
import DropDownField from "@/shared/components/ui/DropDownField";
import DatePickerField from "@/shared/components/ui/DatePickerField";
import { ITINERARY_TYPES } from "@/shared/constants/Itinerary";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { formatDateToString } from "@/shared/utils/formatDateToString";
import { useCreateItinerary } from "@/features/itinerary/hooks/useCreateItinerary";
import EmptyMessage from "@/shared/components/common/EmptyMessage";
import LocationPickerModal, { LocationItemWithAddress, Address } from "@/shared/components/modals/LocationPickerModal";
import OptionsPopup from "@/shared/components/ui/OptionsPopup";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

type DividerBlock = {
  id: number;
  type: 'divider';
};

type TextBlock = {
  id: number;
  type: 'text' | 'header';
  value: string;
};

type ToggleBlock = {
  id: number;
  type: 'toggle';
  value: string;
  checked: boolean;
};

type LocationBlock = {
  id: number;
  type: 'location';
  latitude: number;
  longitude: number;
  locationName: string;
  address: Address;
};

type Block = TextBlock | ToggleBlock | LocationBlock | DividerBlock;

export default function ItineraryCreateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t , currentLanguage } = useLanguage();

  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const COLLAPSED_HEIGHT = 90;
  const EXPANDED_HEIGHT = 165;

  const { create, isPending } = useCreateItinerary();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Solo');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [privacy, setPrivacy] = useState<'private' | 'collaborators' | 'public'>('private');
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = animatedRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  
  const toggleHeader = () => {
    const next = !isHeaderExpanded;
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: next ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setIsHeaderExpanded(next);
  };

  const handleCreate = useCallback(() => {
    create({
      title,
      type,
      startDate: startDate!,
      endDate: endDate!,
      privacy
    });
  }, [create, title, type, startDate, endDate, privacy]);

  const isOwner = true;
  const isViewer = true;
  const isEditor = true;
  const isPrivate = true;
  const isCreateMode = id === 'new';
  const isActive = true;

  if (isPrivate && !isOwner) {
      return (
        <TView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <BackButton type='floating'/>
          <EmptyMessage 
            title="You don't have permission to view this Itinerary" 
            description='Please contact the owner to request access.'
            iconName='alert'
            buttonLabel='Go Back'
            buttonAction={() => router.back()}
            isSolid
          />
        </TView>
      );
  }

  return (
    <TView style={{ flex: 1 }}>
      <Animated.View style={[styles.header, { height: animatedHeight, backgroundColor: primaryColor }]}>
        <View style={styles.headerRow}>
          <BackButton />

          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: title ? textColor : '#ccc8' }]}
          />

          <TouchableOpacity
            onPress={toggleHeader}
            style={styles.collapseBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <TIcon name="chevron-up" size={20} />
            </Animated.View>
          </TouchableOpacity>

          { (isOwner && !isCreateMode) && 
            <OptionsPopup
              options={[
                { label: 'Sharing and Privacy', iconName: 'share-variant', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                ...(isActive ?
                  [
                    { label: 'Mark as Done', iconName: 'check-circle'},
                    { label: 'Cancel Itinerary', iconName: 'minus-circle'},
                  ]
                : [{ label: 'Repeat Itinerary', iconName: 'history'},]),
                { label: 'Delete Itinerary', iconName: 'delete'},
              ]}
            >
              <TIcon name="dots-vertical" size={20} style={styles.collapseBtn} />
            </OptionsPopup>
          }
        </View>

        {isHeaderExpanded ? (
          <>
            <View style={styles.headerRow}>
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
            <DropDownField
              placeholder="Type"
              value={type}
              onValueChange={setType}
              values={ITINERARY_TYPES}
            />
          </>
        ) : (
          <ScrollView
            horizontal
            contentContainerStyle={styles.headerRow}
            style={{ borderTopWidth: 1, borderTopColor: '#ccc2' }}
            showsHorizontalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="calendar" size={15} />
              <TText style={{ fontSize: 11 }}>
                {!startDate || !endDate
                  ? 'Set Date'
                  : `${formatDateToString(startDate, currentLanguage.code)} - ${formatDateToString(endDate, currentLanguage.code)}`}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="pencil" size={15} />
              <TText style={{ fontSize: 11 }}>{type}</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="lock" size={15} />
              <TText style={{ fontSize: 11 }}>{privacy}</TText>
            </TouchableOpacity>
          </ScrollView>
        )}

      </Animated.View>

      <ScrollView>
        {/* ADD CONTENT HERE */}
      </ScrollView>

      { ((isOwner || isEditor) && isActive) && 
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.toolbar}
        >
          { isToolbarOpen &&
            <ScrollView horizontal showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: '3%', gap: 8 }}
              style={{ borderBottomWidth: 1, borderBottomColor: '#ccc2' }}
            >
              <TouchableOpacity
                style={[styles.tool, { backgroundColor }]}
              >
                <TIcon name="map-marker-plus" size={25} />
                <View>
                  <TText>Location</TText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tool, { backgroundColor }]}
              >
                <TIcon name="checkbox-marked" size={25} />
                <View>
                  <TText>Checklist</TText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tool, { backgroundColor }]}
              >
                <TIcon name="format-bold" size={25} />
                <View>
                  <TText>Header</TText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tool, { backgroundColor }]}
              >
                <TIcon name="percent-outline" size={25} />
                <View>
                  <TText>Divider</TText>
                </View>
              </TouchableOpacity>
            </ScrollView>
          }

          <View style={styles.mainButtonsContainer}>
            { (isOwner || isEditor) && isActive &&
              <TouchableOpacity
                style={[styles.tool, { backgroundColor }]}
                onPress={() => setIsToolbarOpen(!isToolbarOpen)}
              >
                { isToolbarOpen ? <TIcon name="chevron-down" size={15}/> : <TIcon name="chevron-down" size={15}/> }
                <TText>{isToolbarOpen ? 'Close Toolbar' : 'Open Toolbar'}</TText>
              </TouchableOpacity>
            }

            <TouchableOpacity
              style={[styles.tool, { backgroundColor: accentColor }]}
              onPress={() => isCreateMode && handleCreate()}
            >
              <TIcon name="check" size={15} color="#fff"/>
              <View>
                <TText style={{ color: '#fff' }}>Save</TText>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      }
    </TView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingTop: 10,
    paddingHorizontal: '2%',
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleInput: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    borderColor: 'transparent',
    height: 30,
    flex: 1,
    marginLeft: -10,
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
    justifyContent: 'flex-end',
    gap: 10,
  },
  tool: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  mainButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    justifyContent: 'flex-end',
    marginRight: '3%',
  },
  headerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  collapseBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
});