import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceMode } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

interface ServiceModeSelectorProps {
  selectedMode: ServiceMode | null;
  onModeChange: (mode: ServiceMode | null) => void;
  showBothOption?: boolean;
  style?: object;
}

interface ModeOption {
  mode: ServiceMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

const modeOptions: ModeOption[] = [
  {
    mode: 'toSalon',
    label: 'To Salon',
    icon: 'storefront-outline',
    description: 'Visit a salon',
    color: '#8B5CF6', // Purple
  },
  {
    mode: 'toHome',
    label: 'To Home',
    icon: 'home-outline',
    description: 'Service at home',
    color: '#EC4899', // Pink
  },
];

/**
 * ServiceModeSelector - V1 Component
 * 
 * Allows users to select between "To Salon" and "To Home" service modes.
 * This is the primary navigation pattern for the V1 search & discovery flow.
 */
const ServiceModeSelector: React.FC<ServiceModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  showBothOption = false,
  style,
}) => {
  const handleModePress = (mode: ServiceMode) => {
    // Toggle off if already selected
    if (selectedMode === mode) {
      onModeChange(null);
    } else {
      onModeChange(mode);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.optionsContainer}>
        {modeOptions.map((option) => {
          const isSelected = selectedMode === option.mode;
          
          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.modeCard,
                isSelected && [
                  styles.modeCardSelected,
                  { borderColor: option.color },
                ],
              ]}
              onPress={() => handleModePress(option.mode)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? option.color : colors.backgroundSecondary },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={isSelected ? colors.textOnPrimary : option.color}
                />
              </View>
              <Text
                style={[
                  styles.modeLabel,
                  isSelected && { color: option.color, fontWeight: '700' },
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.modeDescription}>{option.description}</Text>
              
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                  <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showBothOption && (
        <TouchableOpacity
          style={[
            styles.bothOption,
            selectedMode === 'both' && styles.bothOptionSelected,
          ]}
          onPress={() => onModeChange(selectedMode === 'both' ? null : 'both')}
        >
          <Ionicons
            name="swap-horizontal"
            size={16}
            color={selectedMode === 'both' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.bothOptionText,
              selectedMode === 'both' && styles.bothOptionTextSelected,
            ]}
          >
            Show both
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Compact version of ServiceModeSelector for use in search headers
 */
export const ServiceModeTabs: React.FC<{
  selectedMode: ServiceMode | null;
  onModeChange: (mode: ServiceMode | null) => void;
  style?: object;
}> = ({ selectedMode, onModeChange, style }) => {
  return (
    <View style={[styles.tabsContainer, style]}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedMode === 'toSalon' && styles.tabSelected,
        ]}
        onPress={() => onModeChange(selectedMode === 'toSalon' ? null : 'toSalon')}
      >
        <Ionicons
          name="storefront-outline"
          size={18}
          color={selectedMode === 'toSalon' ? colors.textOnPrimary : colors.text}
        />
        <Text
          style={[
            styles.tabText,
            selectedMode === 'toSalon' && styles.tabTextSelected,
          ]}
        >
          To Salon
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          selectedMode === 'toHome' && styles.tabSelectedPink,
        ]}
        onPress={() => onModeChange(selectedMode === 'toHome' ? null : 'toHome')}
      >
        <Ionicons
          name="home-outline"
          size={18}
          color={selectedMode === 'toHome' ? colors.textOnPrimary : colors.text}
        />
        <Text
          style={[
            styles.tabText,
            selectedMode === 'toHome' && styles.tabTextSelected,
          ]}
        >
          To Home
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    ...shadows.sm,
  },
  modeCardSelected: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modeLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bothOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  bothOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
  },
  bothOptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  bothOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Tab styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  tabSelected: {
    backgroundColor: colors.primary,
  },
  tabSelectedPink: {
    backgroundColor: '#EC4899',
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  tabTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});

export default ServiceModeSelector;

