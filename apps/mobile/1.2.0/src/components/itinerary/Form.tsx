import React, { useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DraggableFlatList from "react-native-draggable-flatlist";
import { TIcon, TText } from "@/components/ui/Themed";
import BackButton from "@/components/common/BackButton";
import LocationPickerModal, { LocationItemWithAddress } from "@/components/modals/LocationPickerModal";
import HeadingBlock from "@/components/itinerary/HeadingBlock";
import LocationBlock from "@/components/itinerary/LocationBlock";
import ChecklistBlock from "@/components/itinerary/ChecklistBlock";
import Toolbar from "@/components/itinerary/Toolbar";
import FocusBar from "@/components/itinerary/FocusBar";
import ColorBar from "@/components/itinerary/ColorBar";
import ItineraryHeader from "@/components/itinerary/Header";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { CreateItineraryForm, ItineraryViewType, HeaderType, ItineraryBlock, TextBlock } from "@/types/itineraryTypes";

type ItineraryFormProps = {
  viewType?: ItineraryViewType;
  initialValues?: Partial<CreateItineraryForm>;
  isSubmitting?: boolean;
  onSubmit?: (values: CreateItineraryForm) => void;
  createMode?: boolean;
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function ItineraryForm({
  viewType = "editor",
  initialValues,
  createMode = false,
  isSubmitting = false,
  onSubmit,
}: ItineraryFormProps) {
  const canEdit = !(viewType === "viewer");
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");
  const accentColor = useThemeColor({}, "accent");
  const textColor = useThemeColor({}, "text");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [startDate, setStartDate] = useState<Date | null>(initialValues?.startDate ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialValues?.endDate ?? null);
  const [type, setType] = useState(initialValues?.type ?? "Solo");
  const [themeColor, setThemeColor] = useState(initialValues?.themeColor ?? accentColor);
  const [colorBarVisible, setColorBarVisible] = useState(false);
  const [content, setContent] = useState<ItineraryBlock[]>((initialValues?.content as ItineraryBlock[] | undefined) ?? [],);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [locationVisible, setLocationVisible] = useState(false);
  const [composerId, setComposerId] = useState<string | null>(null);
  const [blockHeights, setBlockHeights] = useState<Record<string, number>>({});

  const updateBlock = (id: string, changes: Partial<ItineraryBlock>) => {
    if (!canEdit) return;
    setContent((current) =>
      current.map((block) =>
        block.id === id ? ({ ...block, ...changes } as ItineraryBlock) : block,
      ),
    );
  };

  const addText = () => {
    const block: TextBlock = { id: newId(), type: "text", value: "" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addHeading = (blockType: HeaderType) => {
    const block: ItineraryBlock = { id: newId(), type: blockType, value: "" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addChecklist = () => {
    const block: ItineraryBlock = {
      id: newId(),
      type: "toggle",
      value: "",
      checked: false,
    };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addDivider = () => {
    const block: ItineraryBlock = { id: newId(), type: "divider" };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const addLocation = (location: LocationItemWithAddress) => {
    if (!canEdit || location.latitude == null || location.longitude == null)
      return;
    const block: ItineraryBlock = {
      id: newId(),
      type: "location",
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.locationName,
      address: location.address,
    };
    setContent((current) => [...current, block]);
    setFocusedId(block.id);
  };

  const deleteFocused = () => {
    if (!canEdit || !focusedId) return;
    setContent((current) => current.filter((block) => block.id !== focusedId));
    setFocusedId(null);
  };

  const startComposer = () => {
    if (!canEdit) return null;
    if (composerId) return composerId;
    const block: TextBlock = { id: newId(), type: "text", value: "" };
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
    const block: TextBlock = { id: newId(), type: "text", value };
    setContent((current) => [...current, block]);
    setComposerId(block.id);
    setFocusedId(block.id);
  };

  const finishComposer = () => {
    if (!canEdit) return;
    const composer = content.find(
      (block): block is TextBlock =>
        block.id === composerId && block.type === "text",
    );
    if (composerId && !composer?.value) {
      setContent((current) =>
        current.filter((block) => block.id !== composerId),
      );
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
          isActive && styles.activeBlock,
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
                placeholder="Text"
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
              onContentSizeChange={(height) =>
                updateBlockHeight(block.id, height)
              }
              editable={canEdit}
            />
          )}
          {block.type === "location" && (
            <LocationBlock
              block={block}
              onPress={focus}
              onMapPress={
                canEdit
                  ? () =>
                      router.push({
                        pathname:
                          "/itinerary/[id]/location/[location_id]" as any,
                        params: { id: "draft", location_id: block.id },
                      })
                  : undefined
              }
              onLongPress={beginDrag}
              editable={canEdit}
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
              onContentSizeChange={(height) =>
                updateBlockHeight(block.id, height + 10)
              }
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
  const showComposer =
    canEdit && (!lastBlock || lastBlock.type !== "text" || Boolean(composerId));
  const visibleContent = composerId
    ? content.filter((block) => block.id !== composerId)
    : content;
  const submit = () =>
    onSubmit?.({ title, startDate, endDate, type, themeColor, content });

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor }]}
      behavior="padding"
      onStartShouldSetResponderCapture={() => {
        if (canEdit && focusedId) setFocusedId(null);
        return false;
      }}
    >
      <LinearGradient
        style={styles.topButtons}
        colors={[backgroundColor, "transparent"]}
        onTouchStart={() => canEdit && setFocusedId(null)}
      >
        <BackButton
          style={[
            styles.backButton,
            styles.shadow,
            { backgroundColor: primaryColor },
          ]}
        />
        {canEdit && (
          <TouchableOpacity
            style={[
              styles.doneButton,
              styles.shadow,
              { backgroundColor: themeColor },
            ]}
            onPress={submit}
            disabled={isSubmitting}
          >
            <TIcon name="check" size={16} color="#fff" />
            <TText style={styles.white}>Done</TText>
          </TouchableOpacity>
        )}
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
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
              title={title}
              onTitleChange={setTitle}
              type={type}
              onTypeChange={setType}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              themeColor={themeColor}
              onThemeColorPress={
                canEdit ? () => setColorBarVisible(true) : undefined
              }
              editable={canEdit}
              createMode={createMode}
              viewType={viewType}
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
                          (block): block is TextBlock =>
                            block.id === composerId && block.type === "text",
                        )?.value
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
      </ScrollView>
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
              onLocation={() => setLocationVisible(true)}
              onChecklist={addChecklist}
              onDivider={addDivider}
            />
          )}
        </LinearGradient>
      )}
      {canEdit && (
        <LocationPickerModal
          visible={locationVisible}
          onClose={() => setLocationVisible(false)}
          onAddLocation={addLocation}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topButtons: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    flexDirection: "row",
    padding: "3%",
    paddingLeft: 16,
    paddingBottom: 15,
    justifyContent: "space-between",
  },
  backButton: { borderRadius: 20, padding: 3 },
  doneButton: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  white: { color: "#fff" },
  listContent: { paddingBottom: 140, paddingHorizontal: "3%" },
  blockRow: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    marginBottom: 16,
  },
  block: { flex: 1 },
  dragHandle: {
    width: 10,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  hiddenDragHandle: { width: 0, opacity: 0, overflow: "hidden" },
  activeBlock: { opacity: 0.75 },
  footer: { gap: 16, flexGrow: 1, minHeight: 220 },
  textBlock: { minHeight: 30, padding: 0, fontFamily: "Inter", fontSize: 13 },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dividerRow: { marginBottom: 4 },
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
  colorBarDismissArea: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  colorBarLayer: { zIndex: 30 },
});
