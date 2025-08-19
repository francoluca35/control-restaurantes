"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeMasterRedirect() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log("🔍 HomeMasterRedirect - Starting redirect...");
      router.push("/home-master/login");
    } catch (err) {
      console.error("❌ Error in HomeMasterRedirect:", err);
      setError(err.message);
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Application</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/home-master/login")}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}
