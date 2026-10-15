import { ArrowDown, ArrowUp, Eye, Package, Users, Wallet } from "lucide-react";

const icons = { eye: Eye, wallet: Wallet, box: Package, users: Users, up: ArrowUp, down: ArrowDown } as const;
export type DashboardIconName = keyof typeof icons;

export default function DashboardIcon({ name, className = "h-5 w-5" }: { name: DashboardIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
