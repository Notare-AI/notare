interface ColorTheme {
  background: string;
  border: string;
}

export const colorMap: Record<string, { light: ColorTheme; dark: ColorTheme }> = {
  '#ef4444': { // Red
    light: { background: '#fee2e2', border: '#ef4444' },
    dark: { background: '#450a0a', border: '#ef4444' },
  },
  '#f97316': { // Orange
    light: { background: '#ffedd5', border: '#f97316' },
    dark: { background: '#431407', border: '#f97316' },
  },
  '#eab308': { // Yellow
    light: { background: '#fef9c3', border: '#eab308' },
    dark: { background: '#422006', border: '#eab308' },
  },
  '#22c55e': { // Green
    light: { background: '#dcfce7', border: '#22c55e' },
    dark: { background: '#052e16', border: '#22c55e' },
  },
  '#3b82f6': { // Blue
    light: { background: '#dbeafe', border: '#3b82f6' },
    dark: { background: '#172554', border: '#3b82f6' },
  },
  '#8b5cf6': { // Purple
    light: { background: '#ede9fe', border: '#8b5cf6' },
    dark: { background: '#2e1065', border: '#8b5cf6' },
  },
  '#ec4899': { // Pink
    light: { background: '#fce7f3', border: '#ec4899' },
    dark: { background: '#500724', border: '#ec4899' },
  },
};

export const colors = Object.keys(colorMap);