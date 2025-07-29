import { useState, useCallback, useMemo } from 'react';
import { FilterOptions } from '@/types/Marker';

const DEFAULT_FILTERS: FilterOptions = {
  hideVisited: false,
  categories: [],
  radius: 500,
  zoomLevel: 16,
};

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Aktif filter olup olmadığını kontrol et
  const activeFilters = useMemo(() => {
    return filters.hideVisited || filters.categories.length > 0;
  }, [filters.hideVisited, filters.categories.length]);

  // Filter modal'ını aç
  const handleOpenFilterModal = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  // Filter modal'ını kapat
  const handleCloseFilterModal = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  // Filter'ları uygula
  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsFilterModalVisible(false);
  }, []);

  // Filter'ları sıfırla
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    activeFilters,
    isFilterModalVisible,
    handleOpenFilterModal,
    handleCloseFilterModal,
    handleApplyFilters,
    resetFilters,
  };
};

export default useFilters; 