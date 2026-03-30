"use client";

import * as React from "react";

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggleSidebar = React.useCallback(() => {
    setOpen((value) => !value);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div className="relative flex min-h-screen w-full">{children}</div>
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

export function SidebarTrigger({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 ${className}`}
    >
      {children ?? "Toggle Live Feed"}
    </button>
  );
}

export function Sidebar({
  children,
  className = "",
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const { open } = useSidebar();
  const sidePosition = side === "right" ? "right-0" : "left-0";
  const hiddenTransform =
    side === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <aside
      className={`fixed top-0 ${sidePosition} z-40 h-screen w-full max-w-md border-zinc-200 bg-white/95 backdrop-blur transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950/95 md:border-l ${open ? "translate-x-0" : hiddenTransform} ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`h-[calc(100%-56px)] overflow-y-auto p-4 ${className}`}>{children}</div>;
}

