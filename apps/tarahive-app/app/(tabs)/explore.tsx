import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import TaraBuddySection from '@/app/tarabuddy/taraBuddy';
import RoomsSection from '@/app/rooms/rooms';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
// import { groupsApiService} from "@/services/groupsApiService";
import { useSession } from "@/context/SessionContext";
// import ToursSection from '../tours/tours';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import RoundedButton from '@/components/RoundedButton';

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const initialTab = params.tab ? parseInt(params.tab as string) : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabHeight = 50;
  const secondaryColor = useThemeColor({}, 'accent');
  

  useEffect(() => {
    lastScrollY.current = 0;
  }, []);

  // Handle tab parameter from navigation
  useEffect(() => {
    if (params.tab) {
      const tabIndex = parseInt(params.tab as string);
      if (tabIndex >= 0 && tabIndex <= 2) {
        setActiveTab(tabIndex);
      }
    }
  }, [params.tab]);

  const handleTabPress = (idx: number) => {
    if (idx === activeTab) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setActiveTab(idx);
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const isScrollingUp = currentScrollY < lastScrollY.current;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
    
    scrollY.setValue(currentScrollY);
    
    if (isScrollingUp && scrollDifference > 10) {
      Animated.parallel([
        Animated.timing(headerVisible, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else if (!isScrollingUp && currentScrollY > stickyHeight) {
      Animated.parallel([
        Animated.timing(headerVisible, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: -stickyHeight,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
    
    lastScrollY.current = currentScrollY;
  };

  const stickyHeight = tabHeight;
  const headerVisible = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = headerVisible;
  const tabs = [
    'Rooms',
    'TaraBuddy',
    // 'Tours',
  ];

  return (
    <ThemedView style={{flex:1}}>
      <Animated.View 
        style={[
          styles.stickyHeader,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          }
        ]}
      >
        
        <ThemedView color='primary' style={styles.tabRow}>
          {tabs.map((label, idx) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.tabButton,
                { flex: 1 },
              ]}
              onPress={() => handleTabPress(idx)}
              activeOpacity={0.7}
            >
              <View style={styles.tabInnerContainer}>
                <ThemedText style={[
                  {opacity: .6},
                  activeTab === idx && {color: secondaryColor, opacity: 1},
                ]}>{label}</ThemedText>
              </View>
              <View style={[
                styles.tabUnderline,
                activeTab === idx && {backgroundColor: secondaryColor},
              ]} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </Animated.View>

      {/* Content */}
      <View style={{flex: 1}}>
        <View style={[styles.sectionContainer, { display: activeTab === 0 ? 'flex' : 'none' }]}>
          <ScrollView 
            ref={activeTab === 1 ? scrollViewRef : null}
            showsVerticalScrollIndicator={false}
            style={{width: '100%', height: '100%'}}
            contentContainerStyle={{ paddingTop: stickyHeight }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <RoomsSection/>
          </ScrollView>
          <RoundedButton
            iconName="plus"
            onPress={() => router.push('/rooms/rooms-create')}
            style={styles.createButton}
        />
        <RoundedButton
            iconName="door-open"
            onPress={() => router.push('/rooms/rooms-join')}
            style={styles.joinButton}
        />
        </View>
        <View style={[styles.sectionContainer, { display: activeTab === 1 ? 'flex' : 'none' }]}>
          <TaraBuddySection/>
        </View>
        {/* Your Groups */}
        <View style={[styles.sectionContainer, { display: activeTab === 2 ? 'flex' : 'none' }]}>
          <ScrollView 
            ref={activeTab === 1 ? scrollViewRef : null}
            showsVerticalScrollIndicator={false}
            style={{width: '100%', height: '100%'}}
            contentContainerStyle={{ paddingTop: stickyHeight }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* <GroupsSection refreshTrigger={forceRefresh}/> */}
          </ScrollView>
        </View>
        
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  tabRow: {
    flexDirection: 'row',   
    justifyContent: 'space-between',
    alignItems: 'stretch',
    height: 50,
    paddingTop: 10,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabInnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  tabUnderline: {
    height: 1.5,
    width: '70%',
    borderRadius: 20,
  },
  sectionContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  createButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#007AFF',
    },
    joinButton: {
        position: 'absolute',
        bottom: 85,
        right: 16,
        backgroundColor: '#00CAFF',
    },
});