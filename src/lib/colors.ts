interface ColorTheme {
  background: string;
  border: string;
}

export const colorMap: Record<string, { light: ColorTheme; dark: ColorTheme }> = {
  '#ef4444': { // Red
    light: { background: '#fdecec', border: '#ef4444' },
    dark: { background: 'hsl(0, 84%, 15%)', border: '#ef4444' },
  },
  '#f97316': { // Orange
    light: { background: '#fee7d9', border: '#f97316' },
    dark: { background: 'hsl(27, 95%, 15%)', border: '#f97316' },
  },
  '#eab308': { // Yellow
    light: { background: '#fef8d4', border: '#eab308' },
    dark: { background: 'hsl(45, 93%, 15%)', border: '#eab308' },
  },
  '#22c55e': { // Green
    light: { background: '#e3f8ec', border: '#22c55e' },
    dark: { background: 'hsl(145, 69%, 15%)', border: '#22c55e' },
  },
  '#3b82f6': { // Blue
    light: { background: '#e8f0fe', border: '#3b82f6' },
    dark: { background: 'hsl(217, 91%, 15%)', border: '#3b82f6' },
  },
  '#8b5cf6': { // Purple
    light: { background: '#f1ebfe', border: '#8b5cf6' },
    dark: { background: 'hsl(258, 90%, 15%)', border: '#8b5cf6' },
  },
  '#ec4899': { // Pink
    light: { background: '#fdecf5', border: '#ec4899' },
    dark: { background: 'hsl(327, 84%, 15%)', border: '#ec4899' },
  },
};

export const colors = Object.keys(colorMap);