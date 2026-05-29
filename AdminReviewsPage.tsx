import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminListReviews, getAdminListReviewsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-600"}>★</span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const { data, isLoading } = useAdminListReviews({ page, limit: 20 });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: getAdminListReviewsQueryKey() });
      showToast("Review deleted.");
    } catch {
      showToast("Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Check size={16} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total reviews</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Product ID</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Comment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-800 animate-pulse rounded" /></td></tr>
              ))}
              {!isLoading && data?.reviews?.map(review => (
                <tr key={review.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{review.userName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">#{review.productId}</td>
                  <td className="px-4 py-3">
                    <Stars rating={review.rating} />
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs">
                    <p className="line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deleting === review.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.reviews?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No reviews found.</td></tr>
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
