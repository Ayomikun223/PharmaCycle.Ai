interface DonutChartProps {
  segments: { color: string; value: number; label: string }[];
  total: number;
  centerLabel?: string;
  size?: number;
}

// DonutChart removed - replaced with a no-op component to permanently remove graphs from the UI.
// Keeping a minimal component export so imports don't break builds. All visual charts were removed
// intentionally; statistics are now displayed as text elsewhere in the app.
export default function DonutChart(_: DonutChartProps) {
  return null;
}
