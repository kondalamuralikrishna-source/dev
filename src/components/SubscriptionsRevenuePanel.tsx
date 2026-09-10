import React, { useEffect, useState } from "react";
import { IndianRupee, Users, TrendingUp, CreditCard, RefreshCw, Pencil, Check, X } from "lucide-react";
import { Skeleton } from "./Skeleton";

interface Subscriber {
  id: string;
  name: string;
  email?: string;
  tier: "sachet" | "plus" | "pro";
  status: "active" | "expired" | "none";
  planId?: string;
  startedAt?: string;
  expiresAt?: string;
}

interface Order {
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "expired";
  createdAt: string;
  paidAt?: string;
}

interface PlanDefinition {
  id: string;
  tier: string;
  name: string;
  amountInr: number;
  durationDays: number;
  description: string;
}

interface SubscriptionsData {
  summary: {
    totalRevenueInr: number;
    thisMonthRevenueInr: number;
    activeSubscriptions: number;
    totalPaidOrders: number;
  };
  plans: PlanDefinition[];
  revenueByPlan: Record<string, { count: number; totalInr: number }>;
  subscribers: Subscriber[];
  recentOrders: Order[];
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  none: "bg-slate-100 text-slate-500 border-slate-200",
  created: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
      STATUS_STYLES[status] || "bg-slate-100 text-slate-500 border-slate-200"
    }`}
  >
    {status}
  </span>
);

interface PlanCardProps {
  plan: PlanDefinition;
  onSaved: (updated: PlanDefinition) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(plan.name);
  const [amountInr, setAmountInr] = useState(String(plan.amountInr));
  const [durationDays, setDurationDays] = useState(String(plan.durationDays));
  const [description, setDescription] = useState(plan.description);

  const cancelEdit = () => {
    setName(plan.name);
    setAmountInr(String(plan.amountInr));
    setDurationDays(String(plan.durationDays));
    setDescription(plan.description);
    setError(null);
    setIsEditing(false);
  };

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          amountInr: Number(amountInr),
          durationDays: Number(durationDays),
          description,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save plan.");
      onSaved(json.plan);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong saving this plan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-slate-400">{plan.id}</p>
            <p className="text-sm font-black text-slate-900">{plan.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
            aria-label={`Edit ${plan.name}`}
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className="text-lg font-black text-slate-900">
          ₹{plan.amountInr.toLocaleString("en-IN")}{" "}
          <span className="text-xs font-semibold text-slate-400">/ {plan.durationDays}d</span>
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed">{plan.description}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border-2 border-blue-400 space-y-2.5 shadow-sm">
      <p className="text-[10px] font-mono text-slate-400">{plan.id}</p>
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Price (₹)</label>
          <input
            type="number"
            min={1}
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
            className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration (days)</label>
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          <Check size={13} />
          <span>{isSaving ? "Saving…" : "Save"}</span>
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          <X size={13} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

export const SubscriptionsRevenuePanel: React.FC = () => {
  const [data, setData] = useState<SubscriptionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"subscribers" | "orders" | "plans">("subscribers");

  const load = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/subscriptions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load subscriptions & revenue data.");
      setData(json);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong loading this data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatInr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const filteredSubscribers = (data?.subscribers || []).filter(
    (s) =>
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOrders = (data?.recentOrders || []).filter(
    (o) => !search || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.userId.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlanSaved = (updated: PlanDefinition) => {
    setData((prev) =>
      prev ? { ...prev, plans: prev.plans.map((p) => (p.id === updated.id ? updated : p)) } : prev
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Subscriptions & Revenue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live Cashfree order history and current paid subscribers.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Stat cards */}
      {isLoading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <IndianRupee size={13} />
              <span>Total Revenue</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {data ? formatInr(data.summary.totalRevenueInr) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <TrendingUp size={13} />
              <span>This Month</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {data ? formatInr(data.summary.thisMonthRevenueInr) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Users size={13} />
              <span>Active Subscribers</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {data ? data.summary.activeSubscriptions : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <CreditCard size={13} />
              <span>Total Paid Orders</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {data ? data.summary.totalPaidOrders : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Revenue by plan */}
      {data && data.plans.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Revenue by Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.plans.map((plan) => {
              const stats = data.revenueByPlan[plan.id] || { count: 0, totalInr: 0 };
              return (
                <div key={plan.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-800">{plan.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatInr(plan.amountInr)} / {plan.durationDays}d
                  </p>
                  <p className="text-sm font-black text-slate-900 mt-1.5">
                    {formatInr(stats.totalInr)}
                  </p>
                  <p className="text-[10px] text-slate-400">{stats.count} paid order{stats.count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table with tabs + search */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTab("subscribers")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                tab === "subscribers" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Subscribers ({data?.subscribers.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                tab === "orders" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Recent Orders ({data?.recentOrders.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setTab("plans")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                tab === "plans" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Plans ({data?.plans.length ?? 0})
            </button>
          </div>
          {tab !== "plans" && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "subscribers" ? "Search by name or email..." : "Search by order ID or user ID..."}
              className="flex-1 min-w-[200px] max-w-xs h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading && !data ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4">
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : tab === "subscribers" ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Tier</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Started</th>
                  <th className="px-4 py-2.5">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No subscribers yet.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{s.email || "—"}</td>
                      <td className="px-4 py-2.5 uppercase font-semibold text-slate-600">{s.tier}</td>
                      <td className="px-4 py-2.5"><StatusPill status={s.status} /></td>
                      <td className="px-4 py-2.5 text-slate-500">{formatDate(s.startedAt)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{formatDate(s.expiresAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : tab === "orders" ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                  <th className="px-4 py-2.5">Order ID</th>
                  <th className="px-4 py-2.5">User ID</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.orderId} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{o.orderId}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{o.userId}</td>
                      <td className="px-4 py-2.5 text-slate-600">{o.planId}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{formatInr(o.amount)}</td>
                      <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
                      <td className="px-4 py-2.5 text-slate-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(data?.plans || []).length === 0 ? (
                <p className="col-span-full text-center text-slate-400 py-6">No plans configured.</p>
              ) : (
                data!.plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onSaved={handlePlanSaved} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
