"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppIcon from "@/components/ui/AppIcon";
import { pharmaciesApi } from "@/lib/api";

export default function PartnerPharmaciesCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    pharmaciesApi.list({ limit: 20 }).then((res) => setCount(res.total)).catch(() => setCount(0));
  }, []);

  return (
    <Link href="/pharmacies" className="block rounded-xl border border-gray-100 bg-white p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Partner Pharmacies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
        </div>
        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
          <AppIcon name="users" size={18} />
        </div>
      </div>
      <p className="text-xs text-green-600 mt-3 font-medium">View all →</p>
    </Link>
  );
}
