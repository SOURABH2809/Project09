"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, CalendarDays, ChevronDown, ChevronUp, CircleUserRound, FileText, LayoutDashboard, Mail, MessageCircle, PanelLeft, Settings, ShoppingBag, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

type Icon = LucideIcon;
type Item = { label: string; href?: string; icon: Icon; expandable?: boolean };

const mainItems: Item[] = [
  { label: "Dashboard", href: "/admin-panel", icon: LayoutDashboard, expandable: true },
  { label: "Analytics", icon: BarChart3 },
  { label: "Marketing", icon: BarChart3 },
  { label: "Customers", icon: UsersRound },
  { label: "Calendar", icon: CalendarDays },
  { label: "Profile", icon: CircleUserRound },
];

const supportItems: Item[] = [
  { label: "Chats", icon: MessageCircle },
  { label: "Email", icon: Mail },
];

function NavItem({ item, active, onToggle }: { item: Item; active: boolean; onToggle?: () => void }) {
  const Icon = item.icon;
  const content = <><Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} /><span className="flex-1">{item.label}</span>{item.expandable && (active ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}</>;
  if (item.href && !item.expandable) return <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${active ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{content}</Link>;
  return <button type="button" onClick={onToggle} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${active ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{content}</button>;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return <aside className="flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-[#f8f8fa] px-3 text-slate-600"><div className="flex h-16 items-center justify-between px-2"><div className="flex items-center gap-2 text-[21px] font-semibold tracking-tight text-slate-800"><span className="relative inline-flex h-5 w-6"><span className="absolute left-0 top-1 h-4 w-3 -skew-y-[35deg] rounded-sm bg-indigo-600" /><span className="absolute right-0 top-0 h-4 w-3 -skew-y-[35deg] rounded-sm bg-indigo-400" /></span>NextAdmin</div><PanelLeft className="h-4 w-4 text-slate-500" /></div><nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Admin navigation"><p className="mb-3 mt-4 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Main menu</p><NavItem item={mainItems[0]} active={pathname === "/admin-panel"} onToggle={() => setDashboardOpen((value) => !value)} />{dashboardOpen && <div className="mb-1 ml-7 mt-1 space-y-0.5"><Link href="/admin-panel" className="block rounded-lg bg-slate-200 px-3 py-2 text-[13px] font-medium text-slate-800">E-commerce</Link>{mainItems.slice(1).map((item) => <span key={item.label} className="block px-3 py-2 text-[13px] text-slate-600">{item.label}</span>)}</div>}<div className="mt-1 space-y-0.5">{[{ label: "Calendar", icon: CalendarDays }, { label: "Profile", icon: CircleUserRound }, { label: "Pages", icon: FileText }].map((item) => <NavItem key={item.label} item={item} active={false} />)}</div><button type="button" onClick={() => setSettingsOpen((value) => !value)} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"><Settings className="h-[18px] w-[18px]" strokeWidth={1.8} /><span className="flex-1">Settings</span>{settingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>{settingsOpen && <div className="ml-9 mt-1 space-y-0.5"><Link href="/admin-panel/users" className="block rounded-lg px-3 py-2 text-[13px] hover:bg-slate-100">Users</Link><Link href="/admin-panel/roles" className="block rounded-lg px-3 py-2 text-[13px] hover:bg-slate-100">Roles</Link><Link href="/admin-panel/permissions" className="block rounded-lg px-3 py-2 text-[13px] hover:bg-slate-100">Permissions</Link><Link href="/admin-panel/groups" className="block rounded-lg px-3 py-2 text-[13px] hover:bg-slate-100">Groups</Link><LogoutButton className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50" /></div>}<p className="mb-3 mt-6 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Support</p>{supportItems.map((item) => <NavItem key={item.label} item={item} active={false} />)}</nav><div className="mx-1 mb-3 rounded-xl bg-white p-4 text-center shadow-sm"><ShoppingBag className="mx-auto h-7 w-7 text-indigo-500" /><h3 className="mt-2 text-sm font-semibold text-slate-800">Upgrade to Pro</h3><p className="mt-2 text-xs leading-5 text-slate-500">Get all dashboard and 200+ essential UI elements</p><button type="button" className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">Upgrade to Pro</button></div></aside>;
}
