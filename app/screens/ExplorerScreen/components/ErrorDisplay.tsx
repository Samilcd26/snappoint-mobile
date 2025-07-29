import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ErrorDisplayProps {
  error: Error | null;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(({ error, onRetry }) => {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <View style={styles.errorContent}>
          <Feather name="alert-triangle" size={48} color="#ef4444" />
          
          <Text style={styles.errorTitle}>Bir hata oluştu</Text>
          
          <Text style={styles.errorMessage}>
            {error.message || 'Bilinmeyen bir hata oluştu'}
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Feather name="refresh-cw" size={20} color="white" style={styles.retryIcon} />
            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 280,
    maxWidth: width * 0.9,
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorDisplay; 