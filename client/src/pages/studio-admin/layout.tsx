import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Users,
  Film,
  Calendar,
  Mic,
  Settings,
  ChevronRight,
  Menu,
  Building2,
  X,
} from "lucide-react";

const navItems = [
  { href: "/studio-admin", label: "Visão Geral", icon: Home },
  { href: "/studio-admin/members", label: "Membros", icon: Users },
  { href: "/studio-admin/projects", label: "Projetos", icon: Film },
  { href: "/studio-admin/sessions", label: "Sessões", icon: Calendar },
  { href: "/studio-admin/takes", label: "Takes", icon: Mic },
  { href: "/studio-admin/settings", label: "Configurações", icon: Settings },
] as const;

export default function StudioAdminLayout({ children }: { children?: React.ReactNode }) {
  const [location] = useLocation();
  const current = navItems.find((i) => i.href === location);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  return (
    <div className="flex h-screen bg-[#090b10] relative">
      {/* Mobile menu toggle */}
      {isMobile && (
        <Button
          size="icon"
          variant="ghost"
          className="fixed top-4 left-4 z-50 bg-slate-800 border-white/10"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col border-r border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40 transition-transform",
          isMobile && (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Studio Name</h1>
              <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30 text-[10px] px-1.5 py-0">
                ADMIN
              </Badge>
            </div>
          </div>
        </div>
        <Separator className="bg-white/10" />
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => isMobile && setSidebarOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-0px)]">
        {/* Breadcrumbs */}
        <div className="px-8 py-4 border-b border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="uppercase tracking-[0.3em] text-xs">Studio Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{current?.label}</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 px-8 py-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
