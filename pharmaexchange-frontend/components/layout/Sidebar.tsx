const navItems: {
  label: string;
  href: string;
  icon: AppIconName;
  pharmacyOnly?: boolean;
  badgeKey?: "alerts" | "requests";
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Inventory", href: "/inventory", icon: "inventory", pharmacyOnly: true },
  { label: "AI Insights", href: "/ai-insights", icon: "insights", pharmacyOnly: true },
  { label: "Transfers", href: "/transfers", icon: "transfers" },
  { label: "Partner Pharmacies", href: "/pharmacies", icon: "users" },
  { label: "Transfer Requests", href: "/transfer-requests", icon: "requests", badgeKey: "requests" },
  { label: "Alerts", href: "/alerts", icon: "alerts", badgeKey: "alerts" },
  { label: "Scan Medicines", href: "/scan", icon: "scan", pharmacyOnly: true },
  { label: "Analysis", href: "/analysis", icon: "analysis", pharmacyOnly: true },
  { label: "Reports", href: "/reports", icon: "reports", pharmacyOnly: true },
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Help & Support", href: "/help", icon: "help" },
];
