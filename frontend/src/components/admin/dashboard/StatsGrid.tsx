import { stats } from "@/features/dashboard/mockData";
import StatCard from "./StatCard";

export default function StatsGrid() { return <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>; }
