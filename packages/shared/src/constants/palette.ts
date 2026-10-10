export interface ColorSwatch {
  name: string;
  hex: string;
}

export const PROJECTOR_INK_COLORS: ColorSwatch[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'White', hex: '#FFFFFF' },
];

export const HIGHLIGHTER_COLORS: ColorSwatch[] = [
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Pink', hex: '#F472B6' },
  { name: 'Green', hex: '#4ADE80' },
  { name: 'Blue', hex: '#60A5FA' },
];

export const BOARD_THEME_COLORS = {
  light: {
    bgCanvas: '#FFFFFF',
    bgSurface: '#F8FAFC',
    bgSurfaceRaised: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#475569',
    accent: '#4F46E5',
    accentHover: '#4338CA',
  },
  dark: {
    bgCanvas: '#0B1220',
    bgSurface: '#111827',
    bgSurfaceRaised: '#1F2937',
    border: '#374151',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    accent: '#818CF8',
    accentHover: '#6366F1',
  },
  blackboard: {
    bgCanvas: '#1F3D2F',
    bgSurface: '#14271E',
    bgSurfaceRaised: '#1B3529',
    border: '#2C5441',
    text: '#F0FDF4',
    textMuted: '#A7F3D0',
    accent: '#34D399',
    accentHover: '#10B981',
  },
};
