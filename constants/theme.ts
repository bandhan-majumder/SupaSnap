import { Platform } from 'react-native';

const tintColorLight = '#D8B38A';
const tintColorDark = '#D8B38A';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F2F2F7',     
    surface: '#FFFFFF',          
    border: '#E0E0E0',
    tint: tintColorLight,
    icon: '#687076',
    label: '#11181C',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    supaPrimary: "#aeac3a",
    secondaryText: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0D0D0D',      
    surface: '#1C1C1E',         
    border: '#2C2C2E',
    tint: tintColorDark,
    icon: '#9BA1A6',
    label: '#ECEDEE',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    supaPrimary: "#cbc94f",
    secondaryText: '#9BA1A6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
