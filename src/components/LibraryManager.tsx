import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  BookmarkCheck,
  RotateCcw,
  BookCopy,
  BookCheck,
  Sparkles,
  Layers,
  ChevronRight,
  User,
  Phone,
  Send,
  Calendar,
  IndianRupee,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { LibraryBook, BookIssue, BookIssueStatus, FirestoreStudent, SchoolClass } from '../types';
import { addDocument, updateDocument, deleteDocument } from '../lib/firebase';
import { PrintableLibrarySlipModal } from './PrintableLibrarySlipModal';

interface LibraryManagerProps {
  books: LibraryBook[];
  issues: BookIssue[];
  students: FirestoreStudent[];
  classes: SchoolClass[];
}

type LibraryTab = 'catalog' | 'circulation' | 'overdue';

const CATEGORIES = [
  'All',
  'Mizo Literature',
  'Mathematics',
  'Science',
  'English Literature',
  'Social Studies & History',
  'Reference & Dictionary',
  'General Knowledge',
];

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  books,
  issues,
  students,
  classes,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [issueStatusFilter, setIssueStatusFilter] = useState<'all' | 'Active' | 'Returned' | 'Overdue'>('all');

  // Modals state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [preselectedBookId, setPreselectedBookId] = useState<string>('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [activeReturnIssue, setActiveReturnIssue] = useState<BookIssue | null>(null);
  const [viewingSlipIssue, setViewingSlipIssue] = useState<BookIssue | null>(null);
  const [noticeModal, setNoticeModal] = useState<{
    studentName: string;
    parentPhone: string;
    bookTitle: string;
    daysOverdue: number;
    fine: number;
    messageText: string;
  } | null>(null);

  // Form State: Add / Edit Book
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Mizo Literature',
    totalCopies: 5,
    shelfLocation: 'Shelf M-1',
    publishedYear: 2024,
    publisher: '',
    language: 'Mizo',
    description: '',
  });

  // Form State: Issue Book
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    loanDays: 14,
    remarks: '',
    issuedBy: 'Pu Lalrinawma (Librarian)',
  });

  // Form State: Return Book
  const [returnForm, setReturnForm] = useState({
    finePaid: true,
    waiveFine: false,
    remarks: 'Returned in good condition',
  });

  // Calculate dynamic overdue items and late days
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const enrichedIssues = useMemo(() => {
    return issues.map((issue) => {
      const isReturned = issue.status === 'Returned';
      if (isReturned) return issue;

      const dueDate = new Date(issue.dueDate);
      const today = new Date(todayStr);
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        const calculatedFine = diffDays * 5; // ₹5 per day late
        return {
          ...issue,
          status: 'Overdue' as BookIssueStatus,
          fineAmount: Math.max(issue.fineAmount || 0, calculatedFine),
        };
      }
      return issue;
    });
  }, [issues, todayStr]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const totalVolumes = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const activeLoans = enrichedIssues.filter((i) => i.status === 'Issued' || i.status === 'Overdue').length;
    const overdueLoans = enrichedIssues.filter((i) => i.status === 'Overdue').length;
    const totalFines = enrichedIssues.reduce((acc, i) => acc + (i.fineAmount || 0), 0);

    return {
      totalTitles,
      totalVolumes,
      availableCopies,
      activeLoans,
      overdueLoans,
      totalFines,
    };
  }, [books, enrichedIssues]);

  // Filtered Catalog
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.shelfLocation.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || book.category === selectedCategory;

      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.availableCopies > 0) ||
        (availabilityFilter === 'out_of_stock' && book.availableCopies === 0);

      return matchesSearch && matchesCat && matchesAvail;
    });
  }, [books, searchQuery, selectedCategory, availabilityFilter]);

  // Filtered Circulation Issues
  const filteredIssues = useMemo(() => {
    return enrichedIssues.filter((iss) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        iss.bookTitle.toLowerCase().includes(q) ||
        iss.studentName.toLowerCase().includes(q) ||
        iss.rollNo.toString().includes(q) ||
        iss.className.toLowerCase().includes(q) ||
        iss.id.toLowerCase().includes(q);

      const matchesStatus =
        issueStatusFilter === 'all' ||
        (issueStatusFilter === 'Active' && (iss.status === 'Issued' || iss.status === 'Overdue')) ||
        (issueStatusFilter === 'Overdue' && iss.status === 'Overdue') ||
        (issueStatusFilter === 'Returned' && iss.status === 'Returned');

      return matchesSearch && matchesStatus;
    });
  }, [enrichedIssues, searchQuery, issueStatusFilter]);

  // Overdue Only Issues
  const overdueIssues = useMemo(() => {
    return enrichedIssues.filter((iss) => iss.status === 'Overdue');
  }, [enrichedIssues]);

  // Actions
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      isbn: `978-81-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
      category: 'Mizo Literature',
      totalCopies: 5,
      shelfLocation: 'Shelf M-1',
      publishedYear: 2024,
      publisher: 'Mizo Publication Board',
      language: 'Mizo',
      description: '',
    });
    setIsAddBookModalOpen(true);
  };

  const handleOpenEditBook = (book: LibraryBook) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation,
      publishedYear: book.publishedYear || 2024,
      publisher: book.publisher || '',
      language: book.language || 'Mizo',
      description: book.description || '',
    });
    setIsAddBookModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) return;

    const totalCopiesNum = Number(bookForm.totalCopies) || 1;

    if (editingBook) {
      // Calculate adjusted available copies
      const copyDiff = totalCopiesNum - editingBook.totalCopies;
      const newAvail = Math.max(0, editingBook.availableCopies + copyDiff);

      await updateDocument('library_books', editingBook.id, {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        category: bookForm.category,
        totalCopies: totalCopiesNum,
        availableCopies: newAvail,
        shelfLocation: bookForm.shelfLocation,
        publishedYear: Number(bookForm.publishedYear) || undefined,
        publisher: bookForm.publisher,
        language: bookForm.language,
        description: bookForm.description,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addDocument('library_books', {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        category: bookForm.category,
        totalCopies: totalCopiesNum,
        availableCopies: totalCopiesNum,
        shelfLocation: bookForm.shelfLocation,
        publishedYear: Number(bookForm.publishedYear) || undefined,
        publisher: bookForm.publisher,
        language: bookForm.language,
        description: bookForm.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setIsAddBookModalOpen(false);
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (confirm(`Are you sure you want to delete book "${title}" from the library inventory?`)) {
      await deleteDocument('library_books', bookId);
    }
  };

  const handleQuickAddCopy = async (book: LibraryBook) => {
    await updateDocument('library_books', book.id, {
      totalCopies: book.totalCopies + 1,
      availableCopies: book.availableCopies + 1,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleOpenIssueModal = (bookId?: string) => {
    setPreselectedBookId(bookId || (books.find((b) => b.availableCopies > 0)?.id || ''));
    setIssueForm({
      bookId: bookId || (books.find((b) => b.availableCopies > 0)?.id || ''),
      studentId: students[0]?.id || '',
      loanDays: 14,
      remarks: 'Course reading & reference',
      issuedBy: 'Pu Lalrinawma (Librarian)',
    });
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find((b) => b.id === issueForm.bookId);
    const targetStudent = students.find((s) => s.id === issueForm.studentId);

    if (!targetBook || !targetStudent) return;
    if (targetBook.availableCopies <= 0) {
      alert('All copies of this book are currently issued!');
      return;
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(issueForm.loanDays || 14));

    const newIssueId = `iss-${Date.now().toString().slice(-6)}`;

    // Create loan issue
    await addDocument('book_issues', {
      id: newIssueId,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookIsbn: targetBook.isbn,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      rollNo: targetStudent.rollNo,
      classId: targetStudent.classId,
      className: targetStudent.className,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'Issued',
      fineAmount: 0,
      finePaid: false,
      remarks: issueForm.remarks,
      issuedBy: issueForm.issuedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Decrement available copies in book catalog
    await updateDocument('library_books', targetBook.id, {
      availableCopies: Math.max(0, targetBook.availableCopies - 1),
      updatedAt: new Date().toISOString(),
    });

    setIsIssueModalOpen(false);
  };

  const handleOpenReturnModal = (issue: BookIssue) => {
    setActiveReturnIssue(issue);
    const dueDate = new Date(issue.dueDate);
    const today = new Date(todayStr);
    const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const lateDays = Math.max(0, diffDays);

    setReturnForm({
      finePaid: lateDays > 0,
      waiveFine: false,
      remarks: lateDays > 0 ? `Returned ${lateDays} days late. Fine calculated.` : 'Returned on time in pristine condition.',
    });
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!activeReturnIssue) return;
    const finalFine = returnForm.waiveFine ? 0 : activeReturnIssue.fineAmount;

    await updateDocument('book_issues', activeReturnIssue.id, {
      status: 'Returned',
      returnDate: todayStr,
      fineAmount: finalFine,
      finePaid: returnForm.finePaid && !returnForm.waiveFine,
      remarks: returnForm.remarks,
      returnedBy: 'Pu Lalrinawma (Librarian)',
      updatedAt: new Date().toISOString(),
    });

    // Increment available copies in library book catalog
    const book = books.find((b) => b.id === activeReturnIssue.bookId);
    if (book) {
      await updateDocument('library_books', book.id, {
        availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
        updatedAt: new Date().toISOString(),
      });
    }

    setIsReturnModalOpen(false);
    setActiveReturnIssue(null);
  };

  const handleOpenNoticeModal = (issue: BookIssue) => {
    const student = students.find((s) => s.id === issue.studentId);
    const dueDate = new Date(issue.dueDate);
    const today = new Date(todayStr);
    const diffDays = Math.max(1, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const parentPhone = student?.parentPhone || '9862000000';

    const messageText = `Chibai! Mizoram School System Library Dept atangin: Zirlai ${issue.studentName} (Class: ${issue.className}, Roll: ${issue.rollNo}) in lehkhabu a hawh "${issue.bookTitle}" chu ni ${issue.dueDate} khan thehluh a hun tawh a, tunah hian ni ${diffDays} a tlai tawh e (Late fine: ₹${issue.fineAmount}). Khawngaihin library-ah rawn thehlut thuai turin kan ngen a che u. - Librarian`;

    setNoticeModal({
      studentName: issue.studentName,
      parentPhone,
      bookTitle: issue.bookTitle,
      daysOverdue: diffDays,
      fine: issue.fineAmount,
      messageText,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-100">Library Management & Circulation</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                zoxs-library
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Lehkhabu Dahkhawmna, Hawh Chhuahna, leh Tlai Chawina (Fine) Enkawlna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenIssueModal()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <BookCheck className="w-4 h-4" />
            Issue Book
          </button>
          <button
            onClick={handleOpenAddBook}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">Catalog Titles</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-gray-100">{stats.totalTitles}</span>
            <BookmarkCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Registered Titles</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">Total Volumes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-gray-100">{stats.totalVolumes}</span>
            <BookCopy className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Physical Copies</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">On Shelves</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-400">{stats.availableCopies}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Ready to Borrow</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">Active Loans</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-400">{stats.activeLoans}</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">With Students</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">Overdue Items</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-400">{stats.overdueLoans}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[11px] text-rose-500/80 mt-1 block">Needs Return</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <span className="text-xs font-medium text-gray-400 block">Late Fines Due</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-400">₹{stats.totalFines}</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[11px] text-amber-500/80 mt-1 block">₹5/day late fee</span>
        </div>
      </div>

      {/* Sub-Tab Switcher & Filter Toolbar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Book Inventory ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('circulation')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'circulation'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Circulation Desk ({enrichedIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer relative ${
                activeTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Overdue Tracker
              {stats.overdueLoans > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                  {stats.overdueLoans}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'catalog'
                  ? 'Search by title, author, ISBN...'
                  : 'Search by student, book, roll no...'
              }
              className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter controls tailored to active tab */}
        {activeTab === 'catalog' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Stock:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="bg-gray-950 border border-gray-800 text-xs text-gray-300 rounded-md px-2.5 py-1 focus:outline-hidden focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Stock Status</option>
                <option value="available">Available on Shelf</option>
                <option value="out_of_stock">All Borrowed (Out of Stock)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'circulation' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Loan Status:</span>
              <div className="flex items-center gap-1">
                {(['all', 'Active', 'Overdue', 'Returned'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setIssueStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      issueStatusFilter === st
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800'
                    }`}
                  >
                    {st === 'all' ? 'All Loans' : st}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-gray-500 text-xs">Showing {filteredIssues.length} circulation transactions</p>
          </div>
        )}
      </div>

      {/* TAB 1: CATALOG INVENTORY */}
      {activeTab === 'catalog' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Title & Author</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">ISBN & Shelf</th>
                  <th className="px-4 py-3.5 text-center">Available / Total</th>
                  <th className="px-4 py-3.5 text-center">Availability Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      No books matching your query found.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const isAvailable = book.availableCopies > 0;
                    return (
                      <tr key={book.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-purple-400 mt-0.5 shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-100 text-sm leading-snug">{book.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">By {book.author}</p>
                              {book.language && (
                                <span className="inline-block mt-1 text-[10px] text-gray-400 bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800">
                                  {book.language}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-800 text-purple-300 border border-gray-700 inline-block">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-mono text-[11px] text-gray-300">{book.isbn}</div>
                          <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            {book.shelfLocation}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`font-mono text-sm font-bold ${
                              book.availableCopies === 0
                                ? 'text-rose-400'
                                : book.availableCopies <= 2
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {book.availableCopies}
                          </span>
                          <span className="text-gray-500 font-mono text-xs"> / {book.totalCopies}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <AlertCircle className="w-3 h-3" /> Checked Out
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenIssueModal(book.id)}
                              disabled={!isAvailable}
                              title={isAvailable ? 'Issue this book' : 'No copies available'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isAvailable
                                  ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/30'
                                  : 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed'
                              }`}
                            >
                              <BookCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleQuickAddCopy(book)}
                              title="Quick +1 copy to inventory"
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditBook(book)}
                              title="Edit book details"
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              title="Delete book"
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-gray-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CIRCULATION DESK (ISSUES & ACTIVE LOANS) */}
      {activeTab === 'circulation' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Borrower Student</th>
                  <th className="px-4 py-3.5">Borrowed Book</th>
                  <th className="px-4 py-3.5">Issue & Due Date</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Late Fine</th>
                  <th className="px-5 py-3.5 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      No loan records matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => {
                    const isOverdue = issue.status === 'Overdue';
                    const isReturned = issue.status === 'Returned';
                    const relatedBook = books.find((b) => b.id === issue.bookId);

                    return (
                      <tr key={issue.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {issue.rollNo}
                            </div>
                            <div>
                              <p className="font-bold text-gray-100 text-sm">{issue.studentName}</p>
                              <p className="text-gray-400 text-xs">
                                {issue.className} • Roll #{issue.rollNo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-200 text-sm">{issue.bookTitle}</p>
                          <p className="text-gray-500 text-xs font-mono mt-0.5">
                            {issue.bookIsbn || relatedBook?.isbn || 'No ISBN'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-300">
                            Issued: <span className="font-medium text-gray-400">{issue.issueDate}</span>
                          </div>
                          <div
                            className={`mt-0.5 font-medium ${
                              isOverdue ? 'text-rose-400 font-bold' : 'text-gray-400'
                            }`}
                          >
                            Due: {issue.dueDate}
                            {isReturned && issue.returnDate && (
                              <span className="text-emerald-400 block text-[11px]">
                                Returned on {issue.returnDate}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isReturned
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isOverdue
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {issue.fineAmount > 0 ? (
                            <span className="font-bold text-amber-400 font-mono">
                              ₹{issue.fineAmount}
                              {issue.finePaid && (
                                <span className="block text-[10px] text-emerald-400">Paid</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingSlipIssue(issue)}
                              title="Print loan slip"
                              className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Slip
                            </button>

                            {!isReturned ? (
                              <button
                                onClick={() => handleOpenReturnModal(issue)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Return
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs italic">Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OVERDUE TRACKER & RECOVERY DESK */}
      {activeTab === 'overdue' && (
        <div className="space-y-4">
          <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-300">Automated Library Overdue Tracker</h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Students listed here have exceeded their return due date. Mizoram School regulations impose a ₹5 per
                calendar day late charge. You can directly generate due notice messages to parents or waive fines upon
                return.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-3.5">Overdue Student</th>
                    <th className="px-4 py-3.5">Book Title</th>
                    <th className="px-4 py-3.5">Due Date & Delay</th>
                    <th className="px-4 py-3.5 text-center">Accrued Fine</th>
                    <th className="px-5 py-3.5 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {overdueIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-emerald-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                        Nil overdue books! All borrowed library books are in good standing.
                      </td>
                    </tr>
                  ) : (
                    overdueIssues.map((issue) => {
                      const dueDate = new Date(issue.dueDate);
                      const today = new Date(todayStr);
                      const diffDays = Math.max(1, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

                      return (
                        <tr key={issue.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-100 text-sm">{issue.studentName}</div>
                            <div className="text-gray-400 text-xs">
                              {issue.className} • Roll #{issue.rollNo}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-200 text-sm">{issue.bookTitle}</p>
                            <p className="text-gray-500 text-xs font-mono">ID: #{issue.id}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-rose-400">Due: {issue.dueDate}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {diffDays} days late
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-mono text-base font-bold text-amber-400">
                              ₹{issue.fineAmount}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenNoticeModal(issue)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Parent Notice
                              </button>
                              <button
                                onClick={() => handleOpenReturnModal(issue)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Return & Settle
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BOOK */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <div className="flex items-center gap-2 text-purple-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-100">
                  {editingBook ? 'Edit Book Details' : 'Add Book to Library Catalog'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Book Title (Lehkhabu Hming) *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Hawilopari or MBSE Mathematics Class 10"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Author Name (Ziaktu) *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="e.g. B. Lalthangliana"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">ISBN / Accession No. *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-81-..."
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 font-mono focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Category / Subject</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Shelf / Rack Location</label>
                  <input
                    type="text"
                    required
                    value={bookForm.shelfLocation}
                    onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                    placeholder="e.g. Shelf M-2, Rack SC-1"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 font-mono focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Language</label>
                  <select
                    value={bookForm.language}
                    onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Mizo">Mizo</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Mizo & English">Mizo & English</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-medium">Publication Year</label>
                  <input
                    type="number"
                    value={bookForm.publishedYear}
                    onChange={(e) => setBookForm({ ...bookForm, publishedYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 font-mono focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Publisher / Press</label>
                <input
                  type="text"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                  placeholder="e.g. Synod Literature & Publication Board (SLPB)"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Description / Synopsis</label>
                <textarea
                  rows={2}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Short notes about subject or class syllabus reference..."
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingBook ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE BOOK */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <div className="flex items-center gap-2 text-indigo-400">
                <BookCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-100">Issue Book to Student (Hawhtirna)</h3>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="p-6 space-y-4 text-xs">
              {/* Select Book */}
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Select Book to Issue *</label>
                <select
                  required
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Book from Library --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.title} — By {b.author} ({b.availableCopies} available of {b.totalCopies})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Student */}
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Select Borrower Student (Zirlai Hming) *</label>
                <select
                  required
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll #{s.rollNo} • {s.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Period Presets */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Loan Period (Days)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 21, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setIssueForm({ ...issueForm, loanDays: days })}
                      className={`py-2 rounded-lg font-semibold text-center border cursor-pointer transition-colors ${
                        issueForm.loanDays === days
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Condition & Loan Remarks</label>
                <input
                  type="text"
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  placeholder="e.g. Mizo literature revision, book copy pristine"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Librarian */}
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Authorized Librarian</label>
                <input
                  type="text"
                  value={issueForm.issuedBy}
                  onChange={(e) => setIssueForm({ ...issueForm, issuedBy: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Issue Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RETURN BOOK & SETTLE FINE */}
      {isReturnModalOpen && activeReturnIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <div className="flex items-center gap-2 text-emerald-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-100">Return & Check-in Book</h3>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1">
                <p className="font-bold text-gray-100 text-sm">{activeReturnIssue.bookTitle}</p>
                <p className="text-gray-400">
                  Borrower: <span className="text-gray-200 font-semibold">{activeReturnIssue.studentName}</span> (
                  {activeReturnIssue.className})
                </p>
                <p className="text-gray-400">
                  Due Date: <span className="text-gray-200">{activeReturnIssue.dueDate}</span>
                </p>
              </div>

              {activeReturnIssue.fineAmount > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">Late Overdue Fine:</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      ₹{activeReturnIssue.fineAmount}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    Calculated at ₹5/day after due date ({activeReturnIssue.dueDate}).
                  </p>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={returnForm.finePaid && !returnForm.waiveFine}
                        onChange={(e) =>
                          setReturnForm({
                            ...returnForm,
                            finePaid: e.target.checked,
                            waiveFine: !e.target.checked,
                          })
                        }
                        className="rounded border-gray-700 text-emerald-500"
                      />
                      <span>Collect ₹{activeReturnIssue.fineAmount} Fine Now</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setReturnForm({
                          ...returnForm,
                          waiveFine: !returnForm.waiveFine,
                          finePaid: false,
                        })
                      }
                      className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                        returnForm.waiveFine
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {returnForm.waiveFine ? 'Fine Waived' : 'Waive Fine'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Return Condition Remarks</label>
                <input
                  type="text"
                  value={returnForm.remarks}
                  onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                  placeholder="e.g. Returned in good condition, pages intact"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm Book Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PARENT NOTICE DRAFTER */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <div className="flex items-center gap-2 text-indigo-400">
                <Send className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-100">Draft Overdue Notice to Parent</h3>
              </div>
              <button
                onClick={() => setNoticeModal(null)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Recipient Phone:</p>
                  <p className="text-sm font-bold text-gray-200 mt-0.5">{noticeModal.parentPhone}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/20 text-indigo-300">
                  {noticeModal.studentName}'s Parent
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Message Body (WhatsApp / SMS):</label>
                <textarea
                  rows={5}
                  value={noticeModal.messageText}
                  onChange={(e) => setNoticeModal({ ...noticeModal, messageText: e.target.value })}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 leading-relaxed focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setNoticeModal(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(noticeModal.messageText);
                    alert('Notice copied to clipboard! You can paste this directly to WhatsApp or SMS.');
                    setNoticeModal(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Copy & Send Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE SLIP */}
      {viewingSlipIssue && (
        <PrintableLibrarySlipModal
          isOpen={Boolean(viewingSlipIssue)}
          onClose={() => setViewingSlipIssue(null)}
          issue={viewingSlipIssue}
          book={books.find((b) => b.id === viewingSlipIssue.bookId)}
        />
      )}
    </div>
  );
};
