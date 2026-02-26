'use client';

import {
  Bell,
  FileText,
  LayoutDashboard,
  List,
  Scale,
  Send,
  Settings,
  Webhook,
  Activity,
  HeartPulse,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
  {
    title: '标的管理',
    url: '/admin/instruments',
    icon: List,
  },
  {
    title: '规则管理',
    url: '/admin/rules',
    icon: Scale,
  },
  {
    title: 'Webhook管理',
    url: '/admin/webhooks',
    icon: Webhook,
  },
  {
    title: '系统设置',
    url: '/admin/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold tracking-tight">Gold Watch</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
