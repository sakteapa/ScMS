import React, { useState } from 'react';
import { 
  Coffee, 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Save, 
  ShoppingBag, 
  Utensils, 
  QrCode, 
  User, 
  RefreshCw,
  Wallet
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function CanteenView() {
  const { 
    canteenMenu, 
    canteenWallets, 
    canteenTransactions, 
    canteenConfig, 
    recordCanteenPurchase, 
    topupCanteenWallet, 
    updateCanteenMenu, 
    addCanteenMenuItem, 
    updateCanteenConfig,
    students 
  } = useSchool();
  const { currentUser, isPrincipal, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'menu' | 'wallets' | 'config'
  const [toast, setToast] = useState(null);

  // POS State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [cart, setCart] = useState([]); // [{ item, qty }]
  const [searchMenuQuery, setSearchMenuQuery] = useState('');

  // Top-Up Modal State
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupStudentId, setTopupStudentId] = useState('');
  const [topupAmount, setTopupAmount] = useState(200);

  // New Menu Item Modal
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Hot Meals',
    price: 50,
    image: '🍱'
  });

  // Config Draft
  const [configDraft, setConfigDraft] = useState(canteenConfig || {});

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentWallet = selectedStudentId ? (canteenWallets[selectedStudentId] || { balance: 0, dailySpentToday: 0 }) : null;

  const cartTotal = cart.reduce((sum, entry) => sum + (entry.item.price * entry.qty), 0);

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id);
      if (existing) {
        return prev.map(e => e.item.id === item.id ? { ...e, qty: e.qty + 1 } : e);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => prev.filter(e => e.item.id !== itemId));
  };

  const handleCompleteOrder = () => {
    if (!selectedStudentId) {
      alert('Khawngaihin zirlai thlang hmasa rawh.');
      return;
    }
    if (cart.length === 0) {
      alert('Khawngaihin thil lei tur thlang rawh.');
      return;
    }

    const itemsOrdered = cart.flatMap(e => Array(e.qty).fill(e.item));
    const res = recordCanteenPurchase(selectedStudentId, itemsOrdered, cartTotal);

    if (!res.success) {
      alert(res.error || 'Thil lei a theih loh.');
      return;
    }

    setToast(`Order completed! ₹${cartTotal} deducted from ${selectedStudent?.firstName}'s Smart Meal Card.`);
    setCart([]);
    setTimeout(() => setToast(null), 3500);
  };

  const handleTopupSubmit = (e) => {
    e.preventDefault();
    if (!topupStudentId || topupAmount <= 0) return;

    topupCanteenWallet(topupStudentId, topupAmount, 'School Cashier Counter');
    setIsTopupModalOpen(false);
    const stu = students.find(s => s.id === topupStudentId);
    setToast(`₹${topupAmount} added to ${stu?.firstName}'s canteen wallet!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0) return;

    addCanteenMenuItem(newItem);
    setIsNewItemModalOpen(false);
    setNewItem({ name: '', category: 'Hot Meals', price: 50, image: '🍱' });
    setToast('New meal item added to canteen menu!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateCanteenConfig(configDraft);
    setToast('Canteen & Smart Meal settings updated!');
    setTimeout(() => setToast(null), 3000);
  };

  const filteredMenu = canteenMenu.filter(m => 
    m.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchMenuQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <Coffee className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                School Canteen &amp; Smart Lunch Card POS
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                CAFETERIA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Managers: <strong className="text-white">{canteenConfig?.canteenManager || 'Pu K. Lalremruata & Pi Zonuni'}</strong> • Cashless Meal Cards &amp; Fast Checkout
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTopupModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>Top-Up Student Card</span>
          </button>

          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pos' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Point of Sale (POS Terminal)</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'menu' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Daily Canteen Menu ({canteenMenu.length} items)</span>
        </button>

        <button
          onClick={() => setActiveTab('wallets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'wallets' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Smart Wallets &amp; Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Canteen Settings</span>
        </button>
      </div>

      {/* TAB 1: POS TERMINAL */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Selection (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchMenuQuery}
                  onChange={(e) => setSearchMenuQuery(e.target.value)}
                  placeholder="Quick search food items..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredMenu.length} available items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMenu.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleAddToCart(m)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition flex flex-col justify-between space-y-2 group shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{m.image}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹{m.price}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-cyan-300 transition truncate">{m.name}</h4>
                    <span className="text-[10px] text-slate-400">{m.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Tray / Cart (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm font-['Outfit'] border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Active Order Tray</span>
                <span className="text-xs text-cyan-400 font-mono">{cart.length} items</span>
              </h3>

              {/* Student Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Customer (Student)</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="">-- Select Student / Scan QR --</option>
                  {students.map(s => {
                    const bal = canteenWallets[s.id]?.balance || 0;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} (Roll #{s.rollNo} • Bal: ₹{bal})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Student Wallet Overview Pill */}
              {selectedStudent && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Balance:</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{studentWallet?.balance || 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Spent Today:</span>
                    <span className="font-mono text-slate-300">₹{studentWallet?.dailySpentToday || 0} / ₹{canteenConfig?.dailySpendingLimit || 150}</span>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Tray is empty. Click items to add.</p>
                ) : (
                  cart.map(({ item, qty }) => (
                    <div key={item.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[150px]">
                        <span className="font-semibold text-white truncate block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">₹{item.price} × {qty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">₹{item.price * qty}</span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total & Checkout Button */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Total Payable:</span>
                <span className="text-xl font-bold text-white font-mono">₹{cartTotal}</span>
              </div>

              <button
                onClick={handleCompleteOrder}
                disabled={cart.length === 0 || !selectedStudentId}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Swipe Smart Card &amp; Pay (₹{cartTotal})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU CATALOGUE */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {canteenMenu.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">{m.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-white text-xs truncate">{m.name}</h4>
                    <span className="font-mono font-bold text-emerald-400 text-xs">₹{m.price}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{m.category}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono mt-1 inline-block">
                    In Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WALLETS & LEDGER */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm font-['Outfit']">Recent Smart Meal Card Transactions</h3>
            <div className="space-y-1.5">
              {canteenTransactions.map(tx => (
                <div key={tx.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-white">{tx.studentName}</span>
                    <span className="text-slate-500 block text-[10px]">{tx.item} • {tx.time}, {tx.date}</span>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tx.type === 'credit' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">Canteen &amp; Smart Meal Card Configuration</h3>
              <p className="text-xs text-slate-400">Managers, daily spending limits, and payment rules.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Canteen Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Canteen Manager / Caterer Name</label>
              <input
                type="text"
                value={configDraft.canteenManager || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, canteenManager: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Daily Spending Limit Cap per Student (₹)</label>
              <input
                type="number"
                value={configDraft.dailySpendingLimit || 150}
                onChange={(e) => setConfigDraft({ ...configDraft, dailySpendingLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Daily Lunch Pre-Order Cutoff Time</label>
              <input
                type="text"
                value={configDraft.orderCutoffTime || '10:30 AM'}
                onChange={(e) => setConfigDraft({ ...configDraft, orderCutoffTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Low Balance Warning Threshold (₹)</label>
              <input
                type="number"
                value={configDraft.lowBalanceThreshold || 50}
                onChange={(e) => setConfigDraft({ ...configDraft, lowBalanceThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Enforce Cashless Smart Card Only</div>
                <p className="text-[11px] text-slate-400">When enabled, students cannot use physical cash at the counter and must tap their smart card.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.cashlessSmartCardOnly}
                onChange={(e) => setConfigDraft({ ...configDraft, cashlessSmartCardOnly: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>
          </div>
        </form>
      )}

      {/* TOP-UP MODAL */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleTopupSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Top-Up Smart Meal Wallet</h3>
              <button type="button" onClick={() => setIsTopupModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Select Student</label>
              <select
                value={topupStudentId}
                onChange={(e) => setTopupStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Roll #{s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Recharge Amount (₹)</label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min="50"
                step="50"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTopupModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Add ₹{topupAmount} to Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW MENU ITEM MODAL */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddItemSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Add Daily Menu Item</h3>
              <button type="button" onClick={() => setIsNewItemModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Chicken Chowmein, Fresh Juice"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Price (₹)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Icon Emoji</label>
                <input
                  type="text"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="Hot Meals">Hot Meals</option>
                <option value="Snacks">Snacks</option>
                <option value="Healthy Treats">Healthy Treats</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewItemModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
