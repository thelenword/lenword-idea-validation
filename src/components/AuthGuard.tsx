import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";

export function AuthGuard({ children, requireRole }: { children: React.ReactNode, requireRole?: 'founder' | 'investor' }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: "/auth/login" });
    } else if (!loading && user && requireRole && profile && profile.role !== requireRole) {
      // If they don't have the required role, redirect to their respective dashboard
      if (profile.role === 'founder') {
        router.navigate({ to: "/app/dashboard" });
      } else {
        router.navigate({ to: "/insight/dashboard" as any });
      }
    }
  }, [user, profile, loading, router, requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
