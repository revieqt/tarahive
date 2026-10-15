import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import {TIcon} from '@/components/ui/Themed';
import { useLanguage } from '@/context/LanguageContext';

function TabBarLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text
      style={{
        fontFamily: 'PlusJakartaSans',
        fontSize: 11,
        color,
        textAlign: 'center',
        opacity: .7,
      }}
    >
      {children}
    </Text>
  );
}

export default function TabLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'accent');
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: secondaryColor,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarLabel: ({ children, color }) => <TabBarLabel color={color}>{children}</TabBarLabel>,
        tabBarBackground: () => (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.tabBarBackground]}>
            <LinearGradient
              colors={['transparent', backgroundColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.backdropGradient}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.pillSurface,
                { backgroundColor: primaryColor, shadowColor: '#000' },
                Platform.select({
                  ios: {
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                  },
                  android: {
                    elevation: 8,
                  },
                  web: {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                  },
                  default: {},
                }),
              ]}
            />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          left: '3%',
          right: '3%',
          bottom: 12,
          paddingHorizontal: 24,
          paddingTop: 5,
          height: 50,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: 24,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.tabs.home_button'),
          tabBarIcon: ({ color, focused }) => (
            <TIcon name={focused ? 'home' : 'home-outline'} size={22} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.tabs.account_button'),
          tabBarIcon: ({ color, focused }) => (
            <TIcon name={focused ? 'account' : 'account-outline'} size={22} color={color}/>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    overflow: 'visible',
  },
  backdropGradient: {
    position: 'absolute',
    left: -16,
    right: -16,
    top: -30,
    bottom: -12,
  },
  pillSurface: {
    borderRadius: 24,
    borderColor: '#ccc1',
    borderWidth: 1
  },
});