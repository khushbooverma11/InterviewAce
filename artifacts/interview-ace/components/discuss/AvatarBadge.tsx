import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarBadgeProps {
  handle: string;
  avatarColor: string;
  size?: number;
}

export function AvatarBadge({ handle, avatarColor, size = 36 }: AvatarBadgeProps) {
  const initials = handle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '??';
  const bgColor = avatarColor + '28'; // ~16% opacity tint

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38, color: avatarColor }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
