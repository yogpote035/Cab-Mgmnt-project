import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalApiLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout;
    function onLoading(event) {
      if (event.detail) {
        clearTimeout(timeout);
        setLoading(true);
      } else {
        timeout = setTimeout(() => setLoading(false), 220);
      }
    }
    window.addEventListener("api-loading", onLoading);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("api-loading", onLoading);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-20 z-[70] rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-100">
        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
        Loading...
      </div>
    </div>
  );
}

