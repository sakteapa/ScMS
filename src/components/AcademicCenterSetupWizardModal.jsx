import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Printer,
  Download,
  Save,
  Award,
  QrCode,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  BookOpen,
  HeartPulse,
  Shield,
  Bus,
  Bed,
  Utensils,
  Check,
  AlertCircle,
  X,
  Sliders,
  FileCheck,
  Info,
  CheckCheck
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function AcademicCenterSetupWizardModal({ isOpen, onClose, inlineMode = false }) {
  const {
    systemConfig,
    updateSystemConfig,
    sealConfig,
    updateSealConfig,
    paymentConfig,
    updatePaymentConfig,
    setActivePaymentGateway,
    updateGatewayDetails,
    configureSiblingDiscountPolicy,
    websiteConfig,
    updateWebsiteConfig,
    registerSchoolTenant
  } = useSchool();

  // Active step in the wizard: 1 to 7
  const [currentStep, setCurrentStep] = useState(1);
  const [showCharterModal, setShowCharterModal] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Form state pre-populated with current systemConfig, sealConfig, and paymentConfig
  const [formData, setFormData] = useState({
    // Step 1: Institutional Identity
    schoolName: systemConfig?.schoolName || 'OHA (One Heart Academy)',
    motto: systemConfig?.motto || 'Knowledge is Light (Hriatna chu Eng a ni)',
    schoolCode: 'OHA-LGL-02',
    affiliationBoard: 'MBSE (Mizoram Board of School Education)',
    affiliationNo: systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421',
    establishedYear: systemConfig?.establishedYear || '1998',
    institutionType: 'Co-Educational Higher Secondary Institution',
    address: systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701',
    locality: 'Lunglawn',
    district: 'Lunglei',
    state: 'Mizoram',
    pincode: '796701',
    contactPhone: systemConfig?.contactPhone || '+91 372 2322104 / +91 94361 40552',
    contactEmail: systemConfig?.contactEmail || 'oha.lunglawn@gmail.com',
    websiteUrl: 'https://oha-lunglawn.edu.in',
    principalName: sealConfig?.principalSignatoryName || 'Dr. F. Lalhmachhuana',
    principalTitle: sealConfig?.principalDesignation || 'Principal & Head of Institution',

    // Step 2: Academic Session & Structure
    academicSession: systemConfig?.academicSession || '2026 - 2027',
    termModel: '2_terms', // 'annual', '2_terms', 'trimester'
    levelsOffered: {
      prePrimary: true,
      primary: true,
      middle: true,
      highSchool: true,
      higherSecondary: true
    },
    streamsOffered: {
      science: true,
      arts: true,
      commerce: true
    },
    maxSectionIntake: 45,
    gradingScale: 'cbse_9point', // 'cbse_9point' | 'percentage' | 'gpa'
    minPassingPercentage: 40,
    continuousAssessmentWeight: 25,
    termExamWeight: 75,

    // Step 3: Bell Schedule & Timetable Matrix
    workingDays: 'monday_to_friday_plus_alt_sat',
    dailyAssemblyTime: '08:45 AM',
    classesStartTime: '09:00 AM',
    periodsPerDay: 7,
    periodDurationMins: 45,
    recessStartTime: '12:15 PM',
    recessDurationMins: 45,
    closingTime: '03:30 PM',
    enableCampusAudioBell: true,

    // Step 4: Fees & Payment Gateway
    monthlySchoolFee: 1800,
    enableOptionalTuition: false,
    tuitionFeeMonthly: 1200,
    admissionFee: 3500,
    examFeePerTerm: 800,
    computerLabFee: 600,
    enableSiblingDiscount: true,
    siblingDiscountPercent: 15,
    thirdSiblingDiscountPercent: 25,
    activePaymentGateway: paymentConfig?.activeGateway || 'direct_upi',
    upiId: paymentConfig?.gateways?.direct_upi?.upiId || 'ohalunglawn@oksbi',
    merchantName: paymentConfig?.gateways?.direct_upi?.merchantName || 'OHA Lunglawn, Lunglei',
    bankName: 'State Bank of India (SBI)',
    bankAccountNumber: paymentConfig?.gateways?.direct_upi?.accountNumber || '30291827461',
    bankIfsc: paymentConfig?.gateways?.direct_upi?.ifscCode || 'SBIN0001300',
    bankBranch: 'Lunglei Bazar Branch',

    // Step 5: Campus Modules
    enableTransportModule: systemConfig?.enableTransportModule ?? true,
    enableHostelModule: systemConfig?.enableHostelModule ?? true,
    enableClinicModule: true,
    enableVisitorModule: true,
    enableCanteenModule: true,
    enableLibraryModule: true,
    enableSmsNotifications: systemConfig?.enableSmsNotifications ?? true,
    enableOnlineAdmissions: systemConfig?.enableOnlineAdmissions ?? true,
    enableMobilePwa: true,

    // Step 6: Seal & Signatory
    schoolCrestText: sealConfig?.schoolCrestText || 'OHA • ONE HEART ACADEMY • LUNGLAWN, LUNGLEI',
    sealColor: sealConfig?.sealColor || '#d97706',
    sealMottoText: sealConfig?.mottoText || 'KNOWLEDGE IS LIGHT',
    sealType: sealConfig?.sealType || 'circular_crest',
    showSealOnTC: sealConfig?.showSealOnTC ?? true,
    showSealOnReportCard: sealConfig?.showSealOnReportCard ?? true,
    showSealOnCertificates: sealConfig?.showSealOnCertificates ?? true,
    signatureMode: sealConfig?.signatureMode || 'calligraphic',
    calligraphyStyle: sealConfig?.calligraphyStyle || 'cursive_formal'
  });

  // Load OHA Lunglawn preset directly
  const handleLoadOhaPreset = () => {
    setFormData({
      schoolName: 'OHA (One Heart Academy)',
      motto: 'Knowledge is Light (Hriatna chu Eng a ni)',
      schoolCode: 'OHA-LGL-02',
      affiliationBoard: 'MBSE (Mizoram Board of School Education)',
      affiliationNo: 'MBSE-HSS-LGL-0421',
      establishedYear: '1998',
      institutionType: 'Co-Educational Higher Secondary Institution',
      address: 'Lunglawn, Lunglei, Mizoram - 796701',
      locality: 'Lunglawn',
      district: 'Lunglei',
      state: 'Mizoram',
      pincode: '796701',
      contactPhone: '+91 372 2322104 / +91 94361 40552',
      contactEmail: 'oha.lunglawn@gmail.com',
      websiteUrl: 'https://oha-lunglawn.edu.in',
      principalName: 'Dr. F. Lalhmachhuana',
      principalTitle: 'Principal & Head of Institution',

      academicSession: '2026 - 2027',
      termModel: '2_terms',
      levelsOffered: {
        prePrimary: true,
        primary: true,
        middle: true,
        highSchool: true,
        higherSecondary: true
      },
      streamsOffered: {
        science: true,
        arts: true,
        commerce: true
      },
      maxSectionIntake: 45,
      gradingScale: 'cbse_9point',
      minPassingPercentage: 40,
      continuousAssessmentWeight: 25,
      termExamWeight: 75,

      workingDays: 'monday_to_friday_plus_alt_sat',
      dailyAssemblyTime: '08:45 AM',
      classesStartTime: '09:00 AM',
      periodsPerDay: 7,
      periodDurationMins: 45,
      recessStartTime: '12:15 PM',
      recessDurationMins: 45,
      closingTime: '03:30 PM',
      enableCampusAudioBell: true,

      monthlySchoolFee: 1800,
      enableOptionalTuition: false,
      tuitionFeeMonthly: 1200,
      admissionFee: 3500,
      examFeePerTerm: 800,
      computerLabFee: 600,
      enableSiblingDiscount: true,
      siblingDiscountPercent: 15,
      thirdSiblingDiscountPercent: 25,
      activePaymentGateway: 'direct_upi',
      upiId: 'ohalunglawn@oksbi',
      merchantName: 'OHA Lunglawn, Lunglei',
      bankName: 'State Bank of India (SBI)',
      bankAccountNumber: '30291827461',
      bankIfsc: 'SBIN0001300',
      bankBranch: 'Lunglei Bazar Branch',

      enableTransportModule: true,
      enableHostelModule: true,
      enableClinicModule: true,
      enableVisitorModule: true,
      enableCanteenModule: true,
      enableLibraryModule: true,
      enableSmsNotifications: true,
      enableOnlineAdmissions: true,
      enableMobilePwa: true,

      schoolCrestText: 'OHA • ONE HEART ACADEMY • LUNGLAWN, LUNGLEI',
      sealColor: '#d97706',
      sealMottoText: 'KNOWLEDGE IS LIGHT',
      sealType: 'circular_crest',
      showSealOnTC: true,
      showSealOnReportCard: true,
      showSealOnCertificates: true,
      signatureMode: 'calligraphic',
      calligraphyStyle: 'cursive_formal'
    });
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Final Action: Apply & Initialize Academic Center Charter into system context
  const handleApplyCharter = () => {
    // 1. Update system config
    updateSystemConfig({
      schoolName: formData.schoolName,
      motto: formData.motto,
      establishedYear: formData.establishedYear,
      affiliationNo: formData.affiliationNo,
      address: formData.address,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      academicSession: formData.academicSession,
      enableTransportModule: formData.enableTransportModule,
      enableHostelModule: formData.enableHostelModule,
      enableSmsNotifications: formData.enableSmsNotifications,
      enableOnlineAdmissions: formData.enableOnlineAdmissions
    });

    // 2. Update seal & signature config
    updateSealConfig({
      schoolCrestText: formData.schoolCrestText,
      affiliationNumber: `MBSE Affiliation No: ${formData.affiliationNo}`,
      mottoText: formData.sealMottoText,
      establishedYear: formData.establishedYear,
      sealColor: formData.sealColor,
      sealType: formData.sealType,
      principalSignatoryName: formData.principalName,
      principalDesignation: formData.principalTitle,
      showSealOnTC: formData.showSealOnTC,
      showSealOnReportCard: formData.showSealOnReportCard,
      showSealOnCertificates: formData.showSealOnCertificates,
      signatureMode: formData.signatureMode,
      calligraphyStyle: formData.calligraphyStyle
    });

    // 3. Update payment config
    updatePaymentConfig({
      activeGateway: formData.activePaymentGateway
    });
    if (updateGatewayDetails) {
      updateGatewayDetails('direct_upi', {
        upiId: formData.upiId,
        merchantName: formData.merchantName,
        accountNumber: formData.bankAccountNumber,
        ifscCode: formData.bankIfsc
      });
    }

    // 4. Update sibling discount policy
    if (configureSiblingDiscountPolicy) {
      configureSiblingDiscountPolicy({
        enabled: formData.enableSiblingDiscount,
        secondChildDiscount: Number(formData.siblingDiscountPercent),
        thirdChildDiscount: Number(formData.thirdSiblingDiscountPercent)
      });
    }

    // 5. Update website config
    if (updateWebsiteConfig) {
      updateWebsiteConfig({
        schoolName: formData.schoolName,
        motto: formData.motto,
        establishedYear: formData.establishedYear,
        affiliationBadge: `${formData.affiliationBoard} Affiliated Institution`
      });
    }

    // 6. Register as new school tenant in registry
    if (registerSchoolTenant) {
      registerSchoolTenant({
        name: formData.schoolName,
        shortName: formData.schoolName.length > 20 ? formData.schoolName.slice(0, 18) + '...' : formData.schoolName,
        motto: formData.motto,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        affiliationBadge: `${formData.affiliationBoard}`,
        establishedYear: Number(formData.establishedYear) || 2026
      });
    }

    // Show celebratory charter modal
    setShowCharterModal(true);
  };

  const stepsList = [
    { id: 1, title: 'Identity & Board', subtitle: 'Hming, Address, Affiliation', icon: Building2 },
    { id: 2, title: 'Academic Structure', subtitle: 'Session, Stream & Grading', icon: GraduationCap },
    { id: 3, title: 'Timetable & Bell', subtitle: 'Working Days, Periods', icon: Clock },
    { id: 4, title: 'Fees & Gateways', subtitle: 'Tuition, UPI, Bank Details', icon: DollarSign },
    { id: 5, title: 'Campus Modules', subtitle: 'Hostel, Transport, Clinic', icon: ShieldCheck },
    { id: 6, title: 'Official Seal', subtitle: 'Crest, Signature, Watermark', icon: Award },
    { id: 7, title: 'Review & Launch', subtitle: 'Charter Verification & Apply', icon: FileCheck }
  ];

  if (!isOpen && !inlineMode) return null;

  const content = (
    <div className="flex flex-col h-full max-h-[92vh] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* HEADER BAR */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Super Admin Master Wizard
              </span>
              <span className="text-xs text-slate-400">Step {currentStep} of 7</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Academic Center Setup Studio
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLoadOhaPreset}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Load OHA Lunglawn Master Preset"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load OHA Lunglawn Preset</span>
          </button>

          {!inlineMode && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/60'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>
                <div>
                  <div className="text-xs font-semibold whitespace-nowrap">{step.title}</div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{step.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear progress track */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* TOAST ALERT */}
      {saveSuccessToast && (
        <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>OHA (One Heart Academy), Lunglawn, Lunglei preset data loaded successfully!</span>
        </div>
      )}

      {/* BODY STEP CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* STEP 1: IDENTITY & AFFILIATION */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Step 1: Institutional Identity & Legal Affiliation
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Zirna in (School) hming dik tak, slogan, din kum, leh education board affiliation thlun zawmna tur dah luhna.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  School / Academy Full Name *
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="e.g. OHA (One Heart Academy)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Motto / Slogan *
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="e.g. Knowledge is Light (Hriatna chu Eng a ni)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Affiliation Board *
                </label>
                <select
                  value={formData.affiliationBoard}
                  onChange={(e) => setFormData({ ...formData, affiliationBoard: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MBSE (Mizoram Board of School Education)">MBSE (Mizoram Board of School Education)</option>
                  <option value="CBSE (Central Board of Secondary Education)">CBSE (Central Board of Secondary Education)</option>
                  <option value="CISCE (ICSE / ISC)">CISCE (ICSE / ISC)</option>
                  <option value="State Department of School Education">State Department of School Education</option>
                  <option value="Autonomous Private Trust">Autonomous Private Trust</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Affiliation / Recognition No. *
                </label>
                <input
                  type="text"
                  value={formData.affiliationNo}
                  onChange={(e) => setFormData({ ...formData, affiliationNo: e.target.value })}
                  placeholder="e.g. MBSE-HSS-LGL-0421"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Establishment Year (Din Kum) *
                </label>
                <input
                  type="text"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  placeholder="1998"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institution Category / Level
                </label>
                <input
                  type="text"
                  value={formData.institutionType}
                  onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                  placeholder="Co-Educational Higher Secondary Institution"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* CAMPUS ADDRESS & CONTACT */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Physical Campus Location & Helpline
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Campus Full Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Locality / Veng</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Official Contact Helpline</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* HEAD OF INSTITUTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Principal / Head of Institution Name *
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="Dr. F. Lalhmachhuana"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Principal Designation / Title
                </label>
                <input
                  type="text"
                  value={formData.principalTitle}
                  onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
                  placeholder="Principal & Head of Institution"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC SESSION, STRUCTURE & GRADING */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Step 2: Academic Session, Levels & Grading Framework
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Zir kum (Academic Session), classes awm zat, HSSLC stream (Science, Arts, Commerce) leh exam grading framework ruahmanna.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Academic Session *
                </label>
                <input
                  type="text"
                  value={formData.academicSession}
                  onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                  placeholder="2026 - 2027"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic Term Structure
                </label>
                <select
                  value={formData.termModel}
                  onChange={(e) => setFormData({ ...formData, termModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="2_terms">2 Terms (Mid-Term & Annual Final)</option>
                  <option value="annual">Single Annual System</option>
                  <option value="trimester">3 Trimesters</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Max Intake Capacity per Section
                </label>
                <input
                  type="number"
                  value={formData.maxSectionIntake}
                  onChange={(e) => setFormData({ ...formData, maxSectionIntake: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* LEVELS OFFERED CHECKBOXES */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                School Sections & Levels Active
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'prePrimary', label: 'Pre-Primary (Nursery, LKG, UKG)' },
                  { key: 'primary', label: 'Primary (Class 1 to 5)' },
                  { key: 'middle', label: 'Middle School (Class 6 to 8)' },
                  { key: 'highSchool', label: 'High School (Class 9 & 10)' },
                  { key: 'higherSecondary', label: 'Higher Secondary (Class 11 & 12)' }
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.levelsOffered[item.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levelsOffered: { ...formData.levelsOffered, [item.key]: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-medium text-slate-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* STREAMS OFFERED */}
            {formData.levelsOffered.higherSecondary && (
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Higher Secondary Streams (Class 11 & 12)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'science', label: 'Science Stream', desc: 'Physics, Chem, Math, Bio, CS' },
                    { key: 'arts', label: 'Arts & Humanities', desc: 'Pol Sci, History, Edu, Eco, Mizo' },
                    { key: 'commerce', label: 'Commerce Stream', desc: 'Accountancy, Business Studies, Eco' }
                  ].map((stream) => (
                    <label
                      key={stream.key}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition block"
                    >
                      <div className="flex items-center gap-2.5 mb-1">
                        <input
                          type="checkbox"
                          checked={formData.streamsOffered[stream.key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              streamsOffered: { ...formData.streamsOffered, [stream.key]: e.target.checked }
                            })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700"
                        />
                        <span className="text-xs font-bold text-white">{stream.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6.5">{stream.desc}</p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* GRADING SCALE & EVALUATION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Grading Framework
                </label>
                <select
                  value={formData.gradingScale}
                  onChange={(e) => setFormData({ ...formData, gradingScale: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="cbse_9point">CBSE 9-Point Scale (A1 to E2)</option>
                  <option value="percentage">Direct Marks & Percentage (0 - 100%)</option>
                  <option value="gpa">10-Point GPA Framework</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Minimum Pass Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.minPassingPercentage}
                  onChange={(e) => setFormData({ ...formData, minPassingPercentage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Continuous Assessment Ratio
                </label>
                <div className="flex items-center gap-2 text-xs text-slate-300 py-2">
                  <span className="font-mono text-amber-400">Class Tests: {formData.continuousAssessmentWeight}%</span>
                  <span>/</span>
                  <span className="font-mono text-cyan-400">Final: {formData.termExamWeight}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BELL SCHEDULE & TIMETABLE MATRIX */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Step 3: Daily Bell Schedule & Timetable Matrix
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Ni tin school tan hun, assembly hun chhung, period zat leh rei zawng, chawchhun (lunch break), leh ban hun ruahmanna.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Weekly Working Days
                </label>
                <select
                  value={formData.workingDays}
                  onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="monday_to_friday_plus_alt_sat">Monday to Friday + Alternate Saturdays (2nd & 4th)</option>
                  <option value="monday_to_friday">Monday to Friday (5-Day Week)</option>
                  <option value="monday_to_saturday">Monday to Saturday (6-Day Full Week)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Morning Assembly & Devotion Time *
                </label>
                <input
                  type="text"
                  value={formData.dailyAssemblyTime}
                  onChange={(e) => setFormData({ ...formData, dailyAssemblyTime: e.target.value })}
                  placeholder="08:45 AM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  1st Period Start Time *
                </label>
                <input
                  type="text"
                  value={formData.classesStartTime}
                  onChange={(e) => setFormData({ ...formData, classesStartTime: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Teaching Periods per Day *
                </label>
                <input
                  type="number"
                  value={formData.periodsPerDay}
                  onChange={(e) => setFormData({ ...formData, periodsPerDay: e.target.value })}
                  placeholder="7"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Period Duration (Minutes) *
                </label>
                <input
                  type="number"
                  value={formData.periodDurationMins}
                  onChange={(e) => setFormData({ ...formData, periodDurationMins: e.target.value })}
                  placeholder="45"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Recess / Lunch Break Start & Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.recessStartTime}
                    onChange={(e) => setFormData({ ...formData, recessStartTime: e.target.value })}
                    placeholder="12:15 PM"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="number"
                    value={formData.recessDurationMins}
                    onChange={(e) => setFormData({ ...formData, recessDurationMins: e.target.value })}
                    placeholder="45 mins"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  School Dismissal / Closing Time *
                </label>
                <input
                  type="text"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  placeholder="03:30 PM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer w-full hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={formData.enableCampusAudioBell}
                    onChange={(e) => setFormData({ ...formData, enableCampusAudioBell: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Campus Web Audio Bell System</div>
                    <div className="text-[11px] text-slate-400">Harmonic chimes for period transitions</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FEES & DIGITAL PAYMENT GATEWAYS */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Step 4: Fee Structure & Digital Payment Gateways
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Zirlai fee standard rate, unau in tanna (sibling discount), leh direct bank / UPI QR code payment dawn theihna ruahmanna.
              </p>
            </div>

            {/* FEE RATES */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Standard Institutional Fee Rates (INR ₹)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-emerald-400">Monthly School Fee *</label>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Mandatory</span>
                  </div>
                  <input
                    type="number"
                    value={formData.monthlySchoolFee}
                    onChange={(e) => setFormData({ ...formData, monthlySchoolFee: e.target.value })}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Zirlai zawng zawng tan</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Admission Fee</label>
                  <input
                    type="number"
                    value={formData.admissionFee}
                    onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Session thar atan</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Term Exam Fee</label>
                  <input
                    type="number"
                    value={formData.examFeePerTerm}
                    onChange={(e) => setFormData({ ...formData, examFeePerTerm: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Question & Marksheet</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Computer / Lab Fee</label>
                  <input
                    type="number"
                    value={formData.computerLabFee}
                    onChange={(e) => setFormData({ ...formData, computerLabFee: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Practical / Science Lab</span>
                </div>
              </div>

              {/* OPTIONAL EVENING TUITION / COACHING FEE */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Special Evening Tuition &amp; Coaching Fee</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                        Optional (Mi zawng zawng an kal lo)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Zirlai mi zawng zawng an kal lo a, a hran liau liau a ni. Extra evening coaching leh tuition kal duhte chauhva belh theih a ni ang.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableOptionalTuition}
                        onChange={(e) => setFormData({ ...formData, enableOptionalTuition: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {formData.enableOptionalTuition && (
                  <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Monthly Tuition Fee Amount (₹)</label>
                      <span className="text-[11px] text-slate-400">Tuition kal zirlaite chauh bill tur amount:</span>
                    </div>
                    <input
                      type="number"
                      value={formData.tuitionFeeMonthly}
                      onChange={(e) => setFormData({ ...formData, tuitionFeeMonthly: e.target.value })}
                      className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-bold text-right"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SIBLING CONCESSION POLICY */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" /> Unau In tanna (Sibling Discount Concession Policy)
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableSiblingDiscount}
                    onChange={(e) => setFormData({ ...formData, enableSiblingDiscount: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs text-slate-300 font-medium">Policy Enabled</span>
                </label>
              </div>

              {formData.enableSiblingDiscount && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      2nd Sibling Monthly Tuition Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.siblingDiscountPercent}
                      onChange={(e) => setFormData({ ...formData, siblingDiscountPercent: e.target.value })}
                      placeholder="15"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      3rd+ Sibling Monthly Tuition Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.thirdSiblingDiscountPercent}
                      onChange={(e) => setFormData({ ...formData, thirdSiblingDiscountPercent: e.target.value })}
                      placeholder="25"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT UPI & BANK ACCOUNT DETAILS */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Institutional Direct UPI & Bank Settlement Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Official UPI ID (VPA) *</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="ohalunglawn@oksbi"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Beneficiary Merchant Name</label>
                  <input
                    type="text"
                    value={formData.merchantName}
                    onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bank IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Branch Location</label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CAMPUS MODULES */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Step 5: Campus Infrastructure & Operational Modules
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                He academic center-a software module leh campus infrastructure hman tur thlanna.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {[
                {
                  key: 'enableTransportModule',
                  title: 'School Bus & Transport',
                  desc: 'Routes, stops, pickup alerts, driver roster',
                  icon: Bus,
                  color: 'text-amber-400'
                },
                {
                  key: 'enableHostelModule',
                  title: 'Residential Hostels',
                  desc: 'Rooms, beds, roll-call, night curfew passes',
                  icon: Bed,
                  color: 'text-indigo-400'
                },
                {
                  key: 'enableClinicModule',
                  title: 'Campus Health Clinic',
                  desc: 'First aid, vitals logging, emergency SOS',
                  icon: HeartPulse,
                  color: 'text-rose-400'
                },
                {
                  key: 'enableVisitorModule',
                  title: 'Security Gatehouse',
                  desc: 'Visitor badges, parent check-in, parking passes',
                  icon: Shield,
                  color: 'text-cyan-400'
                },
                {
                  key: 'enableCanteenModule',
                  title: 'Canteen & Cafeteria POS',
                  desc: 'Student meal cards, balance top-ups, snacks',
                  icon: Utensils,
                  color: 'text-emerald-400'
                },
                {
                  key: 'enableLibraryModule',
                  title: 'Digital Library Catalog',
                  desc: 'Book barcode checkout, return tracking',
                  icon: BookOpen,
                  color: 'text-purple-400'
                },
                {
                  key: 'enableSmsNotifications',
                  title: 'SMS & WhatsApp Gateway',
                  desc: 'Instant absence alerts, circular broadcast',
                  icon: Phone,
                  color: 'text-blue-400'
                },
                {
                  key: 'enableOnlineAdmissions',
                  title: 'Online Public Admission',
                  desc: 'Student application form, document upload',
                  icon: Globe,
                  color: 'text-teal-400'
                },
                {
                  key: 'enableMobilePwa',
                  title: 'Parent/Student Mobile App',
                  desc: 'One-click PWA installer with offline support',
                  icon: Award,
                  color: 'text-pink-400'
                }
              ].map((mod) => {
                const Icon = mod.icon;
                const isEnabled = formData[mod.key];
                return (
                  <div
                    key={mod.key}
                    onClick={() => setFormData({ ...formData, [mod.key]: !isEnabled })}
                    className={`p-4 rounded-2xl border cursor-pointer transition select-none flex flex-col justify-between ${
                      isEnabled
                        ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-900/30 border-slate-800/80 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl bg-slate-800/80 ${mod.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-white">{mod.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{mod.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Status</span>
                      <span className={`font-semibold ${isEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isEnabled ? 'Active & Ready' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: OFFICIAL SEALS & PRINCIPAL SIGNATURE */}
        {currentStep === 6 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Step 6: Official Seals, Digital Stamps & Signatory
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Marksheet, Certificate, leh Fee Receipt-a official seal chhut lanna tur leh Principal signature ruahmanna.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FORM FIELDS */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Official Outer Circular Rim Text *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolCrestText}
                    onChange={(e) => setFormData({ ...formData, schoolCrestText: e.target.value })}
                    placeholder="OHA • ONE HEART ACADEMY • LUNGLAWN, LUNGLEI"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Center Emblem / Motto Text
                  </label>
                  <input
                    type="text"
                    value={formData.sealMottoText}
                    onChange={(e) => setFormData({ ...formData, sealMottoText: e.target.value })}
                    placeholder="KNOWLEDGE IS LIGHT"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Official Seal Ink Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.sealColor}
                        onChange={(e) => setFormData({ ...formData, sealColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.sealColor}
                        onChange={(e) => setFormData({ ...formData, sealColor: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Signature Style
                    </label>
                    <select
                      value={formData.calligraphyStyle}
                      onChange={(e) => setFormData({ ...formData, calligraphyStyle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="cursive_formal">Formal Royal Cursive</option>
                      <option value="modern_pen">Modern Ballpoint</option>
                      <option value="classic_quill">Classic Fountain Pen</option>
                    </select>
                  </div>
                </div>

                {/* VISIBILITY TOGGLES */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Stamp Placement
                  </span>
                  {[
                    { key: 'showSealOnTC', label: 'Transfer Certificates (TC)' },
                    { key: 'showSealOnReportCard', label: 'Progress Reports & Marksheets' },
                    { key: 'showSealOnCertificates', label: 'Character & Merit Certificates' }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData[item.key]}
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LIVE DIGITAL SEAL PREVIEW */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-4">
                  Live Official Digital Seal Preview
                </span>

                <div
                  className="w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center p-3 relative shadow-inner select-none transition-all duration-300"
                  style={{ borderColor: formData.sealColor, color: formData.sealColor }}
                >
                  <div
                    className="w-40 h-40 rounded-full border border-dashed flex flex-col items-center justify-center p-2 text-center"
                    style={{ borderColor: formData.sealColor }}
                  >
                    <GraduationCap className="w-8 h-8 mb-1" />
                    <span className="text-[9px] font-extrabold tracking-widest uppercase">
                      {formData.sealMottoText}
                    </span>
                    <span className="text-[11px] font-black mt-1">ESTD. {formData.establishedYear}</span>
                    <span className="text-[8px] font-semibold mt-0.5">LUNGLAWN, LUNGLEI</span>
                  </div>
                </div>

                {/* SIGNATURE SPECIMEN */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 w-full flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                    Specimen Principal Signature
                  </span>
                  <div
                    className="text-xl italic font-serif tracking-wide py-1"
                    style={{ color: formData.sealColor }}
                  >
                    {formData.principalName}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">{formData.principalTitle}</div>
                  <div className="text-[10px] text-slate-400">{formData.schoolName}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW BLUEPRINT & ONE-CLICK INITIALIZATION */}
        {currentStep === 7 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* SCORECARD BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      100% Ready for Initialization
                    </span>
                    <span className="text-xs text-slate-400">Academic Session {formData.academicSession}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {formData.schoolName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {formData.address} • Affiliation: {formData.affiliationNo}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyCharter}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 shrink-0"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Initialize & Apply Charter</span>
              </button>
            </div>

            {/* AUDIT SUMMARY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Identity & Affiliation */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" /> Identity & Affiliation
                  </h4>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-indigo-400 hover:underline">
                    Edit
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">School Name:</span> <span className="font-semibold text-white">{formData.schoolName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Affiliation:</span> <span className="text-slate-200">{formData.affiliationBoard}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Board Reg No:</span> <span className="font-mono text-amber-300">{formData.affiliationNo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Principal:</span> <span className="text-slate-200">{formData.principalName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Helpline:</span> <span className="text-slate-200">{formData.contactPhone}</span></div>
                </div>
              </div>

              {/* Card 2: Academic & Bell Schedule */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" /> Academic & Timetable
                  </h4>
                  <button onClick={() => setCurrentStep(2)} className="text-xs text-indigo-400 hover:underline">
                    Edit
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Session:</span> <span className="font-bold text-white">{formData.academicSession}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Assembly Time:</span> <span className="text-slate-200">{formData.dailyAssemblyTime}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Daily Periods:</span> <span className="text-slate-200">{formData.periodsPerDay} periods ({formData.periodDurationMins}m each)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Lunch Break:</span> <span className="text-slate-200">{formData.recessStartTime} ({formData.recessDurationMins} mins)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Grading Scale:</span> <span className="text-emerald-400">CBSE 9-Point (A1 to E2)</span></div>
                </div>
              </div>

              {/* Card 3: Fees & Payment Gateway */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Financials & UPI Settlement
                  </h4>
                  <button onClick={() => setCurrentStep(4)} className="text-xs text-indigo-400 hover:underline">
                    Edit
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Monthly School Fee:</span> <span className="font-bold text-emerald-400">₹{formData.monthlySchoolFee} (Mandatory)</span></div>
                  {formData.enableOptionalTuition && (
                    <div className="flex justify-between"><span className="text-slate-400">Evening Tuition:</span> <span className="text-indigo-300 font-semibold">₹{formData.tuitionFeeMonthly} (Optional)</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-400">Sibling Discount:</span> <span className="text-slate-200">2nd ({formData.siblingDiscountPercent}%) • 3rd+ ({formData.thirdSiblingDiscountPercent}%)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Active Gateway:</span> <span className="uppercase text-indigo-300 font-semibold">{formData.activePaymentGateway}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Official UPI ID:</span> <span className="font-mono text-cyan-300">{formData.upiId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Settlement Bank:</span> <span className="text-slate-200">{formData.bankName}</span></div>
                </div>
              </div>

              {/* Card 4: Active Modules & Seal */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Modules & Official Seal
                  </h4>
                  <button onClick={() => setCurrentStep(5)} className="text-xs text-indigo-400 hover:underline">
                    Edit
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Active Campus Modules:</span> <span className="text-emerald-400 font-semibold">9 Active</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Seal Rim Text:</span> <span className="font-mono text-slate-200 truncate max-w-[200px]">{formData.schoolCrestText}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Seal Color:</span> <span className="font-mono flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.sealColor }} /> {formData.sealColor}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Signatory Title:</span> <span className="text-slate-200">{formData.principalTitle}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CONTROLS */}
      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            currentStep === 1
              ? 'text-slate-600 bg-slate-900 cursor-not-allowed border border-slate-800'
              : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="text-xs text-slate-400">
          Step <span className="text-white font-bold">{currentStep}</span> of <span className="text-white font-bold">7</span>
        </div>

        {currentStep < 7 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApplyCharter}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Apply & Initialize Charter</span>
          </button>
        )}
      </div>

      {/* CHARTER SUCCESS & PRINT CERTIFICATE MODAL */}
      {showCharterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 text-center relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => {
                setShowCharterModal(false);
                if (onClose) onClose();
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-1 mx-auto mb-4 shadow-xl shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-2">
              Official Charter Initialized Successfully
            </span>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              {formData.schoolName}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Academic Center Setup fel takin a zo ta! Configuration zawng zawng hi system database, live portal, payment QR, leh official seals-ah update vek a ni tawh e.
            </p>

            {/* CHARTER SPECIMEN CARD */}
            <div className="my-6 p-5 rounded-2xl bg-slate-950 border border-amber-500/30 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Affiliation & Board:</span>
                <span className="font-semibold text-white">{formData.affiliationNo} ({formData.affiliationBoard})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Campus Location:</span>
                <span className="font-semibold text-white">{formData.address}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Academic Session:</span>
                <span className="font-bold text-amber-400">{formData.academicSession}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Principal Signatory:</span>
                <span className="font-semibold text-white">{formData.principalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official UPI ID:</span>
                <span className="font-mono text-cyan-400">{formData.upiId}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
              >
                <Printer className="w-4 h-4 text-purple-400" />
                <span>Print Official Charter Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCharterModal(false);
                  if (onClose) onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                Done & Return to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (inlineMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {content}
      </div>
    </div>
  );
}
