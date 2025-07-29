import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useGetUserInfo } from '@/api/authApi';
import { Image } from '@/components/ui/image';
import Animated, { useSharedValue, useAnimatedStyle, withTiming,  withDelay, Easing } from 'react-native-reanimated';
import { View, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/utils/useTranslation';

export default function SplashScreen() {
  const { t } = useTranslation();
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
  const sloganOpacity = useSharedValue(0);
  const spinnerOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const sloganY = useSharedValue(30);
  
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

  const sloganAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: sloganOpacity.value,
      transform: [
        { translateY: sloganY.value }
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
    
    // Slogan animation - appears after logo
    sloganOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    sloganY.value = withDelay(1000, withTiming(0, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    }));
    
    // Spinner animation - slightly delayed
    spinnerOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
    
    // Set minimum display time
    const timer = setTimeout(() => {
      console.log('Minimum display time elapsed');
      minimumTimeElapsed.current = true;
      setAnimationComplete(true);
      checkAndNavigate();
    }, 3000); // Minimum 3 seconds display
    
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
          setDestination('/screens/Auth/Login/Login');
          authCheckComplete.current = true;
          checkAndNavigate();
          return;
        }
        
        // Token exists, check if we already have user data
        if (isLoggedIn && user) {
          console.log('User already authenticated, setting destination to /(tabs)');
          setDestination('/(tabs)');
          authCheckComplete.current = true;
          checkAndNavigate();
          return;
        }
        
        // Token exists but no user data, wait for API call
        if (!userInfoQuery.isPending) {
          if (userInfoQuery.isSuccess) {
            console.log('User info fetched successfully, setting destination to /(tabs)');
            setDestination('/(tabs)');
          } else {
            console.log('Error fetching user info, setting destination to /login');
            setDestination('/screens/Auth/Login/Login');
          }
          authCheckComplete.current = true;
          checkAndNavigate();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setDestination('/screens/Auth/Login/Login');
        authCheckComplete.current = true;
        checkAndNavigate();
      }
    };

    // Sadece bir kere çalıştır
    if (!authCheckComplete.current) {
      checkAuth();
    }
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
          {/* Logo */}
          <Animated.View style={[{ marginBottom: 20 }, logoAnimStyle]}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{
                width: 200,
                height: 200,
                resizeMode: 'contain',
              }}
              alt="YerTale Logo"
            />
          </Animated.View>
          
          {/* Slogan */}
          <Animated.View style={[{ marginBottom: 40, paddingHorizontal: 40 }, sloganAnimStyle]}>
            <Text className="text-white text-xl font-medium text-center leading-7 tracking-wide">
              "{t().appSlogan}"
            </Text>
          </Animated.View>
          
          <Animated.View style={[{ marginTop: 20 }, spinnerAnimStyle]}>
            <Spinner size="large" color="white" />
          </Animated.View>
        </Box>
      </LinearGradient>
    </View>
  );
}
