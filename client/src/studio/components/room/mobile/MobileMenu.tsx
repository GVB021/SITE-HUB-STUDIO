import { type ReactNode } from "react";
import { Link } from "wouter";
import { Drawer } from "vaul";
import { ChevronRight } from "lucide-react";
import { cn } from "@studio/lib/utils";

interface MobileMenuItem {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  href?: string;
  testId?: string;
  visible?: boolean;
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MobileMenuItem[];
  overlayZIndex: number;
  contentZIndex: number;
}

export function MobileMenu({
  open,
  onOpenChange,
  items,
  overlayZIndex,
  contentZIndex,
}: MobileMenuProps) {
  const visibleItems = items.filter((item) => item.visible !== false);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: overlayZIndex }}
        />
        <Drawer.Content
          className="room-bg-elevated flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 outline-none max-h-[90vh]"
          style={{ zIndex: contentZIndex }}
        >
          <div className="p-6 pb-12 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-8" />
            <h2 className="text-xl font-bold mb-6 room-text-primary">Menu do Estúdio</h2>
            <div className="space-y-4">
              {visibleItems.map((item, idx) => {
                const content = (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all min-h-[56px]"
                    data-testid={item.testId}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.iconBg)}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm room-text-primary">{item.title}</div>
                        <div className="text-[11px] room-text-subtle uppercase tracking-wider">{item.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 room-text-subtle" />
                  </button>
                );

                return item.href ? (
                  <Link key={idx} to={item.href}>
                    {content}
                  </Link>
                ) : (
                  content
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
