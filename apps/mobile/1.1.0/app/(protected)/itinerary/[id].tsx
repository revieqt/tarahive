import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
  createContext,
} from "react";
import { View, StyleSheet, TextInput, Animated, TouchableOpacity, ScrollView } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
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
import { useGetItinerary } from "@/features/itinerary/hooks/useGetItinerary";

// NOTE: this screen requires `react-native-gesture-handler` and
// `react-native-reanimated` to be installed, and the app root
// (usually app/_layout.tsx) must be wrapped once in
// `<GestureHandlerRootView style={{ flex: 1 }}>`. Both packages are almost
// certainly already present if expo-router / react-navigation is in use.
// `react-native-reanimated/plugin` must also be the LAST plugin in
// babel.config.js.

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
type ToolType = 'header' | 'toggle' | 'divider' | 'location';

// ── Block helpers ──────────────────────────────────────────────────────────

let blockIdCounter = 0;
function generateBlockId(): number {
  blockIdCounter += 1;
  return Date.now() + blockIdCounter;
}

function makeEmptyTextBlock(): TextBlock {
  return { id: generateBlockId(), type: 'text', value: '' };
}

function makeBlockOfType(type: ToolType): Block {
  switch (type) {
    case 'toggle':
      return { id: generateBlockId(), type: 'toggle', value: '', checked: false };
    case 'header':
      return { id: generateBlockId(), type: 'header', value: '' };
    case 'divider':
      return { id: generateBlockId(), type: 'divider' };
    case 'location':
      // Locations are created only after the picker modal confirms
      // (see handleLocationConfirm); this branch shouldn't be hit directly.
      return { id: generateBlockId(), type: 'location', latitude: 0, longitude: 0, locationName: '', address: {} };
  }
}

const TOOL_ICONS: Record<ToolType, string> = {
  location: 'map-marker-plus',
  toggle: 'checkbox-marked',
  header: 'format-bold',
  divider: 'percent-outline',
};
const TOOL_LABELS: Record<ToolType, string> = {
  location: 'Location',
  toggle: 'Checklist',
  header: 'Header',
  divider: 'Divider',
};

// The trailing block is just a normal text block that happens to sit last —
// it's a placeholder to type into, not a locked entity. This only makes sure
// one always exists at the very bottom; it never repositions existing content.
function ensureTrailingPlaceholder(list: Block[]): Block[] {
  if (list.length === 0 || list[list.length - 1].type !== 'text') {
    return [...list, makeEmptyTextBlock()];
  }
  return list;
}

function parseContent(raw: any): Block[] {
  if (!raw) return [makeEmptyTextBlock()];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return ensureTrailingPlaceholder(parsed as Block[]);
    }
  } catch {
    // fall through to default below
  }
  return [makeEmptyTextBlock()];
}

// ── Shared drag context ─────────────────────────────────────────────────────
// One set of shared values powers every row's reorder animation, so a single
// dragged row can compute & broadcast "make room" offsets for its siblings
// without round-tripping through React state on every frame.

interface DragContextValue {
  heightsRef: React.MutableRefObject<Record<number, number>>;
  heightsShared: SharedValue<Record<number, number>>;
  orderShared: SharedValue<number[]>;
  offsets: SharedValue<Record<number, number>>;
  draggingId: SharedValue<number | null>;
  draggingTranslateY: SharedValue<number>;
  pendingTargetIndex: SharedValue<number>;
}

const BlockDragContext = createContext<DragContextValue | null>(null);

// ── Draggable / editable row ─────────────────────────────────────────────────

interface BlockRowProps {
  block: Block;
  editable: boolean;
  onDelete: (id: number) => void;
  onDragActiveChange: (active: boolean) => void;
  onCommitReorder: (id: number, targetIndex: number) => void;
  children: React.ReactNode;
}

function BlockRow({ block, editable, onDelete, onDragActiveChange, onCommitReorder, children }: BlockRowProps) {
  const ctx = useContext(BlockDragContext)!;
  const { heightsRef, heightsShared, orderShared, offsets, draggingId, draggingTranslateY, pendingTargetIndex } = ctx;

  const animatedStyle = useAnimatedStyle(() => {
    if (draggingId.value === block.id) {
      return {
        transform: [{ translateY: draggingTranslateY.value }, { scale: 1.02 }],
        zIndex: 50,
        elevation: 6,
        shadowOpacity: 0.15,
        shadowRadius: 8,
      };
    }
    return {
      transform: [{ translateY: withTiming(offsets.value[block.id] ?? 0, { duration: 180 }) }],
      zIndex: 0,
      elevation: 0,
      shadowOpacity: 0,
    };
  });

  // Long-press (350ms) arms the drag; a normal tap/scroll passes straight
  // through to whatever's inside (TextInput, checkbox, location card, etc).
  // No separate grip handle needed.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(editable)
        .activateAfterLongPress(350)
        .onStart(() => {
          'worklet';
          draggingId.value = block.id;
          runOnJS(onDragActiveChange)(true);
        })
        .onUpdate((e) => {
          'worklet';
          draggingTranslateY.value = e.translationY;

          const order = orderShared.value;
          const heights = heightsShared.value;
          let y = 0;
          const positions: Record<number, number> = {};
          for (const id of order) {
            positions[id] = y;
            y += heights[id] ?? 50;
          }
          const myHeight = heights[block.id] ?? 50;
          const myMid = (positions[block.id] ?? 0) + e.translationY + myHeight / 2;

          const currentIndex = order.indexOf(block.id);
          let targetIndex = currentIndex;
          for (let i = 0; i < order.length; i++) {
            const id = order[i];
            if (id === block.id) continue;
            const top = positions[id];
            const h = heights[id] ?? 50;
            if (myMid > top && myMid < top + h) {
              targetIndex = i;
              break;
            }
          }

          const nextOffsets: Record<number, number> = {};
          for (let i = 0; i < order.length; i++) {
            const id = order[i];
            if (id === block.id) continue;
            if (targetIndex < currentIndex && i >= targetIndex && i < currentIndex) {
              nextOffsets[id] = myHeight;
            } else if (targetIndex > currentIndex && i > currentIndex && i <= targetIndex) {
              nextOffsets[id] = -myHeight;
            } else {
              nextOffsets[id] = 0;
            }
          }
          offsets.value = nextOffsets;
          pendingTargetIndex.value = targetIndex;
        })
        .onEnd(() => {
          'worklet';
          runOnJS(onCommitReorder)(block.id, pendingTargetIndex.value);
        }),
    [block.id, editable]
  );

  const showDeleteButton = editable && (block.type === 'location' || block.type === 'toggle');

  return (
    <GestureDetector gesture={pan}>
      <ReAnimated.View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          heightsRef.current[block.id] = h;
          heightsShared.value = { ...heightsShared.value, [block.id]: h };
        }}
        style={[styles.blockRow, animatedStyle]}
      >
        <View style={{ flex: 1 }}>{children}</View>
        {showDeleteButton && (
          <TouchableOpacity
            onPress={() => onDelete(block.id)}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TIcon name="trash-can-outline" size={16} />
          </TouchableOpacity>
        )}
      </ReAnimated.View>
    </GestureDetector>
  );
}

// ── Toolbar tool button (tap OR drag-and-drop into the list) ───────────────

interface ToolButtonProps {
  type: ToolType;
  backgroundColor: string;
  onTap: (type: ToolType) => void;
  onDragTouchStart: (type: ToolType, x: number, y: number) => void;
  onDragUpdate: (type: ToolType, x: number, y: number, dx: number, dy: number) => void;
  onDragEnd: (type: ToolType, y: number, dx: number, dy: number) => void;
}

function ToolButton({ type, backgroundColor, onTap, onDragTouchStart, onDragUpdate, onDragEnd }: ToolButtonProps) {
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart((e) => {
          'worklet';
          runOnJS(onDragTouchStart)(type, e.absoluteX, e.absoluteY);
        })
        .onUpdate((e) => {
          'worklet';
          runOnJS(onDragUpdate)(type, e.absoluteX, e.absoluteY, e.translationX, e.translationY);
        })
        .onEnd((e) => {
          'worklet';
          runOnJS(onDragEnd)(type, e.absoluteY, e.translationX, e.translationY);
        }),
    [type]
  );

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.tool, { backgroundColor }]}>
        <TIcon name={TOOL_ICONS[type]} size={25} />
        <View>
          <TText>{TOOL_LABELS[type]}</TText>
        </View>
      </View>
    </GestureDetector>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

export default function ItineraryCreateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const routeId = Array.isArray(id) ? id[0] : id;
  const isCreateMode = routeId === 'new';
  const { t , currentLanguage } = useLanguage();

  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const COLLAPSED_HEIGHT = 90;
  const EXPANDED_HEIGHT = 165;

  const { create, isPending } = useCreateItinerary();
  const { itinerary, isLoading, error } = useGetItinerary(isCreateMode ? null : routeId || null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [privacy, setPrivacy] = useState<'private' | 'collaborators' | 'public'>('private');
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  // ── Content blocks ─────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<Block[]>(() => [makeEmptyTextBlock()]);
  const blocksRef = useRef<Block[]>(blocks);

  const heightsRef = useRef<Record<number, number>>({});
  const heightsShared = useSharedValue<Record<number, number>>({});
  const orderShared = useSharedValue<number[]>(blocks.map((b) => b.id));
  const offsets = useSharedValue<Record<number, number>>({});
  const draggingId = useSharedValue<number | null>(null);
  const draggingTranslateY = useSharedValue(0);
  const pendingTargetIndex = useSharedValue(0);

  const dragContextValue = useMemo<DragContextValue>(
    () => ({ heightsRef, heightsShared, orderShared, offsets, draggingId, draggingTranslateY, pendingTargetIndex }),
    []
  );

  useEffect(() => {
    blocksRef.current = blocks;
    orderShared.value = blocks.map((b) => b.id);
  }, [blocks]);

  const [contentScrollEnabled, setContentScrollEnabled] = useState(true);
  const handleDragActiveChange = useCallback((active: boolean) => setContentScrollEnabled(!active), []);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [editingLocationBlockId, setEditingLocationBlockId] = useState<number | null>(null);
  const pendingInsertIndexRef = useRef<number | null>(null);

  // Backspace-twice-on-empty deletes the block (text / header / checklist).
  const backspaceCounts = useRef<Record<number, number>>({});

  // Toolbar drag-into-list state
  const contentWrapperRef = useRef<View>(null);
  const containerTopRef = useRef(0);
  const scrollYRef = useRef(0);
  const dragArmedRef = useRef(false);
  const lastHoverIndexRef = useRef<number | null>(null);
  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const [draggedToolType, setDraggedToolType] = useState<ToolType | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isCreateMode) {
      setTitle('');
      setType('');
      setStartDate(null);
      setEndDate(null);
      setPrivacy('private');
      setBlocks([makeEmptyTextBlock()]);
      return;
    }

    if (!itinerary) return;

    setTitle(itinerary.title || '');
    setType(itinerary.type || '');
    setStartDate(itinerary.startDate ? new Date(itinerary.startDate) : null);
    setEndDate(itinerary.endDate ? new Date(itinerary.endDate) : null);
    setPrivacy(itinerary.privacy || 'private');
    setBlocks(parseContent(itinerary.content));
  }, [isCreateMode, itinerary]);

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

  // ── Block mutation helpers ───────────────────────────────────────────────

  // Used for reorder commits, drag-drop-at-index, and backspace deletes:
  // splices at an explicit index / filters by id, then re-guarantees the
  // trailing placeholder — never re-derives position from a block's id.
  const insertAt = useCallback((newBlock: Block, index: number) => {
    setBlocks((prev) => {
      const clamped = Math.max(0, Math.min(index, prev.length));
      const next = [...prev];
      next.splice(clamped, 0, newBlock);
      return ensureTrailingPlaceholder(next);
    });
  }, []);

  // Used for toolbar taps: appends after whatever's already been typed in
  // the trailing block (preserving it in place), replacing it only if it
  // was still an untouched empty placeholder, then adds a fresh one after.
  const appendSmart = useCallback((newBlock: Block) => {
    setBlocks((prev) => {
      const last = prev[prev.length - 1];
      const base = last && last.type === 'text' && !last.value.trim() ? prev.slice(0, -1) : prev;
      return [...base, newBlock, makeEmptyTextBlock()];
    });
  }, []);

  const updateBlock = useCallback((id: number, patch: Record<string, any>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  }, []);

  const deleteBlock = useCallback((id: number) => {
    setBlocks((prev) => ensureTrailingPlaceholder(prev.filter((b) => b.id !== id)));
  }, []);

  const toggleChecked = useCallback((id: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id && b.type === 'toggle' ? { ...b, checked: !b.checked } : b))
    );
  }, []);

  const handleBackspaceKey = useCallback(
    (id: number, isEmpty: boolean) => {
      if (!isEmpty) {
        backspaceCounts.current[id] = 0;
        return;
      }
      const next = (backspaceCounts.current[id] ?? 0) + 1;
      backspaceCounts.current[id] = next;
      if (next >= 2) {
        backspaceCounts.current[id] = 0;
        deleteBlock(id);
      }
    },
    [deleteBlock]
  );

  const handleCommitReorder = useCallback((id: number, targetIndex: number) => {
    setBlocks((prev) => {
      const currentIndex = prev.findIndex((b) => b.id === id);
      if (currentIndex === -1 || currentIndex === targetIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(Math.min(targetIndex, next.length), 0, moved);
      return ensureTrailingPlaceholder(next);
    });
    offsets.value = {};
    draggingId.value = null;
    draggingTranslateY.value = 0;
    setContentScrollEnabled(true);
  }, []);

  const computeDropIndexJS = useCallback((relativeY: number) => {
    const list = blocksRef.current;
    let y = 0;
    for (let i = 0; i < list.length; i++) {
      const h = heightsRef.current[list[i].id] ?? 50;
      if (relativeY < y + h / 2) return i;
      y += h;
    }
    return list.length;
  }, []);

  const handleToolTap = useCallback(
    (toolType: ToolType) => {
      if (toolType === 'location') {
        pendingInsertIndexRef.current = null;
        setEditingLocationBlockId(null);
        setLocationModalVisible(true);
        return;
      }
      appendSmart(makeBlockOfType(toolType));
    },
    [appendSmart]
  );

  const handleToolDragTouchStart = useCallback((toolType: ToolType, x: number, y: number) => {
    dragArmedRef.current = false;
    ghostX.value = x;
    ghostY.value = y;
    contentWrapperRef.current?.measureInWindow((mx, my) => {
      containerTopRef.current = my;
    });
  }, []);

  const handleToolDragUpdate = useCallback((toolType: ToolType, x: number, y: number, dx: number, dy: number) => {
    ghostX.value = x;
    ghostY.value = y;
    if (!dragArmedRef.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dragArmedRef.current = true;
      setDraggedToolType(toolType);
    }
    if (dragArmedRef.current) {
      const relativeY = y - containerTopRef.current + scrollYRef.current;
      const idx = computeDropIndexJS(relativeY);
      if (lastHoverIndexRef.current !== idx) {
        lastHoverIndexRef.current = idx;
        setHoverIndex(idx);
      }
    }
  }, [computeDropIndexJS]);

  const handleToolDragEnd = useCallback((toolType: ToolType, y: number, dx: number, dy: number) => {
    if (dragArmedRef.current) {
      const relativeY = y - containerTopRef.current + scrollYRef.current;
      const idx = computeDropIndexJS(relativeY);
      if (toolType === 'location') {
        pendingInsertIndexRef.current = idx;
        setEditingLocationBlockId(null);
        setLocationModalVisible(true);
      } else {
        insertAt(makeBlockOfType(toolType), idx);
      }
    } else {
      handleToolTap(toolType);
    }
    setDraggedToolType(null);
    setHoverIndex(null);
    lastHoverIndexRef.current = null;
    dragArmedRef.current = false;
  }, [computeDropIndexJS, insertAt, handleToolTap]);

  const editingLocationBlock = blocks.find(
    (b): b is LocationBlock => b.id === editingLocationBlockId && b.type === 'location'
  );

  const handleLocationConfirm = (loc: LocationItemWithAddress) => {
    if (editingLocationBlockId) {
      updateBlock(editingLocationBlockId, {
        locationName: loc.locationName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      });
    } else {
      const locationBlock: LocationBlock = {
        id: generateBlockId(),
        type: 'location',
        locationName: loc.locationName ?? '',
        latitude: loc.latitude ?? 0,
        longitude: loc.longitude ?? 0,
        address: loc.address ?? {},
      };
      if (pendingInsertIndexRef.current !== null) {
        insertAt(locationBlock, pendingInsertIndexRef.current);
      } else {
        appendSmart(locationBlock);
      }
    }
    setEditingLocationBlockId(null);
    pendingInsertIndexRef.current = null;
  };

  const handleCreate = useCallback(() => {
    create({
      title,
      type,
      startDate: startDate!,
      endDate: endDate!,
      privacy,
      content: JSON.stringify(blocks),
    });
  }, [create, title, type, startDate, endDate, privacy, blocks]);

  const isOwner = true;
  const isEditor = true;
  const isViewer = !isOwner || !isEditor;
  const isPrivate = true;
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

  // ── Per-block content renderer ───────────────────────────────────────────

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'text':
      case 'header':
        return (
          <TextInput
            value={block.value}
            onChangeText={(v) => updateBlock(block.id, { value: v })}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                handleBackspaceKey(block.id, block.value.length === 0);
              } else {
                backspaceCounts.current[block.id] = 0;
              }
            }}
            placeholder={block.type === 'header' ? 'Header' : 'Type something…'}
            placeholderTextColor="#ccc8"
            multiline
            editable={!isViewer}
            style={[
              styles.blockText,
              block.type === 'header' && styles.blockHeaderText,
              { color: textColor },
            ]}
          />
        );
      case 'toggle':
        return (
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => toggleChecked(block.id)} disabled={isViewer}>
              <TIcon name={block.checked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} />
            </TouchableOpacity>
            <TextInput
              value={block.value}
              onChangeText={(v) => updateBlock(block.id, { value: v })}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspaceKey(block.id, block.value.length === 0);
                } else {
                  backspaceCounts.current[block.id] = 0;
                }
              }}
              placeholder="Checklist item"
              placeholderTextColor="#ccc8"
              editable={!isViewer}
              style={[
                styles.blockText,
                {
                  flex: 1,
                  color: textColor,
                  textDecorationLine: block.checked ? 'line-through' : 'none',
                  opacity: block.checked ? 0.5 : 1,
                },
              ]}
            />
          </View>
        );
      case 'location':
        return (
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => {
              if (isViewer) return;
              setEditingLocationBlockId(block.id);
              setLocationModalVisible(true);
            }}
            disabled={isViewer}
          >
            <TIcon name="map-marker" size={20} color={accentColor} />
            <View style={{ flex: 1 }}>
              <TText style={{ fontWeight: 'bold' }}>{block.locationName || 'Untitled location'}</TText>
              <TText style={{ fontSize: 12, opacity: 0.6 }}>
                {[block.address?.city, block.address?.region, block.address?.country]
                  .filter(Boolean)
                  .join(', ')}
              </TText>
            </View>
          </TouchableOpacity>
        );
      case 'divider':
        return <View style={styles.dividerLine} />;
      default:
        return null;
    }
  };

  const ghostStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ghostX.value - 40 }, { translateY: ghostY.value - 24 }],
  }));

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
            editable={!isViewer}
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

      <View style={{ flex: 1 }} ref={contentWrapperRef}>
        <ScrollView
          scrollEnabled={contentScrollEnabled}
          onScroll={(e) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <BlockDragContext.Provider value={dragContextValue}>
            {blocks.map((block, idx) => (
              <React.Fragment key={block.id}>
                {hoverIndex === idx && <View style={[styles.insertionLine, { backgroundColor: accentColor }]} />}
                <BlockRow
                  block={block}
                  editable={!isViewer}
                  onDelete={deleteBlock}
                  onDragActiveChange={handleDragActiveChange}
                  onCommitReorder={handleCommitReorder}
                >
                  {renderBlockContent(block)}
                </BlockRow>
              </React.Fragment>
            ))}
          </BlockDragContext.Provider>
          {hoverIndex === blocks.length && <View style={[styles.insertionLine, { backgroundColor: accentColor }]} />}
        </ScrollView>
      </View>

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
              <ToolButton
                type="location"
                backgroundColor={backgroundColor}
                onTap={handleToolTap}
                onDragTouchStart={handleToolDragTouchStart}
                onDragUpdate={handleToolDragUpdate}
                onDragEnd={handleToolDragEnd}
              />
              <ToolButton
                type="toggle"
                backgroundColor={backgroundColor}
                onTap={handleToolTap}
                onDragTouchStart={handleToolDragTouchStart}
                onDragUpdate={handleToolDragUpdate}
                onDragEnd={handleToolDragEnd}
              />
              <ToolButton
                type="header"
                backgroundColor={backgroundColor}
                onTap={handleToolTap}
                onDragTouchStart={handleToolDragTouchStart}
                onDragUpdate={handleToolDragUpdate}
                onDragEnd={handleToolDragEnd}
              />
              <ToolButton
                type="divider"
                backgroundColor={backgroundColor}
                onTap={handleToolTap}
                onDragTouchStart={handleToolDragTouchStart}
                onDragUpdate={handleToolDragUpdate}
                onDragEnd={handleToolDragEnd}
              />
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

      {draggedToolType && (
        <ReAnimated.View pointerEvents="none" style={[styles.ghost, ghostStyle, { backgroundColor }]}>
          <TIcon name={TOOL_ICONS[draggedToolType]} size={18} />
          <TText style={{ fontSize: 12 }}>{TOOL_LABELS[draggedToolType]}</TText>
        </ReAnimated.View>
      )}

      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => {
          setLocationModalVisible(false);
          setEditingLocationBlockId(null);
          pendingInsertIndexRef.current = null;
        }}
        onAddLocation={handleLocationConfirm}
        isEditingLocation={!!editingLocationBlock}
        initialLocation={
          editingLocationBlock
            ? ({
                locationName: editingLocationBlock.locationName,
                latitude: editingLocationBlock.latitude,
                longitude: editingLocationBlock.longitude,
                address: editingLocationBlock.address,
              } as LocationItemWithAddress)
            : undefined
        }
      />
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
  contentContainer: {
    padding: 16,
    paddingBottom: 160,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  deleteBtn: {
    paddingTop: 10,
    paddingHorizontal: 2,
    opacity: 0.5,
  },
  blockText: {
    fontFamily: 'Inter',
    fontSize: 15,
    paddingVertical: 6,
  },
  blockHeaderText: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  dividerLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc4',
    marginVertical: 6,
  },
  insertionLine: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    marginVertical: 4,
  },
  ghost: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc4',
    opacity: 0.9,
    zIndex: 999,
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