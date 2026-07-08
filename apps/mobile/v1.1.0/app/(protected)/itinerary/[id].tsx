import OptionsPopup from '@/shared/components/ui/OptionsPopup';
import { TIcon, TText, TView } from '@/shared/components/ui/Themed';
import BackButton from '@/shared/components/common/BackButton';
import { useLocation } from '@/shared/context/LocationContext';
import { usePlaceWeather } from '@/shared/hooks/useWeather';
import { useSession } from '@/features/auth/context/SessionContext';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Alert, StyleSheet, TouchableOpacity, View,
  Linking, ScrollView, Platform,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/shared/services/dialog.service';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateToString } from '@/shared/utils/formatDateToString';
import LocationDisplay from '@/shared/components/common/LocationDisplay';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { Address } from '@/features/itinerary/types/itineraryTypes';
import { useGetItinerary } from '@/features/itinerary/hooks/useGetItinerary';
import { useDeleteItinerary } from '@/features/itinerary/hooks/useDeleteItinerary';
import EmptyMessage from '@/shared/components/common/EmptyMessage';
import WeatherDisplay from '@/shared/components/common/WeatherDisplay';
import HiveBg from '@/shared/components/common/HiveBg';

// ─── Content parser ───────────────────────────────────────────────────────────

type ParsedTextBlock = { id: string; type: 'text'; value: string };
type ParsedToggleBlock = { id: string; type: 'toggle'; value: string; checked: boolean };
type ParsedLocationBlock = {
  id: string; type: 'location';
  latitude: number; longitude: number;
  locationName: string; address: Address;
};
type ParsedBlock = ParsedTextBlock | ParsedToggleBlock | ParsedLocationBlock;

function parseContent(content: string): ParsedBlock[] {
  if (!content) return [];

  const blocks: ParsedBlock[] = [];
  let remaining = content;
  let idx = 0;

  while (remaining.length > 0) {
    // Try toggle: $tg[id].[bool]$ {value} /$tg$
    const tgMatch = remaining.match(/^\$tg\[([^\]]+)\]\.\[(true|false)\]\$\s*\{([\s\S]*?)\}\s*\/\$tg\$/);
    if (tgMatch) {
      blocks.push({
        id: tgMatch[1],
        type: 'toggle',
        value: tgMatch[3],
        checked: tgMatch[2] === 'true',
      });
      remaining = remaining.slice(tgMatch[0].length).replace(/^\n/, '');
      continue;
    }

    // Try location: $l[id]$ {json} /$l$
    const lMatch = remaining.match(/^\$l\[([^\]]+)\]\$\s*\{([\s\S]*?)\}\s*\/\$l\$/);
    if (lMatch) {
      try {
        const payload = JSON.parse(lMatch[2]);
        blocks.push({
          id: lMatch[1],
          type: 'location',
          latitude: payload.latitude,
          longitude: payload.longitude,
          locationName: payload.locationName,
          address: payload.address ?? {},
        });
      } catch { }
      remaining = remaining.slice(lMatch[0].length).replace(/^\n/, '');
      continue;
    }

    // Plain text until next block marker or end
    const nextBlock = remaining.search(/\$tg\[|\$l\[/);
    const textChunk = nextBlock === -1 ? remaining : remaining.slice(0, nextBlock);
    if (textChunk.trim()) {
      blocks.push({ id: `parsed_text_${idx++}`, type: 'text', value: textChunk.trimEnd() });
    }
    remaining = nextBlock === -1 ? '' : remaining.slice(nextBlock);
  }

  return blocks;
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function TextBlockView({ value }: { value: string }) {
  return <TText style={styles.textBlock}>{value}</TText>;
}

function ToggleBlockView({ value, checked }: { value: string; checked: boolean }) {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.toggleBlock, { borderColor: '#ccc4', backgroundColor: primaryColor }]}>
      <View style={[
        styles.checkbox,
        { borderColor: checked ? accentColor : '#ccc6', backgroundColor: checked ? accentColor : 'transparent' },
      ]}>
        {checked && <TIcon name="check" size={11} color="white" />}
      </View>
      <TText style={[
        styles.toggleText,
        { color: textColor, textDecorationLine: checked ? 'line-through' : 'none', opacity: checked ? 0.45 : 1 },
      ]}>
        {value}
      </TText>
    </View>
  );
}

function LocationBlockView({
  block,
  onPress,
}: {
  block: ParsedLocationBlock;
  onPress: (loc: ParsedLocationBlock) => void;
}) {
  const accentColor = useThemeColor({}, 'accent');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <TouchableOpacity
      style={[styles.locationBlock, { borderColor: accentColor + '55', backgroundColor: primaryColor }]}
      onPress={() => onPress(block)}
      activeOpacity={0.75}
    >
      <View style={[styles.locationIconBox, { backgroundColor: accentColor + '22' }]}>
        <TIcon name="map-marker" size={18} color={accentColor} />
      </View>
      <View style={{ flex: 1 }}>
        <TText style={styles.locationName} numberOfLines={1}>{block.locationName}</TText>
        {(block.address.city || block.address.region) ? (
          <TText style={styles.locationSub} numberOfLines={1}>
            {[block.address.city, block.address.region].filter(Boolean).join(', ')}
          </TText>
        ) : null}
      </View>
      <TIcon name="chevron-right" size={16} color="#ccc8" />
    </TouchableOpacity>
  );
}

function ContentRenderer({
  content,
  onLocationPress,
}: {
  content: string;
  onLocationPress: (loc: ParsedLocationBlock) => void;
}) {
  const blocks = useMemo(() => parseContent(content), [content]);

  return (
    <>
      {blocks.map((block) => {
        if (block.type === 'text') return <TextBlockView key={block.id} value={block.value} />;
        if (block.type === 'toggle') return <ToggleBlockView key={block.id} value={block.value} checked={block.checked} />;
        return <LocationBlockView key={block.id} block={block as ParsedLocationBlock} onPress={onLocationPress} />;
      })}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ItineraryViewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { itinerary, isLoading, error } = useGetItinerary(id || null);
  const deleteItineraryMutation = useDeleteItinerary();
  const queryClient = useQueryClient();

  const { latitude: userLat, longitude: userLng } = useLocation();
  const { session } = useSession();
  const secondaryColor = useThemeColor({}, 'secondary');

  const [selectedLocation, setSelectedLocation] = useState<ParsedLocationBlock | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  const handleLocationPress = (loc: ParsedLocationBlock) => {
    setSelectedLocation(loc);
  };

  const handleGetDirections = async (loc: ParsedLocationBlock) => {
    if (!loc.latitude || !loc.longitude || !loc.locationName) {
      Alert.alert('Error', 'Unable to get directions to this location.');
      return;
    }
    const encoded = encodeURIComponent(loc.locationName);
    try {
      const url = Platform.OS === 'ios'
        ? `maps://maps.apple.com/?q=${encoded}&ll=${loc.latitude},${loc.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open maps application.');
    }
  };

  const handleSearchLocation = async (loc: ParsedLocationBlock) => {
    try {
      await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(loc.locationName)}`);
    } catch {
      Dialog.alert('Error', 'Unable to open search. Please try again.');
    }
  };

  const handleDeleteItinerary = () => {
    Dialog.confirm(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary?',
      {
        onConfirm: () => {
          if (id) {
            deleteItineraryMutation.delete(id, {
              onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ['user-itineraries'] });
                router.back();
              },
            });
          }
        },
        confirmText: 'Delete',
        destructive: true,
      }
    );
  };

  const SelectedLocationWeather = ({ loc }: { loc: ParsedLocationBlock }) => {
    const { data: weatherData, isLoading } = usePlaceWeather(
      loc.latitude, loc.longitude, loc.address?.city
    );
    return (
      <WeatherDisplay
        heatValue={weatherData?.temperature || 0}
        rainValue={weatherData?.precipitation || 0}
        humidValue={weatherData?.humidity || 0}
        windValue={weatherData?.windSpeed || 0}
        textColor="#fff"
        backgroundColor="#0004"
        loading={isLoading}
      />
    );
  };

  const isOwner = itinerary?.user?.id === session?.user?.id;
  const canView = !itinerary?.isPrivate || isOwner;

  return (
    <View style={{ flex: 1 }}>

      {canView && (
        <LinearGradient colors={['#000', 'transparent']} style={styles.headerGradient}>
          {isOwner && (
            <OptionsPopup
              options={[
                { label: 'Delete Itinerary', iconName: 'delete', onPress: handleDeleteItinerary },
                ...(itinerary?.status === 'active'
                  ? [{ label: 'Share Itinerary', iconName: 'share-variant', onPress: () => router.push({ pathname: '/share', params: { path: `itinerary/${itinerary.id}` } }) }]
                  : []),
              ]}
              style={styles.options}
            >
              <TIcon name="dots-vertical" size={20} color="#fff" />
            </OptionsPopup>
          )}

          <BackButton type="close" color="#fff" style={styles.backButton} />
          <View style={styles.headerRow}>
            <TText type="subtitle" style={{ color: '#fff' }}>{itinerary?.title}</TText>
            {itinerary?.isPrivate && <TIcon name="lock" size={15} color="white" />}
          </View>
          <TText style={{ color: '#fff' }}>
            {formatDateToString(itinerary?.startDate || '')} - {formatDateToString(itinerary?.endDate || '')}
          </TText>
          <TText style={{ color: '#fff7', fontSize: 11 }}>
            Created by {itinerary?.user?.username}
          </TText>
          <View style={styles.headerRow}>
            <View style={styles.headerBubble}>
              <TText style={{ color: '#fff', fontSize: 11 }}>
                {itinerary?.status ? itinerary.status[0].toUpperCase() + itinerary.status.slice(1) : 'N/A'}
              </TText>
            </View>
            <View style={styles.headerBubble}>
              <TText style={{ color: '#fff', fontSize: 11 }}>{itinerary?.type || 'N/A'}</TText>
            </View>
          </View>
        </LinearGradient>
      )}

      {canView && (
        <>
          {selectedLocation ? (
            <LinearGradient colors={['transparent', '#000']} style={styles.bottomGradient}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                  <TIcon name="chevron-left" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <TText type="subtitle" style={{ color: '#fff' }}>{selectedLocation.locationName}</TText>
                  {(selectedLocation.address.city || selectedLocation.address.district || selectedLocation.address.region) && (
                    <TText style={{ color: '#fff', opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
                      {[selectedLocation.address.district, selectedLocation.address.city, selectedLocation.address.region].filter(Boolean).join(', ')}
                    </TText>
                  )}
                </View>
              </View>

              <View style={styles.locationButtonsContainer}>
                <TouchableOpacity
                  style={[styles.locationButtons, { backgroundColor: is3DMode ? secondaryColor : '#0008' }]}
                  onPress={() => setIs3DMode(!is3DMode)}
                >
                  <TIcon name={is3DMode ? 'cube-outline' : 'square-outline'} size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>{is3DMode ? '3D' : '2D'}</TText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.locationButtons} onPress={() => handleGetDirections(selectedLocation)}>
                  <TIcon name="directions" size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>Get Directions</TText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.locationButtons} onPress={() => handleSearchLocation(selectedLocation)}>
                  <TIcon name="magnify" size={20} color="#fff" />
                  <TText style={{ color: '#fff', fontSize: 11 }}>Search</TText>
                </TouchableOpacity>
              </View>

              <SelectedLocationWeather loc={selectedLocation} />
            </LinearGradient>
          ) : (
            itinerary && (
              <TView style={styles.bottomSheet} color="primary">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: '3%', paddingVertical: 20, gap: 4 }}
                >
                  <ContentRenderer
                    content={itinerary.content ?? ''}
                    onLocationPress={handleLocationPress}
                  />
                </ScrollView>
              </TView>
            )
          )}
        </>
      )}

      {itinerary?.isPrivate && !isOwner && (
        <View style={styles.privateOverlay}>
          <EmptyMessage
            iconName="lock"
            title="This itinerary is private"
            description="You do not have permission to view this itinerary."
            buttonLabel="Go Back"
            buttonAction={() => router.back()}
            isWhite
          />
        </View>
      )}

      {(isLoading || error) && (
        <View style={styles.privateOverlay}>
          <EmptyMessage
            iconName="lock"
            title={error ? 'Failed to load itinerary' : 'Loading itinerary...'}
            description={error ? 'Please try again later.' : 'Please wait while we load the itinerary details.'}
            buttonLabel="Go Back"
            buttonAction={() => router.back()}
            isWhite
            loading={isLoading}
          />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  options: {
    position: 'absolute',
    top: 0,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '3%',
    paddingBottom: 50,
    gap: 6,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 11,
    right: '3%',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#0004',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '3%',
    paddingTop: 50,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
    marginBottom: 10,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0007',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  privateOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    gap: 12,
  },
  // Content blocks
  textBlock: {
    fontSize: 13,
    lineHeight: 20,
    marginHorizontal: 5,
  },
  toggleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  toggleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  locationSub: {
    fontSize: 11,
    opacity: 0.55,
    lineHeight: 16,
  },
});