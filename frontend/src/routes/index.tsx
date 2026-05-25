import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sparkles } from "lucide-react";
import { GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <GovIdentity />
          <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">ஏற்றுகிறது...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" />;
  if (role === "district_admin" || role === "super_admin") return <Navigate to="/admin" />;
  return <Navigate to="/home" />;
}
