import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Send, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  ExternalLink,
  ShieldCheck,
  Upload,
  Paperclip,
  Eye,
  Edit3,
  AlertCircle,
  Plus,
  Trash2,
  Settings,
  Printer,
  Check,
  Building,
  UserCheck,
  Phone,
  MapPin,
  FileCheck,
  Save,
  MessageSquare,
  History,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Download,
  Calendar,
  Users,
  Bell,
  Percent,
  Sliders,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import AdmissionDocumentUploader from '../components/AdmissionDocumentUploader';
import { INITIAL_SEAT_QUOTAS } from '../data/mockData';

export default function AdmissionsView({ setCurrentTab }) {
  const { 
    admissions, 
    classes, 
    students = [],
    admissionRequirements = [], 
    onlineAdmissionConfig,
    updateOnlineAdmissionConfig,
    offlineAdmissionConfig,
    updateOfflineAdmissionConfig,
    publishNotice,
    submitAdmission, 
    reviewAdmission, 
    updateAdmissionRecord,
    requestAdmissionDocument,
    updateAdmissionDocumentStatus,
    addAdmissionRequirement,
    updateAdmissionRequirement,
    deleteAdmissionRequirement,
    exportDataToCSV,
    systemConfig
  } = useSchool();
  
  const { isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const canManagePolicy = isPrincipal || isVicePrincipal || isSuperAdmin;

  // Tabs: 'admin_review' | 'offline_desk' | 'public_form' | 'requirements_setup'
  const [activeTab, setActiveTab] = useState('admin_review');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected' | 'offline_walkin' | 'online'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Application for Deep Inspection / Correction Modal
  const [selectedAdmForReview, setSelectedAdmForReview] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Document Viewer & Inspection Modal State
  const [previewingDoc, setPreviewingDoc] = useState(null); // { doc, adm }
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);

  // Reactive admission dossier pointer (keeps docs & audit trail live upon verification)
  const activeSelectedAdm = selectedAdmForReview
    ? (admissions.find(a => a.id === selectedAdmForReview.id) || selectedAdmForReview)
    : null;

  // Document Request Form State
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  const [docRequestForm, setDocRequestForm] = useState({
    title: 'Original Transfer Certificate (TC)',
    message: ''
  });

  // Requirements Setup Modal / Form State
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    category: 'academic',
    description: '',
    mandatory: true,
    targetStreams: 'all',
    allowedFormats: 'PDF, JPG, PNG (Max 5MB)'
  });

  // Seat Matrix & Quota Management State
  const [seatFilterLevel, setSeatFilterLevel] = useState('all');
  const [bulkQuotaPercent, setBulkQuotaPercent] = useState(onlineAdmissionConfig?.defaultOldStudentQuotaPercent || 60);
  const [bulkDefaultCapacity, setBulkDefaultCapacity] = useState(50);
  const [editingClassQuotaId, setEditingClassQuotaId] = useState(null);

  const activeSeatQuotas = (onlineAdmissionConfig?.seatQuotas && onlineAdmissionConfig.seatQuotas.length > 0)
    ? onlineAdmissionConfig.seatQuotas
    : INITIAL_SEAT_QUOTAS;

  const totalSchoolCapacity = activeSeatQuotas.reduce((acc, q) => acc + (Number(q.totalSeats) || 0), 0);
  const totalOldReserved = activeSeatQuotas.reduce((acc, q) => acc + (Number(q.oldStudentReserved) || 0), 0);
  const totalFreshOpen = activeSeatQuotas.reduce((acc, q) => acc + (Number(q.freshOpenSeats) || 0), 0);

  // Helper to compute live enrollment, approved new admissions, and vacant seats
  const getClassStats = (clsIdentifier, quota) => {
    const qClassName = quota?.className || '';
    const enrolledStudents = (students || []).filter(s => 
      s.classId === clsIdentifier || 
      (s.className && qClassName && s.className.toLowerCase() === qClassName.toLowerCase()) ||
      (s.class && qClassName && s.class.toLowerCase() === qClassName.toLowerCase())
    );
    const approvedAdm = admissions.filter(a => 
      (a.appliedClass === clsIdentifier || a.appliedClass === qClassName) && 
      a.status === 'approved'
    );
    const pendingAdm = admissions.filter(a => 
      (a.appliedClass === clsIdentifier || a.appliedClass === qClassName) && 
      a.status === 'pending'
    );

    const enrolledCount = enrolledStudents.length;
    const approvedCount = approvedAdm.length;
    const totalFilled = enrolledCount + approvedCount;
    const totalCap = Number(quota?.totalSeats) || 0;
    const remaining = Math.max(0, totalCap - totalFilled);
    const fillPercent = totalCap > 0 ? Math.min(100, Math.round((totalFilled / totalCap) * 100)) : 0;

    return {
      enrolledCount,
      approvedCount,
      pendingCount: pendingAdm.length,
      totalFilled,
      remaining,
      fillPercent
    };
  };

  const handleUpdateClassQuota = (classId, fields) => {
    const updatedQuotas = activeSeatQuotas.map(q => {
      if (q.classId === classId) {
        const totalSeats = fields.totalSeats !== undefined ? Math.max(0, Number(fields.totalSeats)) : q.totalSeats;
        const oldStudentReserved = fields.oldStudentReserved !== undefined ? Math.max(0, Number(fields.oldStudentReserved)) : q.oldStudentReserved;
        const freshOpenSeats = fields.freshOpenSeats !== undefined ? Math.max(0, Number(fields.freshOpenSeats)) : Math.max(0, totalSeats - oldStudentReserved);
        return {
          ...q,
          ...fields,
          totalSeats,
          oldStudentReserved,
          freshOpenSeats
        };
      }
      return q;
    });
    updateOnlineAdmissionConfig({ seatQuotas: updatedQuotas });
    setEditingClassQuotaId(null);
  };

  const handleBulkApplyQuota = () => {
    const pct = Number(bulkQuotaPercent) || 60;
    const updatedQuotas = activeSeatQuotas.map(q => {
      const totalSeats = q.totalSeats || 50;
      const oldStudentReserved = Math.round((totalSeats * pct) / 100);
      const freshOpenSeats = Math.max(0, totalSeats - oldStudentReserved);
      return {
        ...q,
        totalSeats,
        oldStudentReserved,
        freshOpenSeats
      };
    });
    updateOnlineAdmissionConfig({
      defaultOldStudentQuotaPercent: pct,
      seatQuotas: updatedQuotas
    });
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  const handlePublishSeatNoticeToNoticeBoard = () => {
    const session = systemConfig?.academicSession || onlineAdmissionConfig?.academicSession || '2026 - 2027';
    const percent = onlineAdmissionConfig?.defaultOldStudentQuotaPercent || bulkQuotaPercent || 60;
    const deadline = onlineAdmissionConfig?.oldStudentPriorityEndDate || '2026-05-31';
    const discount = onlineAdmissionConfig?.oldStudentFeeDiscountPercent || 20;

    const noticeData = {
      title: `Official Circular: Academic Session ${session} Admission Seat Matrix & Old Student Quota Policy`,
      content: `The Admission Council and Academic Board hereby publish the sanctioned intake and reservation guidelines for Session ${session}. Under institutional guidelines, ${percent}% of total seats across all classes (Nursery to Class 12) are reserved for continuing and old students of this school. Continuing students enjoy priority re-enrolment and a ${discount}% admission fee concession until ${deadline}. After the priority deadline, any unclaimed seats will automatically convert to the open fresh applicant merit quota.`,
      category: 'academic',
      priority: 'urgent',
      targetAudience: 'all',
      isPinned: true,
      publishedBy: isPrincipal ? 'Rev. Dr. L. H. Rohmingliana (Principal)' : isVicePrincipal ? 'Dr. C. Lalremruata (Vice Principal)' : 'Admission Council & Office',
      channels: { inApp: true, whatsapp: true, push: true, sms: true }
    };

    if (typeof publishNotice === 'function') {
      publishNotice(noticeData);
    }
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    alert('Official Seat Matrix & Old Student Quota Notice has been published to the School Notice Board and broadcasted to students and parents!');
  };

  // Public Online Form State
  const [publicFormData, setPublicFormData] = useState({
    applicantName: '',
    gender: 'Female',
    dob: '2009-04-15',
    bloodGroup: 'B+',
    parentName: '',
    guardianOccupation: '',
    contactPhone: '',
    email: '',
    address: '',
    appliedClass: 'cls-11-sci',
    appliedStream: 'science',
    previousSchool: '',
    marksPercentage: '',
    remarks: '',
    isOldStudent: false,
    previousAdmissionNo: ''
  });
  const [publicUploadedDocs, setPublicUploadedDocs] = useState([]);
  const [submittedApplicationId, setSubmittedApplicationId] = useState(null);

  // Offline Staff Desk Form State
  const [offlineFormData, setOfflineFormData] = useState({
    applicantName: '',
    gender: 'Male',
    dob: '2009-06-20',
    bloodGroup: 'O+',
    parentName: '',
    guardianOccupation: '',
    contactPhone: '',
    email: '',
    address: 'Aizawl, Mizoram',
    appliedClass: 'cls-11-sci',
    appliedStream: 'science',
    previousSchool: '',
    marksPercentage: '',
    remarks: '',
    cashierOfficer: 'Pu R. Laltluanga (Chief Cashier & Desk Clerk)',
    initialAdmissionFee: '12000',
    feeSettledAtCounter: true,
    instantEnroll: false,
    isOldStudent: false,
    previousAdmissionNo: ''
  });
  const [offlineUploadedDocs, setOfflineUploadedDocs] = useState([]);
  const [offlineSuccessId, setOfflineSuccessId] = useState(null);

  // Filtered Admissions List
  const filteredAdmissions = admissions.filter(adm => {
    let matchesFilter = true;
    if (filterStatus === 'pending') matchesFilter = adm.status === 'pending';
    else if (filterStatus === 'approved') matchesFilter = adm.status === 'approved';
    else if (filterStatus === 'rejected') matchesFilter = adm.status === 'rejected';
    else if (filterStatus === 'offline_walkin') matchesFilter = adm.entryType === 'offline_walkin';
    else if (filterStatus === 'online') matchesFilter = adm.entryType === 'online';

    const matchesSearch = !searchQuery || 
      adm.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.contactPhone.includes(searchQuery) ||
      adm.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Simulated Document Upload Handler for Public / Offline Form
  const handleSimulatedDocUpload = (e, targetForm = 'public', reqTitle = 'Document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: reqTitle,
      category: 'uploaded_proof',
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'pending_review',
      uploadedAt: new Date().toISOString(),
      url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
    };

    if (targetForm === 'public') {
      setPublicUploadedDocs(prev => [...prev.filter(d => d.title !== reqTitle), newDoc]);
    } else {
      setOfflineUploadedDocs(prev => [...prev.filter(d => d.title !== reqTitle), newDoc]);
    }
  };

  const handleRemoveDoc = (docId, targetForm = 'public') => {
    if (targetForm === 'public') {
      setPublicUploadedDocs(prev => prev.filter(d => d.id !== docId));
    } else {
      setOfflineUploadedDocs(prev => prev.filter(d => d.id !== docId));
    }
  };

  // Submit Public Online Form
  const handlePublicSubmit = (e) => {
    e.preventDefault();
    const newAdm = submitAdmission({
      ...publicFormData,
      documents: publicUploadedDocs
    }, 'online', 'Applicant (Public Portal)');

    setSubmittedApplicationId(newAdm.id);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Submit Offline Staff Desk Form
  const handleOfflineSubmit = (e) => {
    e.preventDefault();
    const newAdm = submitAdmission({
      ...offlineFormData,
      documents: offlineUploadedDocs
    }, 'offline_walkin', offlineFormData.cashierOfficer);

    if (offlineFormData.instantEnroll) {
      reviewAdmission(
        newAdm.id, 
        'approved', 
        offlineFormData.appliedClass, 
        `Instantly enrolled via Walk-In Counter. Fee receipt recorded: ₹${offlineFormData.initialAdmissionFee}`,
        offlineFormData.cashierOfficer
      );
    }

    setOfflineSuccessId(newAdm.id);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Approve Handler
  const handleApprove = (adm) => {
    const res = reviewAdmission(
      adm.id, 
      'approved', 
      adm.appliedClass, 
      'Approved by Admission Committee & Enrolled.',
      isPrincipal ? 'Principal' : isVicePrincipal ? 'Vice Principal' : 'Admission Officer'
    );
    alert(`Application for ${adm.applicantName} approved! Student profile created with Admission No: ${res?.admissionNo || 'MZ-2026'}.`);
    if (selectedAdmForReview?.id === adm.id) {
      setSelectedAdmForReview(null);
    }
  };

  // Reject Handler
  const handleReject = (adm) => {
    const reason = prompt('Reason for rejection / remark:', 'Seats fully subscribed / Eligibility criteria not fulfilled');
    if (reason !== null) {
      reviewAdmission(
        adm.id, 
        'rejected', 
        null, 
        reason || 'Application rejected by Committee',
        isPrincipal ? 'Principal' : isVicePrincipal ? 'Vice Principal' : 'Admission Officer'
      );
      if (selectedAdmForReview?.id === adm.id) {
        setSelectedAdmForReview(null);
      }
    }
  };

  // Open Inspection Modal
  const handleOpenInspection = (adm) => {
    setSelectedAdmForReview(adm);
    setEditFormData({ ...adm });
    setIsEditingDetails(false);
  };

  // Save Corrected Candidate Details
  const handleSaveCorrectedDetails = (e) => {
    e.preventDefault();
    updateAdmissionRecord(
      selectedAdmForReview.id,
      editFormData,
      isPrincipal ? 'Rev. Dr. L.H. Rohmingliana (Principal)' : 'Admission Verification Council'
    );
    setSelectedAdmForReview(prev => ({ ...prev, ...editFormData }));
    setIsEditingDetails(false);
    alert('Candidate profile details have been successfully corrected and saved with audit record.');
  };

  // Send Document Request
  const handleSendDocRequest = (e) => {
    e.preventDefault();
    if (!docRequestForm.title) return;

    requestAdmissionDocument(
      selectedAdmForReview.id,
      docRequestForm,
      isPrincipal ? 'Principal' : isVicePrincipal ? 'Vice Principal' : 'Admission Council'
    );

    setShowDocRequestModal(false);
    setDocRequestForm({ title: 'Original Transfer Certificate (TC)', message: '' });
    
    // Update local modal state
    setSelectedAdmForReview(prev => ({
      ...prev,
      documentRequests: [
        ...(prev.documentRequests || []),
        {
          id: `dreq-${Date.now()}`,
          title: docRequestForm.title,
          message: docRequestForm.message,
          requestedBy: isPrincipal ? 'Principal' : 'Vice Principal',
          requestedAt: new Date().toISOString(),
          status: 'pending'
        }
      ]
    }));
    alert('Document request and query notification recorded.');
  };

  // Add New Requirement Policy
  const handleAddRequirement = (e) => {
    e.preventDefault();
    if (!newRequirement.title) return;
    addAdmissionRequirement(newRequirement);
    setShowAddReqModal(false);
    setNewRequirement({
      title: '',
      category: 'academic',
      description: '',
      mandatory: true,
      targetStreams: 'all',
      allowedFormats: 'PDF, JPG, PNG (Max 5MB)'
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Online &amp; Walk-In Admissions Suite</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              AY 2026-2027
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Omni-channel enrollment: Walk-in counter registration, public portal, document verification, and admission council review.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('admin_review')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'admin_review' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Review Council ({admissions.filter(a => a.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('offline_desk')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'offline_desk' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Offline Walk-In Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('public_form')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'public_form' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Online Form</span>
          </button>
          {canManagePolicy && (
            <button
              onClick={() => setActiveTab('seat_quotas')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'seat_quotas' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seat Quota &amp; Old Students</span>
            </button>
          )}
          {canManagePolicy && (
            <button
              onClick={() => setActiveTab('requirements_setup')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requirements_setup' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Portal Settings &amp; Open Classes</span>
            </button>
          )}
        </div>
      </div>

      {/* LEADERSHIP ADMISSION GATES BAR (ADMIN & VICE PRINCIPAL) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Leadership Admissions Gate</span>
              <span className="text-[10px] text-slate-400 font-mono">
                Academic Session: <strong className="text-indigo-400">{systemConfig?.academicSession || '2026 - 2027'}</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Admin &amp; Vice Principal direct switches for Online portal and Offline walk-in counter admissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Online Admissions Gate */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-300 font-semibold">Online Portal:</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
              onlineAdmissionConfig?.isOpen !== false
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {onlineAdmissionConfig?.isOpen !== false ? '● OPEN' : '○ CLOSED'}
            </span>
            {canManagePolicy && (
              <button
                type="button"
                onClick={() => updateOnlineAdmissionConfig({ isOpen: !(onlineAdmissionConfig?.isOpen !== false) })}
                className={`text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  onlineAdmissionConfig?.isOpen !== false
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {onlineAdmissionConfig?.isOpen !== false ? 'Close Portal' : 'Open Portal'}
              </button>
            )}
          </div>

          {/* Offline Admissions Gate */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-300 font-semibold">Offline Counter:</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
              offlineAdmissionConfig?.isOpen !== false
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {offlineAdmissionConfig?.isOpen !== false ? '● OPEN' : '○ CLOSED'}
            </span>
            {canManagePolicy && (
              <button
                type="button"
                onClick={() => updateOfflineAdmissionConfig({ isOpen: !(offlineAdmissionConfig?.isOpen !== false) })}
                className={`text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  offlineAdmissionConfig?.isOpen !== false
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                }`}
              >
                {offlineAdmissionConfig?.isOpen !== false ? 'Close Desk' : 'Open Desk'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: ADMIN REVIEW WORKFLOW & AUDIT COUNCIL */}
      {activeTab === 'admin_review' && (
        <div className="space-y-5">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Applications</span>
              <span className="text-2xl font-bold text-white font-['Outfit'] block">{admissions.length}</span>
              <span className="text-[10px] text-slate-500">Online &amp; Walk-In Combined</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-amber-400 font-semibold uppercase">Pending Evaluation</span>
              <span className="text-2xl font-bold text-amber-300 font-['Outfit'] block">
                {admissions.filter(a => a.status === 'pending').length}
              </span>
              <span className="text-[10px] text-amber-500/80">Requires Committee Review</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase">Approved &amp; Enrolled</span>
              <span className="text-2xl font-bold text-emerald-300 font-['Outfit'] block">
                {admissions.filter(a => a.status === 'approved').length}
              </span>
              <span className="text-[10px] text-emerald-500/80">Student IDs Generated</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-purple-400 font-semibold uppercase">Walk-In Counter Entries</span>
              <span className="text-2xl font-bold text-purple-300 font-['Outfit'] block">
                {admissions.filter(a => a.entryType === 'offline_walkin').length}
              </span>
              <span className="text-[10px] text-purple-500/80">Registered by Office Staff</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending Review' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'offline_walkin', label: 'Offline Walk-In' },
                { id: 'online', label: 'Online Portal' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterStatus(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filterStatus === pill.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, or ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => exportDataToCSV('admissions')}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Applications Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAdmissions.map((adm) => {
              const targetClass = classes.find(c => c.id === adm.appliedClass);
              const totalDocs = adm.documents?.length || 0;
              const hasDocRequests = adm.documentRequests?.length > 0;

              return (
                <div
                  key={adm.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Type & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white font-['Outfit']">
                            {adm.applicantName}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">({adm.gender})</span>
                          {adm.isOldStudent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              Old Student Quota
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                          {targetClass?.name} {adm.appliedStream ? `• ${adm.appliedStream.toUpperCase()}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          adm.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          adm.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {adm.status}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          adm.entryType === 'offline_walkin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {adm.entryType === 'offline_walkin' ? 'Walk-In Counter' : 'Online Form'}
                        </span>
                      </div>
                    </div>

                    {/* Bio & Academic Snippet */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parent/Guardian:</span>
                        <span className="text-slate-200 font-medium">{adm.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-slate-200 font-mono">{adm.contactPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prior School:</span>
                        <span className="text-slate-300 truncate max-w-[160px]">{adm.previousSchool}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Score/Marks:</span>
                        <span className="font-mono font-bold text-cyan-300">{adm.marksPercentage}</span>
                      </div>
                    </div>

                    {/* Document Status Badges & Quick Thumbnails */}
                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <button 
                          type="button"
                          onClick={() => handleOpenInspection(adm)}
                          className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition text-[11px] group"
                          title="Click to view all attached documents"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
                          <span>Attached Docs: <strong className="text-white underline decoration-cyan-500/50 group-hover:text-cyan-300">{totalDocs}</strong></span>
                        </button>
                        {hasDocRequests && (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>Doc Requested</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Document View Thumbnails */}
                      {(adm.documents || []).length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                          {(adm.documents || []).map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewingDoc({ doc: d, adm });
                                setPreviewZoom(1);
                                setPreviewRotation(0);
                              }}
                              title={`Click to preview ${d.title} (${d.status})`}
                              className="group/doc relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-400 transition shrink-0"
                            >
                              <div className="w-4 h-4 rounded overflow-hidden bg-slate-800 shrink-0 relative">
                                {d.url ? (
                                  <img src={d.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-3 h-3 text-cyan-400 m-0.5" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-300 max-w-[85px] truncate group-hover/doc:text-cyan-300">
                                {d.title}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                d.status === 'verified' ? 'bg-emerald-400 ring-2 ring-emerald-500/30' :
                                d.status === 'resubmission_requested' ? 'bg-amber-400 ring-2 ring-amber-500/30' :
                                'bg-slate-500'
                              }`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenInspection(adm)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect &amp; Verify</span>
                    </button>

                    {adm.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReject(adm)}
                          className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(adm)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: OFFLINE WALK-IN ADMISSION (STAFF DESK) */}
      {activeTab === 'offline_desk' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  School Admission Counter Desk (Walk-In Entry)
                </h3>
                <p className="text-xs text-slate-400">
                  Fill up admission registration form for candidates visiting the school office.
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase border border-purple-500/30">
              Staff Desk Mode
            </span>
          </div>

          {/* OFFLINE DESK CLOSED NOTICE */}
          {offlineAdmissionConfig?.isOpen === false && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    🔒 Offline Walk-In Admission Desk is Temporarily Closed
                  </h4>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {offlineAdmissionConfig?.closedMessage || 'Walk-in admissions are temporarily paused or closed by the Principal & Vice Principal. Counter registrations are locked.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Counter Location: {offlineAdmissionConfig?.counterLocation || 'Administrative Block Room 102'} • Hours: {offlineAdmissionConfig?.counterHours || '09:30 AM - 02:30 PM'}
                  </p>
                </div>
              </div>

              {canManagePolicy && (
                <button
                  type="button"
                  onClick={() => updateOfflineAdmissionConfig({ isOpen: true })}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition shrink-0 cursor-pointer"
                >
                  🔓 Re-Open Offline Desk
                </button>
              )}
            </div>
          )}

          {offlineSuccessId ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white font-['Outfit']">Offline Candidate Registered Successfully!</h4>
              <p className="text-xs text-slate-300">
                Application record created with Reference ID: <strong className="font-mono text-cyan-400">{offlineSuccessId}</strong>.
                {offlineFormData.instantEnroll ? ' Candidate has been immediately enrolled as an active student.' : ' Queued for Admission Council approval.'}
              </p>
              <button
                onClick={() => setOfflineSuccessId(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Register Next Walk-In Candidate
              </button>
            </div>
          ) : (
            <form onSubmit={handleOfflineSubmit} className="space-y-5 text-xs">
              {/* Desk Officer Signature Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receiving Staff / Cashier</span>
                  <span className="font-bold text-purple-300">{offlineFormData.cashierOfficer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Session:</span>
                  <strong className="text-white">AY 2026-2027</strong>
                </div>
              </div>

              {/* Section 1: Candidate Bio */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400 border-b border-slate-800 pb-1">
                  1. Candidate Personal Biodata
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lalhmingmawii Tochhawng"
                      value={offlineFormData.applicantName}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, applicantName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Gender *</label>
                    <select
                      value={offlineFormData.gender}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={offlineFormData.dob}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Blood Group</label>
                    <select
                      value={offlineFormData.bloodGroup}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Class Seeking Admission *</label>
                    <select
                      value={offlineFormData.appliedClass}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, appliedClass: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>
                      ))}
                    </select>
                    {(() => {
                      const q = activeSeatQuotas.find(sq => sq.classId === offlineFormData.appliedClass || sq.className === offlineFormData.appliedClass);
                      if (!q) return null;
                      const stats = getClassStats(offlineFormData.appliedClass, q);
                      return (
                        <div className="mt-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-between">
                          <span>Total: <strong>{q.totalSeats} Seats</strong> ({q.oldStudentReserved} Old Student Reserved, {q.freshOpenSeats} Open)</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${stats.remaining > 5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                            {stats.remaining} Vacant
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Old Student Quota Claim Option */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                      <input
                        type="checkbox"
                        checked={Boolean(offlineFormData.isOldStudent)}
                        onChange={(e) => setOfflineFormData({ ...offlineFormData, isOldStudent: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Applicant is an Old / Continuing Student of this School (Claim Quota)</span>
                    </label>
                    {offlineFormData.isOldStudent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        60% Reserved Seat + 20% Fee Concession
                      </span>
                    )}
                  </div>
                  {offlineFormData.isOldStudent && (
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">Previous Admission / Roll No *</label>
                        <input
                          type="text"
                          placeholder="e.g. ADM-2024-042 or Roll 12"
                          value={offlineFormData.previousAdmissionNo || ''}
                          onChange={(e) => setOfflineFormData({ ...offlineFormData, previousAdmissionNo: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center">
                        <p>Seat reserved from continuing intake; 20% concession applied at counter.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Parents & Contact */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400 border-b border-slate-800 pb-1">
                  2. Parents / Guardian &amp; Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Father / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. C. Vanlalmuana"
                      value={offlineFormData.parentName}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, parentName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94361..."
                      value={offlineFormData.contactPhone}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Guardian Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Govt. Servant / Business"
                      value={offlineFormData.guardianOccupation}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, guardianOccupation: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Residential Address in Mizoram</label>
                    <input
                      type="text"
                      placeholder="Locality, Veng, House No."
                      value={offlineFormData.address}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Academic Background & Verification Documents */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400 border-b border-slate-800 pb-1">
                  3. Academic Background &amp; Document Scanning
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Previous School Attended</label>
                    <input
                      type="text"
                      placeholder="e.g. Govt. High School"
                      value={offlineFormData.previousSchool}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, previousSchool: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Qualifying Score / Board %</label>
                    <input
                      type="text"
                      placeholder="e.g. 88.5% (Distinction)"
                      value={offlineFormData.marksPercentage}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, marksPercentage: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Document Attachments & Camera Scanner for Walk-in */}
                <AdmissionDocumentUploader
                  uploadedDocs={offlineUploadedDocs}
                  onDocsChange={setOfflineUploadedDocs}
                  customRequirements={admissionRequirements}
                />
              </div>

              {/* Section 4: Counter Fee & Direct Enrolment Option */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offlineFormData.instantEnroll}
                      onChange={(e) => setOfflineFormData({ ...offlineFormData, instantEnroll: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>Direct Enrolment (Issue Student ID &amp; Roll Number Instantly)</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Counter Clearance</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  If checked, the candidate will be immediately enrolled into the active student roster without waiting for admission council meeting.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_review')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Submit Walk-In Admission</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: PUBLIC ADMISSION FORM */}
      {activeTab === 'public_form' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-1 border-b border-slate-800 pb-5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Online Admission Registration {systemConfig?.academicSession || '2026-2027'}
            </span>
            <h3 className="text-2xl font-bold text-white font-['Outfit'] pt-2">
              {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
            </h3>
            <p className="text-xs text-slate-400">
              Online enrollment portal with document attachments for Nursery to Class 12 • {systemConfig?.address?.split(',')[0] || 'Lunglawn, Lunglei'}.
            </p>
          </div>

          {submittedApplicationId ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white font-['Outfit']">Application Submitted Successfully!</h4>
              <p className="text-xs text-slate-300">
                Your application reference ID is: <strong className="font-mono text-cyan-400">{submittedApplicationId}</strong>.
                The School Admission Council will review your documents and contact you on your registered phone number.
              </p>
              <button
                onClick={() => setSubmittedApplicationId(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handlePublicSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lalawmpuii"
                    value={publicFormData.applicantName}
                    onChange={(e) => setPublicFormData({ ...publicFormData, applicantName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gender *</label>
                  <select
                    value={publicFormData.gender}
                    onChange={(e) => setPublicFormData({ ...publicFormData, gender: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Applied Class *</label>
                  <select
                    value={publicFormData.appliedClass}
                    onChange={(e) => setPublicFormData({ ...publicFormData, appliedClass: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>
                    ))}
                  </select>
                  {(() => {
                    const q = activeSeatQuotas.find(sq => sq.classId === publicFormData.appliedClass || sq.className === publicFormData.appliedClass);
                    if (!q) return null;
                    const stats = getClassStats(publicFormData.appliedClass, q);
                    return (
                      <div className="mt-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-between">
                        <span>Total: <strong>{q.totalSeats} Seats</strong> ({q.oldStudentReserved} Old Student Reserved, {q.freshOpenSeats} Open)</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${stats.remaining > 5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {stats.remaining} Vacant
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={publicFormData.dob}
                    onChange={(e) => setPublicFormData({ ...publicFormData, dob: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Old Student Quota Claim Option */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={Boolean(publicFormData.isOldStudent)}
                      onChange={(e) => setPublicFormData({ ...publicFormData, isOldStudent: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Applicant is an Old / Continuing Student of this School (Claim Quota)</span>
                  </label>
                  {publicFormData.isOldStudent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      60% Reserved Seat + 20% Fee Concession
                    </span>
                  )}
                </div>
                {publicFormData.isOldStudent && (
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Previous Admission / Roll No *</label>
                      <input
                        type="text"
                        placeholder="e.g. ADM-2024-042 or Roll 12"
                        value={publicFormData.previousAdmissionNo || ''}
                        onChange={(e) => setPublicFormData({ ...publicFormData, previousAdmissionNo: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center">
                      <p>Priority admission review guaranteed until 31st May 2026 under institutional quota.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Father / Mother / Guardian *</label>
                  <input
                    type="text"
                    required
                    placeholder="Guardian Name"
                    value={publicFormData.parentName}
                    onChange={(e) => setPublicFormData({ ...publicFormData, parentName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94361..."
                    value={publicFormData.contactPhone}
                    onChange={(e) => setPublicFormData({ ...publicFormData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Previous School</label>
                  <input
                    type="text"
                    placeholder="Previous School Name"
                    value={publicFormData.previousSchool}
                    onChange={(e) => setPublicFormData({ ...publicFormData, previousSchool: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Qualifying Score / %</label>
                  <input
                    type="text"
                    placeholder="e.g. 84.5%"
                    value={publicFormData.marksPercentage}
                    onChange={(e) => setPublicFormData({ ...publicFormData, marksPercentage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Online Document Upload & Camera Scanner Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-3">
                <AdmissionDocumentUploader
                  uploadedDocs={publicUploadedDocs}
                  onDocsChange={setPublicUploadedDocs}
                  customRequirements={admissionRequirements}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Additional Remarks / Subject Combination</label>
                <textarea
                  rows={2}
                  placeholder="Subject interests, hostel accommodation requirement, etc."
                  value={publicFormData.remarks}
                  onChange={(e) => setPublicFormData({ ...publicFormData, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Official Application</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 4: ADMISSION REQUIREMENTS & PORTAL SETUP (MANAGEMENT) */}
      {activeTab === 'requirements_setup' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Section 1: Master Online Portal Controls */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  onlineAdmissionConfig?.isOpen !== false 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Online Admission Portal &amp; Open Classes Setup
                    </h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border ${
                      onlineAdmissionConfig?.isOpen !== false 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {onlineAdmissionConfig?.isOpen !== false ? '● Portal Active (Open)' : '○ Portal Paused (Closed)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Control which classes are open for application, set academic sessions, and manage public notices.
                  </p>
                </div>
              </div>

              {/* Master Switch Button */}
              <button
                type="button"
                onClick={() => {
                  const currentStatus = onlineAdmissionConfig?.isOpen !== false;
                  updateOnlineAdmissionConfig({ isOpen: !currentStatus });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer ${
                  onlineAdmissionConfig?.isOpen !== false
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <span>{onlineAdmissionConfig?.isOpen !== false ? 'Pause / Close Online Admissions' : 'Open / Activate Admissions'}</span>
              </button>
            </div>

            {/* Schedule Status & Overview Banner */}
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const adminStartDate = onlineAdmissionConfig?.startDate || '2026-03-01';
              const adminEndDate = onlineAdmissionConfig?.endDate || onlineAdmissionConfig?.applicationDeadline || '2026-06-30';
              const isAutoEnforce = onlineAdmissionConfig?.autoEnforceDates !== false;
              
              let statusType = 'open';
              let statusLabel = 'ACTIVE & OPEN';
              let statusDesc = `Portal is currently open for applications until ${adminEndDate}.`;
              let statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              if (onlineAdmissionConfig?.isOpen === false) {
                statusType = 'paused';
                statusLabel = 'MANUALLY PAUSED';
                statusDesc = 'Portal is turned off by Admin. Applicants will see a closed notice.';
                statusBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              } else if (!isAutoEnforce) {
                statusType = 'manual_open';
                statusLabel = 'ALWAYS OPEN (Manual Mode)';
                statusDesc = 'Date window schedule is ignored; registration is kept perpetually active.';
                statusBadgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              } else if (adminStartDate && todayStr < adminStartDate) {
                statusType = 'upcoming';
                statusLabel = 'UPCOMING (A LA HAWNG LO)';
                statusDesc = `Admission registration will automatically open on ${adminStartDate}.`;
                statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (adminEndDate && todayStr > adminEndDate) {
                statusType = 'expired';
                statusLabel = 'EXPIRED (KHAR TAWH)';
                statusDesc = `Admission schedule ended on ${adminEndDate}. Portal now displays admissions closed.`;
                statusBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              }

              return (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Current Schedule Status:</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{statusDesc}</p>
                    </div>
                  </div>

                  {/* Auto-Enforce Switch */}
                  <label className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer select-none hover:border-slate-700 transition shrink-0">
                    <input
                      type="checkbox"
                      checked={isAutoEnforce}
                      onChange={(e) => updateOnlineAdmissionConfig({ autoEnforceDates: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:outline-none accent-cyan-500 cursor-pointer"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-200">Auto-Enforce Dates</span>
                      <span className="block text-[10px] text-slate-400">Auto open/close by calendar dates</span>
                    </div>
                  </label>
                </div>
              );
            })()}

            {/* Config Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hawn Tan Ni (Start Date)</span>
                </label>
                <input
                  type="date"
                  value={onlineAdmissionConfig?.startDate || '2026-03-01'}
                  onChange={(e) => updateOnlineAdmissionConfig({ startDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">He ni hma chuan portal hi a inhawng lovang</span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>Khar Ni / Deadline (End Date)</span>
                </label>
                <input
                  type="date"
                  value={onlineAdmissionConfig?.endDate || onlineAdmissionConfig?.applicationDeadline || '2026-06-30'}
                  onChange={(e) => updateOnlineAdmissionConfig({ 
                    endDate: e.target.value,
                    applicationDeadline: e.target.value 
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">He ni hnu lamah chuan automatic-in a inkhâr ang</span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Academic Session / Year</label>
                <input
                  type="text"
                  value={onlineAdmissionConfig?.academicSession || '2026 - 2027'}
                  onChange={(e) => updateOnlineAdmissionConfig({ academicSession: e.target.value })}
                  placeholder="e.g. 2026 - 2027"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Session tarlan tur</span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Helpline Phone Number</label>
                <input
                  type="text"
                  value={onlineAdmissionConfig?.contactPhone || '+91 372 2322104'}
                  onChange={(e) => updateOnlineAdmissionConfig({ contactPhone: e.target.value })}
                  placeholder="+91 xxx xxx xxxx"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Zirlai nu/pa biak pawh theihna</span>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-slate-400 font-semibold mb-1">Public Portal Announcement / Banner Notice</label>
                <input
                  type="text"
                  value={onlineAdmissionConfig?.noticeMessage || 'Official Online Student Admission & Status Verification Portal • MBSE Affiliated'}
                  onChange={(e) => updateOnlineAdmissionConfig({ noticeMessage: e.target.value })}
                  placeholder="Banner announcement displayed on top of public form"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Section 2: Interactive Open Classes Selection */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>Classes Open for Public Online Application</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Tick the classes accepting new admissions. Unticked classes will be hidden from applicants.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const allNames = classes.map(c => c.name);
                      updateOnlineAdmissionConfig({ openClassNames: allNames });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOnlineAdmissionConfig({ openClassNames: [] })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of School Classes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {classes.map((cls) => {
                  const currentOpenList = onlineAdmissionConfig?.openClassNames || classes.map(c => c.name);
                  const isClassOpen = currentOpenList.includes(cls.name);

                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        let updated;
                        if (isClassOpen) {
                          updated = currentOpenList.filter(name => name !== cls.name);
                        } else {
                          updated = [...currentOpenList, cls.name];
                        }
                        updateOnlineAdmissionConfig({ openClassNames: updated });
                      }}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                        isClassOpen
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{cls.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Sec {cls.section || 'A'} • Rm {cls.roomNumber || '-'}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isClassOpen ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-700'
                      }`} />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Active Open Classes: <strong className="text-cyan-300 font-mono">{onlineAdmissionConfig?.openClassNames?.length ?? classes.length}</strong> of {classes.length} classes
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto-saved in Cloud
                </span>
              </div>
            </div>
          </div>

          {/* Section 2B: Offline Walk-In Counter Desk Policies */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  offlineAdmissionConfig?.isOpen !== false 
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Offline Walk-In Admission Desk Policies
                    </h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border ${
                      offlineAdmissionConfig?.isOpen !== false 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {offlineAdmissionConfig?.isOpen !== false ? '● Counter Open' : '○ Counter Closed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure walk-in counter operations, operating hours, designated officer, and closure advisories.
                  </p>
                </div>
              </div>

              {/* Master Switch Button */}
              <button
                type="button"
                onClick={() => {
                  const currentStatus = offlineAdmissionConfig?.isOpen !== false;
                  updateOfflineAdmissionConfig({ isOpen: !currentStatus });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer ${
                  offlineAdmissionConfig?.isOpen !== false
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                }`}
              >
                <span>{offlineAdmissionConfig?.isOpen !== false ? 'Pause / Close Offline Counter' : 'Open / Activate Offline Counter'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Counter Location Room / Block</label>
                <input
                  type="text"
                  value={offlineAdmissionConfig?.counterLocation || 'Administrative Block, Ground Floor Room 102'}
                  onChange={(e) => updateOfflineAdmissionConfig({ counterLocation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Counter Operating Hours</label>
                <input
                  type="text"
                  value={offlineAdmissionConfig?.counterHours || '09:30 AM - 02:30 PM (Monday to Friday)'}
                  onChange={(e) => updateOfflineAdmissionConfig({ counterHours: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Designated Desk In-Charge Officer</label>
                <input
                  type="text"
                  value={offlineAdmissionConfig?.contactPerson || 'Chief Admissions Clerk / Superintendent'}
                  onChange={(e) => updateOfflineAdmissionConfig({ contactPerson: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Closure Notice Message (When Counter is Paused)</label>
                <input
                  type="text"
                  value={offlineAdmissionConfig?.closedMessage || 'Offline & Walk-in Admissions are temporarily paused or closed by the Principal & Vice Principal.'}
                  onChange={(e) => updateOfflineAdmissionConfig({ closedMessage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Policy Checklist */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <span>Admission Document Requirements &amp; Policy Checklist</span>
              </h3>
              <p className="text-xs text-slate-400">
                Define the mandatory certificates and proof documents requested from online &amp; walk-in applicants.
              </p>
            </div>
            <button
              onClick={() => setShowAddReqModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document Requirement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admissionRequirements.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-['Outfit']">{req.title}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      req.mandatory ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {req.mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{req.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Formats: {req.allowedFormats}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateAdmissionRequirement(req.id, { mandatory: !req.mandatory });
                      }}
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      Toggle Mandatory
                    </button>
                    <button
                      onClick={() => deleteAdmissionRequirement(req.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: SEAT INTAKE CAPACITY & OLD STUDENT QUOTAS (SEAT AWMZAT & RESERVATION) */}
      {activeTab === 'seat_quotas' && (
        <div className="space-y-6">
          {/* Header & Notice Board Quick Action */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-['Outfit']">
                    Seat Intake Capacity &amp; Old Student Quotas (Seat Awmzat &amp; Reservation)
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {onlineAdmissionConfig?.defaultOldStudentQuotaPercent || 60}% Quota Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manage sanctioned class intake, reserve priority seats for continuing students, set fee concessions, and publish circulars directly to the School Notice Board.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePublishSeatNoticeToNoticeBoard}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-slate-950" />
                <span>Publish to Notice Board</span>
              </button>
            </div>
          </div>

          {/* KPI Stat Cards (Capacity, Reserved, Open, Enrolled, Vacant) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Total School Capacity
              </span>
              <span className="text-2xl font-bold text-white font-['Outfit'] block">{totalSchoolCapacity}</span>
              <span className="text-[10px] text-slate-500">Across {activeSeatQuotas.length} Classes</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Old Student Quota
              </span>
              <span className="text-2xl font-bold text-amber-300 font-['Outfit'] block">{totalOldReserved}</span>
              <span className="text-[10px] text-amber-500/80">
                {onlineAdmissionConfig?.defaultOldStudentQuotaPercent || 60}% Reserved Priority
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] text-cyan-400 font-semibold uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Fresh Open Intake
              </span>
              <span className="text-2xl font-bold text-cyan-300 font-['Outfit'] block">{totalFreshOpen}</span>
              <span className="text-[10px] text-cyan-500/80">Open Merit Competition</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confirmed Enrolled
              </span>
              <span className="text-2xl font-bold text-emerald-300 font-['Outfit'] block">
                {activeSeatQuotas.reduce((acc, q) => acc + getClassStats(q.classId, q).totalFilled, 0)}
              </span>
              <span className="text-[10px] text-emerald-500/80">Enrolled + Approved</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[11px] text-indigo-400 font-semibold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Remaining Vacancies
              </span>
              <span className="text-2xl font-bold text-indigo-300 font-['Outfit'] block">
                {activeSeatQuotas.reduce((acc, q) => acc + getClassStats(q.classId, q).remaining, 0)}
              </span>
              <span className="text-[10px] text-indigo-500/80">Available Across All Sections</span>
            </div>
          </div>

          {/* Global Institutional Quota & Reservation Policy Configuration Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Institutional Reservation &amp; Priority Enrolment Policy</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure default reservation rules, deadline for old student entitlement, and admission fee concessions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={onlineAdmissionConfig?.enableOldStudentReservation !== false}
                    onChange={(e) => updateOnlineAdmissionConfig({ enableOldStudentReservation: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Enable Old Student Priority Quota</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Default Old Student Quota %</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={bulkQuotaPercent}
                    onChange={(e) => setBulkQuotaPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleBulkApplyQuota}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold whitespace-nowrap transition cursor-pointer"
                    title="Calculate and apply this percentage quota across all classes"
                  >
                    Apply All
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Standard policy: 60% reserved for continuing students</span>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Old Student Priority Deadline</span>
                </label>
                <input
                  type="date"
                  value={onlineAdmissionConfig?.oldStudentPriorityEndDate || '2026-05-31'}
                  onChange={(e) => updateOnlineAdmissionConfig({ oldStudentPriorityEndDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Unclaimed quota seats convert to open merit after this date</span>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fee Concession / Discount %</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={onlineAdmissionConfig?.oldStudentFeeDiscountPercent !== undefined ? onlineAdmissionConfig.oldStudentFeeDiscountPercent : 20}
                    onChange={(e) => updateOnlineAdmissionConfig({ oldStudentFeeDiscountPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Concession on initial admission/enrolment fee</span>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Notice Board Broadcast</span>
                </label>
                <button
                  type="button"
                  onClick={handlePublishSeatNoticeToNoticeBoard}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Circular Now</span>
                </button>
                <span className="text-[10px] text-slate-500 mt-1 block">Pushes to In-App, WhatsApp, Web &amp; SMS</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">
                Institutional Policy Explanatory Note (Displayed to parents on Portal &amp; Notice Board)
              </label>
              <textarea
                rows={2}
                value={onlineAdmissionConfig?.oldStudentPolicyNote || '60% seat reservation and accelerated direct re-admission for existing/passed out students of this school. Unclaimed seats released to fresh applicants after priority deadline.'}
                onChange={(e) => updateOnlineAdmissionConfig({ oldStudentPolicyNote: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Class-by-Class Seat Matrix & Quota Allocation Table/Cards */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Class-Wise Intake Capacity &amp; Live Enrolment Matrix</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time seat occupancy comparing existing enrolled students, approved new admissions, and open vacancies.
                </p>
              </div>

              {/* Level Filter Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs self-start sm:self-auto overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'primary', label: 'Primary (Nursery - 5)' },
                  { id: 'middle', label: 'Middle (6 - 8)' },
                  { id: 'secondary', label: 'High School (9 - 10)' },
                  { id: 'higher_secondary', label: 'Higher Sec (11 - 12)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSeatFilterLevel(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                      seatFilterLevel === tab.id ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
              {activeSeatQuotas
                .filter(q => {
                  const name = q.className.toLowerCase();
                  if (seatFilterLevel === 'primary') return name.includes('nursery') || name.includes('kg') || name.includes('class 1') || name.includes('class 2') || name.includes('class 3') || name.includes('class 4') || name.includes('class 5');
                  if (seatFilterLevel === 'middle') return name.includes('class 6') || name.includes('class 7') || name.includes('class 8');
                  if (seatFilterLevel === 'secondary') return name.includes('class 9') || name.includes('class 10');
                  if (seatFilterLevel === 'higher_secondary') return name.includes('class 11') || name.includes('class 12');
                  return true;
                })
                .map((quota) => {
                  const stats = getClassStats(quota.classId, quota);
                  const isEditing = editingClassQuotaId === quota.classId;

                  return (
                    <div
                      key={quota.classId}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-bold text-white font-['Outfit']">{quota.className}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Min: {quota.minPercentage}% marks required
                            </span>
                          </div>

                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                            stats.remaining === 0
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : stats.remaining <= 10
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {stats.remaining === 0 ? 'Full' : stats.remaining <= 10 ? 'Filling Fast' : 'Seats Open'}
                          </span>
                        </div>

                        {/* Interactive Quota Breakdown or Edit Inputs */}
                        {isEditing ? (
                          <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2 text-xs">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 font-medium mb-0.5">Total Intake</label>
                                <input
                                  type="number"
                                  defaultValue={quota.totalSeats}
                                  id={`edit-tot-${quota.classId}`}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-amber-400 font-medium mb-0.5">Old Reserved</label>
                                <input
                                  type="number"
                                  defaultValue={quota.oldStudentReserved}
                                  id={`edit-old-${quota.classId}`}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-cyan-400 font-medium mb-0.5">Fresh Open</label>
                                <input
                                  type="number"
                                  defaultValue={quota.freshOpenSeats}
                                  id={`edit-fresh-${quota.classId}`}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingClassQuotaId(null)}
                                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const tot = document.getElementById(`edit-tot-${quota.classId}`)?.value;
                                  const oldR = document.getElementById(`edit-old-${quota.classId}`)?.value;
                                  const freshO = document.getElementById(`edit-fresh-${quota.classId}`)?.value;
                                  handleUpdateClassQuota(quota.classId, {
                                    totalSeats: Number(tot),
                                    oldStudentReserved: Number(oldR),
                                    freshOpenSeats: Number(freshO)
                                  });
                                }}
                                className="px-3 py-1 rounded bg-amber-500 text-slate-950 text-[11px] font-bold"
                              >
                                Save Quota
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                              <span className="text-sm font-bold text-white font-mono">{quota.totalSeats}</span>
                            </div>
                            <div className="border-x border-slate-800">
                              <span className="text-[10px] text-amber-400 block">Old Reserved</span>
                              <span className="text-sm font-bold text-amber-300 font-mono">{quota.oldStudentReserved}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-cyan-400 block">Fresh Open</span>
                              <span className="text-sm font-bold text-cyan-300 font-mono">{quota.freshOpenSeats}</span>
                            </div>
                          </div>
                        )}

                        {/* Live Enrollment Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">
                              Occupancy: <strong className="text-white">{stats.totalFilled}</strong> / {quota.totalSeats}
                            </span>
                            <span className="font-mono font-bold text-emerald-400">{stats.remaining} Vacant</span>
                          </div>

                          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                            <div
                              style={{ width: `${Math.min(100, Math.round((stats.enrolledCount / (quota.totalSeats || 1)) * 100))}%` }}
                              className="h-full bg-blue-500"
                              title={`Enrolled Students: ${stats.enrolledCount}`}
                            />
                            <div
                              style={{ width: `${Math.min(100, Math.round((stats.approvedCount / (quota.totalSeats || 1)) * 100))}%` }}
                              className="h-full bg-emerald-500"
                              title={`Approved Admissions: ${stats.approvedCount}`}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                              <span>Enrolled: {stats.enrolledCount}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              <span>New Approved: {stats.approvedCount}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                              <span>Pending: {stats.pendingCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Priority till: <strong className="text-slate-200">{quota.priorityDeadline || '31-May-2026'}</strong>
                        </span>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditingClassQuotaId(quota.classId)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Capacity</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* DEEP INSPECTION, CORRECTION & AUDIT MODAL */}
      {selectedAdmForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Candidate Dossier: {selectedAdmForReview.applicantName}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      {selectedAdmForReview.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Admission Council Document Audit, Data Correction &amp; Enrolment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdmForReview(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Top Quick Actions Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Application Mode:</span>
                  <span className="font-bold text-cyan-300 uppercase">
                    {selectedAdmForReview.entryType === 'offline_walkin' ? 'Walk-In Desk Registration' : 'Online Portal'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingDetails ? 'Cancel Edit' : 'Correct / Edit Details'}</span>
                  </button>
                  <button
                    onClick={() => setShowDocRequestModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Request Document / Query</span>
                  </button>
                </div>
              </div>

              {/* CANDIDATE DATA (EDIT MODE vs VIEW MODE) */}
              {isEditingDetails ? (
                <form onSubmit={handleSaveCorrectedDetails} className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Correction Mode: Edit Candidate Details
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Applicant Name</label>
                      <input
                        type="text"
                        value={editFormData.applicantName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, applicantName: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editFormData.dob || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Parent / Guardian</label>
                      <input
                        type="text"
                        value={editFormData.parentName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editFormData.contactPhone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Previous School</label>
                      <input
                        type="text"
                        value={editFormData.previousSchool || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, previousSchool: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Qualifying Score</label>
                      <input
                        type="text"
                        value={editFormData.marksPercentage || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, marksPercentage: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Corrections</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                    <span className="font-mono text-white font-bold">{selectedAdmForReview.dob}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                    <span className="font-bold text-rose-400">{selectedAdmForReview.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guardian Phone</span>
                    <span className="font-mono text-slate-200">{selectedAdmForReview.contactPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prior School</span>
                    <span className="text-slate-200 truncate block">{selectedAdmForReview.previousSchool}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Residential Address</span>
                    <span className="text-slate-300">{selectedAdmForReview.address || 'Aizawl, Mizoram'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Parent Occupation</span>
                    <span className="text-slate-300">{selectedAdmForReview.guardianOccupation || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* ATTACHED DOCUMENTS AUDIT & VERIFICATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    <span>Uploaded Documents Audit ({activeSelectedAdm.documents?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Click thumbnail or 'View' to inspect full size</span>
                </div>

                <div className="space-y-2.5">
                  {(activeSelectedAdm.documents || []).length === 0 ? (
                    <p className="text-slate-500 italic py-2">No documents attached yet.</p>
                  ) : (
                    activeSelectedAdm.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div 
                          className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => {
                            setPreviewingDoc({ doc, adm: activeSelectedAdm });
                            setPreviewZoom(1);
                            setPreviewRotation(0);
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative group/thumb shadow-sm">
                            {doc.url ? (
                              <img src={doc.url} alt={doc.title} className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300" />
                            ) : (
                              <div className="w-full h-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-cyan-600/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition backdrop-blur-[1px]">
                              <Eye className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white text-xs group-hover:text-cyan-300 transition truncate">
                                {doc.title}
                              </h5>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                doc.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                doc.status === 'resubmission_requested' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {doc.status}
                              </span>
                              {doc.category && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 capitalize">
                                  {doc.category}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {doc.fileName} • {doc.fileSize}
                            </span>
                          </div>
                        </div>

                        {/* Audit status controls */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingDoc({ doc, adm: activeSelectedAdm });
                              setPreviewZoom(1);
                              setPreviewRotation(0);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30"
                            title="Open interactive document viewer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAdmissionDocumentStatus(activeSelectedAdm.id, doc.id, 'verified')}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              doc.status === 'verified'
                                ? 'bg-emerald-500 text-slate-950 shadow'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAdmissionDocumentStatus(activeSelectedAdm.id, doc.id, 'resubmission_requested')}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              doc.status === 'resubmission_requested'
                                ? 'bg-amber-500 text-slate-950 shadow'
                                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Flag</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DOCUMENT REQUESTS & QUERIES LIST */}
              {(selectedAdmForReview.documentRequests || []).length > 0 && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                  <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Active Queries / Document Requests</span>
                  </h5>
                  {selectedAdmForReview.documentRequests.map(req => (
                    <div key={req.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{req.title}</span>
                        <span className="text-amber-400 uppercase text-[9px]">{req.status}</span>
                      </div>
                      <p className="text-slate-300">{req.message}</p>
                      <span className="text-[9px] text-slate-500 block">Requested by: {req.requestedBy}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AUDIT TIMELINE */}
              {(selectedAdmForReview.auditLogs || []).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <History className="w-3 h-3" />
                    <span>Audit Trail &amp; Committee Activity</span>
                  </span>
                  <div className="space-y-1">
                    {selectedAdmForReview.auditLogs.map((log, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>• {log.action} ({log.by})</span>
                        <span className="font-mono text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Decision Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Current Status:</span>
                <span className="font-bold text-white uppercase">{selectedAdmForReview.status}</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedAdmForReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedAdmForReview)}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedAdmForReview)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve &amp; Enroll Candidate</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedAdmForReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REQUEST COMPOSITION MODAL */}
      {showDocRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Request Document / Correction</span>
              </h4>
              <button onClick={() => setShowDocRequestModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendDocRequest} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Original Transfer Certificate (TC)"
                  value={docRequestForm.title}
                  onChange={(e) => setDocRequestForm({ ...docRequestForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Message / Instruction</label>
                <textarea
                  rows={3}
                  placeholder="Reason for request (e.g. signature blurred, council counter-signature required)..."
                  value={docRequestForm.message}
                  onChange={(e) => setDocRequestForm({ ...docRequestForm, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocRequestModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD REQUIREMENT POLICY MODAL */}
      {showAddReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm font-['Outfit']">Add Document Requirement Policy</h4>
              <button onClick={() => setShowAddReqModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration Certificate"
                  value={newRequirement.title}
                  onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={newRequirement.category}
                  onChange={(e) => setNewRequirement({ ...newRequirement, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="academic">Academic Certificate</option>
                  <option value="identity">Identity / Address Proof</option>
                  <option value="health">Medical / Immunization</option>
                  <option value="reservation">Tribal / Reservation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for applicants..."
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqMandatory"
                  checked={newRequirement.mandatory}
                  onChange={(e) => setNewRequirement({ ...newRequirement, mandatory: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400"
                />
                <label htmlFor="reqMandatory" className="text-slate-300 font-semibold cursor-pointer">
                  Mandatory (Applicant cannot submit without this)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReqModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL DOCUMENT VIEWER / INSPECTOR MODAL */}
      {previewingDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewingDoc(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:px-6 sm:py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-white font-['Outfit'] truncate">
                    {previewingDoc.doc.title}
                  </h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    (admissions.find(a => a.id === previewingDoc.adm.id)?.documents?.find(d => d.id === previewingDoc.doc.id)?.status || previewingDoc.doc.status) === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : (admissions.find(a => a.id === previewingDoc.adm.id)?.documents?.find(d => d.id === previewingDoc.doc.id)?.status || previewingDoc.doc.status) === 'resubmission_requested'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {admissions.find(a => a.id === previewingDoc.adm.id)?.documents?.find(d => d.id === previewingDoc.doc.id)?.status || previewingDoc.doc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  Applicant: <strong className="text-cyan-300">{previewingDoc.adm.applicantName}</strong> • {previewingDoc.doc.fileName || 'document_scan.jpg'} ({previewingDoc.doc.fileSize || 'Standard'})
                </p>
              </div>

              {/* Viewer Controls Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.max(0.4, Number((z - 0.25).toFixed(2))))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-mono text-cyan-300 min-w-[48px] text-center font-bold">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.min(3, Number((z + 0.25).toFixed(2))))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewRotation(r => (r + 90) % 360)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPreviewZoom(1); setPreviewRotation(0); }}
                    className="px-2 py-1 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition"
                    title="Reset Zoom & Rotation"
                  >
                    Reset
                  </button>
                </div>

                {previewingDoc.doc.url && (
                  <a
                    href={previewingDoc.doc.url}
                    target="_blank"
                    rel="noreferrer"
                    download={previewingDoc.doc.fileName || 'document_file'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                    title="Open in new tab / Download"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewingDoc(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 transition"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div className="relative flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex items-center justify-center min-h-[340px] max-h-[60vh] select-none">
              {/* Subtle background grid pattern */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              />

              {previewingDoc.doc.url ? (
                <div className="relative transition-transform duration-200 ease-out flex items-center justify-center">
                  <img
                    src={previewingDoc.doc.url}
                    alt={previewingDoc.doc.title}
                    style={{
                      transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                    className="max-w-full max-h-[52vh] object-contain rounded-xl shadow-2xl border border-slate-800/80 transition-transform duration-200"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3 max-w-md bg-slate-900/90 rounded-2xl border border-slate-800">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Preview not available</h4>
                  <p className="text-xs text-slate-400">
                    This file format cannot be rendered in direct preview. Please download or open it in a new window.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Footer Bar */}
            <div className="p-4 sm:px-6 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Upload date: <strong className="text-slate-200">{new Date(previewingDoc.doc.uploadedAt || Date.now()).toLocaleDateString('en-IN')}</strong></span>
                {previewingDoc.doc.category && (
                  <span>• Category: <strong className="capitalize text-slate-200">{previewingDoc.doc.category}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateAdmissionDocumentStatus(previewingDoc.adm.id, previewingDoc.doc.id, 'verified')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Verified &amp; Accepted</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdmissionDocumentStatus(previewingDoc.adm.id, previewingDoc.doc.id, 'resubmission_requested')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Flag for Resubmission</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
