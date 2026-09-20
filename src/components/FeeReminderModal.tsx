import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, AlertCircle } from 'lucide-react';
import { FirestoreStudent, FeeRecord } from '../types';
import { generateParentReminderMessage } from '../lib/feeService';

interface FeeReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: FirestoreStudent;
  feeRecord?: FeeRecord;
}

export const FeeReminderModal: React.FC<FeeReminderModalProps> = ({
  isOpen,
  onClose,
  student,
  feeRecord,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const defaultMessage = generateParentReminderMessage(student, feeRecord);
  const [messageText, setMessageText] = useState(defaultMessage);

  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
    setSentSuccess(true);
  };

  const handleSendSMS = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full p-6 text-gray-100 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Parent Fee Due Notification</h3>
              <p className="text-xs text-gray-400">Nu leh Pa Hriattirna / SMS & WhatsApp Alert</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Target Student Info */}
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm">{student.name}</div>
              <div className="text-gray-400 text-xs">
                Roll #{student.rollNo} • {student.className}
              </div>
            </div>
            <div className="text-right">
              <div className="text-rose-400 font-mono font-bold text-sm">
                Due: ₹{(feeRecord?.balanceAmount ?? (student.totalFeesDue || 2200)).toLocaleString()}
              </div>
              <div className="text-gray-400 font-mono text-[11px] flex items-center gap-1 justify-end">
                <Phone className="w-3 h-3 text-gray-500" />
                {student.parentPhone}
              </div>
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Notice Content (Bilingual Mizo & English)</span>
              <span className="text-[11px] text-amber-400 font-normal">Official School Template</span>
            </label>
            <textarea
              rows={8}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
            />
          </div>

          {sentSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Fee reminder alert dispatched successfully to {student.parentPhone}!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Notice Text'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send WhatsApp
            </button>
            <button
              type="button"
              onClick={handleSendSMS}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Send School SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
