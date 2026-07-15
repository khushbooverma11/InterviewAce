import { type ReactNode } from "react";
import { Home, Swords, Users, User } from "lucide-react";
import "./tokens.css";

/**
 * InterviewAce shared mobile shell — "Command Deck" design system.
 * Renders a phone-frame viewport with a status bar, scrollable content
 * slot, and bottom tab navigation. Pages render their content inside
 * <AppShell activeTab="..."> and should NOT render their own nav or
 * status bar.
 */

type Tab = "home" | "practice" | "discuss" | "profile";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Learn", icon: Home },
  { id: "practice", label: "Practice", icon: Swords },
  { id: "discuss", label: "Discuss", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

export function AppShell({
  activeTab,
  children,
}: {
  activeTab: Tab;
  children: ReactNode;
}) {
  return (
    <div className="ia-scope min-h-screen flex items-start justify-center py-0">
      <div
        className="relative w-full max-w-[390px] h-[844px] overflow-hidden flex flex-col"
        style={{ background: "var(--ia-bg)" }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-1 text-[13px] ia-mono shrink-0" style={{ color: "var(--ia-text-dim)" }}>
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span style={{ color: "var(--ia-accent-2)" }}>●</span> LIVE
          </span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>

        {/* Bottom nav */}
        <div
          className="shrink-0 grid grid-cols-4 border-t"
          style={{
            background: "var(--ia-bg-elevated)",
            borderColor: "var(--ia-border-soft)",
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <div
                key={tab.id}
                className="flex flex-col items-center gap-1 py-3"
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={active ? 2.4 : 1.8}
                  style={{
                    color: active ? "var(--ia-accent-2)" : "var(--ia-text-faint)",
                  }}
                />
                <span
                  className="text-[10px] tracking-wide"
                  style={{
                    color: active ? "var(--ia-text)" : "var(--ia-text-faint)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
