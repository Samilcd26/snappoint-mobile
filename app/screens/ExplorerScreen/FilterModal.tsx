import React, { useState, useCallback } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { VStack, Text, Box, Switch, Button, HStack } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterOptions } from '@/types/Marker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Props arayüzü
interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

// Kategori verileri ve tipi
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

// Ana bileşen
const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const insets = useSafeAreaInsets();

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleToggleCategory = useCallback((categoryName: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryName)
        ? prev.categories.filter(cat => cat !== categoryName)
        : [...prev.categories, categoryName];
      return { ...prev, categories: newCategories };
    });
  }, []);

  const handleToggleVisited = useCallback((value: boolean) => {
    setFilters(prev => ({ ...prev, hideVisited: value }));
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContent, { paddingBottom: insets.bottom || 16 }]}>
          <Box style={styles.header}>
            <Text style={styles.headerText}>Filter Places</Text>
          </Box>
          
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <VStack space="lg" style={{width: '100%'}}>
              <VisitedToggle filters={filters} onToggle={handleToggleVisited} />
              <CategoriesSection filters={filters} onToggleCategory={handleToggleCategory} />
            </VStack>
          </ScrollView>

          <HStack space="md" style={styles.footer}>
            <Button variant="outline" style={{flex: 1}} onPress={onClose}>
              <Text>Cancel</Text>
            </Button>
            <Button style={{flex: 1}} onPress={handleApply}>
              <Text style={{color: 'white'}}>Apply Filters</Text>
            </Button>
          </HStack>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};


// --- Alt Bileşenler ---

const VisitedToggle: React.FC<{ filters: FilterOptions; onToggle: (value: boolean) => void; }> = React.memo(({ filters, onToggle }) => (
  <VStack space="sm">
    <HStack style={styles.toggleRow}>
      <VStack space="xs" style={{flex: 1}}>
        <Text style={styles.toggleTitle}>Posted Places</Text>
        <Text style={styles.toggleSubtitle}>
          {filters.hideVisited ? 'Hiding places you posted' : 'Showing places you posted'}
        </Text>
      </VStack>
      <Switch value={filters.hideVisited} onToggle={onToggle} />
    </HStack>
    {filters.hideVisited && <WarningMessage />}
  </VStack>
));

const WarningMessage: React.FC = React.memo(() => (
  <Box style={styles.warningBox}>
    <Text style={styles.warningTitle}>⚠️ Places you posted will not be visible on the map.</Text>
    <Text style={styles.warningSubtitle}>You can see all places by turning this option off.</Text>
  </Box>
));

const CategoriesSection: React.FC<{ filters: FilterOptions; onToggleCategory: (name: string) => void }> = React.memo(({ filters, onToggleCategory }) => (
  <VStack space="sm">
    <Text style={styles.sectionTitle}>Categories</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
      {CATEGORIES.map((category) => (
        <CategoryButton
          key={category.name}
          category={category}
          isSelected={filters.categories.includes(category.name)}
          onPress={onToggleCategory}
        />
      ))}
    </ScrollView>
  </VStack>
));

const CategoryButton: React.FC<{ category: CategoryOption; isSelected: boolean; onPress: (name: string) => void }> = React.memo(({ category, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
    onPress={() => onPress(category.name)}
  >
    <MaterialIcons
      name={category.icon}
      size={22}
      color={isSelected ? 'white' : '#555'}
    />
    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));


// --- Stil Tanımları ---

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  toggleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningTitle: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
  },
  warningSubtitle: {
    fontSize: 11,
    color: '#a16207',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  categoriesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#0891b2',
  },
  categoryText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: 'white',
  },
});

export default React.memo(FilterModal);