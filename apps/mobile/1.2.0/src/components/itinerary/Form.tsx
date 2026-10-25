import React, { useEffect, useRef, useState } from "react";
import { Animated, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "@/hooks/shared/useRouter";
import { LinearGradient } from "expo-linear-gradient";
import DraggableFlatList from "react-native-draggable-flatlist";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import LocationPickerModal, { LocationItemWithAddress } from "@/components/modals/LocationPickerModal";
import HeadingBlock from "@/components/itinerary/HeadingBlock";
import LocationBlock from "@/components/itinerary/LocationBlock";
import ChecklistBlock from "@/components/itinerary/ChecklistBlock";
import Toolbar from "@/components/itinerary/Toolbar";
import FocusBar from "@/components/itinerary/FocusBar";
import ColorBar from "@/components/itinerary/ColorBar";
import ItineraryHeader from "@/components/itinerary/Header";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import RoundButton from "@/components/ui/RoundButton";
import { ITINERARY_TYPES } from "@/constants/Itinerary";
import { newItinerayId } from "@/services/itineraryService";
import { useLanguage } from "@/context/LanguageContext";
import { CreateItineraryForm, Itinerary, ItineraryGeneralPermissions, ItineraryPrivacy, ItineraryStatus, ItineraryUpdateValues, ItineraryViewType, HeaderType, ItineraryBlock, LocationBlockData, TextBlock } from "@/types/itineraryTypes";
import { ItineraryRemoteUpdateNotice } from "@/hooks/itinerary/useItineraryRealtime";
import { useUpdateItinerary } from "@/hooks/itinerary/useUpdateItinerary";
import { useItineraryStatus } from "@/hooks/itinerary/useItineraryStatus";
import { showWarning } from "@/services/toast.service";
import StickyScrollView from "../ui/StickyScrollView";
import { formatDateToString } from "@/utils/formatDateToString";

const itineraryToUpdateValues = (itinerary: Itinerary): ItineraryUpdateValues => ({
  title: itinerary.title,
  type: itinerary.type,
  startDate: new Date(itinerary.startDate),
  endDate: new Date(itinerary.endDate),
  content: itinerary.content ?? [],
  privacy: itinerary.privacy ?? "private",
  themeColor: itinerary.themeColor ?? "",
  allowSharing: itinerary.generalPermissions?.allowSharing ?? true,
  allowCopying: itinerary.generalPermissions?.allowCopying ?? true,
});

const valuesMatch = (left: unknown, right: unknown): boolean => {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
};

type ItineraryFormProps = {
  ownerUsername?: string;
  initialItinerary?: Itinerary;
  viewType?: ItineraryViewType;
  initialValues?: Partial<CreateItineraryForm>;
  isSubmitting?: boolean;
  onSubmit?: (values: CreateItineraryForm) => void;
  onRepeatItinerary?: () => void;
  createMode?: boolean;
  itineraryId?: string;
  remoteUpdateNotice?: ItineraryRemoteUpdateNotice | null;
};

export default function ItineraryForm({
  ownerUsername,
  initialItinerary,
  viewType = "editor",
  initialValues,
  createMode = false,
  isSubmitting = false,
  onSubmit,
  onRepeatItinerary,
  itineraryId,
  remoteUpdateNotice,
}: ItineraryFormProps) {
  const status = initialItinerary?.status ?? ItineraryStatus.ACTIVE;
  const canEdit = viewType !== "viewer" && status === ItineraryStatus.ACTIVE;
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");
  const accentColor = useThemeColor({}, "accent");
  const textColor = useThemeColor({}, "text");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [startDate, setStartDate] = useState<Date | null>(initialValues?.startDate ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialValues?.endDate ?? null);
  const [type, setType] = useState(initialValues?.type ?? ITINERARY_TYPES[0].value);
  const [privacy, setPrivacy] = useState<ItineraryPrivacy>(initialValues?.privacy ?? "private");
  const [generalPermissions, setGeneralPermissions] = useState<ItineraryGeneralPermissions>(
    initialValues?.generalPermissions ?? { allowSharing: true, allowCopying: true }
  );
  const [themeColor, setThemeColor] = useState(initialValues?.themeColor ?? accentColor);
  const [colorBarVisible, setColorBarVisible] = useState(false);
  const [content, setContent] = useState<ItineraryBlock[]>((initialValues?.content as ItineraryBlock[] | undefined) ?? [],);
  const previousItinerary = useRef(initialItinerary);
  const [updateNotice, setUpdateNotice] = useState<ItineraryRemoteUpdateNotice | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [locationVisible, setLocationVisible] = useState(false);
  const [locationEditBlockId, setLocationEditBlockId] = useState<string | null>(null);
  const [composerId, setComposerId] = useState<string | null>(null);
  const [blockHeights, setBlockHeights] = useState<Record<string, number>>({});
  const [isRemoteUpdateNoticeVisible, setIsRemoteUpdateNoticeVisible] = useState(false);
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();
  const updateValues: ItineraryUpdateValues = {
    title,
    type,
    startDate,
    endDate,
    content,
    privacy,
    themeColor,
    allowSharing: generalPermissions.allowSharing,
    allowCopying: generalPermissions.allowCopying,
  };
  const itineraryUpdate = useUpdateItinerary(initialItinerary, updateValues, (savedItinerary) => {
    setUpdateNotice({
      actorName: "You",
      version: savedItinerary.v ?? Date.now(),
    });
  });
  const itineraryStatus = useItineraryStatus(initialItinerary?.id, initialItinerary?.status);

  useEffect(() => {
    if (!remoteUpdateNotice) {
      return;
    }

    setUpdateNotice(remoteUpdateNotice);
  }, [remoteUpdateNotice]);

  useEffect(() => {
    if (!updateNotice) {
      noticeOpacity.stopAnimation();
      noticeOpacity.setValue(0);
      setIsRemoteUpdateNoticeVisible(false);
      return undefined;
    }

    setIsRemoteUpdateNoticeVisible(true);
    noticeOpacity.stopAnimation();
    Animated.timing(noticeOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(noticeOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsRemoteUpdateNoticeVisible(false);
      });
    }, 3000);

    return () => {
      clearTimeout(timeout);
      noticeOpacity.stopAnimation();
    };
  }, [updateNotice, noticeOpacity]);

  useEffect(() => {
    if (!initialItinerary) return;

    const previous = previousItinerary.current;
    if (!previous || previous.id !== initialItinerary.id) {
      previousItinerary.current = initialItinerary;
      const values = itineraryToUpdateValues(initialItinerary);
      setTitle(values.title);
      setType(values.type);
      setStartDate(values.startDate);
      setEndDate(values.endDate);
      setContent(values.content as ItineraryBlock[]);
      setPrivacy(values.privacy);
      setThemeColor(values.themeColor || accentColor);
      setGeneralPermissions({
        allowSharing: values.allowSharing,
        allowCopying: values.allowCopying,
      });
      return;
    }

    const isNewer = previous.v !== undefined && initialItinerary.v !== undefined
      ? initialItinerary.v > previous.v
      : new Date(initialItinerary.updatedOn).getTime() > new Date(previous.updatedOn).getTime();
    if (!isNewer) return;

    const baseline = itineraryToUpdateValues(previous);
    const incoming = itineraryToUpdateValues(initialItinerary);
    const local = updateValues;
    const conflicts: string[] = [];
    const mergeField = <K extends keyof ItineraryUpdateValues>(
      field: K,
      setValue: (value: ItineraryUpdateValues[K]) => void
    ) => {
      const editedLocally = !valuesMatch(local[field], baseline[field]);
      const changedRemotely = !valuesMatch(incoming[field], baseline[field]);
      if (!editedLocally) {
        setValue(incoming[field]);
      } else if (changedRemotely && !valuesMatch(local[field], incoming[field])) {
        conflicts.push(field);
      }
    };

    mergeField("title", setTitle);
    mergeField("type", setType);
    mergeField("startDate", setStartDate);
    mergeField("endDate", setEndDate);
    mergeField("content", (value) => setContent(value as ItineraryBlock[]));
    mergeField("privacy", setPrivacy);
    mergeField("themeColor", setThemeColor);
    mergeField("allowSharing", (value) =>
      setGeneralPermissions((current) => ({ ...current, allowSharing: value }))
    );
    mergeField("allowCopying", (value) =>
      setGeneralPermissions((current) => ({ ...current, allowCopying: value }))
    );
    previousItinerary.current = initialItinerary;

    if (conflicts.length) {
      showWarning(
        "Itinerary updated",
        "Remote changes were loaded. Your edits were kept for fields changed on both devices."
      );
    }
  }, [
    initialItinerary,
    accentColor,
    title,
    type,
    startDate,
    endDate,
    content,
    privacy,
    themeColor,
    generalPermissions,
  ]);

  const updateBlock = (id: string, changes: Partial<ItineraryBlock>) => {
    if (!canEdit) return;
    setContent((current) =>
      current.map((block) => block.id === id ? ({ ...block, ...changes } as ItineraryBlock) : block)
    );
  };

  const addText = () => {
    const block: TextBlock = { id: newItinerayId(), type: "text", value: "" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addHeading = (blockType: HeaderType) => {
    const block: ItineraryBlock = { id: newItinerayId(), type: blockType, value: "" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addChecklist = () => {
    const block: ItineraryBlock = {
      id: newItinerayId(),
      type: "toggle",
      value: "",
      checked: false,
    };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addDivider = () => {
    const block: ItineraryBlock = { id: newItinerayId(), type: "divider" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addLocation = (location: LocationItemWithAddress) => {
    if (!canEdit || location.latitude == null || location.longitude == null)
      return;
    const block: ItineraryBlock = {
      id: newItinerayId(),
      type: "location",
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.locationName,
      address: location.address,
    };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const saveLocation = (location: LocationItemWithAddress) => {
    if (!canEdit || location.latitude == null || location.longitude == null)
      return;
    if (locationEditBlockId) {
      updateBlock(locationEditBlockId, {
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.locationName,
        address: location.address,
      });
      return;
    }
    addLocation(location);
  };

  const closeLocationPicker = () => {
    setLocationVisible(false);
    setLocationEditBlockId(null);
  };

  const editLocation = (block: LocationBlockData) => {
    setLocationEditBlockId(block.id);
    setLocationVisible(true);
  };

  const deleteFocused = () => {
    if (!canEdit || !focusedId) return;
    setContent((current) => current.filter((block) => block.id !== focusedId));
    if (composerId === focusedId) setComposerId(null);
    setFocusedId(null);
  };

  const startComposer = () => {
    if (!canEdit) return null;
    if (composerId) return composerId;
    const block: TextBlock = { id: newItinerayId(), type: "text", value: "" };
    setContent((current) => [...current, block]);
    setComposerId(block.id);
    setFocusedId(block.id);
    return block.id;
  };

  const updateComposer = (value: string) => {
    if (!canEdit) return;
    if (composerId) {
      updateBlock(composerId, { value });
      return;
    }
    const block: TextBlock = { id: newItinerayId(), type: "text", value };
    setContent((current) => [...current, block]);
    setComposerId(block.id);
    setFocusedId(block.id);
  };

  const finishComposer = () => {
    if (!canEdit) return;
    const composer = content.find(
      (block): block is TextBlock => block.id === composerId && block.type === "text"
    );
    if (composerId && !composer?.value) {
      setContent((current) => current.filter((block) => block.id !== composerId));
      setFocusedId(null);
    }
    setComposerId(null);
  };

  const updateBlockHeight = (id: string, height: number) => {
    setBlockHeights((current) => ({ ...current, [id]: Math.max(30, height) }));
  };

  const renderBlock = ({ item: block, drag, isActive }: {
    item: ItineraryBlock;
    drag: () => void;
    isActive: boolean;
  }) => {
    const focus = () => canEdit && setFocusedId(block.id);
    const beginDrag = () => {
      if (!canEdit) return;
      focus();
      drag();
    };
    return (
      <View
        style={[
          styles.blockRow,
          block.type === "divider" && styles.dividerRow,
          isActive && {opacity: .75},
        ]}
      >
        {canEdit && (
          <View
            style={
              focusedId === block.id
                ? [styles.dragHandle, { backgroundColor: `${themeColor}30` }]
                : styles.hiddenDragHandle
            }
          >
            <TouchableOpacity
              onPressIn={beginDrag}
              accessibilityLabel="Reorder block"
            >
              <TIcon name="drag-vertical-variant" size={18} color="#fff8" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.block}>
          {block.type === "text" && (
            <Pressable
              onLongPress={canEdit ? beginDrag : undefined}
              delayLongPress={350}
            >
              <TextInput
                value={block.value}
                onChangeText={(value) => updateBlock(block.id, { value })}
                placeholder={t('itinerary.form.text_block')}
                placeholderTextColor="#999"
                multiline
                editable={canEdit}
                onFocus={focus}
                style={[
                  styles.textBlock,
                  { height: blockHeights[block.id] || 30, color: textColor },
                ]}
                onContentSizeChange={(event) =>
                  updateBlockHeight(
                    block.id,
                    event.nativeEvent.contentSize.height,
                  )
                }
              />
            </Pressable>
          )}
          {(block.type === "header1" ||
            block.type === "header2" ||
            block.type === "header3") && (
            <HeadingBlock
              block={block}
              onChange={(value) => updateBlock(block.id, { value })}
              onPress={focus}
              onLongPress={beginDrag}
              onContentSizeChange={(height) => updateBlockHeight(block.id, height)}
              editable={canEdit}
            />
          )}
          {block.type === "location" && (
            <LocationBlock
              block={block}
              onPress={focus}
              onMapPress={() =>
                router.push({
                  pathname: "/place",
                  params: {
                    id: block.id,
                    address: JSON.stringify(block.address),
                    latitude: String(block.latitude),
                    longitude: String(block.longitude),
                    locationName: block.locationName,
                  },
                })
              }
              onEditPress={() => editLocation(block)}
              onLongPress={beginDrag}
              editable={canEdit}
              themeColor={themeColor}
            />
          )}
          {block.type === "toggle" && (
            <ChecklistBlock
              block={block}
              onChange={
                canEdit
                  ? (changes) => updateBlock(block.id, changes)
                  : undefined
              }
              onPress={focus}
              onLongPress={beginDrag}
              onContentSizeChange={(height) => updateBlockHeight(block.id, height + 10)}
              editable={canEdit}
            />
          )}
          {block.type === "divider" && (
            <Pressable
              onPress={focus}
              onLongPress={canEdit ? beginDrag : undefined}
            >
              <View style={styles.dividerLine} />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const lastBlock = content[content.length - 1];
  const showComposer = canEdit && (!lastBlock || lastBlock.type !== "text" || Boolean(composerId));
  const visibleContent = composerId ? content.filter((block) => block.id !== composerId) : content;
  const editingLocation = content.find(
    (block): block is LocationBlockData =>
      block.id === locationEditBlockId && block.type === "location",
  );
  const submit = () => {
    if (!createMode) {
      itineraryUpdate.save();
      return;
    }

    onSubmit?.({
      title,
      startDate,
      endDate,
      type: ITINERARY_TYPES.find((option) => option.value === type)?.value ?? type,
      themeColor,
      content,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ backgroundColor, flex: 1 }}
      behavior="padding"
    >
      <View
        style={{ flex: 1 }}
        onStartShouldSetResponderCapture={() => {
          if (canEdit && focusedId) setFocusedId(null);
          return false;
        }}
      >
        <StickyScrollView
          title={title ? title : "Unnamed Itinerary"}
          subtitle={(!startDate || !endDate) ? "No Date Yet" : formatDateToString(startDate) + " - " + formatDateToString(endDate)}
        >
          <DraggableFlatList
            data={visibleContent}
            keyExtractor={(item) => item.id}
            renderItem={renderBlock}
            onDragEnd={({ data }) =>
              canEdit &&
              setContent(
                composerId
                  ? [...data, content.find((block) => block.id === composerId)!]
                  : data,
              )
            }
            ListHeaderComponent={
              <ItineraryHeader
                itineraryId={itineraryId}
                ownerUsername={ownerUsername}
                title={title}
                onTitleChange={setTitle}
                type={type}
                onTypeChange={setType}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                privacy={privacy}
                onPrivacyChange={setPrivacy}
                generalPermissions={generalPermissions}
                onGeneralPermissionsChange={(key, value) =>
                  setGeneralPermissions((current) => ({ ...current, [key]: value }))
                }
                status={status}
                onStatusChange={itineraryStatus.updateStatus}
                onRepeatItinerary={onRepeatItinerary}
                isUpdatingStatus={itineraryStatus.isPending}
                themeColor={themeColor}
                onThemeColorPress={
                  canEdit ? () => setColorBarVisible(true) : undefined
                }
                editable={canEdit}
                createMode={createMode}
                viewType={viewType}
                style={{marginBottom: 10}}
              />
            }
            ListFooterComponent={
              showComposer ? (
                <View
                  style={styles.footer}
                  onTouchStart={() => setFocusedId(null)}
                >
                  <TextInput
                    value={
                      composerId
                        ? content.find(
                            (block): block is TextBlock => block.id === composerId && block.type === "text")?.value
                        : ""
                    }
                    multiline
                    autoFocus={!content.length}
                    editable={canEdit}
                    style={[
                      styles.textBlock,
                      {
                        height: composerId ? blockHeights[composerId] || 30 : 30,
                        color: textColor,
                        marginHorizontal: '3%'
                      },
                    ]}
                    onFocus={startComposer}
                    onChangeText={updateComposer}
                    onContentSizeChange={(event) =>
                      composerId &&
                      updateBlockHeight(
                        composerId,
                        event.nativeEvent.contentSize.height,
                      )
                    }
                    onBlur={finishComposer}
                  />
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            activationDistance={canEdit ? 8 : 100000}
          />
        </StickyScrollView>
      </View>
      {canEdit && colorBarVisible && (
        <Pressable
          style={styles.colorBarDismissArea}
          onPress={() => setColorBarVisible(false)}
        />
      )}
      {canEdit && (
        <LinearGradient
          style={[
            styles.bottomButtons,
            colorBarVisible && styles.colorBarLayer,
          ]}
          colors={["transparent", backgroundColor]}
        >
          {isRemoteUpdateNoticeVisible && updateNotice && (
            <Animated.View
              accessibilityLiveRegion="polite"
              pointerEvents="none"
              style={[styles.remoteUpdateNoticeContainer, { opacity: noticeOpacity }]}
            >
              <TView color="primary" borderRadius={18} style={styles.remoteUpdateNotice}>
                <TIcon name="account-sync-outline" size={16} color="#FFFFFF" />
                <TText style={styles.remoteUpdateNoticeText} numberOfLines={1}>
                  {updateNotice.actorName === "You"
                    ? "You updated this itinerary"
                    : `${updateNotice.actorName} updated this itinerary`}
                </TText>
              </TView>
            </Animated.View>
          )}
          <View style={styles.bottomBarRow}>
            {colorBarVisible ? (
              <ColorBar
                primaryColor={primaryColor}
                selectedColor={themeColor}
                onSelect={setThemeColor}
              />
            ) : focusedId ? (
              <FocusBar
                primaryColor={primaryColor}
                onDone={() => setFocusedId(null)}
                onDelete={deleteFocused}
              />
            ) : (
              <Toolbar
                primaryColor={primaryColor}
                onText={addText}
                onHeading={addHeading}
                onLocation={() => {
                  setLocationEditBlockId(null);
                  setLocationVisible(true);
                }}
                onChecklist={addChecklist}
                onDivider={addDivider}
              />
            )}
            <RoundButton
              iconName={createMode ? "check" : "content-save"}
              onPress={submit}
              disabled={createMode ? isSubmitting : isSubmitting || itineraryUpdate.isPending || !itineraryUpdate.hasChanges}
              loading={isSubmitting || itineraryUpdate.isPending}
              style={{ width: 44, height: 44, backgroundColor: themeColor }}
            />
          </View>
        </LinearGradient>
      )}
      {canEdit && (
        <LocationPickerModal
          visible={locationVisible}
          onClose={closeLocationPicker}
          onAddLocation={saveLocation}
          isEditingLocation={locationEditBlockId !== null}
          initialLocation={editingLocation ? { ...editingLocation, note: "" } : undefined}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: { 
    paddingBottom: 140, 
  },
  blockRow: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    marginBottom: 16,
  },
  block: { 
    flex: 1,
    marginHorizontal: '3%'
  },
  dragHandle: {
    width: 10,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  hiddenDragHandle: { 
    width: 0, 
    opacity: 0, 
    overflow: "hidden" 
  },
  footer: { 
    gap: 16, 
    flexGrow: 1, 
    minHeight: 220 
  },
  textBlock: { 
    minHeight: 30, 
    padding: 0, 
    fontFamily: "PlusJakartaSans", 
    fontSize: 13 
  },
  dividerRow: { 
    marginBottom: 4 
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#999",
    width: "100%",
    marginVertical: 4,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    padding: "3%",
    paddingTop: 50,
  },
  bottomBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  remoteUpdateNoticeContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  remoteUpdateNotice: {
    maxWidth: "90%",
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 6,
  },
  remoteUpdateNoticeText: {
    color: "#FFFFFF",
    fontSize: 12,
    flexShrink: 1,
  },
  colorBarDismissArea: { 
    ...StyleSheet.absoluteFillObject, zIndex: 20 }
  ,
  colorBarLayer: { 
    zIndex: 30 
  },
});
