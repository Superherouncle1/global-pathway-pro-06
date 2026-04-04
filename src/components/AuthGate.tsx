import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/auth", "/about", "/privacy", "/pricing"];

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Allow public routes without auth
  if (PUBLIC_PATHS.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
