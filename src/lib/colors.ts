interface ColorTheme {
  background: string;
  border: string;
}

export const colorMap: Record<string, { light: ColorTheme; dark: ColorTheme }> = {
  '#ef4444': { // Red
    light: { background: '#fee2e2', border: '#ef4444' },
    dark: { background: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
  },
  '#f97316': { // Orange
    light: { background: '#ffedd5', border: '#f97316' },
    dark: { background: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  },
  '#eab308': { // Yellow
    light: { background: '#fef9c3', border: '#eab308' },
    dark: { background: 'rgba(234, 179, 8, 0.15)', border: '#eab308' },
  },
  '#22c55e': { // Green
    light: { background: '#dcfce7', border: '#22c55e' },
    dark: { background: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
  },
  '#3b82f6': { // Blue
    light: { background: '#dbeafe', border: '#3b82f6' },
    dark: { background: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' },
  },
  '#8b5cf6': { // Purple
    light: { background: '#ede9fe', border: '#8b5cf6' },
    dark: { background: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6' },
  },
  '#ec4899': { // Pink
    light: { background: '#fce7f3', border: '#ec4899' },
    dark: { background: 'rgba(236, 72, 153, 0.15)', border: '#ec4899' },
  },
};

export const colors = Object.keys(colorMap);