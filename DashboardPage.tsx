import { useGetAdminStats } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Package, ShoppingBag, IndianRupee, Star, TrendingUp } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-yellow-500/20 text-yellow-400",
  Shipped: "bg-blue-500/20 text-blue-400",
  Delivered: "bg-green-500/20 text-green-400",
  Cancelled: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}K`,
      icon: IndianRupee,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, Admin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-gray-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#FF3F6C]" />
            <h2 className="font-semibold text-sm text-white">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {stats?.recentOrders?.length === 0 && (
              <p className="text-gray-500 text-sm px-5 py-4">No orders yet.</p>
            )}
            {stats?.recentOrders?.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Order #{order.id}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">₹{Number(order.total).toLocaleString("en-IN")}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-700 text-gray-300"}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-sm text-white">Orders by Status</h2>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(stats?.ordersByStatus ?? {}).map(([status, count]) => {
              const total = stats?.totalOrders ?? 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{status}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF3F6C] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats?.ordersByStatus ?? {}).length === 0 && (
              <p className="text-gray-500 text-sm">No order data yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
