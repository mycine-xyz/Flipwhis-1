import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminListOrders, getAdminListOrdersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const { data, isLoading } = useAdminListOrders({ page, limit: 15, status: statusFilter || undefined });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const r = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Failed");
      await qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
      showToast(`Order #${id} updated to ${status}`);
    } catch {
      showToast("Update failed.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Check size={16} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", ...STATUSES].map(s => (
            <button
              key={s || "all"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-[#FF3F6C] text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-800 animate-pulse rounded" /></td></tr>
              ))}
              {!isLoading && data?.orders?.map(order => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3">
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 font-semibold text-white">₹{Number(order.total).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#FF3F6C] disabled:opacity-50"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expanded`} className="bg-gray-800/30">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Order Items</div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-700" />
                              <div className="flex-1">
                                <div className="text-sm text-white font-medium">{item.name}</div>
                                <div className="text-xs text-gray-400">{item.brand} · {item.size} · {item.color} · Qty: {item.quantity}</div>
                              </div>
                              <div className="text-sm text-white">₹{Number(item.price).toLocaleString("en-IN")}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          <span className="font-medium text-gray-300">Delivery Address:</span> {order.address}
                          {order.expectedDelivery && <span className="ml-3">Expected: {order.expectedDelivery}</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!isLoading && data?.orders?.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-sm">
            <span className="text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
