import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Users, UserCheck, DollarSign, BookOpen,
  BarChart3, PieChart, Calendar, Clock, Award, AlertCircle, CheckCircle2,
  Sliders, Save, Download, RefreshCw, Filter, Eye, GraduationCap,
  HeartPulse, Package, UtensilsCrossed, ShieldCheck
} from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import { useAuth } from "../context/AuthContext";

const INITIAL_ANALYTICS_CONFIG = {
  refreshInterval: 30,
  defaultDateRange: "this_month",
  showAttendanceWidget: true,
  showFeeWidget: true,
  showAcademicWidget: true,
  showClinicWidget: true,
  showCanteenWidget: true,
  showInventoryWidget: true,
  colorTheme: "cyan",
  showPercentageChange: true,
  exportFormat: "pdf",
};

const TREND_UP = "up";
const TREND_DOWN = "down";

const STATS = [
  { id: "enroll", label: "Total Students", value: "1,247", change: "+23", trend: TREND_UP, icon: Users, color: "from-cyan-500 to-blue-600", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { id: "attend", label: "Avg. Attendance", value: "91.4%", change: "+2.1%", trend: TREND_UP, icon: UserCheck, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: "fees", label: "Fee Collection (Sep)", value: "₹8.4L", change: "+₹1.2L", trend: TREND_UP, icon: DollarSign, color: "from-amber-500 to-yellow-600", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "leave", label: "Pending Leave Apps", value: "7", change: "-3", trend: TREND_DOWN, icon: Clock, color: "from-rose-500 to-pink-600", bg: "bg-rose-500/10 border-rose-500/20" },
  { id: "exam", label: "Avg. Score (Term 1)", value: "73.2%", change: "+4.8%", trend: TREND_UP, icon: GraduationCap, color: "from-indigo-500 to-violet-600", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { id: "clinic", label: "Clinic Visits (Sep)", value: "34", change: "+8", trend: TREND_UP, icon: HeartPulse, color: "from-rose-400 to-rose-600", bg: "bg-rose-400/10 border-rose-400/20" },
  { id: "canteen", label: "Canteen Revenue (Sep)", value: "₹42,800", change: "+₹3,200", trend: TREND_UP, icon: UtensilsCrossed, color: "from-orange-500 to-amber-600", bg: "bg-orange-500/10 border-orange-500/20" },
  { id: "inventory", label: "Assets Under Repair", value: "5", change: "-2", trend: TREND_DOWN, icon: Package, color: "from-slate-400 to-slate-600", bg: "bg-slate-400/10 border-slate-400/20" },
];

const ATTENDANCE_TREND = [
  { month: "Apr", rate: 88 }, { month: "May", rate: 92 }, { month: "Jun", rate: 85 },
  { month: "Jul", rate: 90 }, { month: "Aug", rate: 93 }, { month: "Sep", rate: 91 },
];

const FEE_TREND = [
  { month: "Apr", collected: 620, due: 50 }, { month: "May", collected: 710, due: 30 },
  { month: "Jun", collected: 580, due: 80 }, { month: "Jul", collected: 750, due: 25 },
  { month: "Aug", collected: 800, due: 20 }, { month: "Sep", collected: 840, due: 40 },
];

const CLASS_PERFORMANCE = [
  { class: "8A", score: 76 }, { class: "9B", score: 71 }, { class: "10A", score: 79 },
  { class: "11S", score: 68 }, { class: "12S", score: 74 }, { class: "12C", score: 72 },
];

const DEPARTMENT_BREAKDOWN = [
  { dept: "Science", pct: 31, color: "#06b6d4" },
  { dept: "Commerce", pct: 22, color: "#8b5cf6" },
  { dept: "Arts", pct: 19, color: "#f59e0b" },
  { dept: "Middle Sch.", pct: 28, color: "#10b981" },
];

const TOP_PERFORMERS = [
  { name: "Vanlalhruaia Chawngthu", class: "12 Sci", score: 96.4, rank: 1 },
  { name: "Lalbiakhlui Sailo", class: "12 Sci", score: 94.8, rank: 2 },
  { name: "Ramdinliani Pachuau", class: "11 Sci", score: 93.2, rank: 3 },
  { name: "Lalduhawma Hmar", class: "10 A", score: 92.7, rank: 4 },
  { name: "Lalruatfeli Zote", class: "12 Com", score: 91.5, rank: 5 },
];

const ALERTS = [
  { id: 1, type: "warning", text: "Attendance below 75% — 14 students flagged for term barring.", icon: AlertCircle, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  { id: 2, type: "info", text: "Fee arrears total: ₹24,500 — 8 students have balances exceeding 60 days.", icon: DollarSign, color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
  { id: 3, type: "success", text: "Term 1 results uploaded successfully. Report cards ready for download.", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  { id: 4, type: "info", text: "Inventory alert: Microscope Set (Physics Lab) stock critical — 1 unit remaining.", icon: Package, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
];

// Mini Bar Chart
function BarChart({ data, valueKey, labelKey, color = "#06b6d4", maxVal = null }) {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-lg" style={{ height: `${(d[valueKey] / max) * 88}px`, background: color, opacity: 0.85 }} />
          <span className="text-[9px] text-slate-500 font-mono">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

// Mini Donut Chart (CSS-based)
function DonutChart({ data }) {
  let cumulative = 0;
  const total = data.reduce((s, d) => s + d.pct, 0);
  const size = 96;
  const radius = 36;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((d, i) => {
          const dash = (d.pct / total) * circumference;
          const gap = circumference - dash;
          const offset = -(cumulative / total) * circumference;
          cumulative += d.pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={d.color} strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} />
          );
        })}
        <circle cx={cx} cy={cy} r={28} fill="#0f172a" />
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-300">{d.dept}</span>
            <span className="text-slate-500 font-mono ml-1">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboardView() {
  const { currentUser } = useAuth();
  const [dateRange, setDateRange] = useState("this_month");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsConfig, setAnalyticsConfig] = useState(() => {
    try { const s = localStorage.getItem("zoxs_analytics_config"); return s ? { ...INITIAL_ANALYTICS_CONFIG, ...JSON.parse(s) } : INITIAL_ANALYTICS_CONFIG; }
    catch { return INITIAL_ANALYTICS_CONFIG; }
  });
  const [toast, setToast] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { localStorage.setItem("zoxs_analytics_config", JSON.stringify(analyticsConfig)); }, [analyticsConfig]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const handleRefresh = () => { setLastRefresh(new Date()); showToast("Dashboard data refreshed!"); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <span className="text-3xl">📊</span> Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">School performance insights — Attendance, Fees, Academics & Operations.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_term">This Term</option>
            <option value="this_year">This Year</option>
          </select>
          <button onClick={handleRefresh} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => showToast("Generating PDF report...")} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export
          </button>
          <button onClick={() => setActiveTab(activeTab === "config" ? "overview" : "config")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${activeTab === "config" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}>
            <Sliders className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      <p className="text-[11px] text-slate-600 font-mono">Last updated: {lastRefresh.toLocaleTimeString()}</p>

      {/* ── OVERVIEW ────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className={`bg-slate-900 border rounded-2xl p-4 ${stat.bg}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] font-bold ${stat.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                      {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="font-extrabold text-white text-xl font-['Outfit']">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-400" /> Attendance Trend</h3>
              <BarChart data={ATTENDANCE_TREND} valueKey="rate" labelKey="month" color="#10b981" maxVal={100} />
              <p className="text-[10px] text-slate-500 mt-3 font-mono">Monthly avg. attendance rate (%)</p>
            </div>

            {/* Fee Collection */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-400" /> Fee Collection (₹k)</h3>
              <BarChart data={FEE_TREND} valueKey="collected" labelKey="month" color="#f59e0b" />
              <p className="text-[10px] text-slate-500 mt-3 font-mono">Monthly fees collected (in ₹000s)</p>
            </div>

            {/* Department Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-400" /> Dept. Enrollment</h3>
              <DonutChart data={DEPARTMENT_BREAKDOWN} />
              <p className="text-[10px] text-slate-500 mt-3 font-mono">Student distribution by department</p>
            </div>
          </div>

          {/* Bottom Row: Class Performance + Top Performers + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class Performance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Class-wise Avg. Score</h3>
              <BarChart data={CLASS_PERFORMANCE} valueKey="score" labelKey="class" color="#06b6d4" maxVal={100} />
              <p className="text-[10px] text-slate-500 mt-3 font-mono">Term 1 average score by class (%)</p>
            </div>

            {/* Top Performers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Top Performers</h3>
              <div className="space-y-2.5">
                {TOP_PERFORMERS.map(s => (
                  <div key={s.rank} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${s.rank === 1 ? "bg-amber-500" : s.rank === 2 ? "bg-slate-400" : s.rank === 3 ? "bg-amber-700" : "bg-slate-700"}`}>{s.rank}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400">Class {s.class}</p>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">{s.score}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 col-span-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400" /> Action Alerts</h3>
              <div className="space-y-2.5">
                {ALERTS.map(alert => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${alert.color}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{alert.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIG ──────────────────────────────────────────────────────────── */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><Sliders className="w-4 h-4 text-cyan-400" /> Dashboard Settings</h3>
            {[
              { key: "showAttendanceWidget", label: "Attendance Analytics Widget", desc: "Show attendance trend chart and rate KPI." },
              { key: "showFeeWidget", label: "Fee Collection Widget", desc: "Show fee collection graph and arrears alert." },
              { key: "showAcademicWidget", label: "Academic Performance Widget", desc: "Show class-wise scores and top performers." },
              { key: "showClinicWidget", label: "Clinic & Health Widget", desc: "Show sick bay visits and medical KPIs." },
              { key: "showCanteenWidget", label: "Canteen Revenue Widget", desc: "Show daily canteen sales and wallet recharge stats." },
              { key: "showInventoryWidget", label: "Inventory Status Widget", desc: "Show lab asset health and pending repairs." },
              { key: "showPercentageChange", label: "Show % Change Indicators", desc: "Display percentage change arrows on KPI cards." },
            ].map(item => (
              <label key={item.key} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-white text-xs">{item.label}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <input type="checkbox" checked={analyticsConfig[item.key]} onChange={e => setAnalyticsConfig(p => ({ ...p, [item.key]: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-500 ml-3 flex-shrink-0" />
              </label>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs h-fit">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Advanced Options</h3>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Auto-Refresh Interval</label>
              <select value={analyticsConfig.refreshInterval} onChange={e => setAnalyticsConfig(p => ({ ...p, refreshInterval: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                <option value={0}>Manual Refresh Only</option>
                <option value={15}>Every 15 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Default Date Range</label>
              <select value={analyticsConfig.defaultDateRange} onChange={e => setAnalyticsConfig(p => ({ ...p, defaultDateRange: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_term">This Term</option>
                <option value="this_year">This Year</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Export Format</label>
              <select value={analyticsConfig.exportFormat} onChange={e => setAnalyticsConfig(p => ({ ...p, exportFormat: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                <option value="pdf">PDF Report</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
                <option value="json">JSON (API)</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => { showToast("Analytics settings saved!"); setActiveTab("overview"); }} className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition">
                <Save className="w-3.5 h-3.5" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
