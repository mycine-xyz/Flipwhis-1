import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveFromCart,
  usePlaceOrder,
  getGetCartQueryKey,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const placeOrder = usePlaceOrder();

  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  function handleQuantity(itemId: number, qty: number) {
    updateItem.mutate(
      { itemId, data: { quantity: qty } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  }

  function handleRemove(itemId: number) {
    removeItem.mutate(
      { itemId },
      { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast({ description: "Item removed" }); } }
    );
  }

  function handlePlaceOrder() {
    if (!address.trim()) { toast({ description: "Please enter your address", variant: "destructive" }); return; }
    setPlacingOrder(true);
    placeOrder.mutate(
      { data: { address, paymentMethod } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ description: "Order placed successfully!" });
          setPlacingOrder(false);
          navigate("/orders");
        },
        onError: () => setPlacingOrder(false),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-sm" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-sm" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <ShoppingBag className="w-24 h-24 text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8 text-center">Looks like you haven't added anything to your bag yet.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#FF3F6C] text-white px-10 py-3 font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const savings = cart?.totalDiscount ?? 0;
  const total = cart?.total ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Bag</h1>
          <span className="text-sm text-gray-500">({items.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-sm p-4 flex gap-4">
                {/* Image */}
                <div
                  className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-sm cursor-pointer"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm uppercase tracking-wide">{item.brand}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Size: <span className="font-semibold text-gray-700">{item.size}</span>
                    {" "}&bull;{" "}
                    Color: <span className="font-semibold text-gray-700">{item.color}</span>
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-gray-900">&#8377;{item.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">&#8377;{item.originalPrice.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-orange-500">({item.discount}% OFF)</span>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-sm">
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white border border-gray-100 rounded-sm p-4">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#FF3F6C] transition-colors">
                <Tag className="w-4 h-4 text-[#FF3F6C]" />
                <span className="text-sm font-bold text-gray-700">Apply Coupon</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white border border-gray-100 rounded-sm p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-4 pb-3 border-b border-gray-100">Price Details ({items.length} items)</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total MRP</span>
                  <span className="font-semibold">&#8377;{items.reduce((s, i) => s + i.originalPrice * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount on MRP</span>
                  <span className="font-semibold">- &#8377;{Math.round(savings).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">{total > 499 ? "FREE" : "&#8377;49"}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span>&#8377;{total.toLocaleString()}</span>
                </div>
              </div>
              {savings > 0 && (
                <div className="mt-3 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-sm text-center">
                  You are saving &#8377;{Math.round(savings).toLocaleString()} on this order!
                </div>
              )}
            </div>

            {/* Checkout */}
            {showCheckout ? (
              <div className="bg-white border border-gray-100 rounded-sm p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800">Delivery Address</h3>
                <textarea
                  placeholder="Enter your full address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF3F6C] resize-none"
                />
                <div>
                  <h3 className="font-bold text-sm text-gray-800 mb-2">Payment Method</h3>
                  <div className="space-y-2">
                    {["COD", "UPI", "Credit/Debit Card", "Net Banking"].map((pm) => (
                      <label key={pm} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input type="radio" name="payment" value={pm} checked={paymentMethod === pm} onChange={() => setPaymentMethod(pm)} className="accent-[#FF3F6C]" />
                        {pm}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full bg-[#FF3F6C] text-white py-3 font-bold text-sm uppercase tracking-wide hover:bg-[#e0365f] transition-colors disabled:opacity-60"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-[#FF3F6C] text-white py-3 font-bold text-sm uppercase tracking-wide hover:bg-[#e0365f] transition-colors rounded-sm"
              >
                Place Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
