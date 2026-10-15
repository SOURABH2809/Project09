"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { months, revenueSeries, salesSeries } from "@/features/dashboard/mockData";

const chartData = months.map((month, index) => ({ month, sales: salesSeries.find(([i]) => i === index)?.[1] ?? null, revenue: revenueSeries.find(([i]) => i === index)?.[1] ?? null }));

export default function SalesRevenueChart() {
  const [period, setPeriod] = useState("Monthly");
  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-slate-600">Sales and revenue performance</p><p className="mt-1 text-2xl font-semibold tracking-tight">$11,990.0</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5750F1]"><option>Monthly</option><option>Weekly</option><option>Yearly</option></select></div><div className="mt-6 h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5750F1" stopOpacity={0.2} /><stop offset="95%" stopColor="#5750F1" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#E5E7EB" strokeDasharray="3 4" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Area type="monotone" dataKey="sales" name="Sales" stroke="#5750F1" fill="url(#salesFill)" strokeWidth={2} connectNulls /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#A855F7" fill="none" strokeWidth={2} connectNulls /></AreaChart></ResponsiveContainer></div></section>;
}
