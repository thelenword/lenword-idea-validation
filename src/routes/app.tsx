import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState, redirect, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, BarChart3, Lightbulb, Settings, Search,
  Bell, Sparkles, Users, ChevronDown, Plus, Command,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/use-theme";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/auth/login',
      })
    }
  },
  component: AppLayout,
});

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/reports", label: "Reports", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile } = useAuth();
  const { setTheme } = useTheme();
  const [reportsCount, setReportsCount] = useState<number | null>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate({ to: "/app/reports", search: { q: searchQuery.trim() } });
    }
  };

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from("validation_reports")
          .select("*", { count: "exact", head: true });
        
        if (!error && count !== null) {
          setReportsCount(count);
        }
      } catch (err) {
        console.error("Error fetching reports count:", err);
      }
    };
    fetchCount();
  }, [user]);

  useEffect(() => {
    if (profile?.preferences && typeof profile.preferences === 'object' && 'theme' in profile.preferences) {
      const dbTheme = (profile.preferences as any).theme;
      if (dbTheme && ['light', 'dark', 'system'].includes(dbTheme)) {
        setTheme(dbTheme as any);
      }
    }
  }, [profile?.preferences, setTheme]);
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();
  const roleName = (() => {
    const role = profile?.role || user?.user_metadata?.role;
    if (role === 'investor') return 'Investor';
    if (role === 'admin') return 'Admin';
    return 'Founder';
  })();

  return (
    <div className="relative min-h-screen flex w-full bg-background overflow-hidden">
      <AnimatedBlobs className="fixed inset-0 -z-10" />

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col p-4 border-r border-white/40 bg-white/35 backdrop-blur-2xl dark:border-cyan-950/40 dark:bg-[#050810]/85">
        <Link to="/" className="group flex items-center gap-2 px-2 py-2">
          <div className="flex-1">
            <div className="text-sm font-semibold leading-tight tracking-tight">LENWORD</div>
            <div className="text-[10px] text-muted-foreground">Validate</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
        </Link>

        <Link to="/validate" className="mt-5 btn-primary rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> New validation
        </Link>

        <nav className="mt-6 space-y-1">
          <div className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Workspace</div>
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/app" && pathname.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                  active
                    ? "text-foreground bg-white/80 shadow-[0_4px_18px_-8px_rgba(108,85,249,0.35)] border border-white/80 dark:bg-white/[0.05] dark:border-cyan-900/20 dark:shadow-none"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.03]"
                }`}>
                {active && <motion.span layoutId="nav-dot" className="absolute left-0 h-5 w-1 rounded-r-full" style={{ background: "var(--gradient-primary)" }} />}
                <n.icon className={`h-4 w-4 transition ${active ? "text-primary" : "group-hover:text-primary"}`} />
                <span className="flex-1">{n.label}</span>
                {n.label === "Reports" && reportsCount !== null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{reportsCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto glass-card rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-50" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative">
            <div className="text-xs font-medium">Upgrade to Scale</div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">Unlimited reports, custom benchmarks, and investor exports.</p>
            <button className="mt-3 w-full btn-primary rounded-lg px-3 py-1.5 text-xs font-medium">Upgrade</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 px-6 py-3.5 border-b border-white/40 bg-white/55 backdrop-blur-2xl dark:border-cyan-950/40 dark:bg-[#060A10]/85 flex items-center gap-4">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search reports, markets, founders…"
              className="w-full rounded-xl bg-white/70 border border-white/70 pl-9 pr-16 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 dark:bg-white/5 dark:border-white/10 transition" 
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-white border border-border/60 text-muted-foreground dark:bg-white/10">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
          <ThemeToggle />
          <Link to="/app/settings" className="flex items-center gap-2 pl-3 border-l border-border/60 hover:opacity-80 transition-opacity">
            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-white shadow" style={{ background: "var(--gradient-primary)" }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">{initials}</span>
              )}
            </div>
            <div className="hidden sm:block text-sm leading-tight">
              <div className="font-medium">{displayName}</div>
              <div className="text-[10px] text-muted-foreground">{roleName}</div>
            </div>
          </Link>
        </header>
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>

      <FloatingActionButton />
    </div>
  );
}
