"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppIcon from "@/components/ui/AppIcon";
import { transfersApi } from "@/lib/api";

export default function TransfersPage() {
  const [listings, setListings] = useState<Awaited<ReturnType<typeof transfersApi.available>>["listings"]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{ listing: (typeof listings)[number]; quantity: string } | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  function load() {
    setLoading(true);
    transfersApi.available({ search: search || undefined }).then((res) => setListings(res.listings)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestModal) return;
    const qty = Number(requestModal.quantity);
    if (!qty || qty < 1 || qty > requestModal.listing.quantity) {
      return;
    }

    setSubmittingRequest(true);
    setRequesting(requestModal.listing.listingId);
    try {
      await transfersApi.request(requestModal.listing.listingId, qty);
      setRequestModal(null);
      load();
    } catch {
      // request failure intentionally silent here; user can retry
    } finally {
      setSubmittingRequest(false);
      setRequesting(null);
    }
  }

  return (
    <>
      <TopBar title="Transfers" subtitle="Find, request and manage medicine transfers between pharmacies." />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <AppIcon name="search" size={14} className="text-gray-400" />
                <input type="text" placeholder="Search medicine name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} className="bg-transparent border-none outline-none text-xs w-full" />
              </div>
            </div>
            <button onClick={load} disabled={loading} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs cursor-pointer font-medium transition-colors disabled:opacity-60">{loading ? "Refreshing..." : "Refresh listings"}</button>
            <button onClick={() => load()} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs cursor-pointer font-medium transition-colors">Request Transfer</button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No listings available</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.listingId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-sm font-semibold text-gray-900">{listing.medicineName} {listing.strength}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{listing.dosageForm} · {listing.fromPharmacy.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{listing.quantity} units available</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-semibold text-gray-900">₦{listing.discountedPrice}</div>
                    </div>
                    <button onClick={() => setRequestModal({ listing, quantity: "1" })} disabled={requesting === listing.listingId} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 min-w-[130px] text-center transition-colors">
                      {requesting === listing.listingId ? "Sending..." : "Request Transfer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {requestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRequestSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Transfer</h3>
                <p className="text-sm text-gray-500">{requestModal.listing.medicineName} {requestModal.listing.strength}</p>
              </div>
              <button type="button" onClick={() => setRequestModal(null)} className="text-gray-400 hover:text-gray-700">Cancel</button>
            </div>
            <input type="number" min={1} max={requestModal.listing.quantity} value={requestModal.quantity} onChange={(e) => setRequestModal({ ...requestModal, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setRequestModal(null)} className="flex-1 py-2 border rounded-lg text-sm cursor-pointer">Cancel</button>
              <button type="submit" disabled={submittingRequest} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm cursor-pointer disabled:opacity-50">{submittingRequest ? "Sending..." : "Submit"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
