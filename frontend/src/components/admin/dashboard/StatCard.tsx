import DashboardIcon from "./DashboardIcon";
import Trend from "./Trend";
import type { stats } from "@/features/dashboard/mockData";

type Stat = (typeof stats)[number];

export default function StatCard({ stat }: { stat: Stat }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tint}`}><DashboardIcon name={stat.icon} className="h-4 w-4" /></span><p className="mt-5 text-2xl font-semibold tracking-tight">{stat.value}</p><div className="mt-1 flex items-center justify-between"><span className="text-sm text-slate-500">{stat.label}</span><Trend value={stat.change} up={stat.up} /></div></article>;
}
