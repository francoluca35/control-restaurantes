import { redirect } from "next/navigation";

export default function Home() {
  // Add error boundary and debugging
  try {
    console.log("🔍 Home page loading...");
    redirect("/home-master");
  } catch (error) {
    console.error("❌ Error in Home page:", error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Application</h1>
          <p className="text-red-400 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
