import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useGetUserInfo } from '@/api/authApi';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { useSharedValue, useAnimatedStyle, withTiming,  withDelay, Easing } from 'react-native-reanimated';
import { View, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores';

export default function SplashScreen() {
  const [destination, setDestination] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const userInfoQuery = useGetUserInfo();
  const minimumTimeElapsed = useRef(false);
  const authCheckComplete = useRef(false);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const spinnerOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  
  // Define animated styles
  const logoAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { translateY: logoY.value }
      ],
    };
  });

  const spinnerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: spinnerOpacity.value,
    };
  });

  // Check if we can navigate away from splash screen
  const checkAndNavigate = () => {
    if (minimumTimeElapsed.current && authCheckComplete.current && destination) {
      console.log('Navigating to:', destination);
      // Use direct router navigation instead of Redirect component
      router.replace(destination as any);
    }
  };

  // Start animations and set minimum time
  useEffect(() => {
    // Logo animation - fade in, scale up and move up
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(400, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.5)) 
    }));
    logoY.value = withDelay(400, withTiming(0, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
    
    // Spinner animation - slightly delayed
    spinnerOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    
    // Set minimum display time
    const timer = setTimeout(() => {
      console.log('Minimum display time elapsed');
      minimumTimeElapsed.current = true;
      setAnimationComplete(true);
      checkAndNavigate();
    }, 2500); // Minimum 2.5 seconds display
    
    return () => clearTimeout(timer);
  }, []);

  // Get auth state from Zustand store
  const { isLoggedIn, accessToken, user } = useAuthStore();
  
  // Check auth status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        
        if (!accessToken) {
          console.log('No token found, setting destination to /login');
          setDestination('/login');
          authCheckComplete.current = true;
          checkAndNavigate();
          return;
        }
        
        // Token exists, check user info query
        if (!userInfoQuery.isPending) {
          if (userInfoQuery.isSuccess && isLoggedIn && user) {
            console.log('User info fetched successfully, setting destination to /(tabs)');
            setDestination('/(tabs)');
          } else {
            console.log('Error fetching user info, setting destination to /login');
            setDestination('/login');
          }
          authCheckComplete.current = true;
          checkAndNavigate();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setDestination('/login');
        authCheckComplete.current = true;
        checkAndNavigate();
      }
    };

    checkAuth();
  }, [userInfoQuery.isPending, userInfoQuery.isSuccess, isLoggedIn, accessToken, user]);

  // Check if destination changes
  useEffect(() => {
    if (destination) {
      checkAndNavigate();
    }
  }, [destination, animationComplete]);

  return (
    <View style={{ flex: 1, position: 'absolute', width, height, top: 0, left: 0 }}>
      <StatusBar translucent  barStyle="light-content" />
      <LinearGradient
        colors={['#001f3f', '#0077be', '#00a3e0']}
        locations={[0, 0.6, 1]}
        style={{ 
          flex: 1, 
          width: '100%', 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        }}
      >
        <Box className="justify-center items-center flex-1">
          <Animated.View style={[{ marginBottom: 40 }, logoAnimStyle]}>
            <MaskedView
              maskElement={
                <Text className="text-7xl font-bold text-center">
                  SnapPoint
                </Text>
              }
            >
              <LinearGradient
                colors={['#ffffff', '#e0f7ff', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text className="text-7xl font-bold text-center opacity-0">
                  SnapPoint
                </Text>
              </LinearGradient>
            </MaskedView>
          </Animated.View>
          
          <Animated.View style={[{ marginTop: 32 }, spinnerAnimStyle]}>
            <Spinner size="large" color="white" />
          </Animated.View>
        </Box>
      </LinearGradient>
    </View>
  );
}
