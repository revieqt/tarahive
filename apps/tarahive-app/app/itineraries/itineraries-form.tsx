import DatePicker from '@/components/DatePicker';
import DropDownField from '@/components/DropDownField';
import { LocationItem } from '@/components/LocationAutocomplete';
import TextField from '@/components/TextField';
import ThemedIcons from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCreateItinerary, useUpdateItinerary, useRepeatItinerary } from '@/hooks/useItinerary';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, PanResponder, Animated } from 'react-native';
import Switch from '@/components/Switch';
import BackButton from '@/components/BackButton';
import ProcessModal from '@/components/modals/ProcessModal';
import LocationPickerModal, { LocationItemWithAddress } from '@/components/modals/LocationPickerModal';
import RoundedButton from '@/components/RoundedButton';

const ITINERARY_TYPES = [
  { label: 'Solo', value: 'Solo' },
  { label: 'Group', value: 'Group' },
  { label: 'Family', value: 'Family' },
  { label: 'Business', value: 'Business' },
];

interface DailyLocation {
  date: Date | null;
  locations: LocationItemWithAddress[];
}

function getDatesBetween(start: Date, end: Date): Date[] {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Helper to get the number of days between two dates (inclusive)
function getNumDays(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function CreateItineraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const createItineraryMutation = useCreateItinerary();
  const updateItineraryMutation = useUpdateItinerary();
  const repeatItineraryMutation = useRepeatItinerary();
  const [descriptionHeight, setDescriptionHeight] = useState(60);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Solo');
  const [planDaily, setPlanDaily] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [locations, setLocations] = useState<LocationItemWithAddress[]>([]);
  const [dailyLocations, setDailyLocations] = useState<DailyLocation[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentDayIdx, setCurrentDayIdx] = useState<number | null>(null);
  const [editingLocationIdx, setEditingLocationIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  
  // Drag and drop state
  const [draggedLocationKey, setDraggedLocationKey] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ dayIdx: number | null; locIdx: number } | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastSwapThreshold = useRef<number>(0);

  // Check if this is edit mode on mount
  useEffect(() => {
    if (params.itineraryData && typeof params.itineraryData === 'string') {
      try {
        const itineraryData = JSON.parse(params.itineraryData);
        setItineraryId(itineraryData._id || null);
        setTitle(itineraryData.title || '');
        setDescription(itineraryData.description || '');
        setType(itineraryData.type || 'Solo');
        setPlanDaily(itineraryData.planDaily || false);
        
        // Check if this is a repeat action (no startDate/endDate means repeat)
        const isRepeat = !itineraryData.startDate && !itineraryData.endDate;
        setIsRepeatMode(isRepeat);
        setIsEditMode(!isRepeat); // Only edit mode if not repeat
        
        if (itineraryData.startDate) {
          setStartDate(new Date(itineraryData.startDate));
        }
        if (itineraryData.endDate) {
          setEndDate(new Date(itineraryData.endDate));
        }

        // Handle locations
        if (itineraryData.planDaily && itineraryData.locations) {
          // Convert to DailyLocation format
          const dailyLocs = itineraryData.locations.map((item: any) => ({
            date: item.date ? new Date(item.date) : null,
            locations: item.locations || []
          }));
          setDailyLocations(dailyLocs);
        } else if (itineraryData.locations && Array.isArray(itineraryData.locations)) {
          setLocations(itineraryData.locations);
        }
      } catch (error) {
        console.error('Error parsing itinerary data:', error);
        // If parse fails, treat as create mode
        setIsEditMode(false);
        setIsRepeatMode(false);
      }
    }
  }, [params.itineraryData]);

  // For daily plan, auto-generate days from startDate to endDate
  let autoDailyLocations: DailyLocation[] = dailyLocations;
  if (planDaily && startDate && endDate && startDate <= endDate) {
    const days = getDatesBetween(startDate, endDate);
    autoDailyLocations = days.map((date, idx) => {
      const existing = dailyLocations.find(d => d.date && d.date.toDateString() === date.toDateString());
      return existing || { date, locations: [] };
    });
  }

  // Calculate number of days between startDate and endDate
  const numDays = startDate && endDate ? getNumDays(startDate, endDate) : 0;

  // Set initial startDate from URL parameter (only if not in edit mode)
  useEffect(() => {
    if (!isEditMode && params.startDate && typeof params.startDate === 'string') {
      const initialDate = new Date(params.startDate);
      if (!isNaN(initialDate.getTime())) {
        setStartDate(initialDate);
      }
    }
  }, [params.startDate, isEditMode]);

  // If only 1 day, force planDaily to false
  useEffect(() => {
    if (numDays <= 1 && planDaily) {
      setPlanDaily(false);
    }
  }, [numDays]);

  // Handle mutation success
  useEffect(() => {
    if (createItineraryMutation.isSuccess) {
      setTimeout(() => {
        router.replace(`/itineraries/${createItineraryMutation.data._id}`);
      }, 1500);
    }
  }, [createItineraryMutation.isSuccess, router]);

  // Handle update mutation success
  useEffect(() => {
    if (updateItineraryMutation.isSuccess) {
      setTimeout(() => {
        router.replace(`/itineraries/${updateItineraryMutation.data._id}`);
      }, 1500);
    }
  }, [updateItineraryMutation.isSuccess, router]);

  // Handle repeat mutation success
  useEffect(() => {
    if (repeatItineraryMutation.isSuccess) {
      setTimeout(() => {
        router.replace(`/itineraries/${repeatItineraryMutation.data._id}`);
      }, 1500);
    }
  }, [repeatItineraryMutation.isSuccess, router]);

  // Add a location to a day
  const addLocationToDay = (dayIdx: number, loc: LocationItemWithAddress) => {
    const dayDate = autoDailyLocations[dayIdx]?.date;
    if (!dayDate) return;
    let updated = [...dailyLocations];
    let idx = updated.findIndex(d => d.date && d.date.toDateString() === dayDate.toDateString());
    if (idx === -1) {
      updated.push({ date: dayDate, locations: [loc] });
    } else {
      updated[idx] = {
        ...updated[idx],
        locations: [...updated[idx].locations, loc],
      };
    }
    setDailyLocations(updated);
  };

  // Add a location for non-daily
  const addLocation = (loc: LocationItemWithAddress) => {
    setLocations([...locations, loc]);
  };

  // Remove location (for both modes)
  const removeLocation = (dayIdx: number | null, locIdx: number) => {
    if (planDaily && dayIdx !== null) {
      const updated = [...dailyLocations];
      updated[dayIdx].locations.splice(locIdx, 1);
      setDailyLocations(updated);
    } else {
      const updated = [...locations];
      updated.splice(locIdx, 1);
      setLocations(updated);
    }
  };

  // Generate unique key for location tracking
  const getLocationKey = (dayIdx: number | null, locIdx: number): string => {
    return `${dayIdx}-${locIdx}`;
  };

  // Parse location key
  const parseLocationKey = (key: string): { dayIdx: number | null; locIdx: number } => {
    const parts = key.split('-');
    const dayIdx = parts[0] === 'null' ? null : parseInt(parts[0]);
    const locIdx = parseInt(parts[1]);
    return { dayIdx, locIdx };
  };

  // Handle drag start
  const handleDragStart = (dayIdx: number | null, locIdx: number) => {
    setDraggedLocationKey(getLocationKey(dayIdx, locIdx));
    setDraggedItem({ dayIdx, locIdx });
    dragY.setValue(0);
    lastSwapThreshold.current = 0;
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedLocationKey(null);
    setDraggedItem(null);
    dragY.setValue(0);
    lastSwapThreshold.current = 0;
  };

  // Swap locations based on drag
  const swapLocations = (dayIdx: number | null, fromIdx: number, toIdx: number) => {
    if (toIdx === fromIdx) return;

    if (planDaily && dayIdx !== null) {
      const updated = [...dailyLocations];
      const locs = updated[dayIdx].locations;
      [locs[fromIdx], locs[toIdx]] = [locs[toIdx], locs[fromIdx]];
      setDailyLocations(updated);
    } else {
      const updated = [...locations];
      [updated[fromIdx], updated[toIdx]] = [updated[toIdx], updated[fromIdx]];
      setLocations(updated);
    }
  };

  // Create pan responder for location dragging
  const createLocationResponder = (dayIdx: number | null, locIdx: number, totalLocations: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => draggedLocationKey === getLocationKey(dayIdx, locIdx),
      onPanResponderMove: (evt, gestureState) => {
        if (draggedLocationKey && draggedItem) {
          dragY.setValue(gestureState.dy);
          const threshold = 40;
          
          // Check if we've passed a new swap threshold (cumulative)
          const currentThreshold = lastSwapThreshold.current + threshold;
          const absoluteDy = Math.abs(gestureState.dy);
          
          if (absoluteDy > currentThreshold) {
            const currentLocIdx = draggedItem.locIdx;
            const currentDayIdx = draggedItem.dayIdx;
            
            if (gestureState.dy > 0) {
              // Dragging down
              if (currentLocIdx < totalLocations - 1) {
                swapLocations(currentDayIdx, currentLocIdx, currentLocIdx + 1);
                setDraggedItem({ dayIdx: currentDayIdx, locIdx: currentLocIdx + 1 });
                setDraggedLocationKey(getLocationKey(currentDayIdx, currentLocIdx + 1));
                lastSwapThreshold.current += threshold;
              }
            } else {
              // Dragging up
              if (currentLocIdx > 0) {
                swapLocations(currentDayIdx, currentLocIdx, currentLocIdx - 1);
                setDraggedItem({ dayIdx: currentDayIdx, locIdx: currentLocIdx - 1 });
                setDraggedLocationKey(getLocationKey(currentDayIdx, currentLocIdx - 1));
                lastSwapThreshold.current -= threshold;
              }
            }
          }
        }
      },
      onPanResponderRelease: () => {
        handleDragEnd();
        lastSwapThreshold.current = 0;
      },
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!title.trim() || !startDate || !endDate) {
      Alert.alert('Missing Required Fields', 'Please enter a title, start date, and end date.');
      return;
    }

    if ((planDaily && dailyLocations.length === 0) || (!planDaily && locations.length === 0)) {
      Alert.alert('Missing Locations', 'Please add at least one location.');
      return;
    }

    setErrorMessage(undefined);

    const itineraryData = {
      title: title.trim(),
      description: description.trim(),
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      planDaily,
      locations: planDaily
        ? autoDailyLocations
            .filter(d => d.locations.length > 0)
            .map((d) => ({
              date: d.date ? d.date.toISOString() : '',
              locations: d.locations,
            }))
        : locations,
    };

    try {
      if (isRepeatMode && itineraryId) {
        // Repeat mode - use repeat endpoint
        await repeatItineraryMutation.mutateAsync({
          itineraryID: itineraryId,
          updateData: itineraryData as any,
        });
      } else if (isEditMode && itineraryId) {
        // Update mode
        await updateItineraryMutation.mutateAsync({
          itineraryID: itineraryId,
          updateData: itineraryData as any,
        });
      } else {
        // Create mode
        await createItineraryMutation.mutateAsync(itineraryData as any);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : `Failed to ${isRepeatMode ? 'repeat' : isEditMode ? 'update' : 'create'} itinerary`;
      setErrorMessage(errorMsg);
    }
  };



  // Modal functions
  const openLocationModal = (dayIdx: number | null) => {
    setCurrentDayIdx(dayIdx);
    setEditingLocationIdx(null);
    setIsEditingLocation(false);
    setShowLocationModal(true);
  };

  const openEditLocationModal = (dayIdx: number | null, locIdx: number, location: LocationItem) => {
    setCurrentDayIdx(dayIdx);
    setEditingLocationIdx(locIdx);
    setIsEditingLocation(true);
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setCurrentDayIdx(null);
    setEditingLocationIdx(null);
    setIsEditingLocation(false);
  };

  const handleAddLocationFromModal = (location: LocationItemWithAddress, note: string) => {
    const locationToAdd = { ...location, note } as LocationItemWithAddress;

    if (isEditingLocation && editingLocationIdx !== null) {
      // Edit existing location
      if (planDaily && currentDayIdx !== null) {
        const dayDate = autoDailyLocations[currentDayIdx]?.date;
        if (dayDate) {
          const updated = [...dailyLocations];
          const idx = updated.findIndex(d => d.date && d.date.toDateString() === dayDate.toDateString());
          if (idx !== -1) {
            updated[idx].locations[editingLocationIdx] = locationToAdd;
            setDailyLocations(updated);
          }
        }
      } else {
        const updated = [...locations];
        updated[editingLocationIdx] = locationToAdd;
        setLocations(updated);
      }
    } else {
      // Add new location
      if (planDaily && currentDayIdx !== null) {
        addLocationToDay(currentDayIdx, locationToAdd);
      } else {
        addLocation(locationToAdd);
      }
    }
    closeLocationModal();
  };

  return (
    <ThemedView color='primary' style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ThemedView style={{paddingBottom: 50, overflow: 'hidden'}}>
            <BackButton style={{ marginTop: 20, marginLeft: 10 }}/>
            <TextField placeholder="Title" value={title} onChangeText={setTitle} 
              style={{ fontFamily: 'PoppinsBold', fontSize: 27, borderColor: 'transparent', marginBottom: 0, height: 60, backgroundColor: 'transparent'}}
            />
            <TextField placeholder="Add a Description" value={description} onChangeText={setDescription} 
              style={{ borderColor: 'transparent',backgroundColor: 'transparent', minHeight: 60, height: descriptionHeight, textAlignVertical: 'top'}}
              multiline
              onContentSizeChange={e => setDescriptionHeight(e.nativeEvent.contentSize.height)}
            />
            <View style={{paddingHorizontal: 16, marginBottom: 10}}>
              <DropDownField
                placeholder="Type"
                value={type}
                onValueChange={setType}
                values={ITINERARY_TYPES}
                style={{backgroundColor: 'transparent', fontFamily: 'PoppinsRegular'}}
              />
              
              <View style={styles.rowBetween}>
                <DatePicker
                  placeholder="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  minimumDate={isEditMode ? undefined : new Date()}
                  maximumDate={endDate || undefined}
                  style={{flex: 2, backgroundColor: 'transparent'}}
                />
                <DatePicker
                  placeholder="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minimumDate={startDate || (isEditMode ? undefined : new Date())}
                  style={{flex: 2, backgroundColor: 'transparent'}}
                />
              </View>

              {numDays > 1 && (
                <Switch
                  key="planDaily"
                  label="Plan Daily?"
                  description={planDaily ? 'Yes' : 'No'}
                  value={planDaily}
                  onValueChange={(value) => {
                    setPlanDaily(value);
                    setDailyLocations([]);
                  }}
                />
              )}
            </View>
            <ThemedView color='primary' style={styles.bottomOverlay}/>
          </ThemedView>
          

          <View style={styles.locationContainer}>
            {planDaily ? (
              <>
                {autoDailyLocations.map((day, dayIdx) => (
                  <View key={dayIdx} style={styles.dayBlock}>
                    <View style={styles.rowBetween}>
                      <View style={{flex: 1, marginTop: 5}}>
                        <ThemedText type='subtitle' style={{fontSize: 16}}>Day {dayIdx + 1}</ThemedText>
                        <ThemedText style={{opacity: 0.5, marginBottom: 10, fontSize: 12}}>({day.date?.toDateString()})</ThemedText>
                      </View>
                      <TouchableOpacity style={styles.addLocationButton} onPress={() => openLocationModal(dayIdx)}>
                        <ThemedIcons name='plus' size={15} color='#00CAFF'/>
                        <ThemedText style={{color: '#00CAFF', fontSize: 12}}>Add Location</ThemedText>
                      </TouchableOpacity>
                    </View>
                    {day.locations.map((loc, locIdx) => {
                      const locationKey = getLocationKey(dayIdx, locIdx);
                      const isDragged = draggedLocationKey === locationKey;
                      const responder = createLocationResponder(dayIdx, locIdx, day.locations.length);
                      
                      return (
                        <Animated.View 
                          key={locIdx} 
                          style={[
                            styles.locationRow, 
                            isDragged && {backgroundColor: '#00CAFF30', borderRadius: 8, padding: 8},
                            {transform: isDragged ? [{translateY: dragY}] : [{translateY: 0}]}
                          ]}
                          {...responder.panHandlers}
                        >
                            <TouchableOpacity 
                            style={{ flex: 1, marginBottom: 10 }}
                            onPress={() => openEditLocationModal(dayIdx, locIdx, loc)}
                            onLongPress={() => handleDragStart(dayIdx, locIdx)}
                            >
                            <ThemedText style={{opacity: isDragged ? 1 : 0.9}}>{loc.locationName}</ThemedText>
                            {loc.note ? (
                                <ThemedText style={{opacity: isDragged ? 0.7 : .5}}>{loc.note}</ThemedText>
                            ) : null}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeLocation(dayIdx, locIdx)}>
                              <ThemedIcons name='close' size={20}/>
                            </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                  </View>
                ))}
              </>
            ) : (
              <>
                <View style={styles.rowBetween}>
                    <ThemedText type='subtitle' style={{fontSize: 16}}>Locations</ThemedText>
                  <TouchableOpacity style={styles.addLocationButton} onPress={() => openLocationModal(null)}>
                    <ThemedIcons name='plus' size={15} color='#00CAFF'/>
                    <ThemedText style={{color: '#00CAFF', fontSize: 12}}>Add Location</ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={{marginTop: 16}}>
                    {locations.map((loc, idx) => {
                      const locationKey = getLocationKey(null, idx);
                      const isDragged = draggedLocationKey === locationKey;
                      const responder = createLocationResponder(null, idx, locations.length);
                      
                      return (
                        <Animated.View 
                          key={idx} 
                          style={[
                            styles.locationRow, 
                            isDragged && {backgroundColor: '#00CAFF30', borderRadius: 8, padding: 8},
                            {transform: isDragged ? [{translateY: dragY}] : [{translateY: 0}]}
                          ]}
                          {...responder.panHandlers}
                        >
                          <TouchableOpacity 
                            style={{ flex: 1, marginBottom: 15 }}
                            onPress={() => openEditLocationModal(null, idx, loc)}
                            onLongPress={() => handleDragStart(null, idx)}
                          >
                            <ThemedText style={{opacity: isDragged ? 1 : 0.9}}>{loc.locationName}</ThemedText>
                            {loc.note ? (
                              <ThemedText style={{opacity: isDragged ? 0.7 : .5}}>{loc.note}</ThemedText>
                            ) : null}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeLocation(null, idx)}>
                            <ThemedIcons name='close' size={20}/>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                </View>
                
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ProcessModal
        visible={
          createItineraryMutation.isPending ||
          createItineraryMutation.isSuccess ||
          updateItineraryMutation.isPending ||
          updateItineraryMutation.isSuccess ||
          repeatItineraryMutation.isPending ||
          repeatItineraryMutation.isSuccess ||
          !!errorMessage
        }
        status={
          errorMessage ? 'error' :
          createItineraryMutation.isSuccess || updateItineraryMutation.isSuccess || repeatItineraryMutation.isSuccess ? 'success' :
          'processing'
        }
        message={
          errorMessage || (
            isRepeatMode ? "Itinerary repeated successfully!" : 
            isEditMode ? "Itinerary updated successfully!" : 
            "Itinerary created successfully!"
          )
        }
        onClose={() => {
          setErrorMessage(undefined);
          if (createItineraryMutation.isSuccess || updateItineraryMutation.isSuccess || repeatItineraryMutation.isSuccess) {
            router.back();
          }
        }}
      />
      <RoundedButton
        iconName="check"
        onPress={handleSubmit}
        style={{
          ...styles.cubeButton,
          opacity: !title.trim() || !startDate || !endDate || createItineraryMutation.isPending || updateItineraryMutation.isPending || repeatItineraryMutation.isPending ? 0.5 : 1,
          pointerEvents: !title.trim() || !startDate || !endDate || createItineraryMutation.isPending || updateItineraryMutation.isPending || repeatItineraryMutation.isPending ? 'none' : 'auto'
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationModal}
        onClose={closeLocationModal}
        onAddLocation={handleAddLocationFromModal}
        isEditingLocation={isEditingLocation}
        initialLocation={
          isEditingLocation && editingLocationIdx !== null
            ? planDaily && currentDayIdx !== null
              ? autoDailyLocations[currentDayIdx]?.locations[editingLocationIdx]
              : locations[editingLocationIdx]
            : undefined
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bottomOverlay:{
   position: 'absolute',
   bottom:-2,
   left: 0,
   right: 0,
   height: 20,
   borderTopLeftRadius: 200,
   borderTopRightRadius: 200,
   borderWidth: 1,
   borderColor: '#ccc4',
   borderBottomWidth: 0,
  },
  dayBlock: {
    marginBottom: 16
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10
  },
  addLocationButton:{
    borderColor: '#00CAFF',
    borderWidth: 1,
    padding: 7,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  cubeButton:{
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  locationContainer:{
    paddingHorizontal: 16,
  },

});