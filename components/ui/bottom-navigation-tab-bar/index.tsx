import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import TabRipple from './TabRipple';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: {
    index: number;
    routes: { name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
}

// Define valid FontAwesome icon names that we'll use
type TabIconName = 'trophy' | 'globe' | 'user';

// Define our tab structure
interface TabItem {
  route?: string;
  icon?: TabIconName;
  label?: string;
  center?: boolean;
}

const BottomNavigationTabBar = ({ state, navigation }: TabBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Animations
  const tabAnimations = useRef(state.routes.map(() => new Animated.Value(0))).current;
  const centerButtonAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate the selected tab
    Animated.parallel([
      ...tabAnimations.map((anim, index) => 
        Animated.timing(anim, {
          toValue: index === state.index ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
      Animated.spring(centerButtonAnimation, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [state.index]);

  // Function to handle tab press
  const onTabPress = (routeName: string) => {
    setActiveTab(routeName);
    
    // Reset the active tab after the animation completes
    setTimeout(() => {
      setActiveTab(null);
    }, 800);
    
    // Use the navigation prop to navigate between tabs
    navigation.navigate(routeName);
  };

  // Tab icons and routes - just 3 buttons now
  const tabs: TabItem[] = [
    { route: 'leaderboard', icon: 'trophy', label: 'Leaderboard' },
    { route: 'explorer', icon: 'globe', label: 'Explorer', center: true },
    { route: 'profile', icon: 'user', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          if (tab.center) {
            // Center button (explorer/globe button)
            return (
              <Animated.View 
                key="center" 
                style={[
                  styles.centerButtonContainer,
                  {
                    transform: [
                      { 
                        scale: centerButtonAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      },
                      { 
                        translateY: centerButtonAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.centerButton}
                  onPress={() => tab.route && onTabPress(tab.route)}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="globe" size={24} color="white" />
                </TouchableOpacity>
              </Animated.View>
            );
          }

          // Regular tabs
          const isActive = pathname === `/(tabs)/${tab.route}`;
          const tabAnimation = tabAnimations[index];

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => tab.route && onTabPress(tab.route)}
              activeOpacity={0.7}
            >
              {/* Ripple animation effect */}
              {tab.route && <TabRipple isActive={activeTab === tab.route} />}
              
              <Animated.View style={{
                transform: [
                  { 
                    translateY: tabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6]
                    }) 
                  }
                ]
              }}>
                {tab.icon && (
                  <FontAwesome
                    name={tab.icon as any}
                    size={22}
                    color={isActive ? '#0077be' : '#999999'}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15, // Moved up from bottom: 0
    width: '100%',
    paddingHorizontal: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'white',
    borderRadius: 30, // Full rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    position: 'relative',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0077be',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0077be',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default BottomNavigationTabBar; 