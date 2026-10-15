export type DashboardIconName = "eye" | "wallet" | "box" | "users";

export const stats = [
  { label: "Total Views", value: "34.5K", change: "0.43%", up: true, icon: "eye" as const, tint: "bg-blue-50 text-blue-500" },
  { label: "Total profit", value: "$42,200.0", change: "4.35%", up: true, icon: "wallet" as const, tint: "bg-emerald-50 text-emerald-500" },
  { label: "Total Order", value: "2,450", change: "2.59%", up: true, icon: "box" as const, tint: "bg-orange-50 text-orange-500" },
  { label: "Total User", value: "3,465", change: "0.95%", up: false, icon: "users" as const, tint: "bg-purple-50 text-purple-500" },
];

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const salesSeries: [number, number][] = [[0, 120], [1, 260], [2, 370], [3, 460], [4, 390], [5, 530], [6, 610], [7, 540], [8, 580], [9, 620], [10, 590], [10.35, 600]];
export const revenueSeries: [number, number][] = [[0, 230], [1, 190], [2, 250], [3, 350], [4, 310], [5, 640], [6, 740], [7, 680], [8, 770], [9, 850], [10, 700], [10.35, 650]];

export const products = [
  { name: "Keyboard H32", sales: "1,284", rank: 1, revenue: "$192.3K", growth: "10.98%" },
  { name: "Mouse M12 Pro", sales: "985", rank: 2, revenue: "$143.7K", growth: "8.72%" },
  { name: "Gaming Chair X5", sales: "732", rank: 3, revenue: "$117.4K", growth: "7.61%" },
  { name: "Wireless Headset V7", sales: "640", rank: 4, revenue: "$210.5K", growth: "6.24%" },
];
