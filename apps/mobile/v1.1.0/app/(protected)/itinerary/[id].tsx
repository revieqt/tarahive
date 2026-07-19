import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TIcon, TText, TView } from "@/shared/components/ui/Themed";
import { useLanguage } from "@/shared/context/LanguageContext";
import BackButton from "@/shared/components/common/BackButton";
import DropDownField from "@/shared/components/ui/DropDownField";
import DatePickerField from "@/shared/components/ui/DatePickerField";
import { ITINERARY_TYPES } from "@/shared/constants/Itinerary";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { formatDateToString } from "@/shared/utils/formatDateToString";
import { useCreateItinerary } from "@/features/itinerary/hooks/useCreateItinerary";
import RoundButton from "@/shared/components/ui/RoundButton";
import LocationPickerModal, {
  LocationItemWithAddress,
  Address,
} from "@/shared/components/modals/LocationPickerModal";
import Button from "@/shared/components/ui/Button";
import OptionsPopup from "@/shared/components/ui/OptionsPopup";
import { router } from "expo-router";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLAPSED_HEIGHT = 90;
const EXPANDED_HEIGHT = 220;

// ─── Types ────────────────────────────────────────────────────────────────────

type TextBlock = {
  id: string;
  type: 'text';
  value: string;
};

type ToggleBlock = {
  id: string;
  type: 'toggle';
  value: string;
  checked: boolean;
};

type LocationBlock = {
  id: string;
  type: 'location';
  latitude: number;
  longitude: number;
  locationName: string;
  address: Address;
};

type Block = TextBlock | ToggleBlock | LocationBlock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _counter = 0;
function genId(): string {
  return `b${Date.now()}${_counter++}`;
}

// ─── Serializer ───────────────────────────────────────────────────────────────

function serializeBlocks(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'text') return block.value;
      if (block.type === 'toggle') {
        return `$tg[${block.id}].[${block.checked}]$ {${block.value}} /$tg$`;
      }
      // location
      const payload = JSON.stringify({
        latitude: block.latitude,
        longitude: block.longitude,
        locationName: block.locationName,
        address: block.address,
      });
      return `$l[${block.id}]$ {${payload}} /$l$`;
    })
    .join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ItineraryCreateScreen() {
  const { t } = useLanguage();
  const { create, isPending } = useCreateItinerary();

  // Header
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Solo');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [privacy, setPrivacy] = useState<'Only Me' | 'Public'>('Only Me');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  // Blocks
  const [blocks, setBlocks] = useState<Block[]>([
    { id: genId(), type: 'text', value: '' },
  ]);

  // Per-block input heights
  const [inputHeights, setInputHeights] = useState<Record<string, number>>({});

  // Focus
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  // Location picker
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Serialized content string
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(serializeBlocks(blocks));
  }, [blocks]);

  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');

  // ── Header animation ──────────────────────────────────────────────────────

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

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // ── Block mutations ───────────────────────────────────────────────────────

  const updateBlockValue = useCallback((id: string, value: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, value } : b)));
  }, []);

  const toggleChecked = useCallback((id: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id && b.type === 'toggle' ? { ...b, checked: !b.checked } : b
      )
    );
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;

      const before = prev[idx - 1];
      const after = prev[idx + 1];

      // If both neighbours are text blocks, merge them
      if (before?.type === 'text' && after?.type === 'text') {
        const merged: TextBlock = {
          id: before.id,
          type: 'text',
          value:
            before.value + (before.value && after.value ? '\n' : '') + after.value,
        };
        const next = [...prev];
        next.splice(idx - 1, 3, merged);
        return next;
      }

      return prev.filter((b) => b.id !== id);
    });
  }, []);

  const insertToggleBlock = useCallback(() => {
    const newToggle: ToggleBlock = {
      id: genId(),
      type: 'toggle',
      value: '',
      checked: false,
    };
    setBlocks((prev) => {
      const idx = focusedBlockId
        ? prev.findIndex((b) => b.id === focusedBlockId)
        : prev.length - 1;
      const insertAt = idx === -1 ? prev.length : idx + 1;
      const next = [...prev];
      next.splice(insertAt, 0, newToggle);
      const blockAfter = next[insertAt + 1];
      if (!blockAfter || blockAfter.type !== 'text') {
        next.splice(insertAt + 1, 0, { id: genId(), type: 'text', value: '' });
      }
      return next;
    });
    setFocusedBlockId(newToggle.id);
    setTimeout(() => inputRefs.current[`toggle_${newToggle.id}`]?.focus(), 50);
  }, [focusedBlockId]);

  const handleLocationPicked = useCallback(
    (loc: LocationItemWithAddress) => {
      const newLocation: LocationBlock = {
        id: genId(),
        type: 'location',
        latitude: loc.latitude!,
        longitude: loc.longitude!,
        locationName: loc.locationName ?? '',
        address: loc.address,
      };
      setBlocks((prev) => {
        const idx = focusedBlockId
          ? prev.findIndex((b) => b.id === focusedBlockId)
          : prev.length - 1;
        const insertAt = idx === -1 ? prev.length : idx + 1;
        const next = [...prev];
        next.splice(insertAt, 0, newLocation);
        // Ensure a text block follows
        const blockAfter = next[insertAt + 1];
        if (!blockAfter || blockAfter.type !== 'text') {
          next.splice(insertAt + 1, 0, { id: genId(), type: 'text', value: '' });
        }
        return next;
      });
    },
    [focusedBlockId]
  );

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    create({
      title,
      type,
      startDate: startDate!,
      endDate: endDate!,
      privacy,
      content,
    });
  }, [create, title, type, startDate, endDate, privacy, content]);

  // ── Block renderers ───────────────────────────────────────────────────────

  // const renderTextBlock = (block: TextBlock) => {
  //   const refKey = `text_${block.id}`;
  //   const h = inputHeights[refKey] ?? 28;
  //   return (
  //     <TextInput
  //       key={block.id}
  //       ref={(r) => { inputRefs.current[refKey] = r; }}
  //       value={block.value}
  //       onChangeText={(v) => updateBlockValue(block.id, v)}
  //       onFocus={() => setFocusedBlockId(block.id)}
  //       onContentSizeChange={(e) =>
  //         setInputHeights((prev) => ({
  //           ...prev,
  //           [refKey]: e.nativeEvent.contentSize.height,
  //         }))
  //       }
  //       placeholder="Start writing…"
  //       placeholderTextColor="#ccc8"
  //       multiline
  //       style={[styles.textInput, { color: textColor, height: Math.max(28, h) }]}
  //     />
  //   );
  // };

  // const renderToggleBlock = (block: ToggleBlock) => {
  //   const refKey = `toggle_${block.id}`;
  //   const h = inputHeights[refKey] ?? 28;
  //   return (
  //     <View
  //       key={block.id}
  //       style={[styles.toggleBlock, { borderColor: '#ccc4', backgroundColor: primaryColor }]}
  //     >
  //       <TouchableOpacity
  //         onPress={() => toggleChecked(block.id)}
  //         style={[
  //           styles.checkbox,
  //           {
  //             borderColor: block.checked ? accentColor : '#ccc6',
  //             backgroundColor: block.checked ? accentColor : 'transparent',
  //           },
  //         ]}
  //         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  //       >
  //         {block.checked && <TIcon name="check" size={11} color="white" />}
  //       </TouchableOpacity>

  //       <TextInput
  //         ref={(r) => { inputRefs.current[refKey] = r; }}
  //         value={block.value}
  //         onChangeText={(v) => updateBlockValue(block.id, v)}
  //         onFocus={() => setFocusedBlockId(block.id)}
  //         onContentSizeChange={(e) =>
  //           setInputHeights((prev) => ({
  //             ...prev,
  //             [refKey]: e.nativeEvent.contentSize.height,
  //           }))
  //         }
  //         placeholder="List item…"
  //         placeholderTextColor="#ccc8"
  //         multiline
  //         style={[
  //           styles.toggleInput,
  //           {
  //             color: textColor,
  //             height: Math.max(28, h),
  //             textDecorationLine: block.checked ? 'line-through' : 'none',
  //             opacity: block.checked ? 0.45 : 1,
  //           },
  //         ]}
  //       />

  //       <TouchableOpacity
  //         onPress={() => deleteBlock(block.id)}
  //         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  //         style={styles.deleteBtn}
  //       >
  //         <TIcon name="close" size={14} color="#ccc8" />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  // const renderLocationBlock = (block: LocationBlock) => (
  //   <View
  //     key={block.id}
  //     style={[styles.locationBlock, { borderColor: accentColor + '55', backgroundColor: primaryColor }]}
  //   >
  //     <View style={[styles.locationIconBox, { backgroundColor: accentColor + '22' }]}>
  //       <TIcon name="map-marker" size={18} color={accentColor} />
  //     </View>

  //     <View style={{ flex: 1 }}>
  //       <TText style={styles.locationName} numberOfLines={1}>
  //         {block.locationName}
  //       </TText>
  //       {block.address.city || block.address.region ? (
  //         <TText style={styles.locationSub} numberOfLines={1}>
  //           {[block.address.city, block.address.region].filter(Boolean).join(', ')}
  //         </TText>
  //       ) : null}
  //     </View>

  //     <TouchableOpacity
  //       onPress={() => deleteBlock(block.id)}
  //       hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  //       style={styles.deleteBtn}
  //     >
  //       <TIcon name="close" size={14} color="#ccc8" />
  //     </TouchableOpacity>
  //   </View>
  // );

  // ── Render ────────────────────────────────────────────────────────────────

  // return (
  //   <TView style={{ flex: 1 }}>
  //     <Animated.View
  //       style={[styles.header, { height: animatedHeight, backgroundColor: primaryColor }]}
  //     >
  //       <View style={styles.headerRow}>
  //         <BackButton />
  //         <TextInput
  //           placeholder="Title"
  //           value={title}
  //           onChangeText={setTitle}
  //           style={[styles.titleInput, { color: title ? textColor : '#ccc8' }]}
  //         />
  //         <TouchableOpacity
  //           onPress={toggleHeader}
  //           style={styles.collapseBtn}
  //           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  //         >
  //           <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
  //             <TIcon name="chevron-up" size={20} />
  //           </Animated.View>
  //         </TouchableOpacity>
  //       </View>

  //       {isHeaderExpanded ? (
  //         <>
  //           <View style={styles.headerRow}>
  //             <DatePickerField
  //               placeholder="Start Date"
  //               value={startDate}
  //               onChange={setStartDate}
  //               minimumDate={new Date()}
  //               maximumDate={endDate || undefined}
  //               style={{ backgroundColor: 'transparent', flex: 1 }}
  //             />
  //             <DatePickerField
  //               placeholder="End Date"
  //               value={endDate}
  //               onChange={setEndDate}
  //               minimumDate={startDate || new Date()}
  //               style={{ backgroundColor: 'transparent', flex: 1 }}
  //             />
  //           </View>

  //           <View style={styles.headerRow}>
  //             <DropDownField
  //               placeholder="Type"
  //               value={type}
  //               onValueChange={setType}
  //               values={ITINERARY_TYPES}
  //               style={{ flex: 1 }}
  //             />
  //             <DropDownField
  //               placeholder="Privacy"
  //               value={privacy}
  //               onValueChange={(v) => setPrivacy(v as 'Only Me' | 'Public')}
  //               values={['Only Me', 'Public']}
  //               style={{ flex: 1 }}
  //             />
  //           </View>
            

  //           <View style={styles.headerRow}>
  //             <Button
  //               title="Add Checklist Item"
  //               onPress={insertToggleBlock}
  //               buttonStyle={{ flex: 1 }}
  //             />
  //             <Button
  //               title="Add Location"
  //               onPress={() => setLocationModalVisible(true)}
  //               buttonStyle={{ flex: 1 }}
  //               type="primary"
  //             />
  //           </View>
  //         </>
  //       ) : (
  //         <View style={styles.headerRow}>
  //           <ScrollView
  //             horizontal
  //             contentContainerStyle={styles.headerRow}
  //             showsHorizontalScrollIndicator={false}
  //           >
  //             <TouchableOpacity
  //               style={[styles.headerTab, { backgroundColor }]}
  //               onPress={toggleHeader}
  //             >
  //               <TIcon name="calendar" size={15} />
  //               <TText style={{ fontSize: 11 }}>
  //                 {!startDate || !endDate
  //                   ? 'Set Date'
  //                   : `${formatDateToString(startDate)} - ${formatDateToString(endDate)}`}
  //               </TText>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={[styles.headerTab, { backgroundColor }]}
  //               onPress={toggleHeader}
  //             >
  //               <TIcon name="pencil" size={15} />
  //               <TText style={{ fontSize: 11 }}>{type}</TText>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={[styles.headerTab, { backgroundColor }]}
  //               onPress={toggleHeader}
  //             >
  //               <TIcon name="lock" size={15} />
  //               <TText style={{ fontSize: 11 }}>{privacy}</TText>
  //             </TouchableOpacity>
  //           </ScrollView>

  //           <TouchableOpacity
  //             onPress={insertToggleBlock}
  //             style={styles.toolbarBtn}
  //             accessibilityLabel="Insert checklist item"
  //           >
  //             <TIcon name="checkbox-marked-outline" size={18} />
  //           </TouchableOpacity>

  //           <TouchableOpacity
  //             onPress={() => setLocationModalVisible(true)}
  //             style={styles.toolbarBtn}
  //             accessibilityLabel="Add location"
  //           >
  //             <TIcon name="map-marker-plus" size={18} color={accentColor}/>
  //           </TouchableOpacity>
  //         </View>
          
  //       )}
  //     </Animated.View>

  //     <View style={{ flex: 1 }}>

  //       <ScrollView
  //         contentContainerStyle={styles.editorContainer}
  //         showsVerticalScrollIndicator={false}
  //         keyboardShouldPersistTaps="handled"
  //       >
  //         {blocks.map((block) => {
  //           if (block.type === 'text') return renderTextBlock(block as TextBlock);
  //           if (block.type === 'toggle') return renderToggleBlock(block as ToggleBlock);
  //           return renderLocationBlock(block as LocationBlock);
  //         })}
  //       </ScrollView>
  //     </View>

  //     <LocationPickerModal
  //       visible={locationModalVisible}
  //       onClose={() => setLocationModalVisible(false)}
  //       onAddLocation={handleLocationPicked}
  //     />

  //     <RoundButton
  //       iconName="check"
  //       onPress={handleSave}
  //       style={styles.cubeButton}
  //       disabled={isPending || !title.trim() || !startDate || !endDate}
  //     />
  //   </TView>
  // );

  const isOwner = true;
  const isViewer = true;
  const isEditor = true;
  const isPrivate = true;
  const isCreateMode = false;
  const isActive = true;

  return (
    <TView style={{ flex: 1 }}>
      <TView style={styles.header} color='primary' shadow>
        <View style={styles.headerRow}>
          <BackButton/>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: title ? textColor : '#ccc8' }]}
          />

          { (isOwner && !isCreateMode) && 
            <OptionsPopup
              options={[
                { label: 'Sharing and Privacy', iconName: 'share-variant', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/` } }) },
                ...(isActive ?
                  [
                    { label: 'Create Room with Itinerary', iconName: 'account-group'},
                    { label: 'Mark as Done', iconName: 'check-circle'},
                    { label: 'Cancel Itinerary', iconName: 'minus-circle'},
                  ]
                : [{ label: 'Repeat Itinerary', iconName: 'history'},]),
                { label: 'Delete Itinerary', iconName: 'delete'},
              ]}
            >
              <TIcon name="dots-vertical" size={20} color="#fff" />
            </OptionsPopup>
          }
          
          
        </View>

        <View style={styles.toolbar}>
          <TText style={styles.toolbarText}>Add New</TText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="calendar" size={15} />
              <TText style={{ fontSize: 11 }}>Location</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="lock" size={15} />
              <TText style={{ fontSize: 11 }}>Checklist</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="pencil" size={15} />
              <TText style={{ fontSize: 11 }}>Header</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerTab, { backgroundColor }]}
              onPress={toggleHeader}
            >
              <TIcon name="lock" size={15} />
              <TText style={{ fontSize: 11 }}>Divider</TText>
            </TouchableOpacity>
            
            
          </ScrollView>
        </View>

        
      </TView>
    </TView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    gap: 7,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc5',
    padding: 5,
    borderRadius: 10,
    gap: 5,
  },
  toolbarText: {
    fontSize: 11,
    opacity: 0.5,
    width: 60,
  },
  // collapseBtn: {
  //   padding: 4,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderRadius: 15,
  //   borderWidth: 1,
  //   borderColor: '#ccc4',
  // },
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
  // toolbarBtn: {
  //   width: 34,
  //   height: 34,
  //   borderRadius: 8,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderWidth: 1,
  //   borderColor: 'transparent',
  // },
  // saveBtn: {
  //   borderRadius: 10,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 10,
  //   paddingVertical: 7,
  //   gap: 5,
  // },
  // editorContainer: {
  //   padding: '3%',
  //   paddingBottom: 60,
  //   gap: 4,
  // },
  // textInput: {
  //   fontFamily: 'Inter',
  //   fontSize: 13,
  //   lineHeight: 20,
  //   marginHorizontal: 5,
  //   minHeight: 28,
  // },
  // // Toggle
  // toggleBlock: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   paddingHorizontal: 10,
  //   paddingVertical: 8,
  //   gap: 10,
  // },
  // checkbox: {
  //   width: 20,
  //   height: 20,
  //   borderRadius: 5,
  //   borderWidth: 1.5,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 4,
  //   flexShrink: 0,
  // },
  // toggleInput: {
  //   flex: 1,
  //   fontFamily: 'Inter',
  //   fontSize: 13,
  //   lineHeight: 20,
  //   minHeight: 28,
  // },
  // deleteBtn: {
  //   width: 24,
  //   height: 24,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 2,
  //   flexShrink: 0,
  // },
  // // Location
  // locationBlock: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   paddingHorizontal: 10,
  //   paddingVertical: 10,
  //   gap: 10,
  // },
  // locationIconBox: {
  //   width: 36,
  //   height: 36,
  //   borderRadius: 8,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   flexShrink: 0,
  // },
  // locationName: {
  //   fontSize: 13,
  //   fontWeight: '600',
  //   lineHeight: 18,
  // },
  // locationSub: {
  //   fontSize: 11,
  //   opacity: 0.55,
  //   lineHeight: 16,
  // },
  // cubeButton: {
  //   position: 'absolute',
  //   bottom: 16,
  //   right: '3%'
  // },
});