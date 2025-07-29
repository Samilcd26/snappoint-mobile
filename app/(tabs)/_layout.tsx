import React from 'react';
import { Tabs } from 'expo-router';
import BottomNavigationTabBar from '../../components/ui/bottom-navigation-tab-bar';
import { useTranslation } from '@/utils/useTranslation';

export default function TabLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide the default tab bar
        },
      }}
      tabBar={(props) => <BottomNavigationTabBar {...props} />}
    >
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t('leaderboard'),
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: t('explorer'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
        }}
      />
    </Tabs>
  );
} 