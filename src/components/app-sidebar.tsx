import { Link } from "@tanstack/react-router";
import { List, Scale, Webhook } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
	{
		title: "标的管理",
		url: "/admin/instruments",
		icon: List,
	},
	{
		title: "规则管理",
		url: "/admin/rules",
		icon: Scale,
	},
	{
		title: "Webhook管理",
		url: "/admin/webhooks",
		icon: Webhook,
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
										<Link
											to={item.url}
											activeProps={{
												className: "bg-accent text-accent-foreground",
											}}
										>
											<item.icon />
											<span>{item.title}</span>
										</Link>
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
