import React, { useState, useMemo } from 'react';
import { 
  Shirt, 
  BookOpen, 
  Package, 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  Upload, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  Settings, 
  Download, 
  QrCode, 
  DollarSign, 
  User, 
  Tag, 
  Image as ImageIcon,
  Sparkles,
  Info,
  X,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import CloudPhotoStorageModal from '../components/CloudPhotoStorageModal';

// Sample Presets for fast uniform and book photo setup
const UNIFORM_PHOTO_PRESETS = [
  { label: 'Sky Blue Shirt', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80' },
  { label: 'Girls Blouse', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80' },
  { label: 'Navy Trousers', url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop&q=80' },
  { label: 'Box-Pleated Skirt', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&auto=format&fit=crop&q=80' },
  { label: 'School Blazer', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80' },
  { label: 'Woolen Sweater', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80' },
  { label: 'Red House Tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' },
  { label: 'Blue House Tee', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80' },
  { label: 'Green House Tee', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80' },
  { label: 'Yellow House Tee', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80' },
  { label: 'Tie & Belt', url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=80' },
  { label: 'Athletic Socks', url: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500&auto=format&fit=crop&q=80' }
];

const BOOK_PHOTO_PRESETS = [
  { label: 'Mizo Literature', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80' },
  { label: 'English Reader', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80' },
  { label: 'Mathematics', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80' },
  { label: 'Science / Physics', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80' },
  { label: 'Chemistry Lab', url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&auto=format&fit=crop&q=80' },
  { label: 'Biology', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Social Studies', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80' },
  { label: 'School Notebooks', url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80' }
];

export default function SchoolStoreView({ setCurrentTab }) {
  const { 
    storeConfig, 
    updateStoreConfig, 
    storeUniforms = [], 
    addStoreUniform, 
    updateStoreUniform, 
    deleteStoreUniform, 
    storeBooks = [], 
    addStoreBook, 
    updateStoreBook, 
    deleteStoreBook, 
    updateStoreItemPhoto,
    storeDistributions = [], 
    distributeStoreItems, 
    storeSales = [], 
    recordStoreSale,
    students = [],
    classes = [],
    activeSchoolInfo
  } = useSchool();

  const { isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const canManage = isPrincipal || isVicePrincipal || isSuperAdmin;

  // Active Tab: 'uniforms' | 'books' | 'distributions' | 'pos'
  const [activeTab, setActiveTab] = useState('uniforms');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  // Modals state
  const [isUniformModalOpen, setIsUniformModalOpen] = useState(false);
  const [editingUniform, setEditingUniform] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState(null);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPrintSlipModalOpen, setIsPrintSlipModalOpen] = useState(false);
  const [slipToPrint, setSlipToPrint] = useState(null);

  // Photo editing modal state
  const [photoModalItem, setPhotoModalItem] = useState(null); // { type: 'uniform'|'book', id, name, photoUrl }
  const [isCloudStudioOpen, setIsCloudStudioOpen] = useState(false);

  // POS State
  const [posSelectedStudentId, setPosSelectedStudentId] = useState('');
  const [posCart, setPosCart] = useState([]);
  const [posPaymentType, setPosPaymentType] = useState('cash'); // 'cash' | 'upi_qr' | 'fee_ledger'

  // Summary Metrics
  const totalUniformItemsCount = storeUniforms.length;
  const totalUniformPiecesInStock = storeUniforms.reduce((acc, u) => {
    return acc + (u.sizes || []).reduce((sAcc, s) => sAcc + (Number(s.stock) || 0), 0);
  }, 0);

  const totalBookTitlesCount = storeBooks.length;
  const totalBookCopiesInStock = storeBooks.reduce((acc, b) => acc + (Number(b.stockQuantity) || 0), 0);

  const totalDistributionsCompleted = storeDistributions.filter(d => d.status === 'completed').length;
  const totalStoreSalesRevenue = storeSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);

  // Filtered Uniforms
  const filteredUniforms = useMemo(() => {
    return storeUniforms.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || u.category === categoryFilter;
      const matchesGender = genderFilter === 'all' || u.gender === genderFilter || u.gender === 'unisex';
      return matchesSearch && matchesCategory && matchesGender;
    });
  }, [storeUniforms, searchQuery, categoryFilter, genderFilter]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return storeBooks.filter(b => {
      const matchesSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (b.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (b.publisher || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || b.classId === classFilter || b.classId === 'all';
      return matchesSearch && matchesClass;
    });
  }, [storeBooks, searchQuery, classFilter]);

  // Filtered Distributions
  const filteredDistributions = useMemo(() => {
    return storeDistributions.filter(d => {
      const matchesSearch = (d.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (d.admissionNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (d.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || d.classId === classFilter;
      const matchesStatus = categoryFilter === 'all' || d.status === categoryFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [storeDistributions, searchQuery, classFilter, categoryFilter]);

  // Handler for opening photo editor
  const handleOpenPhotoEditor = (type, item) => {
    setPhotoModalItem({
      type,
      id: item.id,
      name: type === 'uniform' ? item.name : item.title,
      photoUrl: item.photoUrl || ''
    });
  };

  // Handler for printing class book list
  const handlePrintClassBookList = (selectedClassId) => {
    const classObj = classes.find(c => c.id === selectedClassId);
    const className = classObj ? `${classObj.name} ${classObj.section || ''}` : 'Selected Class';
    const booksForClass = storeBooks.filter(b => b.classId === selectedClassId || b.classId === 'all');
    const totalBundleCost = booksForClass.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Textbook List - ${className}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
          .class-title { background: #f1f5f9; padding: 10px 14px; font-weight: 700; font-size: 15px; border-radius: 6px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          .right { text-align: right; }
          .total-box { margin-top: 16px; text-align: right; font-size: 16px; font-weight: 700; }
          .notice { margin-top: 24px; padding: 12px; border-left: 4px solid #0284c7; background: #f0f9ff; font-size: 12px; color: #0369a1; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${activeSchoolInfo?.name || 'Central School'}</h1>
          <p>${storeConfig.storeName || 'Official Campus Store & Textbook Depot'}</p>
          <p>Contact: ${storeConfig.contactPhone || ''} | Room: ${storeConfig.location || ''}</p>
        </div>
        <div class="class-title">Official Prescribed Syllabus & Textbook List: ${className} (Academic Year 2026-2027)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Book Title</th>
              <th>Subject</th>
              <th>Publisher</th>
              <th>Edition</th>
              <th class="right" style="width: 90px;">Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${booksForClass.map((b, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${b.title}</strong></td>
                <td>${b.subject}</td>
                <td>${b.publisher}</td>
                <td>${b.edition}</td>
                <td class="right">₹${b.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-box">
          Complete Syllabus Bundle Total: ₹${totalBundleCost}
        </div>
        <div class="notice">
          <strong>Parent Advisory:</strong> Official textbooks and school crested homework notebooks are available at the School Depot. Please retain this list for syllabus verification and bookstore purchase.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Add Item to POS Cart
  const handleAddToCart = (item, type, selectedSize = null) => {
    const cartItemId = `${type}-${item.id}-${selectedSize || 'standard'}`;
    const existingIndex = posCart.findIndex(c => c.cartItemId === cartItemId);
    if (existingIndex >= 0) {
      setPosCart(prev => {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      });
    } else {
      setPosCart(prev => [
        ...prev,
        {
          cartItemId,
          id: item.id,
          type,
          name: type === 'uniform' ? item.name : item.title,
          size: selectedSize,
          price: Number(item.price) || 0,
          quantity: 1,
          uniformId: type === 'uniform' ? item.id : null,
          bookId: type === 'book' ? item.id : null
        }
      ]);
    }
  };

  // Remove from POS cart
  const handleRemoveFromCart = (cartItemId) => {
    setPosCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  // Calculate POS Total
  const posTotalAmount = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Complete POS Sale
  const handleCompleteSale = () => {
    if (posCart.length === 0) {
      alert('Khawngaihin items cart-ah dah hmasa rawh le.');
      return;
    }

    const selectedStudent = students.find(s => s.id === posSelectedStudentId);

    const saleRecord = {
      studentId: selectedStudent?.id || 'walk-in',
      studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Walk-in Student / Parent',
      classId: selectedStudent?.classId || 'N/A',
      items: posCart,
      totalAmount: posTotalAmount,
      paymentType: posPaymentType,
      servedBy: storeConfig.inChargeName?.split('&')[0]?.trim() || 'Store In-charge',
      notes: `Counter Sale (${posPaymentType.toUpperCase()})`
    };

    const newSale = recordStoreSale(saleRecord);
    setPosCart([]);
    setPosSelectedStudentId('');
    
    // Open receipt print preview
    setSlipToPrint({
      type: 'pos_sale',
      data: newSale,
      items: posCart,
      totalAmount: posTotalAmount
    });
    setIsPrintSlipModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Store Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-900/50 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Campus Bookstore & Uniform Depot (Zirlaibu & Uniform)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{storeConfig.storeName || 'School Store & Uniform Depot'}</span>
            </h1>
            <p className="text-sm text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>👤 In-Charge: <strong className="text-white">{storeConfig.inChargeName || 'Store In-charge'}</strong></span>
              <span>📍 Room: <strong className="text-white">{storeConfig.location || 'Depot Room'}</strong></span>
              <span>⏰ Hours: <strong className="text-white">{storeConfig.openingHours || 'School Hours'}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canManage && (
              <>
                <button
                  onClick={() => { setEditingUniform(null); setIsUniformModalOpen(true); }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Uniform</span>
                </button>
                <button
                  onClick={() => { setEditingBook(null); setIsBookModalOpen(true); }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Add Textbook</span>
                </button>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Store Settings & UPI"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4 Stat KPI Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Uniform Items</p>
              <p className="text-lg font-bold text-white">{totalUniformItemsCount} <span className="text-xs font-normal text-slate-400">({totalUniformPiecesInStock} pcs)</span></p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Textbook Titles</p>
              <p className="text-lg font-bold text-white">{totalBookTitlesCount} <span className="text-xs font-normal text-slate-400">({totalBookCopiesInStock} copies)</span></p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Students Distributed</p>
              <p className="text-lg font-bold text-white">{totalDistributionsCompleted} <span className="text-xs font-normal text-slate-400">full kits</span></p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Direct Store Sales</p>
              <p className="text-lg font-bold text-white">₹{totalStoreSalesRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => { setActiveTab('uniforms'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'uniforms'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>1. Uniform Catalog & Dress Code</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/30 text-white/90">
            {storeUniforms.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('books'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'books'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Textbooks & Class Bundles (Zirlaibu)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/30 text-white/90">
            {storeBooks.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('distributions'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'distributions'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3. Student Issuance Tracker (Semchhuahna)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/30 text-white/90">
            {storeDistributions.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('pos'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pos'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>4. Quick POS & Counter Sales</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: UNIFORM CATALOG & DRESS CODE                       */}
      {/* ========================================================= */}
      {activeTab === 'uniforms' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search uniform by name, code (e.g. Oxford Shirt, Blazer, Tie)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="regular">Regular Weekday</option>
                <option value="house">House & Sports</option>
                <option value="winter">Winter Wear (Blazer / Sweater)</option>
                <option value="accessories">Accessories (Tie, Belt, Socks)</option>
              </select>

              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Genders</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="unisex">Unisex</option>
              </select>

              {canManage && (
                <button
                  onClick={() => { setEditingUniform(null); setIsUniformModalOpen(true); }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>
          </div>

          {/* Dress Code Advisory Card */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-200">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white text-sm">Official School Dress Code Policy (Zirlai Uniform Hak Dan)</strong>
              <p>
                • <strong>Mon, Tue, Thu, Fri:</strong> Full Regular Uniform (Oxford Shirt, Navy Trousers/Skirt, Tie, Belt & Black Leather Shoes with navy socks).
                <br />
                • <strong>Wed & Sat:</strong> Respective House Sports T-Shirt, Navy Track-pants / PT Shorts, and White Canvas/Sports Shoes.
                <br />
                • <strong>Winter (Nov - Feb):</strong> Official Crest Blazer / Navy V-Neck Sweater mandatory during morning assembly.
              </p>
            </div>
          </div>

          {/* Uniform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUniforms.map(uniform => {
              const totalStock = (uniform.sizes || []).reduce((acc, s) => acc + (Number(s.stock) || 0), 0);
              const isLowStock = totalStock <= 10;

              return (
                <div
                  key={uniform.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group"
                >
                  {/* Photo with Overlay Photo Editor */}
                  <div className="relative h-56 bg-slate-950 overflow-hidden">
                    <img
                      src={uniform.photoUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80'}
                      alt={uniform.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        uniform.category === 'regular' ? 'bg-blue-600/90 text-white' :
                        uniform.category === 'house' ? 'bg-amber-600/90 text-white' :
                        uniform.category === 'winter' ? 'bg-cyan-600/90 text-white' :
                        'bg-purple-600/90 text-white'
                      }`}>
                        {uniform.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                        {uniform.gender?.toUpperCase()}
                      </span>
                    </div>

                    {/* Quick Photo Edit Button */}
                    {canManage && (
                      <button
                        onClick={() => handleOpenPhotoEditor('uniform', uniform)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-indigo-600 text-white rounded-lg backdrop-blur-md border border-slate-700/80 transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                        title="Change / Upload Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Edit Photo</span>
                      </button>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                          {uniform.code || 'CODE'}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 leading-tight line-clamp-1">
                          {uniform.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-emerald-400">₹{uniform.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {uniform.description || 'Standard high quality prescribed uniform attire.'}
                      </p>

                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Classes: <strong className="text-slate-200">{uniform.applicableClasses || 'All Classes'}</strong></span>
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          isLowStock ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {totalStock} in stock
                        </span>
                      </div>

                      {/* Sizes Matrix */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sizes & Stock:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(uniform.sizes || []).map(sz => (
                            <span
                              key={sz.size}
                              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                                Number(sz.stock) > 5 
                                  ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                  : Number(sz.stock) > 0 
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 line-through'
                              }`}
                            >
                              <span>{sz.size}</span>
                              <span className="text-[10px] opacity-70">({sz.stock})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          // Quick add to POS cart with first available size
                          const firstAvailable = (uniform.sizes || []).find(s => Number(s.stock) > 0) || uniform.sizes?.[0];
                          handleAddToCart(uniform, 'uniform', firstAvailable?.size || 'Standard');
                          setActiveTab('pos');
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sell at Counter</span>
                      </button>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingUniform(uniform); setIsUniformModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Edit Uniform Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`He uniform item "${uniform.name}" hi paih i chiang chiah em?`)) {
                                deleteStoreUniform(uniform.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUniforms.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
              <Shirt className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Uniform hmuh a ni lo</h3>
              <p className="text-xs text-slate-400">Search filter thlak rawh le emaw item thar dah rawh.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TEXTBOOKS & CLASS BUNDLES (ZIRLAIBU)               */}
      {/* ========================================================= */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {/* Class Selector & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search textbooks by title, subject (e.g. Mizo, Math, NCERT, Physics)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Classes Syllabus</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                ))}
              </select>

              {classFilter !== 'all' && (
                <button
                  onClick={() => handlePrintClassBookList(classFilter)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Print class syllabus book list for parents"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Print Class List</span>
                </button>
              )}

              {canManage && (
                <button
                  onClick={() => { setEditingBook(null); setIsBookModalOpen(true); }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Textbook</span>
                </button>
              )}
            </div>
          </div>

          {/* Class Complete Bundle Box (if class selected) */}
          {classFilter !== 'all' && (
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-800/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  <Package className="w-3.5 h-3.5" />
                  <span>Complete Class Bundle</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {classes.find(c => c.id === classFilter)?.name} Complete Book Set ({filteredBooks.length} Books)
                </h4>
                <p className="text-xs text-slate-300">
                  Total Bundle Cost: <strong className="text-emerald-400 text-sm">₹{filteredBooks.reduce((sum, b) => sum + (Number(b.price) || 0), 0)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintClassBookList(classFilter)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Book List PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Books Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map(book => {
              const isLowStock = Number(book.stockQuantity) <= 5;

              return (
                <div
                  key={book.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group"
                >
                  {/* Book Cover Photo with Quick Edit */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={book.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600/90 text-white">
                        {book.subject || 'General'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                        {book.publisher || 'NCERT'}
                      </span>
                    </div>

                    {/* Change Photo Overlay Button */}
                    {canManage && (
                      <button
                        onClick={() => handleOpenPhotoEditor('book', book)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-md border border-slate-700/80 transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                        title="Change / Upload Book Cover"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Edit Cover</span>
                      </button>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-xs text-slate-300 font-medium bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {book.className || 'All Classes'}
                      </span>
                      <span className="text-lg font-black text-emerald-400">₹{book.price}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {book.title}
                      </h3>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p>Author: <strong className="text-slate-200">{book.author || 'Board'}</strong></p>
                        <p>Edition: <strong className="text-slate-200">{book.edition || 'Current'}</strong></p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          isLowStock ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {book.stockQuantity} copies available
                        </span>

                        {book.isMandatory && (
                          <span className="text-[11px] text-amber-400 font-medium">
                            ★ Mandatory Syllabus
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          handleAddToCart(book, 'book', null);
                          setActiveTab('pos');
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sell Book</span>
                      </button>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingBook(book); setIsBookModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Edit Book Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`He lehkhabu "${book.title}" hi paih i chiang chiah em?`)) {
                                deleteStoreBook(book.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Lehkhabu hmuh a ni lo</h3>
              <p className="text-xs text-slate-400">Class thlan danglam rawh le emaw lehkhabu thar dah rawh.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STUDENT ISSUANCE TRACKER (SEMNA & LAK DINHMUN)     */}
      {/* ========================================================= */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student distribution by name, roll no, receipt no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Issuance Status</option>
                <option value="completed">Completed (La kim)</option>
                <option value="partial">Partial (La kim lo)</option>
                <option value="pending">Pending (La la lo)</option>
              </select>

              {canManage && (
                <button
                  onClick={() => { setEditingDistribution(null); setIsDistributeModalOpen(true); }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-amber-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue Kit / Semchhuak</span>
                </button>
              )}
            </div>
          </div>

          {/* Distribution Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student & Roll</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Issued Uniforms & Sizes</th>
                    <th className="p-4">Textbooks</th>
                    <th className="p-4">Pending Items</th>
                    <th className="p-4">Receipt & Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredDistributions.map(dist => (
                    <tr key={dist.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{dist.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Adm: {dist.admissionNo || 'N/A'} • Roll: {dist.rollNo || '0'}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {dist.className || 'General'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          dist.status === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : dist.status === 'partial'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {dist.status === 'completed' ? 'Fully Issued' : dist.status === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(dist.uniformItems || []).map((u, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                              {u.name} (Sz: {u.size})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(dist.bookItems || []).map((b, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-800/50">
                              {b.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {dist.pendingItems && dist.pendingItems.length > 0 ? (
                          <div className="space-y-0.5">
                            {dist.pendingItems.map((p, i) => (
                              <div key={i} className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">None (All cleared)</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-slate-300 text-[11px]">{dist.receiptNumber}</div>
                        <div className="text-[10px] text-slate-400">{dist.issuedDate}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSlipToPrint({
                                type: 'distribution_slip',
                                data: dist
                              });
                              setIsPrintSlipModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-all cursor-pointer"
                            title="Print Official Store Issue Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => {
                                setEditingDistribution(dist);
                                setIsDistributeModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Update Distribution Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDistributions.length === 0 && (
              <div className="text-center py-12 p-8 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Semchhuahna record hmuh a ni lo</h3>
                <p className="text-xs text-slate-400">"Issue Kit / Semchhuak" click la, zirlai hnenah uniform leh lehkhabu sem rawh le.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: QUICK POS & COUNTER SALES                          */}
      {/* ========================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Catalog Item Selector */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick find uniform or book..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Items (Uniforms & Books)</option>
                  <option value="uniforms">Uniforms Only</option>
                  <option value="books">Textbooks Only</option>
                </select>
              </div>
            </div>

            {/* Quick Pick Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(categoryFilter === 'all' || categoryFilter === 'uniforms') &&
                storeUniforms
                  .filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(uni => (
                    <div
                      key={uni.id}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={uni.photoUrl}
                          alt={uni.name}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Uniform</span>
                          <h4 className="text-xs font-bold text-white truncate">{uni.name}</h4>
                          <p className="text-xs font-black text-emerald-400 mt-1">₹{uni.price}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                        <select
                          id={`size-sel-${uni.id}`}
                          className="bg-slate-800 text-[11px] text-slate-200 rounded px-1.5 py-1 border border-slate-700"
                        >
                          {(uni.sizes || []).map(s => (
                            <option key={s.size} value={s.size}>
                              Sz {s.size} ({s.stock})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            const sel = document.getElementById(`size-sel-${uni.id}`);
                            const chosenSize = sel ? sel.value : uni.sizes?.[0]?.size;
                            handleAddToCart(uni, 'uniform', chosenSize);
                          }}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}

              {(categoryFilter === 'all' || categoryFilter === 'books') &&
                storeBooks
                  .filter(b => (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(bk => (
                    <div
                      key={bk.id}
                      className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 flex flex-col justify-between transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={bk.photoUrl}
                          alt={bk.title}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">Textbook</span>
                          <h4 className="text-xs font-bold text-white truncate">{bk.title}</h4>
                          <p className="text-xs font-black text-emerald-400 mt-1">₹{bk.price}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Stock: {bk.stockQuantity}</span>
                        <button
                          onClick={() => handleAddToCart(bk, 'book', null)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Right Col: POS Cashier Cart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Store Counter Checkout</h3>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {posCart.reduce((sum, i) => sum + i.quantity, 0)} Items
                </span>
              </div>

              {/* Student Link Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Customer / Student Link:</label>
                <select
                  value={posSelectedStudentId}
                  onChange={e => setPosSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Walk-In Student / Direct Cash</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber || 'No ID'}) - Class {s.classId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {posCart.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Cart-ah item a la awm lo. Dinglam atang hian add rawh le.
                  </div>
                ) : (
                  posCart.map(item => (
                    <div
                      key={item.cartItemId}
                      className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.size ? `Size: ${item.size} • ` : ''}₹{item.price} x {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-emerald-400">₹{item.price * item.quantity}</span>
                        <button
                          onClick={() => handleRemoveFromCart(item.cartItemId)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Payment Mode (Pawisa Pek Dan):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosPaymentType('cash')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      posPaymentType === 'cash'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosPaymentType('upi_qr')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      posPaymentType === 'upi_qr'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    📱 UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosPaymentType('fee_ledger')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      posPaymentType === 'fee_ledger'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    📑 Fee Ledger
                  </button>
                </div>
              </div>
            </div>

            {/* Total and Checkout Button */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Grand Total:</span>
                <span className="text-2xl font-black text-emerald-400">₹{posTotalAmount}</span>
              </div>

              <button
                disabled={posCart.length === 0}
                onClick={handleCompleteSale}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Complete Sale & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PHOTO EDITOR (ADD / EDIT UNIFORM & BOOK PHOTOS)     */}
      {/* ========================================================= */}
      {photoModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Update Photo: {photoModalItem.name}
                </h3>
              </div>
              <button
                onClick={() => setPhotoModalItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Preview */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <img
                src={photoModalItem.photoUrl || 'https://via.placeholder.com/300?text=No+Photo'}
                alt="Preview"
                className="w-44 h-44 object-cover rounded-xl shadow-lg border border-slate-700"
              />
              <span className="text-xs text-slate-400">Current Photo Preview</span>
            </div>

            {/* Option A: Device File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. Upload from Device (Phone Gallery / Computer):</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = reader.result;
                    setPhotoModalItem(prev => ({ ...prev, photoUrl: dataUrl }));
                    updateStoreItemPhoto(photoModalItem.type, photoModalItem.id, dataUrl);
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            {/* Option B: Direct Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                2. Or Paste Image Web URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoModalItem.photoUrl}
                  onChange={e => setPhotoModalItem(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    updateStoreItemPhoto(photoModalItem.type, photoModalItem.id, photoModalItem.photoUrl);
                    setPhotoModalItem(null);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Option C: Curated Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Or Select from School Photo Presets:</span>
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                {(photoModalItem.type === 'uniform' ? UNIFORM_PHOTO_PRESETS : BOOK_PHOTO_PRESETS).map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setPhotoModalItem(prev => ({ ...prev, photoUrl: preset.url }));
                      updateStoreItemPhoto(photoModalItem.type, photoModalItem.id, preset.url);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-center border border-slate-700 hover:border-indigo-500 text-[10px] text-slate-200 transition-all cursor-pointer flex flex-col items-center gap-1"
                  >
                    <img src={preset.url} alt={preset.label} className="w-10 h-10 object-cover rounded" />
                    <span className="truncate w-full">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Option D: Open Cloud Storage Studio */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setIsCloudStudioOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Webcam & Cloud Studio...</span>
              </button>

              <button
                onClick={() => setPhotoModalItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Photo Storage Modal for Webcam or Cloudinary/Firebase */}
      {isCloudStudioOpen && (
        <CloudPhotoStorageModal
          isOpen={isCloudStudioOpen}
          onClose={() => setIsCloudStudioOpen(false)}
          initialTargetType="general"
          onSuccess={(uploadedUrl) => {
            if (photoModalItem) {
              setPhotoModalItem(prev => ({ ...prev, photoUrl: uploadedUrl }));
              updateStoreItemPhoto(photoModalItem.type, photoModalItem.id, uploadedUrl);
            }
            setIsCloudStudioOpen(false);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT UNIFORM ITEM                            */}
      {/* ========================================================= */}
      {isUniformModalOpen && (
        <UniformFormModal
          isOpen={isUniformModalOpen}
          onClose={() => { setIsUniformModalOpen(false); setEditingUniform(null); }}
          initialData={editingUniform}
          onSave={(uniformData) => {
            if (editingUniform) {
              updateStoreUniform(editingUniform.id, uniformData);
            } else {
              addStoreUniform(uniformData);
            }
            setIsUniformModalOpen(false);
            setEditingUniform(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT TEXTBOOK ITEM                           */}
      {/* ========================================================= */}
      {isBookModalOpen && (
        <BookFormModal
          isOpen={isBookModalOpen}
          onClose={() => { setIsBookModalOpen(false); setEditingBook(null); }}
          initialData={editingBook}
          classes={classes}
          onSave={(bookData) => {
            if (editingBook) {
              updateStoreBook(editingBook.id, bookData);
            } else {
              addStoreBook(bookData);
            }
            setIsBookModalOpen(false);
            setEditingBook(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: ISSUE KIT / DISTRIBUTE TO STUDENT                  */}
      {/* ========================================================= */}
      {isDistributeModalOpen && (
        <DistributeKitModal
          isOpen={isDistributeModalOpen}
          onClose={() => { setIsDistributeModalOpen(false); setEditingDistribution(null); }}
          initialData={editingDistribution}
          students={students}
          classes={classes}
          uniforms={storeUniforms}
          books={storeBooks}
          storeConfig={storeConfig}
          onSave={(distData) => {
            const saved = distributeStoreItems(distData);
            setIsDistributeModalOpen(false);
            setEditingDistribution(null);
            setSlipToPrint({
              type: 'distribution_slip',
              data: saved
            });
            setIsPrintSlipModalOpen(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: STORE SETTINGS & UPI CONFIG                        */}
      {/* ========================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>School Store Settings & Configuration</span>
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateStoreConfig({
                  storeName: formData.get('storeName'),
                  inChargeName: formData.get('inChargeName'),
                  contactPhone: formData.get('contactPhone'),
                  location: formData.get('location'),
                  openingHours: formData.get('openingHours'),
                  upiId: formData.get('upiId'),
                  termsAndConditions: formData.get('termsAndConditions')
                });
                setIsConfigModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store / Depot Name:</label>
                <input
                  name="storeName"
                  defaultValue={storeConfig.storeName}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">In-Charge Name(s):</label>
                  <input
                    name="inChargeName"
                    defaultValue={storeConfig.inChargeName}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone:</label>
                  <input
                    name="contactPhone"
                    defaultValue={storeConfig.contactPhone}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Room:</label>
                  <input
                    name="location"
                    defaultValue={storeConfig.location}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Opening Hours:</label>
                  <input
                    name="openingHours"
                    defaultValue={storeConfig.openingHours}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Official UPI / QR ID (for POS counter):</label>
                <input
                  name="upiId"
                  defaultValue={storeConfig.upiId}
                  placeholder="e.g. schoolstore@sbi"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Terms, Exchange & Return Policy:</label>
                <textarea
                  name="termsAndConditions"
                  defaultValue={storeConfig.termsAndConditions}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRINT OFFICIAL STORE SLIP / RECEIPT                */}
      {/* ========================================================= */}
      {isPrintSlipModalOpen && slipToPrint && (
        <PrintSlipModal
          isOpen={isPrintSlipModalOpen}
          onClose={() => setIsPrintSlipModalOpen(false)}
          slip={slipToPrint}
          schoolInfo={activeSchoolInfo}
          storeConfig={storeConfig}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-MODAL: ADD / EDIT UNIFORM ITEM
// ==========================================
function UniformFormModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    category: initialData?.category || 'regular',
    gender: initialData?.gender || 'unisex',
    applicableClasses: initialData?.applicableClasses || 'Class 1 to 12',
    price: initialData?.price || 450,
    photoUrl: initialData?.photoUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=80',
    description: initialData?.description || '',
    sizes: initialData?.sizes || [
      { size: '28', stock: 15 },
      { size: '30', stock: 20 },
      { size: '32', stock: 25 },
      { size: '34', stock: 15 }
    ]
  });

  const handleSizeChange = (idx, field, value) => {
    setFormData(prev => {
      const nextSizes = [...prev.sizes];
      nextSizes[idx] = { ...nextSizes[idx], [field]: value };
      return { ...prev, sizes: nextSizes };
    });
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '36', stock: 10 }]
    }));
  };

  const handleRemoveSize = (idx) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shirt className="w-5 h-5 text-indigo-400" />
            <span>{initialData ? 'Edit Uniform Item' : 'Add New Uniform Item'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Uniform Item Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Boys Regular Oxford Shirt"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category:</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="regular">Regular Weekday</option>
                <option value="house">House & Sports</option>
                <option value="winter">Winter Wear (Blazer / Sweater)</option>
                <option value="accessories">Accessories (Tie, Belt, Socks)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender:</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="unisex">Unisex</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Applicable Classes:</label>
              <input
                type="text"
                value={formData.applicableClasses}
                onChange={e => setFormData({ ...formData, applicableClasses: e.target.value })}
                placeholder="e.g. Class 1 to 12"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Price per Piece (₹):</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Photo URL / Image:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <img
                src={formData.photoUrl}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description & Wear Guidance:</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="e.g. Cotton-poly blend sky blue shirt with crest. Mon, Tue, Thu, Fri wear."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          {/* Sizes & Stock Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Sizes & Inventory Stock:</label>
              <button
                type="button"
                onClick={handleAddSize}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.sizes.map((sz, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sz.size}
                    onChange={e => handleSizeChange(idx, 'size', e.target.value)}
                    placeholder="Size (e.g. 30, S, M)"
                    className="w-1/2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="number"
                    value={sz.stock}
                    onChange={e => handleSizeChange(idx, 'stock', Number(e.target.value))}
                    placeholder="Stock Qty"
                    className="w-1/2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
            >
              Save Uniform Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUB-MODAL: ADD / EDIT TEXTBOOK ITEM
// ==========================================
function BookFormModal({ isOpen, onClose, initialData, classes, onSave }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    classId: initialData?.classId || 'cls-10-a',
    className: initialData?.className || 'Class 10 A',
    subject: initialData?.subject || 'Mathematics',
    author: initialData?.author || 'NCERT Editorial Board',
    publisher: initialData?.publisher || 'NCERT',
    edition: initialData?.edition || '2026 Edition',
    price: initialData?.price || 280,
    stockQuantity: initialData?.stockQuantity || 35,
    isMandatory: initialData?.isMandatory !== undefined ? initialData.isMandatory : true,
    photoUrl: initialData?.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>{initialData ? 'Edit Textbook' : 'Add New Textbook'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Textbook Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. MBSE Class 10 Mizo Reader: Rin Lanu"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Class / Grade:</label>
              <select
                value={formData.classId}
                onChange={e => {
                  const selClass = classes.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    className: selClass ? `${selClass.name} ${selClass.section || ''}` : 'All Classes'
                  });
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="all">All Classes / General</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subject:</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Mizo, English, Science"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Publisher:</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="e.g. NCERT, MBSE, SCERT"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Edition / Year:</label>
              <input
                type="text"
                value={formData.edition}
                onChange={e => setFormData({ ...formData, edition: e.target.value })}
                placeholder="e.g. 2026 Revised Edition"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Price (₹):</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Quantity:</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Cover Photo URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <img
                src={formData.photoUrl}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isMandatory"
              checked={formData.isMandatory}
              onChange={e => setFormData({ ...formData, isMandatory: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
            />
            <label htmlFor="isMandatory" className="text-slate-300 font-medium">
              Mandatory prescribed syllabus book (Zirlai zawng zawng chhiar ngei ngei tur)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
            >
              Save Textbook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUB-MODAL: ISSUE COMPLETE KIT TO STUDENT
// ==========================================
function DistributeKitModal({ isOpen, onClose, initialData, students, classes, uniforms, books, storeConfig, onSave }) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialData?.studentId || students[0]?.id || '');
  const [selectedUniforms, setSelectedUniforms] = useState(initialData?.uniformItems || []);
  const [selectedBooks, setSelectedBooks] = useState(initialData?.bookItems || []);
  const [pendingNotes, setPendingNotes] = useState(initialData?.pendingItems?.join(', ') || '');
  const [remarks, setRemarks] = useState(initialData?.remarks || 'Handed over in good condition.');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const totalKitCost = [
    ...selectedUniforms.map(u => (u.price || 0) * (u.quantity || 1)),
    ...selectedBooks.map(b => b.price || 0)
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <span>Issue School Store Kit (Uniform & Books Semna)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!selectedStudent) {
              alert('Student thlang rawh le.');
              return;
            }

            const pendingArray = pendingNotes.trim() ? pendingNotes.split(',').map(s => s.trim()).filter(Boolean) : [];
            const isCompleted = pendingArray.length === 0;

            onSave({
              studentId: selectedStudent.id,
              studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
              admissionNo: selectedStudent.admissionNumber || 'MZ-2026-NIL',
              classId: selectedStudent.classId,
              className: `Class ${selectedStudent.classId}`,
              rollNo: selectedStudent.rollNo || '0',
              status: isCompleted ? 'completed' : 'partial',
              uniformItems: selectedUniforms,
              bookItems: selectedBooks,
              pendingItems: pendingArray,
              totalAmount: totalKitCost,
              paymentMethod: 'included_in_fees',
              issuedBy: storeConfig.inChargeName || 'Store Master',
              remarks
            });
          }}
          className="space-y-4 text-xs"
        >
          {/* Select Student */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Student (Zirlai thlang rawh):</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-sm"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (Roll: {s.rollNo || '0'}, Adm: {s.admissionNumber}) - Class {s.classId}
                </option>
              ))}
            </select>
          </div>

          {/* Uniform Items Checkbox List with Size Pickers */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-semibold text-indigo-300">Uniform Items to Issue (Uniform sem turte):</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {uniforms.map(uni => {
                const isSelected = selectedUniforms.some(u => u.name === uni.name);
                const currentItem = selectedUniforms.find(u => u.name === uni.name);

                return (
                  <div
                    key={uni.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-indigo-950/40 border-indigo-500/60' : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUniforms(prev => [
                              ...prev,
                              {
                                uniformId: uni.id,
                                name: uni.name,
                                size: uni.sizes?.[0]?.size || '30',
                                quantity: 1,
                                price: uni.price
                              }
                            ]);
                          } else {
                            setSelectedUniforms(prev => prev.filter(u => u.name !== uni.name));
                          }
                        }}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                      />
                      <span className="text-white truncate font-medium">{uni.name}</span>
                    </label>

                    {isSelected && (
                      <select
                        value={currentItem?.size}
                        onChange={e => {
                          const newSize = e.target.value;
                          setSelectedUniforms(prev =>
                            prev.map(u => u.name === uni.name ? { ...u, size: newSize } : u)
                          );
                        }}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5"
                      >
                        {(uni.sizes || []).map(s => (
                          <option key={s.size} value={s.size}>Sz: {s.size}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Book Items Checkbox List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-semibold text-emerald-300">Textbooks to Hand Over (Zirlaibu sem turte):</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {books.map(bk => {
                const isSelected = selectedBooks.some(b => b.title === bk.title);

                return (
                  <label
                    key={bk.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedBooks(prev => [
                              ...prev,
                              { bookId: bk.id, title: bk.title, price: bk.price, quantity: 1 }
                            ]);
                          } else {
                            setSelectedBooks(prev => prev.filter(b => b.title !== bk.title));
                          }
                        }}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                      />
                      <span className="text-white truncate font-medium">{bk.title}</span>
                    </div>
                    <span className="text-emerald-400 font-bold shrink-0">₹{bk.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Pending Items & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pending Items (A la kim lo awm chuan hetiang hian ziak rawh):
              </label>
              <input
                type="text"
                value={pendingNotes}
                onChange={e => setPendingNotes(e.target.value)}
                placeholder="e.g. Blazer size 32, Tie"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Remarks / Note:</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Remarks"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Total Package Value: <strong className="text-emerald-400 text-sm">₹{totalKitCost}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save & Print Issue Slip</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUB-MODAL: PRINT OFFICIAL ISSUE SLIP / RECEIPT
// ==========================================
function PrintSlipModal({ isOpen, onClose, slip, schoolInfo, storeConfig }) {
  const isPos = slip.type === 'pos_sale';
  const data = slip.data;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isPos ? 'Store Cash Receipt' : 'Student Store Issue Slip'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header p { margin: 3px 0; font-size: 12px; color: #475569; }
          .receipt-title { background: #f1f5f9; padding: 8px 12px; font-weight: 700; text-align: center; border-radius: 4px; font-size: 13px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-grid { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 16px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          .right { text-align: right; }
          .total-row { font-weight: 700; font-size: 13px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
          .sig-box { text-align: center; width: 160px; border-top: 1px dashed #64748b; padding-top: 6px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${schoolInfo?.name || 'CENTRAL SCHOOL ACADEMY'}</h2>
          <p>${storeConfig.storeName || 'Official Bookstore & Uniform Depot'}</p>
          <p>Location: ${storeConfig.location || 'Admin Block'} | Phone: ${storeConfig.contactPhone || ''}</p>
        </div>

        <div class="receipt-title">
          ${isPos ? 'OFFICIAL STORE CASH MEMO / SALES INVOICE' : 'OFFICIAL STUDENT STORE ISSUE SLIP (DELIVERY RECEIPT)'}
        </div>

        <div class="meta-grid">
          <div>
            <strong>Student Name:</strong> ${data.studentName || 'Walk-in'}<br />
            <strong>Class:</strong> ${data.className || data.classId || 'N/A'}<br />
            <strong>Admission No:</strong> ${data.admissionNo || 'N/A'}
          </div>
          <div style="text-align: right;">
            <strong>Slip No:</strong> ${data.receiptNumber || data.receiptNo || 'RCP-STORE'}<br />
            <strong>Date:</strong> ${data.issuedDate || data.date || new Date().toISOString().split('T')[0]}<br />
            <strong>Served By:</strong> ${data.issuedBy || data.servedBy || 'Store In-charge'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Item Particulars</th>
              <th style="width: 60px;">Size</th>
              <th style="width: 50px;" class="right">Qty</th>
              <th style="width: 70px;" class="right">Rate (₹)</th>
              <th style="width: 80px;" class="right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(isPos ? data.items || [] : [...(data.uniformItems || []), ...(data.bookItems || [])]).map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.name || item.title}</strong></td>
                <td>${item.size || 'Std'}</td>
                <td class="right">${item.quantity || 1}</td>
                <td class="right">₹${item.price}</td>
                <td class="right">₹${(item.price || 0) * (item.quantity || 1)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5" class="right">Total Value:</td>
              <td class="right">₹${data.totalAmount || slip.totalAmount || 0}</td>
            </tr>
          </tbody>
        </table>

        ${data.pendingItems && data.pendingItems.length > 0 ? `
          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; font-size: 11px; color: #92400e; margin-bottom: 16px; border-radius: 4px;">
            <strong>Pending Items to Collect:</strong> ${data.pendingItems.join(', ')}
          </div>
        ` : ''}

        <div style="font-size: 11px; color: #64748b; margin-top: 10px;">
          <strong>Exchange Policy:</strong> ${storeConfig.termsAndConditions || 'Exchanges accepted within 7 days with intact tags.'}
        </div>

        <div class="signatures">
          <div class="sig-box">
            Receiver / Guardian Signature
          </div>
          <div class="sig-box">
            Store In-Charge Seal & Sign
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <span>Store Delivery Receipt / Slip</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
          <div className="text-center border-b border-slate-800 pb-2">
            <p className="font-bold text-white text-sm">{schoolInfo?.name || 'School Store Depot'}</p>
            <p className="text-[11px] text-slate-400">Slip No: {data.receiptNumber || data.receiptNo}</p>
          </div>

          <div className="flex justify-between text-[11px]">
            <span>Student: {data.studentName}</span>
            <span>Date: {data.issuedDate || data.date}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            {(isPos ? data.items || [] : [...(data.uniformItems || []), ...(data.bookItems || [])]).map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name || item.title} (x{item.quantity || 1})</span>
                <span className="font-bold text-white">₹{(item.price || 0) * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400 text-sm">
            <span>TOTAL:</span>
            <span>₹{data.totalAmount || slip.totalAmount}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Slip (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
