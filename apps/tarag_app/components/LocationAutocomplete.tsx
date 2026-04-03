import TextField from '@/components/TextField';
import ThemedIcons from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface LocationItem {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  note: string;
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (loc: LocationItem) => void;
  placeholder: string;
  style?: any;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onSelect, placeholder, style }) => {
  const [input, setInput] = useState<string>(value || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal input state with value prop
  useEffect(() => {
    setInput(value || '');
  }, [value]);

  // Auto-fetch with 2-second debounce when user types
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't fetch if input is empty
    if (!input.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Set new timer for 2 seconds
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions();
    }, 2000);

    // Cleanup on unmount or when input changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [input]);

  const fetchSuggestions = async () => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(input.trim())}&limit=10`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowDropdown(true);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (!text) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = async (item: any) => {
    const locationName = item.properties?.display_name || item.properties?.name || 'Unknown location';
    setInput(locationName);
    setShowDropdown(false);
    
    // Extract coordinates from the Photon API response
    const coordinates = item.geometry?.coordinates;
    const longitude = coordinates?.[0] || null;
    const latitude = coordinates?.[1] || null;
    
    onSelect({
      locationName: locationName,
      latitude: latitude,
      longitude: longitude,
      note: '',
    });
  };

  return (
    <View style={[{ zIndex: 10 }, style]}>
      <View style={styles.inputContainer}>
        <TextField
          placeholder={placeholder}
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            setIsInputFocused(true);
            setShowDropdown(!!input && suggestions.length > 0);
          }}
          onBlur={() => {
            setIsInputFocused(false);
            // Only hide dropdown if no suggestions or after longer delay
            blurTimeoutRef.current = setTimeout(() => {
              if (!showDropdown) return;
              setShowDropdown(false);
            }, 500);
          }}
          style={[styles.textField, style]}
        />
        <TouchableOpacity
          onPress={() => {
            if (showDropdown && suggestions.length > 0) {
              // If dropdown is showing, dismiss keyboard but keep dropdown
              Keyboard.dismiss();
            } else {
              // If no dropdown, fetch suggestions
              fetchSuggestions();
            }
          }}
          style={styles.searchButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small"/>
          ) : (
            <ThemedIcons 
              name={showDropdown && suggestions.length > 0 ? "apple-keyboard-control" : "magnify"} 
              size={20}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton}>
          <ThemedIcons 
            name='map-search'
            size={20}
            style={styles.mapIcon}
          />
        </TouchableOpacity>
      </View>
      {showDropdown && suggestions.length > 0 && (
        <ThemedView color='primary' shadow style={styles.dropdown}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {suggestions.length === 0 ? (
              <ThemedText>No results</ThemedText>
            ) : (
              suggestions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.properties?.osm_id || item.properties?.place_id || index}-${index}`}
                  onPress={() => {
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current);
                      blurTimeoutRef.current = null;
                    }
                    Keyboard.dismiss();
                    handleSelect(item);
                  }}
                  style={styles.dropdownItemBtn}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText>
                      {item.properties?.display_name || item.properties?.name || 'Unknown location'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  textField: {
    paddingRight: 80, // Make space for the search button
  },
  searchButton: {
    position: 'absolute',
    right: 40,
    top: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 9999, // For Android
    maxHeight: 180,
  },
  scrollView: {
    flex: 1,
    maxHeight: 180,
  },
  dropdownItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  mapButton:{
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    
  },
  mapIcon:{
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 11,
  }
});

export default LocationAutocomplete; 