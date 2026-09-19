/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - Batch Student ID Card Print Studio
 * Administrative & teacher view to batch-print official student ID cards with dynamic QR codes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  CheckSquare,
  Square,
  Search,
  Filter,
  Download,
  Eye,
  School,
  Sparkles,
  QrCode,
  Layers,
  FileDown,
  RefreshCw,
  X,
  Phone,
  Droplet,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { FirestoreStudent, SchoolClass } from '../../types';
import {
  generateStudentQrDataUrl,
  downloadStudentQrPng,
  CURRENT_ACADEMIC_YEAR,
} from '../../lib/qrCodeService';

interface BatchIdCardPrintStudioProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  onScanSimulate?: (student: FirestoreStudent) => void;
  onClose?: () => void;
}

export type CardFormat = 'portrait' | 'landscape' | 'sticker';

export const BatchIdCardPrintStudio: React.FC<BatchIdCardPrintStudioProps> = ({
  students,
  classes,
  onScanSimulate,
  onClose,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardFormat, setCardFormat] = useState<CardFormat>('portrait');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [inspectingStudent, setInspectingStudent] = useState<FirestoreStudent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter students based on class and search query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClassId === 'all' ||
        student.classId === selectedClassId ||
        student.className?.toLowerCase().includes(selectedClassId.toLowerCase());
      const matchesQuery =
        !searchQuery.trim() ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toString().includes(searchQuery.trim()) ||
        student.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.parentPhone && student.parentPhone.includes(searchQuery.trim()));
      return matchesClass && matchesQuery;
    });
  }, [students, selectedClassId, searchQuery]);

  // Preload QR codes for all filtered students
  useEffect(() => {
    let isCancelled = false;
    const loadQrs = async () => {
      setIsGenerating(true);
      const newUrls: Record<string, string> = { ...qrDataUrls };
      const missing = filteredStudents.filter((s) => !newUrls[s.id]);

      await Promise.all(
        missing.map(async (student) => {
          try {
            const url = await generateStudentQrDataUrl(student, {
              width: cardFormat === 'sticker' ? 200 : 260,
              margin: 1,
            });
            if (!isCancelled) {
              newUrls[student.id] = url;
            }
          } catch (err) {
            console.error('Failed to generate QR for student', student.id, err);
          }
        })
      );

      if (!isCancelled) {
        setQrDataUrls(newUrls);
        setIsGenerating(false);
      }
    };

    if (filteredStudents.length > 0) {
      loadQrs();
    }
    return () => {
      isCancelled = true;
    };
  }, [filteredStudents, cardFormat]);

  // Default: select all filtered students initially or when filter changes
  useEffect(() => {
    const ids = new Set(filteredStudents.map((s) => s.id));
    setSelectedStudentIds(ids);
  }, [selectedClassId]);

  // Toggle single selection
  const toggleStudentSelection = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  // Trigger browser print dialog for selected badges
  const handlePrint = () => {
    window.print();
  };

  // Batch download QR codes for all selected students
  const handleBatchDownloadQrs = async () => {
    const targets = filteredStudents.filter((s) => selectedStudentIds.has(s.id));
    for (const student of targets) {
      await downloadStudentQrPng(student);
      // Brief pause to prevent browser spam block
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  const selectedCount = selectedStudentIds.size;
  const totalCount = filteredStudents.length;

  return (
    <div className="space-y-6">
      {/* Non-printable Control Header */}
      <div className="print:hidden bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Student ID Cards & QR Code Batch Print Studio
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  MBSE {CURRENT_ACADEMIC_YEAR}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Batch-generate and print official high-resolution student identity badges with scannable attendance QR codes.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print {selectedCount} Badges</span>
            </button>

            <button
              type="button"
              onClick={handleBatchDownloadQrs}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Download all selected QR codes as individual PNGs"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export QR PNGs</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer"
                title="Close studio"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter & Options Toolbar */}
        <div className="mt-5 pt-4 border-t border-gray-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">
              <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-white">All Classes & Grades</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-gray-900 text-white">
                    {cls.name} {cls.stream ? `(${cls.stream})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, roll #..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Select All Toggle */}
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-750 text-gray-300 border border-gray-700 cursor-pointer font-medium"
            >
              {selectedCount === totalCount && totalCount > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>
                {selectedCount === totalCount ? 'Deselect All' : `Select All (${totalCount})`}
              </span>
            </button>
          </div>

          {/* Badge Format Selector */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-700 self-start md:self-auto">
            <span className="text-[10px] uppercase font-mono text-gray-400 px-2">Layout:</span>
            <button
              type="button"
              onClick={() => setCardFormat('portrait')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                cardFormat === 'portrait'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Portrait Lanyard
            </button>
            <button
              type="button"
              onClick={() => setCardFormat('landscape')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                cardFormat === 'landscape'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Landscape Pocket
            </button>
            <button
              type="button"
              onClick={() => setCardFormat('sticker')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                cardFormat === 'sticker'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mini Token Sticker
            </button>
          </div>
        </div>

        {/* Selection Status Banner */}
        <div className="mt-3 text-[11px] text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-indigo-300 font-semibold">{selectedCount}</span> of{' '}
            <span className="text-white">{totalCount}</span> cards selected for printing
            {isGenerating && (
              <span className="inline-flex items-center gap-1 text-amber-400 ml-2 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Rendering high-res QR codes...
              </span>
            )}
          </div>
          <span className="text-gray-400 italic">
            Tip: Standard A4 print sheet fits 8 Portrait badges or 9 Landscape cards.
          </span>
        </div>
      </div>

      {/* ID Cards Grid Container */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-gray-800/60 rounded-xl border border-gray-700 text-gray-400">
          <QrCode className="w-10 h-10 mx-auto text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-white">No student records match filter criteria</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting a different class or clearing your search term.</p>
        </div>
      ) : (
        <div
          id="printable-id-cards"
          className={`grid gap-5 ${
            cardFormat === 'portrait'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-2 print:gap-4'
              : cardFormat === 'landscape'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-4'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-4 print:gap-2'
          }`}
        >
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentIds.has(student.id);
            const qrUrl = qrDataUrls[student.id];

            // Render Card based on layout format
            if (cardFormat === 'sticker') {
              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudentSelection(student.id)}
                  className={`relative p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gray-850 border-indigo-500 ring-1 ring-indigo-500/40 print:bg-white print:border-black'
                      : 'bg-gray-900 border-gray-800 opacity-60 print:hidden'
                  }`}
                >
                  <div className="w-20 h-20 mx-auto bg-white p-1 rounded border border-gray-300">
                    {qrUrl ? (
                      <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate print:text-black">
                    {student.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono print:text-gray-700">
                    Roll #{student.rollNo} • {student.className}
                  </p>
                </div>
              );
            }

            if (cardFormat === 'landscape') {
              return (
                <div
                  key={student.id}
                  className={`relative rounded-xl border-2 transition-all overflow-hidden flex flex-col justify-between shadow-lg ${
                    isSelected
                      ? 'bg-gray-850 border-gray-700 print:bg-white print:border-black print:text-black'
                      : 'bg-gray-900/60 border-gray-800 opacity-50 print:hidden'
                  }`}
                >
                  {/* Card Header Stripe */}
                  <div className="bg-indigo-700 print:bg-indigo-900 text-white px-3.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-[10px]">
                        <School className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest leading-none font-bold">
                          MIZORAM SCHOOL SYSTEM
                        </div>
                        <div className="text-[9px] text-indigo-200 leading-none mt-0.5 font-mono">
                          zoxs-sms • Affiliated with MBSE
                        </div>
                      </div>
                    </div>

                    <div className="print:hidden flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleStudentSelection(student.id)}
                        className="text-white hover:text-indigo-200 cursor-pointer p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-300" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex gap-3.5 items-center">
                    {/* Left: QR Code */}
                    <div className="shrink-0 bg-white p-1 rounded-lg border-2 border-indigo-600/30 print:border-black">
                      {qrUrl ? (
                        <img
                          src={qrUrl}
                          alt={`QR-${student.name}`}
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 animate-pulse rounded" />
                      )}
                      <div className="text-[8px] text-center font-mono text-gray-700 font-bold mt-0.5">
                        SCAN ATTENDANCE
                      </div>
                    </div>

                    {/* Right: Student Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase print:text-indigo-900 print:bg-gray-100">
                          ID: STD-{student.rollNo.toString().padStart(3, '0')}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 print:text-gray-600">
                          AY: {CURRENT_ACADEMIC_YEAR}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white print:text-black truncate mt-1">
                        {student.name}
                      </h3>

                      <div className="text-xs text-indigo-300 print:text-indigo-900 font-bold mt-0.5">
                        {student.className} {student.stream ? `• ${student.stream}` : ''}
                      </div>

                      <div className="text-[11px] text-gray-300 print:text-gray-800 font-mono mt-0.5">
                        Roll Number: <strong className="text-white print:text-black">#{student.rollNo}</strong>
                      </div>

                      <div className="text-[10px] text-gray-400 print:text-gray-600 truncate mt-1 flex items-center gap-2">
                        <span>Ph: {student.parentPhone || 'N/A'}</span>
                        <span>•</span>
                        <span>Blood: {student.bloodGroup || 'B+'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="px-3.5 py-1.5 bg-gray-900/80 print:bg-gray-100 border-t border-gray-800 print:border-gray-300 flex items-center justify-between text-[9px] text-gray-400 print:text-gray-700 font-mono">
                    <span>Aizawl, Mizoram</span>
                    <span className="font-bold">Principal Signature: ____________</span>
                  </div>

                  {/* Non-printable action buttons */}
                  <div className="print:hidden p-2 bg-gray-900/50 border-t border-gray-800 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectingStudent(student)}
                      className="px-2 py-1 rounded text-[10px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 inline mr-1" /> View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadStudentQrPng(student)}
                      className="px-2 py-1 rounded text-[10px] font-medium bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 inline mr-1" /> Save QR
                    </button>
                  </div>
                </div>
              );
            }

            // Default: Standard Portrait Lanyard Badge (CR80 PVC Form Factor)
            return (
              <div
                key={student.id}
                className={`relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? 'bg-gray-850 border-gray-700 print:bg-white print:border-black print:text-black'
                    : 'bg-gray-900/60 border-gray-800 opacity-50 print:hidden'
                }`}
              >
                {/* Lanyard Slot Hole Graphic */}
                <div className="pt-2.5 pb-1 flex justify-center print:hidden">
                  <div className="w-10 h-2 rounded-full bg-gray-950 border border-gray-750"></div>
                </div>

                {/* Badge Header with School Crest */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 print:from-indigo-950 print:to-indigo-950 text-white p-3 text-center relative">
                  <div className="print:hidden absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => toggleStudentSelection(student.id)}
                      className="text-white hover:text-indigo-200 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-300" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 mx-auto flex items-center justify-center text-white mb-1">
                    <School className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold tracking-tight uppercase leading-tight font-serif">
                    Mizoram School System
                  </h4>
                  <p className="text-[9px] text-indigo-200 font-mono tracking-widest">
                    AIZAWL • MBSE RECOGNIZED
                  </p>
                </div>

                {/* Student Photo Avatar & Identity Core */}
                <div className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center text-xl shadow-md border-2 border-indigo-400/40 print:border-black print:text-black print:bg-gray-100">
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <h3 className="text-sm font-bold text-white print:text-black mt-2 leading-tight">
                    {student.name}
                  </h3>

                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 print:text-indigo-950 print:bg-gray-100 text-[11px] font-bold font-mono">
                    <span>Roll #{student.rollNo}</span>
                    <span>•</span>
                    <span>{student.className}</span>
                  </div>

                  {student.stream && (
                    <div className="text-[10px] text-emerald-400 print:text-black font-semibold mt-0.5 font-mono">
                      Stream: {student.stream}
                    </div>
                  )}

                  {/* Scannable QR Code Box */}
                  <div className="mt-3 p-2 bg-white rounded-xl border border-gray-300 inline-block shadow-xs">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR-${student.name}`}
                        className="w-28 h-28 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gray-100 animate-pulse rounded" />
                    )}
                    <span className="block text-[9px] font-mono text-gray-800 font-bold tracking-wider mt-1 uppercase">
                      Official Student QR
                    </span>
                  </div>

                  {/* Metadata Table */}
                  <div className="mt-3 space-y-1 text-left text-[10px] text-gray-300 print:text-black font-mono border-t border-gray-700/60 print:border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 print:text-gray-700">Student ID:</span>
                      <span className="font-bold">STD-{student.rollNo.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 print:text-gray-700">Guardian Ph:</span>
                      <span>{student.parentPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 print:text-gray-700">Blood Group:</span>
                      <span className="text-rose-400 print:text-black font-bold">
                        {student.bloodGroup || 'B+'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 print:text-gray-700">Valid Session:</span>
                      <span>{CURRENT_ACADEMIC_YEAR}</span>
                    </div>
                  </div>
                </div>

                {/* Signatory Footer */}
                <div className="p-2.5 bg-gray-900 print:bg-gray-50 border-t border-gray-800 print:border-gray-300 flex items-center justify-between text-[9px] text-gray-400 print:text-gray-700 font-mono">
                  <span className="text-[8px]">zoxs-sms Verified</span>
                  <div className="text-right">
                    <span className="block italic text-[8px]">Authorized Signatory</span>
                    <span className="font-bold text-gray-300 print:text-black">Principal</span>
                  </div>
                </div>

                {/* Non-Printable Quick Action Bar */}
                <div className="print:hidden p-2 bg-gray-900/60 border-t border-gray-800 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onScanSimulate) {
                        onScanSimulate(student);
                      }
                    }}
                    className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                    title="Simulate scanning this badge in live scanner"
                  >
                    Test Scan
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInspectingStudent(student)}
                      className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                      title="Inspect full student card"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadStudentQrPng(student)}
                      className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white cursor-pointer"
                      title="Download QR code"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Single Student Card Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 text-gray-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectingStudent.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Roll #{inspectingStudent.rollNo} • {inspectingStudent.className}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white rounded-xl text-center border border-gray-300">
                {qrDataUrls[inspectingStudent.id] && (
                  <img
                    src={qrDataUrls[inspectingStudent.id]}
                    alt="QR"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                )}
                <span className="text-xs font-mono text-gray-800 font-bold block mt-2 uppercase">
                  Encoded Student Authentication Token
                </span>
              </div>

              <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">System:</span>
                  <span className="text-indigo-400">zoxs-sms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Student ID:</span>
                  <span className="text-white">{inspectingStudent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Guardian Contact:</span>
                  <span className="text-white">{inspectingStudent.parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address / Veng:</span>
                  <span className="text-white">{inspectingStudent.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blood Group:</span>
                  <span className="text-rose-400 font-bold">{inspectingStudent.bloodGroup || 'B+'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => downloadStudentQrPng(inspectingStudent)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print This Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
