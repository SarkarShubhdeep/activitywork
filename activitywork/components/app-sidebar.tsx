"use client";

import type { LucideIcon } from "lucide-react";
import { AppWindow, LayoutDashboard, SlidersHorizontal } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

/** Stable route ids; add entries here when introducing new pages. */
export type AppPageId = "home" | "tracked-windows" | "plugin-settings";

export type AppSidebarProps = {
    activePage: AppPageId;
    onNavigate: (page: AppPageId) => void;
};

const navItems: Array<{
    id: AppPageId;
    label: string;
    icon: LucideIcon;
}> = [
    { id: "home", label: "About", icon: LayoutDashboard },
    { id: "tracked-windows", label: "Tracked windows", icon: AppWindow },
    {
        id: "plugin-settings",
        label: "Plugin settings",
        icon: SlidersHorizontal,
    },
];

/** Title shown in the top bar for each route. */
export function getAppPageTitle(page: AppPageId): string {
    return navItems.find((item) => item.id === page)?.label ?? page;
}

export function AppSidebar({ activePage, onNavigate }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border p-0">
                <div className="flex w-full h-12 items-center justify-start group-data-[collapsible=icon]:justify-center">
                    <div className="hidden h-full items-center justify-center text-sm font-semibold group-data-[collapsible=icon]:flex">
                        AW
                    </div>
                    <div className="flex min-w-0 flex-1 items-center truncate px-4 text-sm font-semibold group-data-[collapsible=icon]:hidden h-full">
                        ActivityWork
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={activePage === item.id}
                                        tooltip={item.label}
                                        onClick={() => onNavigate(item.id)}
                                    >
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
