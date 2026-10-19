import { router, Tabs, useLocalSearchParams, usePathname } from 'expo-router';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import BackButton from '@/components/common/BackButton';
import ShareModal from '@/components/modals/ShareModal';
import StickyScrollView from '@/components/ui/StickyScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

export default function RoomLayout() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const name = 'Test';
  const description = 'This is a test description for the room.';
  const themeColor = '#4A90E2';
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const [tab, setTab] = useState('feed');

  const navigateToTab = (tab: 'details' | 'members' | 'chat' | 'map' | 'settings') => {
    const pathname = tab === 'details' ? '/room/[id]' : `/room/[id]/${tab}`;
    router.navigate({ pathname, params: { id } });
  };

  return (
    <TView style={{flex: 1}}>
      <StickyScrollView
        style={{ flex: 1 }} 
        contentContainerStyle={{ height: 2000 }}
        headerAppearOn={150}
        title={"Room Title here"}
        subtitle={"2 members"}
      >
        <TView 
          color='secondary'
          style={styles.header}
        >
          <BackButton type='floating' color='#fff'/>
          <LinearGradient
            colors={['transparent', backgroundColor]}
            style={styles.headerGradient}
          >
            <TText type='title' numberOfLines={1}>Room Title Here</TText>
            <TText numberOfLines={2} style={styles.description}>Loren Ipsum Loren Ipsum Loren Ipsum Loren Ipsum Loren Ipsum Loren Ipsum</TText>
          </LinearGradient>
        </TView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          <TouchableOpacity
            style={[
              styles.tabs,
              { backgroundColor: primaryColor }
            ]}
            onPress={() => setTab('feed')}
          >
            <TText>Feed</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={() => setTab('members')}
          >
            <TText>Members</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/room/[id]/chat')}
          >
            <TText>Chat</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabs, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/room/[id]/map')}
          >
            <TText>Map</TText>
          </TouchableOpacity>
        </ScrollView>

      </StickyScrollView>
    </TView>
  );
}

const styles = StyleSheet.create({
  header:{
    height: 170
  },
  headerGradient:{
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: '3%',
    paddingBottom: 8,
    paddingTop: 20
  },
  description: {
    opacity: 0.7,
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
    borderWidth: 1,
    borderColor: '#ccc2',
    borderRadius: 20,
    opacity: 0.5,
    height: 30,
    justifyContent: 'center'
  },
  navigationRow: {
    flexDirection: 'row',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingLeft: '3%'
  },
  tabsScroll: {
    // flex: 1,
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
