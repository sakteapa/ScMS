import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  BookmarkCheck,
  AlertCircle,
  Scan
} from 'lucide-react';
import LibraryScannerModal from '../components/LibraryScannerModal';
import { useSchool } from '../context/SchoolContext';

export default function LibraryView() {
  const { libraryBooks, students, issueBook, returnBook } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const categories = ['all', ...Array.from(new Set(libraryBooks.map(b => b.category)))];

  const filteredBooks = libraryBooks.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleOpenIssue = (book) => {
    setSelectedBookForIssue(book);
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = (e) => {
    e.preventDefault();
    if (!selectedBookForIssue || !selectedStudentId) return;
    const st = students.find(s => s.id === selectedStudentId);
    issueBook(selectedBookForIssue.id, st.id, `${st.firstName} ${st.lastName}`);
    setIsIssueModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Central Library Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {libraryBooks.length} Titles
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Book circulation, ISBN cataloging, shelf rack mapping, and return tracking.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition shrink-0"
        >
          <Scan className="w-4 h-4" />
          <span>Barcode &amp; ISBN Camera Scanner</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Book Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          const activeIssues = (book.issuedTo || []).filter(i => !i.returned);

          return (
            <div
              key={book.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {book.category}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${
                    book.availableCopies > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {book.availableCopies} / {book.totalCopies} Available
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-['Outfit'] line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-400">By {book.author}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>ISBN: {book.isbn}</span>
                  <span>Rack: {book.rackLocation}</span>
                </div>
              </div>

              {/* Active Borrower List */}
              {activeIssues.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Currently Issued To:</span>
                  {activeIssues.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium truncate max-w-[130px]">{issue.studentName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Due: {issue.dueDate}</span>
                        <button
                          onClick={() => returnBook(book.id, issue.studentId)}
                          className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white text-[10px] font-bold"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Loan Period: 21 Days</span>
                <button
                  disabled={book.availableCopies <= 0}
                  onClick={() => handleOpenIssue(book)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Issue Book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue Book Modal */}
      {isIssueModalOpen && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0e1626] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit']">Issue Library Book</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="font-bold text-white block">{selectedBookForIssue.title}</span>
              <p className="text-slate-400">Author: {selectedBookForIssue.author}</p>
              <p className="text-cyan-400 font-mono">Location: {selectedBookForIssue.rackLocation}</p>
            </div>

            <form onSubmit={handleConfirmIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Issue to Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNo} • {s.classId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & ISBN Camera Scanner Suite */}
      <LibraryScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
