/**
 * Semantic design tokens for the mobile app.
 *
 * Light and dark palettes. The useColors() hook automatically picks
 * the active palette based on the device's appearance setting.
 */

const colors = {
  light: {
    text: '#0a0a0a',
    tint: '#2f95dc',
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#f9f9f9',
    cardForeground: '#0a0a0a',
    primary: '#2f95dc',
    primaryForeground: '#ffffff',
    secondary: '#f0f0f0',
    secondaryForeground: '#1a1a1a',
    muted: '#f0f0f0',
    mutedForeground: '#737373',
    accent: '#f0f0f0',
    accentForeground: '#1a1a1a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e5e5e5',
    input: '#e5e5e5',
  },

  dark: {
    text: '#F0F6FC',
    tint: '#3B82F6',
    background: '#0D1117',
    foreground: '#F0F6FC',
    card: '#161B22',
    cardForeground: '#F0F6FC',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#1C2333',
    secondaryForeground: '#CDD5DF',
    muted: '#1C2333',
    mutedForeground: '#8B949E',
    accent: '#1C2333',
    accentForeground: '#CDD5DF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#21262D',
    input: '#21262D',
  },

  // Border radius (in px). Applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
