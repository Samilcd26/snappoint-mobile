import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface TabRippleProps {
  isActive: boolean;
  style?: ViewStyle;
}

const TabRipple: React.FC<TabRippleProps> = ({ isActive, style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Start ripple effect when tab becomes active
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Fade out after ripple completes
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Reset values when tab is not active
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.ripple,
        style,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0077be',
    bottom: 10,
  },
});

export default TabRipple; 