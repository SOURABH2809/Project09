import StatsGrid from "./StatsGrid";
import SalesRevenueChart from "./SalesRevenueChart";
import InventoryOverview from "./InventoryOverview";
import TopProducts from "./TopProducts";

export default function AdminDashboard() {
  return <section className="bg-white px-4 py-6 font-sans text-slate-900 sm:px-6 lg:px-8"><h1 className="text-2xl font-semibold tracking-tight">Store Front</h1><p className="mt-1 text-sm text-slate-500">Track sales, monitor orders, and analyze store performance.</p><StatsGrid /><SalesRevenueChart /><div className="mt-5 grid gap-5 lg:grid-cols-2"><InventoryOverview /><TopProducts /></div></section>;
}
