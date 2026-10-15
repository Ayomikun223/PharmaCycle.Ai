"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppIcon from "@/components/ui/AppIcon";
import Badge from "@/components/ui/Badge";
import { pharmaciesApi } from "@/lib/api";

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Awaited<ReturnType<typeof pharmaciesApi.list>>["pharmacies"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmaciesApi.list({ limit: 20 })
      .then((res) => setPharmacies(res.pharmacies))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar title="Partner Pharmacies" subtitle="View verified pharmacies connected to the network." />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Pharmacy network</h3>
              <p className="text-sm text-gray-500">Verified partner pharmacies available for transfers and coordination.</p>
            </div>
            <Badge variant="excess-stock">{pharmacies.length} active</Badge>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading pharmacies...</p>
          ) : pharmacies.length === 0 ? (
            <p className="text-sm text-gray-500">No partner pharmacies found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                      <AppIcon name="pharmacy" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pharmacy.name}</p>
                      <p className="text-xs text-gray-500">{pharmacy.city}, {pharmacy.state}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Verified partner pharmacy</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
