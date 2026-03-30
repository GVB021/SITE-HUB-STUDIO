import React from "react";
import { useLocation, Link, Route, Switch } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Building2,
  Users,
  BarChart3,
  Layers,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/platform-admin", label: "Visão Geral", icon: Globe },
  { href: "/platform-admin/studios", label: "Estúdios", icon: Building2 },
  { href: "/platform-admin/users", label: "Usuários", icon: Users },
  { href: "/platform-admin/metrics", label: "Métricas", icon: BarChart3 },
] as const;

export default function PlatformAdminLayout({ children }: { children?: React.ReactNode }) {
  const [location] = useLocation();
  const current = navItems.find((i) => i.href === location);

  return (
    <div className="flex h-screen bg-[#090b10]">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HubDub</h1>
              <Badge variant="secondary" className="bg-violet-600/20 text-violet-300 border-violet-600/30 text-[10px] px-1.5 py-0">
                PLATFORM ADMIN
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
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-violet-600/20 text-violet-300 border-l-2 border-violet-500"
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

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-0px)]">
        {/* Breadcrumbs */}
        <div className="px-8 py-4 border-b border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="uppercase tracking-[0.3em] text-xs">Platform Admin</span>
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
