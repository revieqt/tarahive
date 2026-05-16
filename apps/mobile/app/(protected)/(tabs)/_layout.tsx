import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import {TIcon} from '@/shared/components/ui/Themed';
import { useLanguage } from '@/shared/context/LanguageContext';

function TabBarLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter',
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
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'accent');
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: secondaryColor,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabel: ({ children, color }) => <TabBarLabel color={color}>{children}</TabBarLabel>,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            paddingHorizontal: 24,
            paddingTop: 5,
            height: 70,
            backgroundColor: primaryColor,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          default: {
            paddingHorizontal: 10,
            paddingTop: 5,
            height: 70,
            backgroundColor: primaryColor,
            borderTopWidth: 0,
            elevation: 0,
          },
        }),
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
        name="maps"
        options={{
          title: t('tabs.tabs.maps_button'),
          tabBarIcon: ({ color, focused }) => (
            <TIcon name={focused ? 'map' : 'map-outline'} size={20} color={color}/>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.tabs.explore_button'),
          tabBarIcon: ({ color, focused }) => (
            <TIcon name={focused ? 'compass' : 'compass-outline'} size={20} color={color}/>
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