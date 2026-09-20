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
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import AdmissionDocumentUploader from '../components/AdmissionDocumentUploader';

export default function AdmissionsView({ setCurrentTab }) {
  const { 
    admissions, 
    classes, 
    admissionRequirements = [], 
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
    remarks: ''
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
    instantEnroll: false
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
              onClick={() => setActiveTab('requirements_setup')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requirements_setup' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Doc Policy Setup</span>
            </button>
          )}
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
                  </div>
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
              {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}
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

      {/* VIEW 4: ADMISSION REQUIREMENTS & POLICY SETUP (MANAGEMENT) */}
      {activeTab === 'requirements_setup' && (
        <div className="space-y-5 max-w-4xl mx-auto">
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
