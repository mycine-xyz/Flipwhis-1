import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetProduct,
  useGetProductReviews,
  useAddProductReview,
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
  getGetCartQueryKey,
  getGetWishlistQueryKey,
  getGetProductReviewsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag, ChevronRight, ChevronLeft, Star, Truck, RotateCcw, Shield } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
  const params = useParams();
  const id = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(id);
  const { data: reviews } = useGetProductReviews(id, { query: { queryKey: getGetProductReviewsQueryKey(id) } });
  const { data: wishlist } = useGetWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addReview = useAddProductReview();

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const isWishlisted = wishlist?.some((w) => w.productId === id) ?? false;

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-100 rounded-sm" style={{ aspectRatio: "3/4" }} />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/3" />
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-[#FF3F6C] font-semibold">Go Home</button>
      </div>
    );
  }

  function handleAddToCart() {
    if (!selectedSize) { toast({ description: "Please select a size", variant: "destructive" }); return; }
    if (!selectedColor) { toast({ description: "Please select a color", variant: "destructive" }); return; }
    setAddingToCart(true);
    addToCart.mutate(
      { data: { productId: product!.id, size: selectedSize, color: selectedColor, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ description: "Added to bag!" });
          setAddingToCart(false);
        },
        onError: () => setAddingToCart(false),
      }
    );
  }

  function handleWishlist() {
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId: product!.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ description: "Removed from wishlist" });
        },
      });
    } else {
      addToWishlist.mutate({ data: { productId: product!.id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ description: "Added to wishlist!" });
        },
      });
    }
  }

  function submitReview() {
    if (!reviewName || !reviewComment) { toast({ description: "Please fill all fields", variant: "destructive" }); return; }
    addReview.mutate(
      { id, data: { userName: reviewName, rating: reviewRating, comment: reviewComment } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(id) });
          setShowReviewForm(false);
          setReviewName("");
          setReviewComment("");
          setReviewRating(5);
          toast({ description: "Review submitted!" });
        },
      }
    );
  }

  const images = product.imageUrls.length > 0 ? product.imageUrls : ["https://via.placeholder.com/600x800?text=No+Image"];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-screen-xl mx-auto">
          <nav className="text-xs text-gray-400 flex items-center gap-1">
            <button onClick={() => navigate("/")} className="hover:text-[#FF3F6C]">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigate(`/category/${product.category}`)} className="hover:text-[#FF3F6C] capitalize">{product.category}</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-semibold truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-sm border border-gray-100 p-6">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-sm bg-gray-50" style={{ aspectRatio: "3/4" }}>
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIdx((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-20 rounded-sm overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-[#FF3F6C]" : "border-gray-200"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            <div>
              <p className="text-lg font-bold text-gray-900 uppercase tracking-wide">{product.brand}</p>
              <h1 className="text-base text-gray-600 mt-1">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-sm text-gray-500">| {product.reviewCount.toLocaleString()} Ratings</span>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-100 py-4">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">MRP</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900">&#8377;{product.price.toLocaleString()}</span>
                <span className="text-base text-gray-400 line-through">&#8377;{product.originalPrice.toLocaleString()}</span>
                <span className="text-base font-bold text-orange-500">({product.discount}% OFF)</span>
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">Inclusive of all taxes</p>
            </div>

            {/* Color */}
            {product.colors.filter(c => c !== "N/A").length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  Color: <span className="font-normal text-gray-600">{selectedColor || "Select"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.filter(c => c !== "N/A").map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-semibold border rounded-sm transition-all ${selectedColor === color ? "border-[#FF3F6C] text-[#FF3F6C] bg-pink-50" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.filter(s => s !== "One Size" && s !== "Free Size" && s !== "N/A").length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Size: <span className="font-normal text-gray-600">{selectedSize || "Select"}</span>
                  </p>
                  <button className="text-xs text-[#FF3F6C] font-semibold hover:underline">Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.filter(s => s !== "One Size" && s !== "Free Size" && s !== "N/A").map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 text-sm font-bold border rounded-full transition-all ${selectedSize === size ? "border-[#FF3F6C] text-[#FF3F6C] bg-pink-50" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleWishlist}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border font-bold text-sm uppercase tracking-wide transition-all ${isWishlisted ? "border-[#FF3F6C] text-[#FF3F6C] bg-pink-50" : "border-gray-300 text-gray-700 hover:border-[#FF3F6C] hover:text-[#FF3F6C]"}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-[#FF3F6C]" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FF3F6C] text-white font-bold text-sm uppercase tracking-wide hover:bg-[#e0365f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                {!product.inStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Bag"}
              </button>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: Truck, label: "Free Delivery", sub: "on orders above ₹499" },
                { icon: RotateCcw, label: "Easy Returns", sub: "14-day return policy" },
                { icon: Shield, label: "100% Genuine", sub: "Assured quality" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-2">
                  <Icon className="w-5 h-5 text-gray-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Product Details</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-6 bg-white rounded-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Ratings & Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm text-[#FF3F6C] font-bold border border-[#FF3F6C] px-3 py-1.5 hover:bg-pink-50 transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Overall Rating */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-sm">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">{product.rating}</p>
              <StarRating rating={product.rating} size="sm" />
              <p className="text-xs text-gray-400 mt-1">{product.reviewCount.toLocaleString()} ratings</p>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-sm">
              <h3 className="font-bold text-gray-800 mb-3">Write Your Review</h3>
              <div className="space-y-3">
                <input
                  placeholder="Your name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF3F6C]"
                />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                </div>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF3F6C] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitReview}
                    className="bg-[#FF3F6C] text-white px-4 py-2 text-sm font-bold hover:bg-[#e0365f] transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                        <span>{review.rating}</span>
                        <Star className="w-2.5 h-2.5 fill-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{review.userName}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first to write one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
