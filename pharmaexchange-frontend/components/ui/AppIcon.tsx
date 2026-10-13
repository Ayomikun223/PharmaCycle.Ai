"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  AiIdeaIcon,
  Alert01Icon,
  AlertCircleIcon,
  ArrowDataTransferHorizontalIcon,
  ArrowLeftRightIcon,
  BarcodeScanIcon,
  Calendar03Icon,
  Camera01Icon,
  Cancel01Icon,
  ChartDecreaseIcon,
  ChartIcon,
  ChartIncreaseIcon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  Clock01Icon,
  DashboardSquare01Icon,
  Dollar01Icon,
  Download01Icon,
  File01Icon,
  FilterIcon,
  FlashIcon,
  HelpCircleIcon,
  Hospital01Icon,
  Medicine01Icon,
  Notification01Icon,
  Package01Icon,
  PillIcon,
  Plant01Icon,
  Search01Icon,
  SentIcon,
  Settings01Icon,
  Shield01Icon,
  SparklesIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export type AppIconName =
  | "dashboard"
  | "inventory"
  | "insights"
  | "transfers"
  | "requests"
  | "alerts"
  | "bell"
  | "scan"
  | "analysis"
  | "reports"
  | "settings"
  | "help"
  | "warning"
  | "trending"
  | "package"
  | "expiry"
  | "lowStock"
  | "transfer"
  | "price"
  | "naira"
  | "search"
  | "camera"
  | "clipboard"
  | "send"
  | "check"
  | "cancel"
  | "truck"
  | "chart"
  | "sparkles"
  | "lightbulb"
  | "zap"
  | "pill"
  | "pharmacy"
  | "user"
  | "sprout"
  | "verified"
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "checkmark"
  | "calendar"
  | "clock"
  | "download"
  | "filter"
  | "users";

const iconMap: Record<Exclude<AppIconName, "price" | "naira">, IconSvgElement> = {
  dashboard: DashboardSquare01Icon,
  inventory: Package01Icon,
  insights: AiIdeaIcon,
  transfers: ArrowLeftRightIcon,
  requests: SentIcon,
  alerts: Notification01Icon,
  bell: Notification01Icon,
  scan: BarcodeScanIcon,
  analysis: ChartIcon,
  reports: File01Icon,
  settings: Settings01Icon,
  help: HelpCircleIcon,
  warning: Alert01Icon,
  trending: ChartIncreaseIcon,
  package: Package01Icon,
  expiry: AlertCircleIcon,
  lowStock: ChartDecreaseIcon,
  transfer: ArrowDataTransferHorizontalIcon,
  search: Search01Icon,
  camera: Camera01Icon,
  clipboard: ClipboardIcon,
  send: SentIcon,
  check: CheckmarkCircle02Icon,
  cancel: Cancel01Icon,
  truck: TruckIcon,
  chart: ChartIcon,
  sparkles: SparklesIcon,
  lightbulb: AiIdeaIcon,
  zap: FlashIcon,
  pill: PillIcon,
  pharmacy: Hospital01Icon,
  user: UserIcon,
  sprout: Plant01Icon,
  verified: Shield01Icon,
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  chevronLeft: ChevronLeftIcon,
  checkmark: CheckmarkCircle02Icon,
  calendar: Calendar03Icon,
  clock: Clock01Icon,
  download: Download01Icon,
  filter: FilterIcon,
  users: UserGroupIcon,
};

export type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

type AppIconProps = IconProps & {
  name: AppIconName;
};

export function NairaIcon({ size = 20, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 19V5l12 14V5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="4" y1="14" x2="20" y2="14" />
    </svg>
  );
}

export default function AppIcon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.75,
}: AppIconProps) {
  if (name === "price" || name === "naira") {
    return (
      <NairaIcon
        size={size}
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <HugeiconsIcon
      icon={iconMap[name]}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      color="currentColor"
    />
  );
}

export function LogoIcon({ size = 20, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <HugeiconsIcon
      icon={Medicine01Icon}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      color="currentColor"
    />
  );
}

export function HugeIcon({
  icon,
  size = 20,
  className = "",
  strokeWidth = 1.75,
}: IconProps & { icon: IconSvgElement }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      color="currentColor"
    />
  );
}

export {
  AiIdeaIcon,
  Alert01Icon,
  AlertCircleIcon,
  ArrowDataTransferHorizontalIcon,
  ArrowLeftRightIcon,
  Calendar03Icon,
  Camera01Icon,
  Cancel01Icon,
  ChartDecreaseIcon,
  ChartIcon,
  ChartIncreaseIcon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  Clock01Icon,
  DashboardSquare01Icon,
  Dollar01Icon,
  Download01Icon,
  File01Icon,
  FilterIcon,
  FlashIcon,
  HelpCircleIcon,
  Hospital01Icon,
  Medicine01Icon,
  Notification01Icon,
  Package01Icon,
  PillIcon,
  Plant01Icon,
  Search01Icon,
  SentIcon,
  Settings01Icon,
  Shield01Icon,
  SparklesIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
};
