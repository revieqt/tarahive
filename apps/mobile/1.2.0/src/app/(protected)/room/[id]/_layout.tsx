import { router, Tabs, useLocalSearchParams, usePathname } from 'expo-router';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TIcon, TText } from '@/components/ui/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import BackButton from '@/components/common/BackButton';
import ShareModal from '@/components/modals/ShareModal';

export default function RoomLayout() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const name = 'Test';
  const description = 'This is a test description for the room.';
  const themeColor = '#4A90E2';

  const navigateToTab = (tab: 'details' | 'chat' | 'map') => {
    const pathname = tab === 'details' ? '/room/[id]' : `/room/[id]/${tab}`;
    router.navigate({ pathname, params: { id } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.titleContainer, { backgroundColor: themeColor }]}>
        <TText style={styles.name}>{name}</TText>
        <TText style={styles.description}>{description}</TText>

        <BackButton type="close" color="white" style={styles.closeButton} />

        <View style={styles.navigationRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={styles.tabsScroll}
          >
            <TouchableOpacity
              style={[
                styles.tabs,
                (pathname === `/room/${id}` || pathname.endsWith('/details')) && styles.activeTab,
              ]}
              onPress={() => navigateToTab('details')}
            >
              <TText style={styles.tabsText}>{t('itinerary.form.details_tab')}</TText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabs, pathname.endsWith('/chat') && styles.activeTab]}
              onPress={() => navigateToTab('chat')}
            >
              <TText style={styles.tabsText}>Chat</TText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabs, pathname.endsWith('/map') && styles.activeTab]}
              onPress={() => navigateToTab('map')}
            >
              <TText style={styles.tabsText}>Map</TText>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.moreOptionsContainer}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/room/[id]/edit', params: { id } })}
              accessibilityLabel="Edit Room"
            >
              <TIcon name="pencil" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShareModalVisible(true)}
              accessibilityLabel="Share Room"
            >
              <TIcon name="share" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          path={`/itinerary/`}
        />
      </View>

      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="members" />
        <Tabs.Screen name="chat" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: '3%',
    paddingTop: 8,
  },
  name: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    height: 30,
    color: '#fff',
    width: '92%',
  },
  description: {
    opacity: 0.7,
    color: 'white',
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '3%',
  },
  tabs: {
    paddingHorizontal: 8,
    borderBottomWidth: 3,
    paddingTop: 9,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  activeTab: {
    borderColor: '#fff',
    opacity: 1,
  },
  tabsText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  navigationRow: {
    flexDirection: 'row',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabsScroll: {
    flex: 1,
  },
  moreOptionsContainer: {
    flexDirection: 'row',
    borderTopLeftRadius: 20,
    backgroundColor: '#fff4',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 8,
    marginRight: '-3%',
  },
});
