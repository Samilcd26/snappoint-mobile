import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores';
import { WelcomeScreen } from './WelcomeScreen';
import { SystemLoginForm } from './SystemLoginForm';

export const Login = () => {
  const [showSystemLogin, setShowSystemLogin] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { isLoading } = useAuthStore();

  const handleSystemLogin = () => {
    setShowSystemLogin(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const goBackToOptions = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSystemLogin(false);
    });
  };

  return (
    <Box style={styles.container}>
      <LinearGradient
        colors={['#001f3f', '#0077be']}
        style={styles.gradient}
      >
        <Box>
          {!showSystemLogin ? (
            <WelcomeScreen
              isLoading={isLoading}
              onSystemLogin={handleSystemLogin}
            />
          ) : (
            <SystemLoginForm
              fadeAnim={fadeAnim}
              onGoBack={goBackToOptions}
            />
          )}
        </Box>
      </LinearGradient>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    width: '100%',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
});

export default Login;
