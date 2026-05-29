import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50">
      <p className="text-8xl font-black text-[#FF3F6C] mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist.</p>
      <button
        onClick={() => navigate("/")}
        className="bg-[#FF3F6C] text-white px-8 py-3 font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
      >
        Go to Home
      </button>
    </div>
  );
}
