import React from 'react';
import { Tabs } from 'expo-router';
import BottomNavigationTabBar from '../../components/ui/bottom-navigation-tab-bar';

export default function TabLayout() {
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
          title: 'Leaderboard',
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: 'Explorer',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
} 