import DashboardIcon from "./DashboardIcon";

export default function Trend({ value, up }: { value: string; up: boolean }) {
  return <span className={`inline-flex items-center gap-1 text-sm font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>{value}<DashboardIcon name={up ? "up" : "down"} className="h-3.5 w-3.5" /></span>;
}
