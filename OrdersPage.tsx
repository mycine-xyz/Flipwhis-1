import { useLocation } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Package, ChevronRight, CheckCircle, Clock, Truck, Star } from "lucide-react";

const STATUS_STEPS = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

function StatusTracker({ status }: { status: string }) {
  const currentStep = STATUS_STEPS.indexOf(status);
  const stepIdx = currentStep === -1 ? 0 : currentStep;

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                i <= stepIdx
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-gray-300"
              }`}
            >
              {i <= stepIdx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <p className="text-[8px] text-gray-500 text-center mt-0.5 max-w-[42px] leading-tight">{step}</p>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 ${i < stepIdx ? "bg-green-500" : "bg-gray-200"}`} style={{ width: "20px" }} />
          )}
        </div>
      ))}
    </div>
  );
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Processing: <Clock className="w-4 h-4 text-orange-500" />,
  Shipped: <Truck className="w-4 h-4 text-blue-500" />,
  Delivered: <CheckCircle className="w-4 h-4 text-green-500" />,
};

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        {[1,2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-sm" />)}
      </div>
    );
  }

  const ordersList = orders ?? [];

  if (ordersList.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <Package className="w-24 h-24 text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#FF3F6C] text-white px-10 py-3 font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {[...ordersList].reverse().map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden">
              {/* Order Header */}
              <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[order.status] || <Package className="w-4 h-4 text-gray-400" />}
                    <span className={`text-sm font-bold ${order.status === "Delivered" ? "text-green-600" : "text-orange-500"}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.expectedDelivery && order.status !== "Delivered" && (
                    <p className="text-xs text-gray-500 mt-0.5">Expected by {order.expectedDelivery}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-5 py-4">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div
                        className="w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm cursor-pointer"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 uppercase">{item.brand}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Size: {item.size} &bull; Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">&#8377;{item.price.toLocaleString()}</p>
                      </div>
                      {order.status === "Delivered" && (
                        <button
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="flex items-center gap-1 self-start text-xs font-semibold text-[#FF3F6C] border border-[#FF3F6C] px-2 py-1 hover:bg-pink-50 transition-colors whitespace-nowrap"
                        >
                          <Star className="w-3 h-3" />
                          Rate
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Status Tracker */}
                <div className="mt-4 overflow-x-auto">
                  <StatusTracker status={order.status} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-base font-bold text-gray-900">&#8377;{order.total.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Delivery address</p>
                    <p className="text-xs text-gray-700 font-semibold max-w-48 truncate">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
