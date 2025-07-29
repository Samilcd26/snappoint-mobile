import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';

interface LoaderOneProps {
  title?: string;
  subtitle?: string;
  showGradient?: boolean;
  spinnerColor?: string;
  spinnerSize?: 'small' | 'large';
  backgroundColor?: string;
  textColor?: string;
}

const { width, height } = Dimensions.get('window');

export const LoaderOne: React.FC<LoaderOneProps> = ({
  title = 'Loading...',
  subtitle,
  showGradient = false,
  spinnerColor = '#3b82f6',
  spinnerSize = 'large',
  backgroundColor = 'rgba(255, 255, 255, 0.95)',
  textColor = '#374151',
}) => {
  const content = (
    <View style={[styles.container, { backgroundColor: showGradient ? 'transparent' : backgroundColor }]}>
      <View style={styles.content}>
        <Spinner 
          size={spinnerSize} 
          color={spinnerColor}
          style={styles.spinner}
        />
        
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: textColor }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  if (showGradient) {
    return (
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'rgba(147, 197, 253, 0.2)', 'rgba(255, 255, 255, 0.95)']}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        <View style={styles.content}>
          <Spinner 
            size={spinnerSize} 
            color={spinnerColor}
            style={styles.spinner}
          />
          
          <Text style={[styles.title, { color: textColor }]}>
            {title}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: textColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </LinearGradient>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
    maxWidth: width * 0.8,
  },
  spinner: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    maxWidth: 280,
  },
});

export default LoaderOne; 