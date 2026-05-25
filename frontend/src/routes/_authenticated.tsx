import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sparkles } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading, role } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!session) {
    throw redirect({ to: "/login" });
  }

  const isAdminRoute = loc.pathname.startsWith("/admin");
  const showBottomNav = !isAdminRoute && role !== "district_admin" && role !== "super_admin";

  return (
    <div className="min-h-screen bg-background">
      <div className={showBottomNav ? "pb-20" : ""}>
        <Outlet />
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
