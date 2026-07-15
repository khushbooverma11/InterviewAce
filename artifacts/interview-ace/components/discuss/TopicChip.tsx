import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface TopicChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export function TopicChip({ label, active = false, onPress, small = false }: TopicChipProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        small ? styles.small : styles.normal,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          small ? styles.labelSmall : styles.labelNormal,
          { color: active ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  normal: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontWeight: '500',
  },
  labelNormal: {
    fontSize: 13,
  },
  labelSmall: {
    fontSize: 11,
  },
});
