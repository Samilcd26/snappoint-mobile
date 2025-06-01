import React, { useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { VStack, Text, Box, Switch, Button, HStack } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterOptions } from '@/types/Marker';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

interface CategoryOption {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const CATEGORIES: CategoryOption[] = [
  { name: "Restaurant", icon: "restaurant" },
  { name: "Cafe", icon: "local-cafe" },
  { name: "Park", icon: "park" },
  { name: "Pub", icon: "local-bar" },
  { name: "Museum", icon: "museum" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Historical", icon: "account-balance" },
];

const DEFAULT_FILTERS: FilterOptions = {
  hideVisited: false,
  categories: [],
  radius: 1000,
  zoomLevel: 15,
};

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  initialFilters = DEFAULT_FILTERS,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
    categories: initialFilters.categories || [],
  });

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const toggleCategory = (categoryName: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(cat => cat !== categoryName)
        : [...prev.categories, categoryName]
    }));
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Box style={{padding: 16, width: '100%'}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 16}}>Filter Places</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="md" style={{width: '100%'}}>
                {/* Hide Visited Toggle */}
                <HStack style={{justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text>Hide Visited Places</Text>
                  <Switch
                    value={filters.hideVisited}
                    onToggle={(value) => setFilters({...filters, hideVisited: value})}
                  />
                </HStack>

                {/* Categories Horizontal Scroll */}
                <VStack space="sm">
                  <Text>Categories</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.name}
                        style={[
                          styles.categoryButton,
                          filters.categories.includes(category.name) && styles.categoryButtonSelected
                        ]}
                        onPress={() => toggleCategory(category.name)}
                      >
                        <MaterialIcons
                          name={category.icon}
                          size={24}
                          color={filters.categories.includes(category.name) ? 'white' : '#666'}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            filters.categories.includes(category.name) && styles.categoryTextSelected
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </VStack>
              </VStack>
            </ScrollView>

            <HStack space="md" style={{marginTop: 24, justifyContent: 'space-between'}}>
              <Button variant="outline" style={{flex: 1}} onPress={onClose}>
                <Text>Cancel</Text>
              </Button>
              <Button style={{flex: 1}} onPress={handleApplyFilters}>
                <Text style={{color: 'white'}}>Apply Filters</Text>
              </Button>
            </HStack>
          </Box>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '80%',
  },
  categoriesContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#0891b2',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: 'white',
  },
});

export default FilterModal; 