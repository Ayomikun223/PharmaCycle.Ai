const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("PharmaCycle.AI_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("PharmaCycle.AI_token", token);
  else localStorage.removeItem("PharmaCycle.AI_token");
}

export function getStoredAuth() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("PharmaCycle.AI_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      token: string;
      user?: { id: string; name: string; email: string; role: string };
      pharmacy?: { id: string; name: string; city: string; state: string };
      consumer?: { id: string; name: string; email: string; city?: string; state?: string };
      accountType: "pharmacy" | "consumer";
    };
  } catch {
    return null;
  }
}

export function setStoredAuth(data: ReturnType<typeof getStoredAuth>) {
  if (typeof window === "undefined") return;
  if (data) {
    localStorage.setItem("PharmaCycle.AI_auth", JSON.stringify(data));
    setToken(data.token);
  } else {
    localStorage.removeItem("PharmaCycle.AI_auth");
    setToken(null);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || res.statusText || "Request failed", res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const pharmaciesApi = {
  list: (params?: { city?: string; state?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.city) q.set("city", params.city);
    if (params?.state) q.set("state", params.state);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{ pharmacies: { id: string; name: string; city: string; state: string; address?: string; lat?: number | null; lng?: number | null }[]; total: number; page: number; limit: number }>(`/pharmacies${qs ? `?${qs}` : ""}`);
  },
  nearby: (lat: number, lng: number, radiusKm = 25) =>
    request<{ pharmacies: { id: string; name: string; city: string; state: string; address?: string; distanceKm?: number | null }[]; count: number; radiusKm: number }>(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
};

export const dashboardApi = {
  summary: () =>
    request<{ totalInventoryItems: number; nearExpiryItems: number; activeTransfers: number; partnerPharmacies: number; }>('/dashboard/summary'),
  inventoryStatus: () =>
    request<{ total: number; breakdown: { status: string; count: number; percentage: number }[]; }>('/dashboard/inventory-status'),
};

export const insightsApi = {
  list: () => request<{ insights: AIInsight[] }>('/insights'),
  generate: (type: 'EXPIRY_RISK' | 'DEMAND_FORECAST' | 'RESTOCK_SUGGESTION') =>
    request<AIInsight>('/insights/generate', { method: 'POST', body: JSON.stringify({ type }) }),
};
