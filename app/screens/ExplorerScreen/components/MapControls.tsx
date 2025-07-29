import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MapControlsProps {
  activeFilters: boolean;
  onFilterPress: () => void;
  onMyLocationPress: () => void;
}

const MapControls: React.FC<MapControlsProps> = memo(({ 
  activeFilters, 
  onFilterPress, 
  onMyLocationPress 
}) => {
  const insets = useSafeAreaInsets(); // 🔧 Cihazın safe area değerleri

  return (
    <>
      {/* Filter Button */}
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          { top: insets.top + 10 }, // 👈 Güvenli üst boşluk
          activeFilters && styles.activeFilterButton
        ]}
        onPress={onFilterPress}
        accessibilityLabel="Filtreleri Aç"
      >
        <Feather name="filter" size={24} color={activeFilters ? "white" : "black"} />
        {activeFilters && (
          <View style={styles.filterBadge}>
            <View style={styles.filterBadgeInner} />
          </View>
        )}
      </TouchableOpacity>

      {/* My Location Button */}
      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={onMyLocationPress}
        accessibilityLabel="Konumuma Git"
      >
        <Feather name="navigation" size={24} color="#3b82f6" />
      </TouchableOpacity>
    </>
  );
});

MapControls.displayName = 'MapControls';

const styles = StyleSheet.create({
  filterButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 15,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MapControls;
