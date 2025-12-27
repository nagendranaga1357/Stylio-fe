import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceMode, AudienceType, PriceLevel, SalonSortBy, SortOrder } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

// ============================================
// Types
// ============================================

export interface SearchFiltersState {
  mode?: ServiceMode | null;
  audience?: AudienceType | null;
  minRating?: number;
  maxRating?: number;
  minPriceLevel?: PriceLevel;
  maxPriceLevel?: PriceLevel;
  sortBy?: SalonSortBy;
  sortOrder?: SortOrder;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  showModeFilter?: boolean;
  style?: object;
}

// ============================================
// Filter Chip Component
// ============================================

interface FilterChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  isSelected,
  onPress,
  color = colors.primary,
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      isSelected && [styles.chipSelected, { backgroundColor: color, borderColor: color }],
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon && (
      <Ionicons
        name={icon}
        size={16}
        color={isSelected ? colors.textOnPrimary : colors.textSecondary}
      />
    )}
    <Text
      style={[
        styles.chipText,
        isSelected && styles.chipTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ============================================
// Audience Filter Section
// ============================================

interface AudienceFilterProps {
  selected: AudienceType | null | undefined;
  onChange: (audience: AudienceType | null) => void;
}

const audienceOptions: { value: AudienceType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'men', label: 'Men', icon: 'man-outline' },
  { value: 'women', label: 'Women', icon: 'woman-outline' },
  { value: 'kids', label: 'Kids', icon: 'happy-outline' },
  { value: 'unisex', label: 'Unisex', icon: 'people-outline' },
];

export const AudienceFilter: React.FC<AudienceFilterProps> = ({ selected, onChange }) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterLabel}>For</Text>
    <View style={styles.chipRow}>
      {audienceOptions.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          icon={option.icon}
          isSelected={selected === option.value}
          onPress={() => onChange(selected === option.value ? null : option.value)}
        />
      ))}
    </View>
  </View>
);

// ============================================
// Rating Filter Section
// ============================================

interface RatingFilterProps {
  minRating: number | undefined;
  onChange: (rating: number | undefined) => void;
}

const ratingOptions = [4.5, 4.0, 3.5, 3.0];

export const RatingFilter: React.FC<RatingFilterProps> = ({ minRating, onChange }) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterLabel}>Minimum Rating</Text>
    <View style={styles.chipRow}>
      {ratingOptions.map((rating) => (
        <FilterChip
          key={rating}
          label={`${rating}+`}
          icon="star"
          isSelected={minRating === rating}
          onPress={() => onChange(minRating === rating ? undefined : rating)}
          color={colors.star}
        />
      ))}
    </View>
  </View>
);

// ============================================
// Price Level Filter Section
// ============================================

interface PriceLevelFilterProps {
  minPriceLevel: PriceLevel | undefined;
  maxPriceLevel: PriceLevel | undefined;
  onChange: (min: PriceLevel | undefined, max: PriceLevel | undefined) => void;
}

const priceLevelOptions: { value: PriceLevel; label: string }[] = [
  { value: 1, label: '₹' },
  { value: 2, label: '₹₹' },
  { value: 3, label: '₹₹₹' },
  { value: 4, label: '₹₹₹₹' },
];

export const PriceLevelFilter: React.FC<PriceLevelFilterProps> = ({
  minPriceLevel,
  maxPriceLevel,
  onChange,
}) => {
  const handlePress = (level: PriceLevel) => {
    if (minPriceLevel === level && maxPriceLevel === level) {
      // Deselect
      onChange(undefined, undefined);
    } else if (!minPriceLevel) {
      // First selection
      onChange(level, level);
    } else if (level < minPriceLevel) {
      // Extend range left
      onChange(level, maxPriceLevel || minPriceLevel);
    } else if (level > (maxPriceLevel || minPriceLevel)) {
      // Extend range right
      onChange(minPriceLevel, level);
    } else {
      // Select single
      onChange(level, level);
    }
  };

  const isInRange = (level: PriceLevel) => {
    if (!minPriceLevel) return false;
    const max = maxPriceLevel || minPriceLevel;
    return level >= minPriceLevel && level <= max;
  };

  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Price Range</Text>
      <View style={styles.chipRow}>
        {priceLevelOptions.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            isSelected={isInRange(option.value)}
            onPress={() => handlePress(option.value)}
            color={colors.success}
          />
        ))}
      </View>
    </View>
  );
};

// ============================================
// Sort Options Section
// ============================================

interface SortOptionsProps {
  sortBy: SalonSortBy | undefined;
  sortOrder: SortOrder | undefined;
  hasLocation: boolean;
  onChange: (sortBy: SalonSortBy, sortOrder: SortOrder) => void;
}

const sortOptions: { value: SalonSortBy; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'popular', label: 'Popular', icon: 'flame-outline' },
  { value: 'rating', label: 'Rating', icon: 'star-outline' },
  { value: 'price', label: 'Price', icon: 'cash-outline' },
  { value: 'distance', label: 'Distance', icon: 'location-outline' },
];

export const SortOptions: React.FC<SortOptionsProps> = ({
  sortBy,
  sortOrder,
  hasLocation,
  onChange,
}) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterLabel}>Sort By</Text>
    <View style={styles.chipRow}>
      {sortOptions
        .filter((opt) => opt.value !== 'distance' || hasLocation)
        .map((option) => {
          const isSelected = sortBy === option.value;
          return (
            <FilterChip
              key={option.value}
              label={option.label}
              icon={option.icon}
              isSelected={isSelected}
              onPress={() => {
                if (isSelected) {
                  // Toggle sort order
                  onChange(option.value, sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  onChange(option.value, 'desc');
                }
              }}
              color={colors.info}
            />
          );
        })}
    </View>
  </View>
);

// ============================================
// Quick Filter Bar (Horizontal scroll)
// ============================================

interface QuickFilterBarProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  onOpenFilters: () => void;
}

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  filters,
  onFiltersChange,
  onOpenFilters,
}) => {
  const activeFilterCount = [
    filters.mode,
    filters.audience,
    filters.minRating,
    filters.minPriceLevel,
  ].filter(Boolean).length;

  return (
    <View style={styles.quickFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFilterScroll}
      >
        {/* Filter button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={onOpenFilters}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? colors.textOnPrimary : colors.text}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Mode chips */}
        <FilterChip
          label="To Salon"
          icon="storefront-outline"
          isSelected={filters.mode === 'toSalon'}
          onPress={() =>
            onFiltersChange({
              ...filters,
              mode: filters.mode === 'toSalon' ? null : 'toSalon',
            })
          }
        />
        <FilterChip
          label="To Home"
          icon="home-outline"
          isSelected={filters.mode === 'toHome'}
          onPress={() =>
            onFiltersChange({
              ...filters,
              mode: filters.mode === 'toHome' ? null : 'toHome',
            })
          }
          color="#EC4899"
        />

        {/* Audience chips */}
        {audienceOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            isSelected={filters.audience === opt.value}
            onPress={() =>
              onFiltersChange({
                ...filters,
                audience: filters.audience === opt.value ? null : opt.value,
              })
            }
          />
        ))}

        {/* Rating chips */}
        <FilterChip
          label="4+ ★"
          icon="star"
          isSelected={filters.minRating === 4}
          onPress={() =>
            onFiltersChange({
              ...filters,
              minRating: filters.minRating === 4 ? undefined : 4,
            })
          }
          color={colors.star}
        />
      </ScrollView>
    </View>
  );
};

// ============================================
// Full Filter Modal
// ============================================

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFiltersState;
  onApply: (filters: SearchFiltersState) => void;
  hasLocation?: boolean;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  hasLocation = false,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFiltersState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <AudienceFilter
            selected={localFilters.audience}
            onChange={(audience) => setLocalFilters({ ...localFilters, audience })}
          />

          <RatingFilter
            minRating={localFilters.minRating}
            onChange={(minRating) => setLocalFilters({ ...localFilters, minRating })}
          />

          <PriceLevelFilter
            minPriceLevel={localFilters.minPriceLevel}
            maxPriceLevel={localFilters.maxPriceLevel}
            onChange={(minPriceLevel, maxPriceLevel) =>
              setLocalFilters({ ...localFilters, minPriceLevel, maxPriceLevel })
            }
          />

          <SortOptions
            sortBy={localFilters.sortBy}
            sortOrder={localFilters.sortOrder}
            hasLocation={hasLocation}
            onChange={(sortBy, sortOrder) =>
              setLocalFilters({ ...localFilters, sortBy, sortOrder })
            }
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// Main SearchFilters Component
// ============================================

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  showModeFilter = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showModeFilter && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Service Type</Text>
          <View style={styles.chipRow}>
            <FilterChip
              label="To Salon"
              icon="storefront-outline"
              isSelected={filters.mode === 'toSalon'}
              onPress={() =>
                onFiltersChange({
                  ...filters,
                  mode: filters.mode === 'toSalon' ? undefined : 'toSalon',
                })
              }
            />
            <FilterChip
              label="To Home"
              icon="home-outline"
              isSelected={filters.mode === 'toHome'}
              onPress={() =>
                onFiltersChange({
                  ...filters,
                  mode: filters.mode === 'toHome' ? undefined : 'toHome',
                })
              }
              color="#EC4899"
            />
          </View>
        </View>
      )}

      <AudienceFilter
        selected={filters.audience}
        onChange={(audience) => onFiltersChange({ ...filters, audience })}
      />

      <RatingFilter
        minRating={filters.minRating}
        onChange={(minRating) => onFiltersChange({ ...filters, minRating })}
      />
    </View>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  // Quick filter bar
  quickFilterContainer: {
    paddingVertical: spacing.sm,
  },
  quickFilterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  resetText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default SearchFilters;

