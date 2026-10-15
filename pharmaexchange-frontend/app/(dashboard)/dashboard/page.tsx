"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/ui/StatCard";
import AppIcon, { type AppIconName } from "@/components/ui/AppIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  alertsApi,
  dashboardApi,
  insightsApi,
  transfersApi,
  type AIInsight,
  type Alert,
  type TransferListing,
} from "@/lib/api";
import { alertTypeToIcon, formatNaira, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";

export default function DashboardPage() {
  const { auth } = useAuth();
  const pharmacy = auth?.accountType === "pharmacy" ? auth.pharmacy : null;

  const [summary, setSummary] = useState({ totalInventoryItems: 0, nearExpiryItems: 0, activeTransfers: 0, partnerPharmacies: 0 });
  const [inventorySegments, setInventorySegments] = useState<{ color: string; value: number; label: string }[]>([]);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [listings, setListings] = useState<TransferListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{
    listing: TransferListing;
    quantity: string;
  } | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.inventoryStatus(),
      insightsApi.list().catch(() => ({ insights: [] })),
      alertsApi.list().catch(() => ({ alerts: [] })),
      transfersApi.available().catch(() => ({ listings: [] })),
    ])
      .then(([sum, invStatus, ins, al, tr]) => {
        setSummary(sum);
        setInventoryTotal(invStatus.total);
        setInventorySegments(
          invStatus.breakdown
            .filter((b) => ["HEALTHY", "LOW_STOCK", "NEAR_EXPIRY", "OUT_OF_STOCK"].includes(b.status))
            .map((b) => ({
              color: STATUS_COLORS[b.status] || "#d1d5db",
              value: b.count,
              label: STATUS_LABELS[b.status] || b.status,
            }))
        );
        setInsights(ins.insights);
        setAlerts(al.alerts.slice(0, 4));
        setListings(tr.listings.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestModal) return;
    const qty = Number(requestModal.quantity);
    if (!qty || qty < 1 || qty > requestModal.listing.quantity) {
      toastError(`Please enter a quantity between 1 and ${requestModal.listing.quantity}`);
      return;
    }

    setSubmittingRequest(true);
    setRequesting(requestModal.listing.listingId);
    try {
      await transfersApi.request(requestModal.listing.listingId, qty);
      toastSuccess("Transfer request sent!");
      setRequestModal(null);
      const tr = await transfersApi.available().catch(() => ({ listings: [] }));
      setListings(tr.listings.slice(0, 4));
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmittingRequest(false);
      setRequesting(null);
    }
  }

  const insightConfig: Record<string, { icon: AppIconName; iconClass: string; color: string; link: string }> = {
    EXPIRY_RISK: { icon: "warning", iconClass: "text-red-500", color: "bg-red-50 border-red-100", link: "View Items →" },
    DEMAND_FORECAST: { icon: "trending", iconClass: "text-blue-500", color: "bg-blue-50 border-blue-100", link: "See prediction →" },
    RESTOCK_SUGGESTION: { icon: "package", iconClass: "text-green-500", color: "bg-green-50 border-green-100", link: "List now →" },
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" subtitle="Loading..." />
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Dashboard" subtitle={`Welcome back, ${pharmacy?.name || "Pharmacy"}`} alertCount={unreadAlerts} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <p className="text-sm text-gray-500 mb-5">Here&apos;s what&apos;s happening with your inventory today.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard icon={<AppIcon name="package" size={20} className="text-white" />} iconBg="bg-green-500"
            title="Total Inventory Items" value={summary.totalInventoryItems.toLocaleString()} trend="View all" trendColor="text-green-600" />
          <StatCard icon={<AppIcon name="warning" size={20} className="text-white" />} iconBg="bg-orange-500"
            title="Near Expiry Items" value={String(summary.nearExpiryItems)} trend="View all" trendColor="text-orange-500" />
          <StatCard icon={<AppIcon name="transfers" size={20} className="text-white" />} iconBg="bg-blue-500"
            title="Active Transfers" value={String(summary.activeTransfers)} trend="View all" trendColor="text-blue-500" />
          <Link href="/pharmacies" className="block">
            <StatCard icon={<AppIcon name="users" size={20} className="text-white" />} iconBg="bg-purple-500"
              title="Available Pharmacies" value={String(summary.partnerPharmacies)} subtitle="Active Network" trend="View all" trendColor="text-purple-500" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Inventory Status Overview</h3>
                  <div className="space-y-2.5">
                    {inventorySegments.length === 0 ? (
                      <p className="text-sm text-gray-500">No inventory status data yet.</p>
                    ) : (
                      inventorySegments.map((seg) => {
                        const pct = inventoryTotal > 0 ? ((seg.value / inventoryTotal) * 100).toFixed(1) : "0";
                        return (
                          <div key={seg.label} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                              <span className="text-xs text-gray-600 truncate">{seg.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-900">{seg.value} <span className="text-[10px] text-gray-400">({pct}%)</span></span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <Link href="/analysis" className="text-sm text-green-600 font-medium mt-4 inline-flex items-center gap-1 hover:text-green-700">
                  View full report →
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AppIcon name="sparkles" size={18} className="text-purple-500" />
                    AI Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  {insights.length === 0 ? (
                    <p className="text-sm text-gray-500">No insights yet. <Link href="/ai-insights" className="text-green-600">Generate insights</Link></p>
                  ) : (
                    insights.map((insight) => {
                      const cfg = insightConfig[insight.type] || insightConfig.EXPIRY_RISK;
                      const text = (insight.payload as { summary?: string }).summary || "AI insight available";
                      return (
                        <div key={insight.id} className={`p-3 rounded-xl border ${cfg.color}`}>
                          <div className="flex gap-2.5">
                            <AppIcon name={cfg.icon} size={18} className={`shrink-0 mt-0.5 ${cfg.iconClass}`} />
                            <div>
                              <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                              <Link href="/ai-insights" className="text-xs text-green-600 font-semibold mt-1 inline-block">{cfg.link}</Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Available Medicines for Transfer</h3>
                <Link href="/transfers" className="text-sm text-green-600 font-medium hover:text-green-700">View all →</Link>
              </div>
              {listings.length === 0 ? (
                <p className="text-sm text-gray-500">No transfer listings available right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                  {listings.map((med) => (
                    <div key={med.listingId} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col justify-between h-full bg-white">
                      <div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg mb-3 flex items-center justify-center">
                          <AppIcon name="pill" size={20} className="text-blue-500" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1" title={`${med.medicineName} ${med.strength}`}>
                          {med.medicineName} {med.strength}
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 truncate">{med.dosageForm}</p>
                        <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                          <div className="flex justify-between"><span className="text-gray-400">Quantity</span><span className="font-semibold text-gray-700">{med.quantity} units</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="font-semibold text-gray-900">{formatNaira(med.discountedPrice)}{med.discountPercent > 0 && (<span className="ml-1 text-red-500 font-normal">-{med.discountPercent}%</span>)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">From</span><span className="font-medium text-gray-700 truncate max-w-[110px]" title={med.fromPharmacy.name}>{med.fromPharmacy.name}</span></div>
                        </div>
                      </div>
                      <div className="mt-2 pt-3 border-t border-gray-100">
                        <button onClick={() => setRequestModal({ listing: med, quantity: "1" })} disabled={requesting === med.listingId} className="w-full py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                          <AppIcon name="transfers" size={14} />
                          {requesting === med.listingId ? "Sending..." : "Request Transfer"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Alerts</h3>
                <Link href="/alerts" className="text-sm text-green-600 font-medium hover:text-green-700">View all</Link>
              </div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-gray-500">No alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <AppIcon name={alertTypeToIcon(alert.type)} size={18} className="shrink-0 text-orange-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alert.message}</p>
                      </div>
                      {!alert.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Scan Medicine", icon: "camera" as AppIconName, href: "/scan" },
                  { label: "List for Transfer", icon: "clipboard" as AppIconName, href: "/transfers" },
                  { label: "Search Medicines", icon: "search" as AppIconName, href: "/transfers" },
                  { label: "New Transfer Request", icon: "send" as AppIconName, href: "/transfer-requests" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-medium text-gray-700">
                    <AppIcon name={action.icon} size={16} className="text-green-600 shrink-0" />
                    <span className="text-xs text-left">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {requestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRequestSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Transfer</h3>
                <p className="text-sm text-gray-500">{requestModal.listing.medicineName} {requestModal.listing.strength} from {requestModal.listing.fromPharmacy.name}</p>
              </div>
              <button type="button" onClick={() => setRequestModal(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer text-lg font-bold">✕</button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between"><span>Unit price</span><span className="font-semibold text-gray-900">{formatNaira(requestModal.listing.discountedPrice)}</span></div>
              <div className="flex items-center justify-between mt-2"><span>Available</span><span className="text-gray-600">{requestModal.listing.quantity} units</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request quantity</label>
              <input type="number" min={1} max={requestModal.listing.quantity} value={requestModal.quantity} onChange={(e) => setRequestModal({ ...requestModal, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between"><span>Total estimated cost</span><span className="font-semibold text-gray-900 text-base">{formatNaira(requestModal.listing.discountedPrice * Number(requestModal.quantity || 0))}</span></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setRequestModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
              <button type="submit" disabled={submittingRequest} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 transition-colors">{submittingRequest ? "Sending..." : "Submit Request"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

