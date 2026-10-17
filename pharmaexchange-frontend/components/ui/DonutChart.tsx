interface DonutChartProps {
  segments: { color: string; value: number; label: string }[];
  total: number;
  centerLabel?: string;
  size?: number;
}

export default function DonutChart(_: DonutChartProps) {
  // Graphs are disabled as requested.
  return null;
}