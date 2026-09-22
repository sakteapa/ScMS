import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  Award, 
  UserCheck, 
  HeartPulse, 
  ShieldCheck, 
  Package, 
  UtensilsCrossed, 
  UserPlus,
  Check,
  FileText,
  Clock,
  Server,
  Archive,
  ExternalLink
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function ExportModal({ isOpen, onClose }) {
  const { 
    exportDataToCSV, 
    exportDataToExcel, 
    students = [], 
    fees = [], 
    grades = [],
    staff = [],
    attendance = [],
    clinicRecords = [],
    visitors = [],
    inventoryAssets = [],
    canteenTransactions = [],
    admissions = []
  } = useSchool();

  const [format, setFormat] = useState('excel'); // 'excel' | 'csv'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadedItem, setDownloadedItem] = useState(null);

  if (!isOpen) return null;

  const exportOptions = [
    {
      id: 'students',
      category: 'academic',
      title: 'Student Master Directory',
      description: 'All enrolled students, classes, streams, contact info, and current attendance rates',
      count: `${students.length} Records`,
      icon: Users,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
    },
    {
      id: 'financials',
      category: 'finance',
      title: 'Financial Ledger & Fee Receipts',
      description: 'Complete fee transactions, dual UPI (UTR) & Cash cashier receipt ledger',
      count: `${fees.length} Receipts`,
      icon: CreditCard,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'grades',
      category: 'academic',
      title: 'Academic Grade Sheets',
      description: 'Continuous Class Tests and Term Examinations across Nursery to Class 12',
      count: `${grades.length} Marks`,
      icon: Award,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300'
    },
    {
      id: 'staff',
      category: 'operations',
      title: 'Staff & Governance Directory',
      description: 'Teaching and non-teaching faculty roster, designations, base pay, and departments',
      count: `${staff.length} Staff`,
      icon: UserCheck,
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300'
    },
    {
      id: 'attendance',
      category: 'academic',
      title: 'Daily Attendance Matrix',
      description: 'Live QR scanner verified daily attendance records and session logs',
      count: `${attendance.length} Logs`,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
    },
    {
      id: 'clinic',
      category: 'operations',
      title: 'Health Clinic & Infirmary',
      description: 'Sick bay inpatient admissions, vitals readings, complaints, and dispensed medicines',
      count: `${clinicRecords.length} Visits`,
      icon: HeartPulse,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300'
    },
    {
      id: 'visitors',
      category: 'operations',
      title: 'Gate Pass & Visitor Registry',
      description: 'Campus gate entry passes, host faculties visited, vehicle numbers, and checkout logs',
      count: `${visitors.length} Passes`,
      icon: ShieldCheck,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300'
    },
    {
      id: 'inventory',
      category: 'operations',
      title: 'Science Lab & Campus Assets',
      description: 'Physics, Chemistry, Biology, and IT PC assets with condition status and depreciation',
      count: `${inventoryAssets.length} Assets`,
      icon: Package,
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-300'
    },
    {
      id: 'canteen',
      category: 'finance',
      title: 'Canteen Smart Card Ledger',
      description: 'Student meal card deductions, daily spending, and prepaid wallet recharges',
      count: `${canteenTransactions.length} Orders`,
      icon: UtensilsCrossed,
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300'
    },
    {
      id: 'admissions',
      category: 'academic',
      title: 'Online Admission Applications',
      description: 'Prospective student enrollment applications, merit marks, and verification statuses',
      count: `${admissions.length} Applicants`,
      icon: UserPlus,
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300'
    }
  ];

  const filteredOptions = exportOptions.filter(opt => {
    if (selectedCategory === 'all') return true;
    return opt.category === selectedCategory;
  });

  const handleExport = (id) => {
    if (format === 'excel') {
      exportDataToExcel(id);
    } else {
      exportDataToCSV(id);
    }
    setDownloadedItem(id);
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  const handleBatchExport = () => {
    filteredOptions.forEach((opt, idx) => {
      setTimeout(() => {
        if (format === 'excel') {
          exportDataToExcel(opt.id);
        } else {
          exportDataToCSV(opt.id);
        }
      }, idx * 400);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1626] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#101b30] to-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                <span>Institutional Data Export Suite</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">10 Modules</span>
              </h2>
              <p className="text-xs text-slate-400">
                1-Click download verified records with UTF-8 BOM encoding for Microsoft Excel & CSV
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Format Selector & Category Filter */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All (10)' },
              { id: 'academic', label: 'Academic' },
              { id: 'finance', label: 'Financial' },
              { id: 'operations', label: 'Operations' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Format Toggle & Batch Download */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFormat('excel')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  format === 'excel'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xls)</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  format === 'csv'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            <button
              onClick={handleBatchExport}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
              title="Download all selected categories"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Batch</span>
            </button>
          </div>
        </div>

        {/* Web Hosting Production Deployment Banner */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Web Hosting Server Package (.ZIP)</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                cPanel, Hostinger, GoDaddy <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">public_html</code>-a upload mai theih tur build sa vek a ni.
              </p>
            </div>
          </div>
          <a
            href="/scms-production-webhosting.zip"
            download="scms-production-webhosting.zip"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition shrink-0"
          >
            <Archive className="w-4 h-4" />
            <span>Download ZIP (999 KB)</span>
          </a>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[55vh] scrollbar-thin">
          {filteredOptions.map((opt) => {
            const Icon = opt.icon;
            const isDownloaded = downloadedItem === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleExport(opt.id)}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${opt.color} bg-slate-950/60 shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-2 flex-wrap">
                      <span>{opt.title}</span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {opt.count}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <button className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isDownloaded
                      ? 'bg-emerald-500 text-slate-950'
                      : format === 'excel'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-slate-950'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 group-hover:bg-indigo-500 group-hover:text-white'
                  }`}>
                    {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isDownloaded ? 'Downloaded' : format === 'excel' ? 'Excel' : 'CSV'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Formatted with UTF-8 BOM encoding for Microsoft Excel & Google Sheets</span>
          <span className="font-mono text-cyan-400">{filteredOptions.length} collections ready</span>
        </div>
      </div>
    </div>
  );
}
