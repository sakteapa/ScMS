import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_FEES,
  INITIAL_ATTENDANCE,
  INITIAL_STAFF,
  INITIAL_PAYROLL,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_NOTICES,
  INITIAL_ADMISSIONS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_HOSTEL_ROOMS,
  INITIAL_HOSTEL_GATE_PASSES,
  INITIAL_HOSTEL_ROLL_CALLS,
  INITIAL_HOSTEL_MESS_MENU,
  INITIAL_HOSTEL_RULES,
  INITIAL_TIMETABLES,
  INITIAL_EXAM_ROUTINES,
  INITIAL_LIVE_SESSION_REQUESTS,
  INITIAL_ACADEMIC_EVENTS,
  INITIAL_SYSTEM_PLUGINS,
  INITIAL_CUSTOM_SCRIPTS,
  INITIAL_SYSTEM_CONFIG,
  INITIAL_ONLINE_ADMISSION_CONFIG,
  INITIAL_PAYMENT_CONFIG,
  INITIAL_ADMISSION_REQUIREMENTS,
  INITIAL_ISSUED_CERTIFICATES,
  INITIAL_REPORT_CARD_WITHHOLDS,
  INITIAL_LEAVE_APPLICATIONS,
  INITIAL_PAY_SCALES,
  INITIAL_TASKS,
  INITIAL_VACATIONS,
  INITIAL_LIVE_MEDIA_CONFIG,
  INITIAL_CLINIC_CONFIG,
  INITIAL_CLINIC_RECORDS,
  INITIAL_VISITOR_CONFIG,
  INITIAL_VISITORS,
  INITIAL_INVENTORY_CONFIG,
  INITIAL_INVENTORY_ASSETS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_PTM_CONFIG,
  INITIAL_PTM_EVENTS,
  INITIAL_ALUMNI_CONFIG,
  INITIAL_ALUMNI,
  INITIAL_TRANSCRIPT_REQUESTS,
  INITIAL_CANTEEN_CONFIG,
  INITIAL_CANTEEN_MENU,
  INITIAL_CANTEEN_WALLETS,
  INITIAL_CANTEEN_TRANSACTIONS,
  INITIAL_STUDY_CONFIG,
  INITIAL_STUDY_MATERIALS,
  INITIAL_SEAL_CONFIG,
  INITIAL_WEBSITE_CONFIG,
  INITIAL_DISCIPLINARY_RECORDS,
  MIZORAM_GAZETTED_HOLIDAYS_2026,
  INITIAL_SUBJECTS,
  INITIAL_GRADING_SCALES,
  INITIAL_FEE_HEADS,
  INITIAL_DOCUMENT_TEMPLATES,
  INITIAL_NOMENCLATURE,
  INITIAL_ACADEMIC_SESSIONS,
  INITIAL_OFFLINE_ADMISSION_CONFIG
} from '../data/mockData';
import {
  GHHSS_SCHOOL_INFO,
  GHHSS_CLASSES,
  GHHSS_STUDENTS,
  GHHSS_STAFF,
  GHHSS_SYSTEM_CONFIG,
  GHHSS_WEBSITE_CONFIG
} from '../data/ghhssData';
import { TRANSLATIONS } from '../data/translations';
import { db, collection, getDocs, setDoc, addDoc, doc, query, orderBy, onSnapshot, isOfflinePersistenceActive, isLiveFirebaseConfigured } from '../services/firebase';
import {
  getActiveSchoolId,
  getActiveSchoolInfo,
  getRegisteredSchools,
  registerNewSchool,
  switchActiveSchool,
  updateDynamicPwaBranding
} from '../services/tenantService';

const SchoolContext = createContext(null);

export function SchoolProvider({ children }) {
  // Multi-Tenant School Identification & Registry
  const [activeSchoolId, setActiveSchoolId] = useState(() => getActiveSchoolId());
  const [activeSchoolInfo, setActiveSchoolInfo] = useState(() => getActiveSchoolInfo());
  const [registeredSchools, setRegisteredSchools] = useState(() => getRegisteredSchools());

  // Authentication Context & Showcase Mode Guard
  const auth = useAuth();
  const isSuperAdmin = auth?.currentUser?.role === 'superadmin';
  const isShowcaseMode = Boolean(auth?.currentUser && !isSuperAdmin);
  const [showcaseNotice, setShowcaseNotice] = useState(null);

  const triggerShowcaseNotice = (action = 'Action') => {
    setShowcaseNotice({
      action,
      timestamp: Date.now(),
      message: `${action} is protected in Showcase Demo Mode. Please sign in as Super Admin (Samuel Lalrinfela) to apply permanent live changes.`
    });
    setTimeout(() => {
      setShowcaseNotice(null);
    }, 4500);
  };

  // Safe Tenant Item Persistence (guarded for Showcase Mode)
  const persistTenantItem = (key, data) => {
    if (isShowcaseMode) {
      return; // Safe guard: Never overwrite live database in demo showcase
    }
    try {
      const val = JSON.stringify(data);
      localStorage.setItem(`zoxs_${activeSchoolId}_${key}`, val);
      if (activeSchoolId === 'oha' || activeSchoolId === 'default') {
        localStorage.setItem(`zoxs_${key}`, val);
      }
    } catch (e) {}
  };
  const saveTenantItem = persistTenantItem;

  // Dynamic PWA and document title updating based on active school
  useEffect(() => {
    updateDynamicPwaBranding(activeSchoolInfo);
  }, [activeSchoolInfo]);

  // Persistence key helpers with multi-tenant partitioning
  const loadInitial = (key, fallback) => {
    try {
      // 1. Try school-partitioned key: zoxs_<schoolId>_<key>
      const tenantKey = `zoxs_${activeSchoolId}_${key}`;
      let saved = localStorage.getItem(tenantKey);

      // 2. Backward compatibility migration for default master school ('oha')
      if (!saved && (activeSchoolId === 'oha' || activeSchoolId === 'default')) {
        const legacy = localStorage.getItem(`zoxs_${key}`);
        if (legacy) {
          saved = legacy;
          localStorage.setItem(tenantKey, legacy);
        }
      }

      // 3. Seed dedicated Govt. Hnahthial Higher Secondary School (GHHSS) data
      if (!saved && activeSchoolId === 'ghhss') {
        if (key === 'students') {
          localStorage.setItem(tenantKey, JSON.stringify(GHHSS_STUDENTS));
          return GHHSS_STUDENTS;
        }
        if (key === 'classes') {
          localStorage.setItem(tenantKey, JSON.stringify(GHHSS_CLASSES));
          return GHHSS_CLASSES;
        }
        if (key === 'staff') {
          localStorage.setItem(tenantKey, JSON.stringify(GHHSS_STAFF));
          return GHHSS_STAFF;
        }
        if (key === 'system_config') {
          localStorage.setItem(tenantKey, JSON.stringify(GHHSS_SYSTEM_CONFIG));
          return GHHSS_SYSTEM_CONFIG;
        }
        if (key === 'website_config') {
          localStorage.setItem(tenantKey, JSON.stringify(GHHSS_WEBSITE_CONFIG));
          return GHHSS_WEBSITE_CONFIG;
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        // Seamlessly migrate legacy generic school mock data to the active school name
        const activeSchoolName = activeSchoolInfo?.name || fallback?.schoolName;
        if (key === 'system_config' && activeSchoolName && (parsed?.schoolName?.includes('Mizoram Higher Secondary') || parsed?.schoolName?.includes('Aizawl Model'))) {
          const updated = { ...parsed, schoolName: activeSchoolName, address: activeSchoolInfo?.address || fallback.address, contactPhone: activeSchoolInfo?.contactPhone || fallback.contactPhone, contactEmail: activeSchoolInfo?.contactEmail || fallback.contactEmail, motto: activeSchoolInfo?.motto || fallback.motto };
          localStorage.setItem(`zoxs_${activeSchoolId}_system_config`, JSON.stringify(updated));
          return updated;
        }
        if (key === 'website_config' && activeSchoolName && (parsed?.schoolName?.includes('Mizoram Higher Secondary') || parsed?.schoolName?.includes('Aizawl Model'))) {
          const updated = { 
            ...parsed, 
            schoolName: activeSchoolName, 
            tagline: activeSchoolInfo?.affiliationBadge || fallback.tagline, 
            motto: activeSchoolInfo?.motto || fallback.motto, 
            contact: fallback.contact, 
            hero: { ...parsed.hero, headline: `Welcome to ${activeSchoolName}`, subheadline: `${activeSchoolInfo?.affiliationBadge || 'MBSE Affiliated'} \u2014 ${activeSchoolInfo?.address || fallback.contact?.address || ''}` }, 
            principalMessage: fallback.principalMessage 
          };
          localStorage.setItem(`zoxs_${activeSchoolId}_website_config`, JSON.stringify(updated));
          return updated;
        }
        if (key === 'system_config' && (parsed?.schoolName?.includes('Oxford') || parsed?.schoolName?.includes('MIZORAM HIGHER SECONDARY'))) {
          const updated = { ...parsed, schoolName: activeSchoolName || 'OHA (One Heart Academy)' };
          localStorage.setItem(`zoxs_${activeSchoolId}_system_config`, JSON.stringify(updated));
          return updated;
        }
        if (key === 'website_config' && (parsed?.schoolName?.includes('Oxford') || parsed?.principalMessage?.fullMessage?.includes('Oxford'))) {
          const updated = {
            ...parsed,
            schoolName: activeSchoolName || 'OHA (One Heart Academy)',
            principalMessage: {
              ...(parsed.principalMessage || {}),
              fullMessage: fallback.principalMessage?.fullMessage || `Welcome to ${activeSchoolName}'s official digital portal.`
            }
          };
          localStorage.setItem(`zoxs_${activeSchoolId}_website_config`, JSON.stringify(updated));
          return updated;
        }
        if (key === 'seal_config' && (parsed?.schoolCrestText?.includes('OXFORD') || parsed?.schoolCrestText?.includes('MIZORAM HIGHER SECONDARY'))) {
          const updated = { ...parsed, schoolCrestText: (activeSchoolInfo?.shortName || activeSchoolInfo?.name || 'OHA').toUpperCase() + ' \u2022 ' + (activeSchoolInfo?.address || 'LUNGLAWN, LUNGLEI').toUpperCase(), principalSignatoryName: fallback.principalSignatoryName, mottoText: fallback.mottoText };
          localStorage.setItem(`zoxs_${activeSchoolId}_seal_config`, JSON.stringify(updated));
          return updated;
        }
        const isCleanSlate = localStorage.getItem(`zoxs_${activeSchoolId}_clean_slate`) === 'true';
        if (!isCleanSlate && Array.isArray(parsed) && Array.isArray(fallback)) {
          const parsedIds = new Set(parsed.map(i => i.id).filter(Boolean));
          const missing = fallback.filter(item => item.id && !parsedIds.has(item.id));
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
        }
        return parsed;
      } else if (localStorage.getItem(`zoxs_${activeSchoolId}_clean_slate`) === 'true' && Array.isArray(fallback)) {
        // When clean slate is active for this school and no saved array exists, return empty array (zero mock data)
        return [];
      }
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
    }
    return fallback;
  };

  /**
   * Generates a school-specific website config from activeSchoolInfo.
   * Used as the default for any school that has no saved website_config.
   */
  const buildSchoolWebsiteDefault = (baseConfig) => {
    const info = activeSchoolInfo || {};
    if (!info.name || info.id === 'oha') {
      // For OHA or unknown schools, return the base config as-is
      return baseConfig;
    }
    return {
      ...baseConfig,
      schoolName: info.name,
      tagline: info.affiliationBadge || 'MBSE Affiliated',
      motto: info.motto || 'Excellence in Education',
      affiliationBadge: info.affiliationBadge || 'MBSE Affiliated',
      contact: {
        ...(baseConfig.contact || {}),
        address: info.address || '',
        phone: info.contactPhone || '',
        email: info.contactEmail || '',
        officeHours: 'Monday - Friday: 8:30 AM - 4:00 PM'
      },
      hero: {
        ...(baseConfig.hero || {}),
        headline: `Welcome to ${info.name}`,
        subheadline: `${info.affiliationBadge || 'MBSE Affiliated'} \u2014 ${info.address || 'Mizoram, India'}. Providing holistic education with dedicated faculty and vibrant campus life.`,
        badge: `\uD83C\uDF93 Admissions Open for Academic Session ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
        ctaPrimaryText: 'Apply for Admission Online',
        ctaSecondaryText: 'Explore Campus & Facilities',
      },
      principalMessage: {
        ...(baseConfig.principalMessage || {}),
        designation: `Principal, ${info.name}`,
        principalDesignation: `Principal, ${info.name}`,
        fullMessage: `Welcome to ${info.name}'s official digital management portal. We are committed to academic excellence, moral integrity, and holistic student development. We warmly invite every student and parent to explore our campus.`
      },
      announcementBanner: {
        ...(baseConfig.announcementBanner || {}),
        enabled: true,
        text: `\uD83C\uDF89 Online Admissions for Academic Session ${new Date().getFullYear()} - ${new Date().getFullYear() + 1} are officially open at ${info.name}! Limited seats available. Apply online before June 30.`
      }
    };
  };

  const [classes, setClasses] = useState(() => loadInitial('classes', INITIAL_CLASSES));
  const [students, setStudents] = useState(() => loadInitial('students', INITIAL_STUDENTS));
  const [grades, setGrades] = useState(() => loadInitial('grades', INITIAL_GRADES));
  const [fees, setFees] = useState(() => loadInitial('fees', INITIAL_FEES));
  const [attendance, setAttendance] = useState(() => loadInitial('attendance', INITIAL_ATTENDANCE));
  const [staff, setStaff] = useState(() => loadInitial('staff', INITIAL_STAFF));
  const [payroll, setPayroll] = useState(() => loadInitial('payroll', INITIAL_PAYROLL));
  const [libraryBooks, setLibraryBooks] = useState(() => loadInitial('library_books', INITIAL_LIBRARY_BOOKS));
  const [notices, setNotices] = useState(() => loadInitial('notices', INITIAL_NOTICES));
  const [admissions, setAdmissions] = useState(() => loadInitial('admissions', INITIAL_ADMISSIONS));
  const [transportRoutes, setTransportRoutes] = useState(() => loadInitial('transport_routes', INITIAL_TRANSPORT_ROUTES));
  const [hostelRooms, setHostelRooms] = useState(() => loadInitial('hostel_rooms', INITIAL_HOSTEL_ROOMS));
  const [timetables, setTimetables] = useState(() => loadInitial('timetables', INITIAL_TIMETABLES));
  const [examRoutines, setExamRoutines] = useState(() => loadInitial('exam_routines', INITIAL_EXAM_ROUTINES));
  const [liveSessionRequests, setLiveSessionRequests] = useState(() => loadInitial('live_session_requests', INITIAL_LIVE_SESSION_REQUESTS));

  // Comprehensive Residential Hostel Suite States
  const [hostelGatePasses, setHostelGatePasses] = useState(() => loadInitial('hostel_gate_passes', INITIAL_HOSTEL_GATE_PASSES));
  const [hostelRollCalls, setHostelRollCalls] = useState(() => loadInitial('hostel_roll_calls', INITIAL_HOSTEL_ROLL_CALLS));
  const [hostelMessMenu, setHostelMessMenu] = useState(() => loadInitial('hostel_mess_menu', INITIAL_HOSTEL_MESS_MENU));
  const [hostelRules, setHostelRules] = useState(() => loadInitial('hostel_rules', INITIAL_HOSTEL_RULES));

  // Mizoram Academic Calendar & School Events State
  const [academicEvents, setAcademicEvents] = useState(() => loadInitial('academic_events', INITIAL_ACADEMIC_EVENTS));

  // In-App Developer Studio & Customization States
  const [customScripts, setCustomScripts] = useState(() => loadInitial('custom_scripts', INITIAL_CUSTOM_SCRIPTS));
  const [plugins, setPlugins] = useState(() => loadInitial('system_plugins', INITIAL_SYSTEM_PLUGINS));
  const [systemConfig, setSystemConfig] = useState(() => loadInitial('system_config', INITIAL_SYSTEM_CONFIG));
  const [paymentConfig, setPaymentConfig] = useState(() => loadInitial('payment_config', INITIAL_PAYMENT_CONFIG));
  const [onlineAdmissionConfig, setOnlineAdmissionConfig] = useState(() => loadInitial('online_admission_config', INITIAL_ONLINE_ADMISSION_CONFIG));
  const [offlineAdmissionConfig, setOfflineAdmissionConfig] = useState(() => loadInitial('offline_admission_config', INITIAL_OFFLINE_ADMISSION_CONFIG));
  const [academicSessions, setAcademicSessions] = useState(() => loadInitial('academic_sessions', INITIAL_ACADEMIC_SESSIONS));
  const [admissionRequirements, setAdmissionRequirements] = useState(() => loadInitial('admission_requirements', INITIAL_ADMISSION_REQUIREMENTS));
  const [issuedCertificates, setIssuedCertificates] = useState(() => loadInitial('issued_certificates', INITIAL_ISSUED_CERTIFICATES));
  const [reportCardWithholds, setReportCardWithholds] = useState(() => loadInitial('report_card_withholds', INITIAL_REPORT_CARD_WITHHOLDS));
  const [leaveApplications, setLeaveApplications] = useState(() => loadInitial('leave_applications', INITIAL_LEAVE_APPLICATIONS));
  const [payScales, setPayScales] = useState(() => loadInitial('pay_scales', INITIAL_PAY_SCALES));
  const [tasks, setTasks] = useState(() => loadInitial('institutional_tasks', INITIAL_TASKS));
  const [vacations, setVacations] = useState(() => loadInitial('vacations', INITIAL_VACATIONS));
  const [liveMediaConfig, setLiveMediaConfig] = useState(() => loadInitial('live_media_config', INITIAL_LIVE_MEDIA_CONFIG));

  // 1. Health Clinic & Infirmary States
  const [clinicRecords, setClinicRecords] = useState(() => loadInitial('clinic_records', INITIAL_CLINIC_RECORDS));
  const [clinicConfig, setClinicConfig] = useState(() => loadInitial('clinic_config', INITIAL_CLINIC_CONFIG));

  // 2. Main Campus Visitor & Security Gate Pass States
  const [visitors, setVisitors] = useState(() => loadInitial('visitors', INITIAL_VISITORS));
  const [visitorConfig, setVisitorConfig] = useState(() => loadInitial('visitor_config', INITIAL_VISITOR_CONFIG));

  // 3. Campus Inventory & Science Lab Assets States
  const [inventoryAssets, setInventoryAssets] = useState(() => loadInitial('inventory_assets', INITIAL_INVENTORY_ASSETS));
  const [maintenanceTickets, setMaintenanceTickets] = useState(() => loadInitial('maintenance_tickets', INITIAL_MAINTENANCE_TICKETS));
  const [inventoryConfig, setInventoryConfig] = useState(() => loadInitial('inventory_config', INITIAL_INVENTORY_CONFIG));

  // 4. Parent-Teacher Meeting (PTM) States
  const [ptmEvents, setPtmEvents] = useState(() => {
    const loaded = loadInitial('ptm_events', INITIAL_PTM_EVENTS);
    if (loaded && loaded[0]?.teachersAvailable && loaded[0]?.teachersAvailable?.length < 8) {
      return INITIAL_PTM_EVENTS;
    }
    return loaded;
  });
  const [ptmConfig, setPtmConfig] = useState(() => loadInitial('ptm_config', INITIAL_PTM_CONFIG));

  // 5. Alumni & Former Students Network States
  const [alumni, setAlumni] = useState(() => loadInitial('alumni', INITIAL_ALUMNI));
  const [transcriptRequests, setTranscriptRequests] = useState(() => loadInitial('transcript_requests', INITIAL_TRANSCRIPT_REQUESTS));
  const [alumniConfig, setAlumniConfig] = useState(() => loadInitial('alumni_config', INITIAL_ALUMNI_CONFIG));

  // 6. School Canteen & Smart Lunch Card States
  const [canteenMenu, setCanteenMenu] = useState(() => loadInitial('canteen_menu', INITIAL_CANTEEN_MENU));
  const [canteenWallets, setCanteenWallets] = useState(() => loadInitial('canteen_wallets', INITIAL_CANTEEN_WALLETS));
  const [canteenTransactions, setCanteenTransactions] = useState(() => loadInitial('canteen_transactions', INITIAL_CANTEEN_TRANSACTIONS));
  const [canteenConfig, setCanteenConfig] = useState(() => loadInitial('canteen_config', INITIAL_CANTEEN_CONFIG));

  // 7. Academic Study Materials & Question Papers
  const [studyMaterials, setStudyMaterials] = useState(() => loadInitial('study_materials', INITIAL_STUDY_MATERIALS));
  const [studyConfig, setStudyConfig] = useState(() => loadInitial('study_config', INITIAL_STUDY_CONFIG));

  // 8. Official School Seal & Principal Signature
  const [sealConfig, setSealConfig] = useState(() => loadInitial('seal_config', INITIAL_SEAL_CONFIG));

  // 9. Public School Website & CMS Config
  // For non-OHA schools with no saved config, build a school-specific default
  const [websiteConfig, setWebsiteConfig] = useState(() => {
    const base = loadInitial('website_config', INITIAL_WEBSITE_CONFIG);
    // If the loaded config still has OHA data but we're a different school, override with school-specific defaults
    if (
      activeSchoolId !== 'oha' &&
      activeSchoolId !== 'default' &&
      activeSchoolInfo?.name &&
      (base?.schoolName?.includes('One Heart') || base?.schoolName?.includes('OHA') || !base?.schoolName)
    ) {
      // Build and cache a school-specific config
      const schoolSpecific = {
        ...INITIAL_WEBSITE_CONFIG,
        schoolName: activeSchoolInfo.name,
        tagline: activeSchoolInfo.affiliationBadge || 'MBSE Affiliated',
        motto: activeSchoolInfo.motto || 'Excellence in Education',
        affiliationBadge: activeSchoolInfo.affiliationBadge || 'MBSE Affiliated',
        contact: {
          ...(INITIAL_WEBSITE_CONFIG.contact || {}),
          address: activeSchoolInfo.address || '',
          phone: activeSchoolInfo.contactPhone || '',
          email: activeSchoolInfo.contactEmail || '',
          officeHours: 'Monday - Friday: 8:30 AM - 4:00 PM'
        },
        hero: {
          ...(INITIAL_WEBSITE_CONFIG.hero || {}),
          headline: `Welcome to ${activeSchoolInfo.name}`,
          subheadline: `${activeSchoolInfo.affiliationBadge || 'MBSE Affiliated'} \u2014 ${activeSchoolInfo.address || 'Mizoram, India'}. Providing holistic education with dedicated faculty and vibrant campus life.`,
          badge: `\uD83C\uDF93 Admissions Open for Academic Session ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
          ctaPrimaryText: 'Apply for Admission Online',
          ctaSecondaryText: 'Explore Campus & Facilities',
        },
        principalMessage: {
          ...(INITIAL_WEBSITE_CONFIG.principalMessage || {}),
          designation: `Principal, ${activeSchoolInfo.name}`,
          principalDesignation: `Principal, ${activeSchoolInfo.name}`,
          name: '',
          photoUrl: '',
          quote: `At ${activeSchoolInfo.name}, we are dedicated to academic excellence and the holistic development of every student.`,
          fullMessage: `Welcome to ${activeSchoolInfo.name}'s official digital management portal. We are committed to academic excellence, moral integrity, and holistic student development. We warmly invite every student and parent to explore our campus.`
        },
        announcementBanner: {
          ...(INITIAL_WEBSITE_CONFIG.announcementBanner || {}),
          enabled: true,
          text: `\uD83C\uDF89 Online Admissions for Academic Session ${new Date().getFullYear()} - ${new Date().getFullYear() + 1} are officially open at ${activeSchoolInfo.name}! Limited seats available. Apply before June 30.`
        }
      };
      try {
        localStorage.setItem(`zoxs_${activeSchoolId}_website_config`, JSON.stringify(schoolSpecific));
      } catch(e) {}
      return schoolSpecific;
    }
    return base;
  });

  // 10. Student Disciplinary Records & Suspension Suite
  const [disciplinaryRecords, setDisciplinaryRecords] = useState(() => loadInitial('disciplinary_records', INITIAL_DISCIPLINARY_RECORDS));

  // 11. In-App Master Architecture States (Zero External Dependency)
  const [subjects, setSubjects] = useState(() => loadInitial('subjects', INITIAL_SUBJECTS));
  const [gradingScales, setGradingScales] = useState(() => loadInitial('grading_scales', INITIAL_GRADING_SCALES));
  const [feeHeads, setFeeHeads] = useState(() => loadInitial('fee_heads', INITIAL_FEE_HEADS));
  const [documentTemplates, setDocumentTemplates] = useState(() => loadInitial('document_templates', INITIAL_DOCUMENT_TEMPLATES));
  const [systemNomenclature, setSystemNomenclature] = useState(() => loadInitial('system_nomenclature', INITIAL_NOMENCLATURE));
  const [customStudentFields, setCustomStudentFields] = useState(() => loadInitial('custom_student_fields', []));
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_language');
      if (saved) return saved;
    } catch (e) {}
    return 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'mizo' : 'en';
      localStorage.setItem('zoxs_language', next);
      return next;
    });
  };

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || fallback || key;
  };
  const [autoAbsentNotificationEnabled, setAutoAbsentNotificationEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_auto_absent_noti');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleAutoAbsentNotification = (enabled) => {
    const nextVal = typeof enabled === 'boolean' ? enabled : !autoAbsentNotificationEnabled;
    setAutoAbsentNotificationEnabled(nextVal);
    localStorage.setItem('zoxs_auto_absent_noti', JSON.stringify(nextVal));
    return nextVal;
  };

  // ── SMS & WHATSAPP GATEWAY INTEGRATION ────────────────────────────────────
  const [gatewayConfig, setGatewayConfig] = useState(() => {
    try {
      const s = localStorage.getItem('zoxs_gateway_config');
      return s ? JSON.parse(s) : {
        smsProvider: 'fast2sms', // 'fast2sms' | 'twilio' | 'gupshup' | 'custom'
        fast2smsApiKey: '',
        twilioSid: '',
        twilioAuthToken: '',
        twilioFromNumber: '',
        gupshupApiKey: '',
        gupshupAppName: '',
        customWebhookUrl: '',
        enableSmsFeverAlert: true,
        enableSmsFeeReceipt: true,
        enableSmsSosAlert: true,
        enableSmsAbsence: true,
        whatsAppProvider: 'twilio_whatsapp',
        metaPhoneNumberId: '',
        metaAccessToken: '',
        agoraAppId: '',
        agoraAppCertificate: '',
        lastSmsSentAt: null,
        smsDeliveryLog: []
      };
    } catch {
      return {
        smsProvider: 'fast2sms',
        fast2smsApiKey: '',
        twilioSid: '',
        twilioAuthToken: '',
        twilioFromNumber: '',
        gupshupApiKey: '',
        gupshupAppName: '',
        customWebhookUrl: '',
        enableSmsFeverAlert: true,
        enableSmsFeeReceipt: true,
        enableSmsSosAlert: true,
        enableSmsAbsence: true,
        whatsAppProvider: 'twilio_whatsapp',
        metaPhoneNumberId: '',
        metaAccessToken: '',
        agoraAppId: '',
        agoraAppCertificate: '',
        lastSmsSentAt: null,
        smsDeliveryLog: []
      };
    }
  });

  const updateGatewayConfig = (updates) => {
    setGatewayConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('zoxs_gateway_config', JSON.stringify(next));
      return next;
    });
  };

  const sendSmsAlert = async (phone, message, type = 'sms') => {
    const timestamp = new Date().toLocaleTimeString();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    let success = true;

    try {
      if (gatewayConfig.smsProvider === 'fast2sms' && gatewayConfig.fast2smsApiKey && cleanPhone.length === 10) {
        await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': gatewayConfig.fast2smsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: `[ZOXS-SMS] ${message}`,
            language: 'english',
            flash: 0,
            numbers: cleanPhone
          })
        });
      } else if (gatewayConfig.smsProvider === 'custom' && gatewayConfig.customWebhookUrl) {
        await fetch(gatewayConfig.customWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, message, type, timestamp })
        });
      }
    } catch (err) {
      console.warn('SMS gateway dispatch notice:', err);
    }

    const logEntry = {
      id: 'sms_' + Date.now(),
      phone: cleanPhone || phone || 'N/A',
      message,
      type,
      provider: gatewayConfig.smsProvider,
      status: 'delivered',
      timestamp
    };

    setGatewayConfig(prev => {
      const updated = {
        ...prev,
        lastSmsSentAt: timestamp,
        smsDeliveryLog: [logEntry, ...(prev.smsDeliveryLog || [])].slice(0, 50)
      };
      localStorage.setItem('zoxs_gateway_config', JSON.stringify(updated));
      return updated;
    });

    return { success: true, logEntry };
  };

  const sendWhatsAppAlert = async (phone, message) => {
    return sendSmsAlert(phone, message, 'whatsapp');
  };


  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState({
    connected: false,
    lastPushAt: null,
    lastPullAt: null,
    lastError: null,
    pushProgress: null, // e.g. 'Pushing students (2/12)...'
    autoSyncEnabled: false,
  });

  // ── FIREBASE SYNC HELPERS ─────────────────────────────────────────────────

  // Test whether the current Firebase config can reach Firestore
  const testFirebaseConnection = async () => {
    setFirebaseSyncStatus(p => ({ ...p, lastError: null, pushProgress: 'Testing connection...' }));
    try {
      if (!db) throw new Error('Firebase db is not initialised. Check your credentials.');
      // Lightweight probe: attempt to read a non-existent doc
      const { getDoc } = await import('firebase/firestore');
      await getDoc(doc(db, '__zoxs_ping__', 'probe'));
      const ts = new Date().toLocaleTimeString();
      setFirebaseSyncStatus(p => ({ ...p, connected: true, lastError: null, pushProgress: null }));
      setLastSyncTime(ts);
      return { success: true };
    } catch (err) {
      const msg = err?.code === 'permission-denied'
        ? 'Connected! (Firestore rules block read — set rules to allow write for sync.)'
        : err.message;
      setFirebaseSyncStatus(p => ({ ...p, connected: err?.code === 'permission-denied', lastError: msg, pushProgress: null }));
      return { success: err?.code === 'permission-denied', error: msg };
    }
  };

  // Push all localStorage collections to Firestore
  const syncToFirestore = async () => {
    if (isShowcaseMode) {
      triggerShowcaseNotice('Cloud Sync to Firestore');
      return { success: false, error: 'Database mutation is protected in Showcase Demo Mode.' };
    }
    if (!db) {
      setFirebaseSyncStatus(p => ({ ...p, lastError: 'Firebase not initialised. Enter credentials first.', pushProgress: null }));
      return { success: false };
    }
    setIsSyncing(true);
    const collectionsMap = [
      { key: 'students',           data: students },
      { key: 'classes',            data: classes },
      { key: 'fees',               data: fees },
      { key: 'grades',             data: grades },
      { key: 'staff',              data: staff },
      { key: 'payroll',            data: payroll },
      { key: 'library_books',      data: libraryBooks },
      { key: 'notices',            data: notices },
      { key: 'admissions',         data: admissions },
      { key: 'transport_routes',   data: transportRoutes },
      { key: 'hostel_rooms',       data: hostelRooms },
      { key: 'clinic_records',     data: clinicRecords },
      { key: 'visitors',           data: visitors },
      { key: 'inventory_assets',   data: inventoryAssets },
      { key: 'alumni',             data: alumni },
      { key: 'canteen_wallets',    data: canteenWallets },
      { key: 'canteen_transactions', data: canteenTransactions },
      { key: 'leave_applications', data: leaveApplications },
      { key: 'system_config',      data: systemConfig ? [{ id: 'main', ...systemConfig }] : [] },
      { key: 'seal_config',        data: sealConfig ? [{ id: 'main', ...sealConfig }] : [] },
      { key: 'subjects',           data: subjects },
      { key: 'grading_scales',     data: gradingScales },
      { key: 'fee_heads',          data: feeHeads },
      { key: 'document_templates', data: documentTemplates ? [{ id: 'main', ...documentTemplates }] : [] },
      { key: 'system_nomenclature',data: systemNomenclature ? [{ id: 'main', ...systemNomenclature }] : [] }
    ];

    let pushed = 0;
    const errors = [];
    try {
      for (const col of collectionsMap) {
        setFirebaseSyncStatus(p => ({ ...p, pushProgress: `Pushing ${col.key} (${pushed + 1}/${collectionsMap.length})...` }));
        const arr = Array.isArray(col.data) ? col.data : [];
        for (const record of arr) {
          if (!record?.id) continue;
          try {
            await setDoc(doc(db, `zoxs_${col.key}`, String(record.id)), record, { merge: true });
          } catch (e) {
            errors.push(`${col.key}/${record.id}: ${e.message}`);
          }
        }
        pushed++;
      }
      const ts = new Date().toLocaleTimeString();
      setLastSyncTime(ts);
      setFirebaseSyncStatus(p => ({
        ...p, connected: true, lastPushAt: ts, pushProgress: null,
        lastError: errors.length ? `${errors.length} record(s) failed: ${errors[0]}` : null
      }));
      return { success: true, errors };
    } catch (err) {
      setFirebaseSyncStatus(p => ({ ...p, lastError: err.message, pushProgress: null }));
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull all Firestore collections → overwrite local state
  const pullFromFirestore = async () => {
    if (!db) {
      setFirebaseSyncStatus(p => ({ ...p, lastError: 'Firebase not initialised. Enter credentials first.', pushProgress: null }));
      return { success: false };
    }
    setIsSyncing(true);
    const collectionsMap = [
      { key: 'students',    setter: setStudents },
      { key: 'classes',     setter: setClasses },
      { key: 'fees',        setter: setFees },
      { key: 'grades',      setter: setGrades },
      { key: 'staff',       setter: setStaff },
      { key: 'payroll',     setter: setPayroll },
      { key: 'library_books', setter: setLibraryBooks },
      { key: 'notices',     setter: setNotices },
      { key: 'admissions',  setter: setAdmissions },
      { key: 'transport_routes', setter: setTransportRoutes },
      { key: 'hostel_rooms', setter: setHostelRooms },
      { key: 'clinic_records', setter: setClinicRecords },
      { key: 'visitors',    setter: setVisitors },
      { key: 'inventory_assets', setter: setInventoryAssets },
      { key: 'alumni',      setter: setAlumni },
      { key: 'canteen_wallets', setter: setCanteenWallets },
      { key: 'canteen_transactions', setter: setCanteenTransactions },
      { key: 'leave_applications', setter: setLeaveApplications },
      { key: 'system_config', setter: (docs) => { if (docs[0]) setSystemConfig(docs[0]); } },
      { key: 'seal_config', setter: (docs) => { if (docs[0]) setSealConfig(docs[0]); } },
      { key: 'subjects', setter: setSubjects },
      { key: 'grading_scales', setter: setGradingScales },
      { key: 'fee_heads', setter: setFeeHeads },
      { key: 'document_templates', setter: (docs) => { if (docs[0]) setDocumentTemplates(docs[0]); } },
      { key: 'system_nomenclature', setter: (docs) => { if (docs[0]) setSystemNomenclature(docs[0]); } }
    ];
    let pulled = 0;
    try {
      for (const col of collectionsMap) {
        setFirebaseSyncStatus(p => ({ ...p, pushProgress: `Pulling ${col.key} (${pulled + 1}/${collectionsMap.length})...` }));
        try {
          const snap = await getDocs(collection(db, `zoxs_${col.key}`));
          if (!snap.empty) {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            col.setter(docs);
          }
        } catch (e) { /* collection may not exist yet */ }
        pulled++;
      }
      const ts = new Date().toLocaleTimeString();
      setLastSyncTime(ts);
      setFirebaseSyncStatus(p => ({ ...p, connected: true, lastPullAt: ts, pushProgress: null, lastError: null }));
      return { success: true };
    } catch (err) {
      setFirebaseSyncStatus(p => ({ ...p, lastError: err.message, pushProgress: null }));
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto save to local storage (offline cache mirror with multi-tenant partitioning)
  useEffect(() => {
    // If running in Showcase Demo mode, do not persist mutations into master storage!
    if (isShowcaseMode) {
      return;
    }

    const saveTenantItem = persistTenantItem;

    saveTenantItem('classes', classes);
    saveTenantItem('students', students);
    saveTenantItem('grades', grades);
    saveTenantItem('fees', fees);
    saveTenantItem('attendance', attendance);
    saveTenantItem('staff', staff);
    saveTenantItem('payroll', payroll);
    saveTenantItem('library_books', libraryBooks);
    saveTenantItem('notices', notices);
    saveTenantItem('admissions', admissions);
    saveTenantItem('admission_requirements', admissionRequirements);
    saveTenantItem('issued_certificates', issuedCertificates);
    saveTenantItem('report_card_withholds', reportCardWithholds);
    saveTenantItem('transport_routes', transportRoutes);
    saveTenantItem('hostel_rooms', hostelRooms);
    saveTenantItem('hostel_gate_passes', hostelGatePasses);
    saveTenantItem('hostel_roll_calls', hostelRollCalls);
    saveTenantItem('hostel_mess_menu', hostelMessMenu);
    saveTenantItem('hostel_rules', hostelRules);
    saveTenantItem('academic_events', academicEvents);
    saveTenantItem('timetables', timetables);
    saveTenantItem('custom_scripts', customScripts);
    saveTenantItem('plugins', plugins);
    saveTenantItem('system_config', systemConfig);
    saveTenantItem('payment_config', paymentConfig);
    saveTenantItem('online_admission_config', onlineAdmissionConfig);
    saveTenantItem('offline_admission_config', offlineAdmissionConfig);
    saveTenantItem('academic_sessions', academicSessions);
    saveTenantItem('leave_applications', leaveApplications);
    saveTenantItem('pay_scales', payScales);
    saveTenantItem('tasks', tasks);
    saveTenantItem('vacations', vacations);
    saveTenantItem('clinic_records', clinicRecords);
    saveTenantItem('clinic_config', clinicConfig);
    saveTenantItem('visitors', visitors);
    saveTenantItem('visitor_config', visitorConfig);
    saveTenantItem('inventory_assets', inventoryAssets);
    saveTenantItem('maintenance_tickets', maintenanceTickets);
    saveTenantItem('inventory_config', inventoryConfig);
    saveTenantItem('ptm_events', ptmEvents);
    saveTenantItem('ptm_config', ptmConfig);
    saveTenantItem('alumni', alumni);
    saveTenantItem('transcript_requests', transcriptRequests);
    saveTenantItem('alumni_config', alumniConfig);
    saveTenantItem('canteen_menu', canteenMenu);
    saveTenantItem('canteen_wallets', canteenWallets);
    saveTenantItem('canteen_transactions', canteenTransactions);
    saveTenantItem('canteen_config', canteenConfig);
    saveTenantItem('study_materials', studyMaterials);
    saveTenantItem('study_config', studyConfig);
    saveTenantItem('seal_config', sealConfig);
    saveTenantItem('subjects', subjects);
    saveTenantItem('grading_scales', gradingScales);
    saveTenantItem('fee_heads', feeHeads);
    saveTenantItem('document_templates', documentTemplates);
    saveTenantItem('system_nomenclature', systemNomenclature);
    saveTenantItem('custom_student_fields', customStudentFields);
    setLastSyncTime(new Date().toLocaleTimeString());
  }, [activeSchoolId, classes, students, grades, fees, attendance, staff, payroll, libraryBooks, notices, admissions, admissionRequirements, onlineAdmissionConfig, issuedCertificates, reportCardWithholds, transportRoutes, hostelRooms, timetables, hostelGatePasses, hostelRollCalls, hostelMessMenu, hostelRules, academicEvents, customScripts, plugins, systemConfig, paymentConfig, leaveApplications, payScales, tasks, vacations, clinicRecords, clinicConfig, visitors, visitorConfig, inventoryAssets, maintenanceTickets, inventoryConfig, ptmEvents, ptmConfig, alumni, transcriptRequests, alumniConfig, canteenMenu, canteenWallets, canteenTransactions, canteenConfig, studyMaterials, studyConfig, sealConfig, subjects, gradingScales, feeHeads, documentTemplates, systemNomenclature, customStudentFields]);

  // Real-time In-App Stylesheet & Scripts Live Injection
  useEffect(() => {
    // 1. Live CSS Injection
    let styleTag = document.getElementById('zoxs-custom-in-app-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'zoxs-custom-in-app-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = customScripts?.css || '';

    // 2. Load Enabled Plugins CDNs dynamically (Scripts & CSS)
    plugins.forEach(plugin => {
      if (plugin.enabled) {
        // Dynamic JavaScript CDN
        if (plugin.cdnUrl) {
          const scriptId = `zoxs-cdn-${plugin.id}`;
          if (!document.getElementById(scriptId)) {
            const s = document.createElement('script');
            s.id = scriptId;
            s.src = plugin.cdnUrl;
            if (plugin.loadTiming === 'defer') s.defer = true;
            else s.async = true;
            document.head.appendChild(s);
          }
        }

        // Dynamic CSS / Stylesheet CDN
        if (plugin.cdnCssUrl) {
          const cssId = `zoxs-css-${plugin.id}`;
          if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = plugin.cdnCssUrl;
            document.head.appendChild(link);
          }
        }

        // Execute plugin initialization script with its configuration
        if (plugin.script && plugin.script.trim()) {
          try {
            new Function('config', 'context', plugin.script)(plugin.config || {}, { classes, students, systemConfig });
          } catch (e) {
            // Silently handle sandbox execution
          }
        }
      }
    });

    // 3. Execute custom JS hooks safely
    if (customScripts?.js && customScripts.js.trim()) {
      try {
        const runScript = new Function('context', `
          try {
            ${customScripts.js}
          } catch(err) {
            console.warn("[Zoxs Script Hook Notice]:", err);
          }
        `);
        runScript({ classes, students, systemConfig });
      } catch (e) {
        console.warn("[Zoxs Custom Script Syntax Error]:", e);
      }
    }
  }, [customScripts, plugins, systemConfig]);



  // 1. Attendance recording (QR scan or manual) with Automated Absent Alert Trigger
  const recordAttendance = (record) => {
    const newId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const newRecord = {
      id: newId,
      date: record.date || today,
      timestamp,
      status: record.status || 'present',
      scanMethod: record.scanMethod || 'qr_scan',
      scannedBy: record.scannedBy || 'Teacher',
      studentId: record.studentId,
      classId: record.classId,
      remarks: record.remarks || (record.scanMethod === 'manual' ? 'Manual status update' : 'QR Verified')
    };

    let previousRecord = null;

    setAttendance(prev => {
      previousRecord = prev.find(a => a.studentId === newRecord.studentId && a.date === newRecord.date);
      const filtered = prev.filter(a => !(a.studentId === newRecord.studentId && a.date === newRecord.date));
      return [newRecord, ...filtered];
    });

    // Auto absent notification trigger if status is absent and not suppressed
    if (newRecord.status === 'absent' && autoAbsentNotificationEnabled && !record.suppressNotification) {
      const targetStudent = students.find(s => s.id === record.studentId);
      if (targetStudent) {
        sendPrivateNotification({
          title: `Hriattirna: School Kal Loh (Absent Alert) - ${targetStudent.firstName} ${targetStudent.lastName}`,
          content: `Vawiin ni ${newRecord.date} hian i fa ${targetStudent.firstName} ${targetStudent.lastName} (Roll No: #${targetStudent.rollNo}) chu school-ah a lo kal lo (Absent) a ni. A chhan fiah tak Class Teacher ${record.scannedBy || 'School Office'} hnenah hriattir tur a ni e.`,
          category: 'general',
          priority: 'urgent',
          targetAudience: 'individual',
          targetUserId: targetStudent.id,
          targetUserName: `${targetStudent.firstName} ${targetStudent.lastName}`,
          recipientRole: 'parent',
          senderId: record.scannedBy || 'Attendance Desk',
          publishedBy: `${record.scannedBy || 'Class Teacher'} (Attendance Desk)`,
          channels: { inApp: true, whatsapp: true, push: true, sms: true }
        });
      }
    }

    // If status changed from absent to present/late, optionally send correction notice if requested
    if (previousRecord?.status === 'absent' && (newRecord.status === 'present' || newRecord.status === 'late') && record.sendCorrectionNotice) {
      const targetStudent = students.find(s => s.id === record.studentId);
      if (targetStudent) {
        sendPrivateNotification({
          title: `Correction Notice: Attendance Updated to ${newRecord.status.toUpperCase()}`,
          content: `Attendance enfiah nawn a ni a: ${targetStudent.firstName} ${targetStudent.lastName} chu vawiin ni ${newRecord.date} hian ${newRecord.status === 'present' ? 'Present' : 'Late'} tiin update dik a ni e.`,
          category: 'general',
          priority: 'normal',
          targetAudience: 'individual',
          targetUserId: targetStudent.id,
          targetUserName: `${targetStudent.firstName} ${targetStudent.lastName}`,
          recipientRole: 'parent',
          senderId: record.scannedBy || 'Attendance Desk',
          publishedBy: `${record.scannedBy || 'Class Teacher'} (Correction)`,
          channels: { inApp: true, whatsapp: true, push: true, sms: false }
        });
      }
    }

    // Recalculate attendance rate for student
    setStudents(prev => prev.map(stu => {
      if (stu.id === record.studentId) {
        const delta = record.status === 'present' ? 0.5 : record.status === 'absent' ? -1 : 0;
        return {
          ...stu,
          attendanceRate: Math.min(100, Math.max(50, (stu.attendanceRate || 90) + delta))
        };
      }
      return stu;
    }));

    return newRecord;
  };

  const dispatchBulkAbsentNotifications = (classId, date, senderName = 'Class Teacher') => {
    const classStudents = students.filter(s => s.classId === classId);
    const dateAttendance = attendance.filter(a => a.date === date && a.status === 'absent');
    const absentStudents = classStudents.filter(s => dateAttendance.some(a => a.studentId === s.id));

    absentStudents.forEach(st => {
      sendPrivateNotification({
        title: `Hriattirna: School Kal Loh (Absent Alert) - ${st.firstName} ${st.lastName}`,
        content: `Vawiin ni ${date} hian i fa ${st.firstName} ${st.lastName} (Roll No: #${st.rollNo}) chu school-ah a lo kal lo (Absent) a ni. A chhan fiah tak Class Teacher ${senderName} hnenah hriattir tur a ni e.`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: st.id,
        targetUserName: `${st.firstName} ${st.lastName}`,
        recipientRole: 'parent',
        senderId: senderName,
        publishedBy: `${senderName} (Attendance Desk)`,
        channels: { inApp: true, whatsapp: true, push: true, sms: true }
      });
    });

    return absentStudents.length;
  };

  const bulkMarkAttendance = (classId, date, status, scannedBy = 'Teacher') => {
    const targetStudents = students.filter(s => s.classId === classId);
    const timestamp = new Date().toISOString();

    const newRecords = targetStudents.map(stu => ({
      id: `att-${Date.now()}-${stu.id}`,
      studentId: stu.id,
      classId: stu.classId,
      date,
      status,
      scanMethod: 'manual',
      scannedBy,
      timestamp
    }));

    setAttendance(prev => {
      const studentIds = new Set(targetStudents.map(s => s.id));
      const remaining = prev.filter(a => !(studentIds.has(a.studentId) && a.date === date));
      return [...newRecords, ...remaining];
    });
  };

  // 2. Dual payment recording (UPI/GPay vs Cash)
  const recordPayment = (paymentData) => {
    const isUPI = paymentData.paymentMode === 'upi';
    const receiptPrefix = isUPI ? 'MSS-UPI' : 'MSS-CSH';
    const receiptCounter = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `${receiptPrefix}-2026-${receiptCounter}`;

    const newFeeRecord = {
      id: `fee-rec-${Date.now()}`,
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      admissionNo: paymentData.admissionNo,
      classId: paymentData.classId,
      amount: Number(paymentData.amount),
      paymentMode: paymentData.paymentMode, // 'upi' | 'cash'
      feeType: paymentData.feeType || 'Tuition Fee',
      upiId: isUPI ? (paymentData.upiId || 'mizoramschool@oksbi') : null,
      transactionUtr: isUPI ? paymentData.transactionUtr : null,
      cashierName: !isUPI ? (paymentData.cashierName || 'R. Laltluanga') : null,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      verified: true,
      receiptNo,
      remarks: paymentData.remarks || (isUPI ? 'Online UPI payment verified' : 'Cash received at fee counter')
    };

    setFees(prev => [newFeeRecord, ...prev]);

    // Update student's fee clearance status
    setStudents(prev => prev.map(stu => {
      if (stu.id === paymentData.studentId) {
        const newPaid = (stu.paidFees || 0) + Number(paymentData.amount);
        const total = stu.totalFees || 32000;
        let feeStatus = 'partial';
        if (newPaid >= total) {
          feeStatus = 'cleared';
        } else if (newPaid <= 0) {
          feeStatus = 'overdue';
        }
        return {
          ...stu,
          paidFees: newPaid,
          feeStatus
        };
      }
      return stu;
    }));

    return newFeeRecord;
  };

  // 3. Academic Grade Management (Strictly separated Class Tests vs Examinations)
  const addGrade = (gradeData) => {
    const newGrade = {
      id: `grd-${Date.now()}`,
      studentId: gradeData.studentId,
      classId: gradeData.classId,
      subject: gradeData.subject,
      type: gradeData.type, // 'class_test' or 'examination'
      testName: gradeData.testName,
      maxMarks: Number(gradeData.maxMarks),
      marksObtained: Number(gradeData.marksObtained),
      date: gradeData.date || new Date().toISOString().split('T')[0],
      remarks: gradeData.remarks || '',
      gradingScale: gradeData.type === 'class_test' ? 'Continuous Assessment' : 'MBSE Standard'
    };

    setGrades(prev => [newGrade, ...prev]);
    return newGrade;
  };

  // 4. Library Book checkout & return
  const issueBook = (bookId, studentId, studentName) => {
    const issueDate = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 21);
    const dueDate = due.toISOString().split('T')[0];

    setLibraryBooks(prev => prev.map(book => {
      if (book.id === bookId && book.availableCopies > 0) {
        return {
          ...book,
          availableCopies: book.availableCopies - 1,
          issuedTo: [
            ...book.issuedTo,
            { studentId, studentName, issueDate, dueDate, returned: false }
          ]
        };
      }
      return book;
    }));
  };

  const returnBook = (bookId, studentId) => {
    setLibraryBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const updatedIssues = book.issuedTo.map(issue => {
          if (issue.studentId === studentId && !issue.returned) {
            return { ...issue, returned: true, returnDate: new Date().toISOString().split('T')[0] };
          }
          return issue;
        });
        return {
          ...book,
          availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
          issuedTo: updatedIssues
        };
      }
      return book;
    }));
  };

  // 5. Staff & Payroll Management
  const processPayroll = (staffId, month, year, transactionRef) => {
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    const netSalary = targetStaff.baseSalary + targetStaff.allowances - targetStaff.deductions;
    const newRecord = {
      id: `pay-${year}-${month}-${staffId}`,
      staffId: targetStaff.id,
      staffName: targetStaff.name,
      designation: targetStaff.designation,
      month,
      year: Number(year),
      baseSalary: targetStaff.baseSalary,
      allowances: targetStaff.allowances,
      deductions: targetStaff.deductions,
      netSalary,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: transactionRef || `NEFT-MZB-${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    setPayroll(prev => [newRecord, ...prev.filter(p => !(p.staffId === staffId && p.month === month && p.year === Number(year)))]);
    return newRecord;
  };

  // 5b. Pay Scales & Payroll Revision (Siamremna) Suite (Admin Only)
  const updatePayScale = (scaleId, updatedFields) => {
    setPayScales(prev => prev.map(scale => {
      if (scale.id === scaleId) {
        return { ...scale, ...updatedFields };
      }
      return scale;
    }));
    return { success: true };
  };

  const addPayScale = (newScaleData) => {
    const newScale = {
      id: `scale-${Date.now()}`,
      level: newScaleData.level || 'Level 10',
      title: newScaleData.title,
      designations: newScaleData.designations || [],
      minBase: Number(newScaleData.minBase || 35000),
      maxBase: Number(newScaleData.maxBase || 60000),
      currentBase: Number(newScaleData.currentBase || 40000),
      daRatePercent: Number(newScaleData.daRatePercent || 38),
      hraRatePercent: Number(newScaleData.hraRatePercent || 16),
      medicalAllowance: Number(newScaleData.medicalAllowance || 1000),
      specialAllowance: Number(newScaleData.specialAllowance || 1000),
      epfNpsPercent: Number(newScaleData.epfNpsPercent || 10),
      profTax: Number(newScaleData.profTax || 150),
      description: newScaleData.description || 'Institutional Pay Scale Band'
    };

    setPayScales(prev => [...prev, newScale]);
    return newScale;
  };

  const adjustStaffSalary = (staffId, adjustment) => {
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    const revisionEntry = {
      date: new Date().toISOString().split('T')[0],
      revisedBy: adjustment.revisedBy || 'Rev. Dr. L. H. Rohmingliana (Principal)',
      previousBase: targetStaff.baseSalary,
      newBase: Number(adjustment.baseSalary ?? targetStaff.baseSalary),
      previousAllowances: targetStaff.allowances,
      newAllowances: Number(adjustment.allowances ?? targetStaff.allowances),
      previousDeductions: targetStaff.deductions,
      newDeductions: Number(adjustment.deductions ?? targetStaff.deductions),
      payScaleId: adjustment.payScaleId || targetStaff.payScaleId || null,
      reason: adjustment.reason || 'Annual increment & Pay scale revision',
      timestamp: new Date().toISOString()
    };

    setStaff(prev => prev.map(stf => {
      if (stf.id === staffId) {
        return {
          ...stf,
          baseSalary: Number(adjustment.baseSalary ?? stf.baseSalary),
          allowances: Number(adjustment.allowances ?? stf.allowances),
          deductions: Number(adjustment.deductions ?? stf.deductions),
          payScaleId: adjustment.payScaleId || stf.payScaleId || null,
          salaryRevisionHistory: [revisionEntry, ...(stf.salaryRevisionHistory || [])]
        };
      }
      return stf;
    }));

    // Send confidential private alert to staff member
    sendPrivateNotification({
      title: `Hlawh Siamremna: Pay Scale / Salary Revision Approved`,
      content: `Dear ${targetStaff.name}, i hlawh leh allowances chu School Administration (${revisionEntry.revisedBy}) in an siamrem fel e. Base Salary thar: ₹${Number(adjustment.baseSalary ?? targetStaff.baseSalary).toLocaleString('en-IN')}, Allowances: ₹${Number(adjustment.allowances ?? targetStaff.allowances).toLocaleString('en-IN')}. Reason: "${revisionEntry.reason}".`,
      category: 'general',
      priority: 'confidential',
      targetAudience: 'individual',
      targetUserId: targetStaff.id,
      targetUserName: `${targetStaff.name} (${targetStaff.designation})`,
      recipientRole: targetStaff.role || 'teacher',
      senderId: 'principal',
      publishedBy: revisionEntry.revisedBy,
      channels: { inApp: true, whatsapp: true, push: true, sms: false }
    });

    return revisionEntry;
  };

  // 6. Online & Offline Walk-In Admissions & Comprehensive Review Council
  const submitAdmission = (formData, entryType = 'online', registeredBy = null) => {
    const newAdm = {
      id: `adm-${Date.now()}`,
      applicantName: formData.applicantName,
      appliedClass: formData.appliedClass,
      appliedStream: formData.appliedStream || null,
      gender: formData.gender || 'Female',
      dob: formData.dob || '2009-01-01',
      bloodGroup: formData.bloodGroup || 'O+',
      parentName: formData.parentName,
      guardianOccupation: formData.guardianOccupation || '',
      contactPhone: formData.contactPhone,
      email: formData.email || '',
      address: formData.address || 'Aizawl, Mizoram',
      previousSchool: formData.previousSchool || 'N/A',
      marksPercentage: formData.marksPercentage || 'N/A',
      entryType: entryType || formData.entryType || 'online',
      registeredBy: registeredBy || formData.registeredBy || (entryType === 'offline_walkin' ? 'School Admission Desk' : 'Applicant (Online Portal)'),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      remarks: formData.remarks || (entryType === 'offline_walkin' ? 'Offline Walk-In Desk Registration' : 'Public online submission'),
      documents: formData.documents || [],
      documentRequests: [],
      auditLogs: [
        {
          action: entryType === 'offline_walkin' ? 'Offline Walk-In Form Submitted' : 'Online Application Registered',
          by: registeredBy || (entryType === 'offline_walkin' ? 'Admission Counter' : 'Applicant'),
          timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setAdmissions(prev => [newAdm, ...prev]);
    return newAdm;
  };

  const updateAdmissionRecord = (admissionId, updatedFields, auditorName = 'School Admission Committee') => {
    setAdmissions(prev => prev.map(adm => {
      if (adm.id === admissionId) {
        const audit = {
          action: 'Candidate details corrected & updated',
          by: auditorName,
          timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...adm,
          ...updatedFields,
          auditLogs: [...(adm.auditLogs || []), audit]
        };
      }
      return adm;
    }));
    return { success: true };
  };

  const requestAdmissionDocument = (admissionId, requestDetails, requesterName = 'Admission Committee') => {
    const newRequest = {
      id: `dreq-${Date.now()}`,
      title: requestDetails.title,
      message: requestDetails.message,
      requestedBy: requesterName,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    setAdmissions(prev => prev.map(adm => {
      if (adm.id === admissionId) {
        const audit = {
          action: `Document Requested: ${requestDetails.title}`,
          by: requesterName,
          timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...adm,
          documentRequests: [...(adm.documentRequests || []), newRequest],
          auditLogs: [...(adm.auditLogs || []), audit]
        };
      }
      return adm;
    }));
    return { success: true, request: newRequest };
  };

  const updateAdmissionDocumentStatus = (admissionId, docId, newDocStatus, auditorName = 'Admission Committee') => {
    setAdmissions(prev => prev.map(adm => {
      if (adm.id === admissionId) {
        const updatedDocs = (adm.documents || []).map(doc => {
          if (doc.id === docId) {
            return { ...doc, status: newDocStatus };
          }
          return doc;
        });
        const audit = {
          action: `Document status changed to ${newDocStatus}`,
          by: auditorName,
          timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...adm,
          documents: updatedDocs,
          auditLogs: [...(adm.auditLogs || []), audit]
        };
      }
      return adm;
    }));
    return { success: true };
  };

  const addAdmissionRequirement = (reqData) => {
    const newReq = {
      id: `req-${Date.now()}`,
      ...reqData
    };
    setAdmissionRequirements(prev => [...prev, newReq]);
    return { success: true, requirement: newReq };
  };

  const updateAdmissionRequirement = (reqId, updatedData) => {
    setAdmissionRequirements(prev => prev.map(r => r.id === reqId ? { ...r, ...updatedData } : r));
    return { success: true };
  };

  const updateOnlineAdmissionConfig = (newConfig) => {
    setOnlineAdmissionConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveTenantItem('online_admission_config', updated);
      return updated;
    });
  };

  const updateOfflineAdmissionConfig = (newConfig) => {
    setOfflineAdmissionConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveTenantItem('offline_admission_config', updated);
      return updated;
    });
  };

  // Start New Academic Session & Session Turnover
  const startNewAcademicSession = ({ sessionName, startDate, endDate, notes = '' }) => {
    if (!sessionName) return null;
    const cleanSession = sessionName.trim();

    // 1. Mark existing active session as completed
    const updatedSessions = (academicSessions || []).map(s => {
      if (s.status === 'active') {
        return { ...s, status: 'completed', completedAt: new Date().toISOString() };
      }
      return s;
    });

    const newSessionId = `sess-${cleanSession.replace(/\s+/g, '').replace(/-/g, '_')}_${Date.now()}`;
    const newSessionObj = {
      id: newSessionId,
      sessionName: cleanSession,
      status: 'active',
      startDate: startDate || `${new Date().getFullYear()}-04-01`,
      endDate: endDate || `${new Date().getFullYear() + 1}-03-31`,
      totalEnrolled: 0,
      notes: notes || `Academic Session ${cleanSession} officially inaugurated by Administration.`,
      createdAt: new Date().toISOString()
    };

    const finalSessions = [...updatedSessions, newSessionObj];
    setAcademicSessions(finalSessions);
    saveTenantItem('academic_sessions', finalSessions);

    // 2. Synchronize systemConfig and admission configs
    updateSystemConfig({ academicSession: cleanSession });
    updateOnlineAdmissionConfig({ academicSession: cleanSession });
    updateOfflineAdmissionConfig({ academicSession: cleanSession });

    // 3. STRICT RULE: Past students and parents are NOT automatically enrolled in the new session!
    // They are marked with enrollmentStatus: 'awaiting_promotion' to prevent automatic rollover.
    setStudents(prev => {
      const updated = prev.map(s => {
        const enrolled = s.enrolledSessions || [s.academicSession || '2026 - 2027'];
        if (!enrolled.includes(cleanSession)) {
          return {
            ...s,
            enrollmentStatus: 'awaiting_promotion'
          };
        }
        return s;
      });
      saveTenantItem('students', updated);
      return updated;
    });

    // 4. Dispatch institutional notification
    addNotice({
      title: `🎉 Official Notice: Academic Session ${cleanSession} Commenced`,
      content: `School Administration has officially opened Academic Session ${cleanSession}. Class promotions and admission verifications are active. All returning students require explicit promotion or re-enrollment approval.`,
      targetRole: 'all',
      priority: 'high',
      category: 'academic',
      audience: 'all'
    });

    return newSessionObj;
  };

  // Switch Active Academic Session
  const switchActiveAcademicSession = (sessionId) => {
    const target = (academicSessions || []).find(s => s.id === sessionId);
    if (!target) return;

    const updated = (academicSessions || []).map(s => ({
      ...s,
      status: s.id === sessionId ? 'active' : (s.status === 'active' ? 'completed' : s.status)
    }));
    setAcademicSessions(updated);
    saveTenantItem('academic_sessions', updated);

    updateSystemConfig({ academicSession: target.sessionName });
    updateOnlineAdmissionConfig({ academicSession: target.sessionName });
    updateOfflineAdmissionConfig({ academicSession: target.sessionName });
  };

  // Detailed Student Promotion (Both Session Turnover & Mid-Stream Advancement)
  const promoteStudent = (studentId, promotionData) => {
    const {
      toClassId,
      newRollNo,
      type = 'session_advancement', // 'session_advancement' | 'mid_term_accelerated' | 'stream_transfer' | 'section_shift'
      targetSession,
      reason,
      remarks,
      promotedBy = 'Principal / Vice Principal',
      effectiveDate = new Date().toISOString().split('T')[0]
    } = promotionData;

    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    const sourceClass = classes.find(c => c.id === student.classId);
    const targetClass = classes.find(c => c.id === toClassId);
    const sessionToEnroll = targetSession || systemConfig?.academicSession || '2026 - 2027';

    const orderNumber = `PROMO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPromotionRecord = {
      id: `promo-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      orderNumber,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      fromClassId: student.classId,
      fromClassName: sourceClass?.name || student.classId,
      fromStream: student.stream || sourceClass?.stream || null,
      fromRollNo: student.rollNo,
      toClassId: toClassId,
      toClassName: targetClass?.name || toClassId,
      toStream: targetClass?.stream || student.stream || null,
      newRollNo: newRollNo || student.rollNo,
      fromSession: student.academicSession || '2026 - 2027',
      toSession: sessionToEnroll,
      type,
      reason: reason || 'Academic performance, screening marks, and council clearance.',
      remarks: remarks || 'Officially endorsed by Institutional Promotion & Evaluation Council.',
      promotedBy,
      promotedAt: effectiveDate,
      timestamp: new Date().toISOString()
    };

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === studentId) {
          const prevEnrolled = s.enrolledSessions || [s.academicSession || '2026 - 2027'];
          const newEnrolledSessions = Array.from(new Set([...prevEnrolled, sessionToEnroll]));
          const prevHistory = s.promotionHistory || [];

          return {
            ...s,
            classId: toClassId,
            stream: targetClass?.stream || s.stream || null,
            rollNo: newRollNo || s.rollNo,
            academicSession: sessionToEnroll,
            enrolledSessions: newEnrolledSessions,
            enrollmentStatus: 'enrolled',
            promotionHistory: [newPromotionRecord, ...prevHistory]
          };
        }
        return s;
      });
      saveTenantItem('students', updated);
      return updated;
    });

    // Send targeted in-app notification to student and parent
    addNotice({
      title: `🎓 Official Promotion Order: ${targetClass?.name || 'Class Advancement'}`,
      content: `Official Promotion Order #${orderNumber}: ${student.firstName} ${student.lastName} is officially promoted from ${sourceClass?.name || student.classId} to ${targetClass?.name} for Academic Session ${sessionToEnroll}. Assigned Roll No: ${newRollNo || student.rollNo}. Details: ${remarks || reason || 'Regular academic advancement.'}`,
      targetRole: 'parent',
      recipientId: student.id,
      recipientName: `${student.firstName} ${student.lastName}`,
      priority: 'high',
      category: 'academic',
      audience: 'private'
    });

    return newPromotionRecord;
  };

  // Batch Class Promotion
  const batchPromoteStudents = (studentIds, promotionData) => {
    if (!Array.isArray(studentIds) || studentIds.length === 0) return [];
    const results = [];
    studentIds.forEach(id => {
      const res = promoteStudent(id, promotionData);
      if (res) results.push(res);
    });
    return results;
  };

  // Re-Enroll Returning Student into Active Session
  const reEnrollStudent = (studentId, targetSession) => {
    const session = targetSession || systemConfig?.academicSession || '2026 - 2027';
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === studentId) {
          const prevEnrolled = s.enrolledSessions || [];
          return {
            ...s,
            academicSession: session,
            enrolledSessions: Array.from(new Set([...prevEnrolled, session])),
            enrollmentStatus: 'enrolled'
          };
        }
        return s;
      });
      saveTenantItem('students', updated);
      return updated;
    });
  };

  const deleteAdmissionRequirement = (reqId) => {
    setAdmissionRequirements(prev => prev.filter(r => r.id !== reqId));
    return { success: true };
  };

  const reviewAdmission = (admissionId, newStatus, assignedClassId, remarks, reviewerName = 'Admission Committee') => {
    let createdStudent = null;

    setAdmissions(prev => prev.map(adm => {
      if (adm.id === admissionId) {
        const audit = {
          action: `Application ${newStatus.toUpperCase()}`,
          by: reviewerName,
          timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...adm,
          status: newStatus,
          remarks: remarks || adm.remarks,
          auditLogs: [...(adm.auditLogs || []), audit]
        };
      }
      return adm;
    }));

    if (newStatus === 'approved') {
      const targetAdm = admissions.find(a => a.id === admissionId);
      if (targetAdm) {
        const nextRoll = (students.filter(s => s.classId === (assignedClassId || targetAdm.appliedClass)).length + 1).toString().padStart(2, '0');
        const nextAdmNo = `MZ-2026-0${100 + students.length + 1}`;
        const nameParts = targetAdm.applicantName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Mizo';

        createdStudent = {
          id: `stu-${Date.now()}`,
          admissionNo: nextAdmNo,
          rollNo: nextRoll,
          firstName,
          lastName,
          gender: targetAdm.gender,
          dob: targetAdm.dob,
          bloodGroup: targetAdm.bloodGroup || 'B+',
          classId: assignedClassId || targetAdm.appliedClass,
          stream: targetAdm.appliedStream,
          guardianName: targetAdm.parentName,
          guardianPhone: targetAdm.contactPhone,
          guardianEmail: targetAdm.email,
          address: targetAdm.address || 'Aizawl, Mizoram',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          feeStatus: 'partial',
          totalFees: 32000,
          paidFees: 0,
          transportRouteId: null,
          hostelRoomId: null,
          attendanceRate: 100.0
        };

        setStudents(prev => [createdStudent, ...prev]);
      }
    }

    return createdStudent;
  };

  const submitOnlineAdmission = (appData) => {
    const newApp = {
      id: appData.id || `adm-${Date.now()}`,
      applicationNo: appData.applicationNo || appData.applicationNumber || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationNumber: appData.applicationNumber || appData.applicationNo || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
      submittedAt: appData.createdAt || new Date().toISOString(),
      status: appData.status?.toLowerCase() || 'pending',
      entryType: 'online',
      registeredBy: 'Applicant (Online Public Portal)',
      applicantName: appData.applicantName,
      appliedClass: appData.targetClass || appData.appliedClass,
      parentName: appData.parentName,
      contactPhone: appData.parentPhone || appData.contactPhone || '',
      email: appData.parentEmail || appData.email || '',
      address: appData.address || '',
      previousSchool: appData.previousSchool || '',
      marksPercentage: appData.previousMarksPercentage ? `${appData.previousMarksPercentage}%` : appData.marksPercentage || '',
      documents: appData.documents || [],
      attachedDocs: appData.documents || [],
      ...appData
    };
    setAdmissions(prev => [newApp, ...prev]);
    return { success: true, application: newApp };
  };

  // 6b. Institutional Certificates (Transfer Certificate, Migration, Bonafide)
  const issueCertificate = (certData) => {
    const certPrefix = certData.certType === 'transfer' ? 'TC' : certData.certType === 'migration' ? 'MIG' : 'BON';
    const autoNumber = `${certPrefix}/2026/0${(issuedCertificates.length + 43).toString().padStart(2, '0')}`;

    const newCert = {
      id: `cert-${Date.now()}`,
      certNumber: certData.certNumber || autoNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      preparedBy: certData.preparedBy || 'School Examination Office (Pu R. Laltluanga)',
      authorizedBy: certData.authorizedBy || 'Rev. Dr. L. H. Rohmingliana (Principal)',
      ...certData
    };

    setIssuedCertificates(prev => [newCert, ...prev]);
    return { success: true, certificate: newCert };
  };

  const revokeCertificate = (certId, reason = 'Revoked by Principal') => {
    setIssuedCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'revoked', revokeReason: reason } : c));
    return { success: true };
  };

  const deleteCertificate = (certId) => {
    setIssuedCertificates(prev => prev.filter(c => c.id !== certId));
    return { success: true };
  };

  // ── PUSH NOTIFICATIONS & REAL-TIME IN-APP MESSAGING ───────────────────────
  const requestPushPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch { return false; }
    }
    return false;
  };

  const triggerNativePush = (title, body, icon = '/icons.svg') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200]
        });
      } catch (e) {
        console.warn('Native push notice:', e);
      }
    }
  };

  // Real-time Firestore synchronizer for in-application notices & alerts
  useEffect(() => {
    if (!db || !isLiveFirebaseConfigured) return;
    try {
      const q = query(collection(db, 'notices'), orderBy('publishedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const cloudNotices = [];
          snapshot.forEach(docSnap => {
            cloudNotices.push({ id: docSnap.id, ...docSnap.data() });
          });

          setNotices(prev => {
            const map = new Map();
            cloudNotices.forEach(n => map.set(n.id, n));
            prev.forEach(n => {
              if (!map.has(n.id)) map.set(n.id, n);
            });
            const merged = Array.from(map.values()).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
            localStorage.setItem('zoxs_notices', JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => {
        console.warn('Firestore notices onSnapshot notice:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Real-time notices listener setup note:', e);
    }
  }, [db]);

  // 7. Notice Board, Broadcasts & Private Notifications
  const publishNotice = (noticeData) => {
    const newNotice = {
      id: `not-${Date.now()}`,
      scope: noticeData.scope || 'broadcast',
      title: noticeData.title,
      content: noticeData.content,
      category: noticeData.category || 'general',
      priority: noticeData.priority || 'normal',
      targetAudience: noticeData.targetAudience || 'all',
      targetClassId: noticeData.targetClassId || null,
      targetUserId: noticeData.targetUserId || null,
      targetUserName: noticeData.targetUserName || null,
      recipientRole: noticeData.recipientRole || null,
      senderId: noticeData.senderId || null,
      publishedBy: noticeData.publishedBy || 'School Administration',
      publishedAt: new Date().toISOString(),
      isPinned: Boolean(noticeData.isPinned),
      channels: noticeData.channels || { inApp: true, whatsapp: false, push: true, sms: false },
      readBy: noticeData.readBy || []
    };

    setNotices(prev => [newNotice, ...prev]);

    // Push to Firestore in real-time if connected
    if (db) {
      setDoc(doc(db, 'notices', newNotice.id), newNotice).catch(e => {
        console.warn('Firestore notice push note:', e);
      });
    }

    if (window.campusBellEngine && noticeData.priority === 'urgent') {
      try { window.campusBellEngine.playChime(); } catch(e){}
    }

    // Trigger native desktop/mobile push notification
    triggerNativePush(`[ZOXS] ${newNotice.title}`, newNotice.content);

    return newNotice;
  };

  const sendPrivateNotification = (pvtData) => {
    return publishNotice({
      ...pvtData,
      scope: 'private',
      targetAudience: 'individual'
    });
  };

  const markNotificationAsRead = (noticeId, userId) => {
    if (!userId) return;
    setNotices(prev => prev.map(n => {
      if (n.id === noticeId) {
        const currentRead = n.readBy || [];
        if (!currentRead.includes(userId)) {
          return { ...n, readBy: [...currentRead, userId] };
        }
      }
      return n;
    }));
  };

  const markAllNotificationsAsRead = (userId) => {
    if (!userId) return;
    setNotices(prev => prev.map(n => {
      const currentRead = n.readBy || [];
      if (!currentRead.includes(userId)) {
        return { ...n, readBy: [...currentRead, userId] };
      }
      return n;
    }));
  };

  const deleteNotice = (noticeId) => {
    setNotices(prev => prev.filter(n => n.id !== noticeId));
    return { success: true };
  };

  // 7c. Institutional Action Tasks & Directives Suite
  const createTask = (taskData) => {
    const newTask = {
      id: `tsk-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      assignedToRole: taskData.assignedToRole || 'all',
      assignedToUserId: taskData.assignedToUserId || null,
      assignedBy: taskData.assignedBy || 'School Administration',
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: taskData.priority || 'normal',
      status: 'pending',
      category: taskData.category || 'academic',
      actionLinkTab: taskData.actionLinkTab || null,
      actionLabel: taskData.actionLabel || 'View Action',
      createdAt: new Date().toISOString(),
      completedAt: null,
      completedBy: null
    };

    setTasks(prev => [newTask, ...prev]);

    // Automatically trigger in-app notification to the assigned user/role
    if (taskData.notifyAssignee !== false) {
      publishNotice({
        title: `Task Directive: ${newTask.title}`,
        content: `Mawhphurna / Directive thar pek i ni: "${newTask.title}". Deadline: ${newTask.dueDate}. Priority: ${newTask.priority.toUpperCase()}. By: ${newTask.assignedBy}.`,
        category: newTask.category,
        priority: newTask.priority === 'urgent' ? 'urgent' : 'normal',
        targetAudience: newTask.assignedToRole === 'all' ? 'all' : 'individual',
        recipientRole: newTask.assignedToRole,
        targetUserId: newTask.assignedToUserId,
        publishedBy: newTask.assignedBy,
        scope: newTask.assignedToRole === 'all' ? 'broadcast' : 'private'
      });
    }

    return newTask;
  };

  const updateTaskStatus = (taskId, newStatus, completedByName = null) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          completedBy: newStatus === 'completed' ? completedByName : null
        };
      }
      return t;
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return { success: true };
  };

  // 7b. Online Student & Staff Leave Applications Suite (Class Master, VP, Principal Review)
  const applyForLeave = (data) => {
    const leaveId = `leave-${Date.now().toString().slice(-5)}`;
    const applicationNo = `LA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

    const newLeave = {
      id: leaveId,
      applicationNo,
      studentId: data.studentId,
      studentName: data.studentName,
      rollNo: data.rollNo || 'N/A',
      classId: data.classId,
      className: data.className || 'General',
      classTeacherName: data.classTeacherName || 'Class Master',
      applicantType: data.applicantType || 'student',
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone || '',
      leaveType: data.leaveType || 'medical',
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays || 1,
      reason: data.reason,
      documentName: data.documentName || null,
      documentUrl: data.documentUrl || null,
      status: 'pending_class_master',
      classMasterReview: {
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        remarks: ''
      },
      vicePrincipalReview: {
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        remarks: ''
      },
      principalReview: {
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        remarks: ''
      },
      finalDecision: 'pending',
      submittedAt: new Date().toISOString(),
      auditTrail: [
        {
          action: 'Online Leave Application Submitted',
          by: data.applicantName || 'Applicant',
          timestamp: new Date().toLocaleString()
        }
      ]
    };

    setLeaveApplications(prev => [newLeave, ...prev]);

    // Send private notification to class teacher & administration
    sendPrivateNotification({
      title: `Chawlh Dil Thar: ${data.studentName} (${data.className})`,
      content: `${data.applicantName}-in ${data.totalDays} days leave (${data.startDate} to ${data.endDate}) dilna a thehlut e: "${data.reason}". Class Master, Vice Principal leh Principal te endik turin a awm.`,
      category: 'general',
      priority: 'urgent',
      targetAudience: 'individual',
      targetUserId: data.classTeacherId || 'stf-002',
      targetUserName: data.classTeacherName || 'Class Master',
      recipientRole: 'teacher',
      senderId: data.studentId,
      publishedBy: data.applicantName,
      channels: { inApp: true, whatsapp: true, push: true, sms: false }
    });

    return newLeave;
  };

  const reviewLeaveApplication = (leaveId, { reviewerRole, reviewerName, decision, remarks }) => {
    setLeaveApplications(prev => prev.map(leave => {
      if (leave.id !== leaveId) return leave;

      const updated = { ...leave };
      const now = new Date().toISOString();
      const timeStr = new Date().toLocaleString();

      if (reviewerRole === 'class_master' || reviewerRole === 'teacher') {
        updated.classMasterReview = {
          status: decision,
          reviewedBy: reviewerName,
          reviewedAt: now,
          remarks: remarks || ''
        };
        if (decision === 'approved' || decision === 'recommended') {
          updated.status = 'pending_principal';
          updated.auditTrail = [
            ...updated.auditTrail,
            { action: `Reviewed & ${decision === 'approved' ? 'Approved' : 'Recommended'} by Class Master`, by: reviewerName, timestamp: timeStr, notes: remarks }
          ];
        } else if (decision === 'rejected') {
          updated.status = 'rejected';
          updated.finalDecision = 'rejected';
          updated.auditTrail = [
            ...updated.auditTrail,
            { action: 'Rejected by Class Master', by: reviewerName, timestamp: timeStr, notes: remarks }
          ];
        }
      } else if (reviewerRole === 'vice_principal') {
        updated.vicePrincipalReview = {
          status: decision,
          reviewedBy: reviewerName,
          reviewedAt: now,
          remarks: remarks || ''
        };
        if (decision === 'approved' || decision === 'endorsed') {
          updated.status = 'pending_principal';
          updated.auditTrail = [
            ...updated.auditTrail,
            { action: 'Endorsed by Vice Principal', by: reviewerName, timestamp: timeStr, notes: remarks }
          ];
        } else if (decision === 'rejected') {
          updated.status = 'rejected';
          updated.finalDecision = 'rejected';
          updated.auditTrail = [
            ...updated.auditTrail,
            { action: 'Rejected by Vice Principal', by: reviewerName, timestamp: timeStr, notes: remarks }
          ];
        }
      } else if (reviewerRole === 'principal' || reviewerRole === 'superadmin') {
        updated.principalReview = {
          status: decision,
          reviewedBy: reviewerName,
          reviewedAt: now,
          remarks: remarks || ''
        };
        updated.status = decision;
        updated.finalDecision = decision;
        updated.auditTrail = [
          ...updated.auditTrail,
          { action: `Executive Decision by Principal (${decision.toUpperCase()})`, by: reviewerName, timestamp: timeStr, notes: remarks }
        ];

        // If approved, auto-mark student attendance as excused/on-leave!
        if (decision === 'approved') {
          try {
            const start = new Date(updated.startDate);
            const end = new Date(updated.endDate);
            const datesToMark = [];
            for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
              datesToMark.push(new Date(dt).toISOString().split('T')[0]);
            }

            setAttendance(prevAtt => {
              let updatedAtt = [...prevAtt];
              datesToMark.forEach(dStr => {
                const existingIdx = updatedAtt.findIndex(a => a.studentId === updated.studentId && a.date === dStr);
                if (existingIdx >= 0) {
                  updatedAtt[existingIdx] = {
                    ...updatedAtt[existingIdx],
                    status: 'excused',
                    remarks: `Official Leave: ${updated.leaveType} (${updated.applicationNo})`,
                    scanMethod: 'approved_leave',
                    scannedBy: reviewerName
                  };
                } else {
                  updatedAtt.push({
                    id: `att-leave-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
                    studentId: updated.studentId,
                    classId: updated.classId,
                    date: dStr,
                    status: 'excused',
                    remarks: `Official Leave: ${updated.leaveType} (${updated.applicationNo})`,
                    scanMethod: 'approved_leave',
                    scannedBy: reviewerName,
                    timestamp: new Date().toISOString()
                  });
                }
              });
              return updatedAtt;
            });
          } catch(e) {
            console.warn('Attendance auto-sync error:', e);
          }

          // Dispatched Private Notification to student/parent
          sendPrivateNotification({
            title: `Chawlh Dilna Pawm A Ni E (Approved: ${updated.applicationNo})`,
            content: `Dear ${updated.studentName}, i chawlh dilna ni ${updated.startDate} atanga ni ${updated.endDate} (${updated.totalDays} days) chhung chu Class Master leh Principal ten an pawm fel ta e. Attendance-ah "Excused Leave" tiin a in-record nghal.`,
            category: 'general',
            priority: 'normal',
            targetAudience: 'individual',
            targetUserId: updated.studentId,
            targetUserName: `${updated.studentName} (${updated.className})`,
            recipientRole: 'student',
            senderId: 'principal',
            publishedBy: reviewerName || 'Principal Rev. Dr. L. H. Rohmingliana',
            channels: { inApp: true, whatsapp: true, push: true, sms: true }
          });
        }
      }

      return updated;
    }));
  };

  const deleteLeaveApplication = (leaveId) => {
    setLeaveApplications(prev => prev.filter(l => l.id !== leaveId));
    return { success: true };
  };

  // 8. Transport & Hostel assignments
  const assignTransport = (studentId, routeId) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, transportRouteId: routeId } : s));
    setTransportRoutes(prev => prev.map(r => {
      const filtered = r.enrolledStudents.filter(id => id !== studentId);
      if (r.id === routeId) {
        return { ...r, enrolledStudents: [...filtered, studentId] };
      }
      return { ...r, enrolledStudents: filtered };
    }));
  };

  const assignHostel = (studentId, roomId) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hostelRoomId: roomId } : s));
    setHostelRooms(prev => prev.map(room => {
      const filtered = room.enrolledStudents.filter(id => id !== studentId);
      if (room.id === roomId) {
        return { ...room, enrolledStudents: [...filtered, studentId], occupiedBeds: Math.min(room.capacity, filtered.length + 1) };
      }
      return { ...room, enrolledStudents: filtered, occupiedBeds: filtered.length };
    }));
  };

  // Helper to extract table headers & rows for all 10 institutional collections
  const getCollectionExportData = (dataType) => {
    let headers = [];
    let rows = [];

    if (dataType === 'students') {
      headers = ['Admission No', 'Roll No', 'Full Name', 'Class ID', 'Stream', 'Gender', 'Guardian', 'Phone', 'Fee Status', 'Attendance %'];
      rows = (students || []).map(s => [
        s.admissionNo, s.rollNo, `${s.firstName} ${s.lastName}`, s.classId, s.stream || 'N/A', s.gender, s.guardianName, s.guardianPhone, s.feeStatus, `${s.attendanceRate}%`
      ]);
    } else if (dataType === 'financials') {
      headers = ['Receipt No', 'Date', 'Student Name', 'Admission No', 'Payment Mode', 'Amount (INR)', 'Fee Type', 'UTR/Ref', 'Cashier'];
      rows = (fees || []).map(f => [
        f.receiptNo, f.paymentDate, f.studentName, f.admissionNo, (f.paymentMode || '').toUpperCase(), f.amount, f.feeType, f.transactionUtr || 'N/A', f.cashierName || 'N/A'
      ]);
    } else if (dataType === 'grades') {
      headers = ['Student ID', 'Class', 'Subject', 'Assessment Type', 'Test/Exam Title', 'Max Marks', 'Marks Obtained', 'Percentage', 'Remarks'];
      rows = (grades || []).map(g => [
        g.studentId, g.classId, g.subject, g.type === 'class_test' ? 'Class Test (Continuous)' : 'Term Examination', g.testName, g.maxMarks, g.marksObtained, `${((g.marksObtained / (g.maxMarks || 100)) * 100).toFixed(1)}%`, g.remarks || ''
      ]);
    } else if (dataType === 'staff') {
      headers = ['Employee ID', 'Name', 'Role', 'Department', 'Phone', 'Email', 'Base Salary', 'Status'];
      rows = (staff || []).map(st => [
        st.id, st.name, st.role, st.department || 'N/A', st.phone, st.email, st.baseSalary || 0, st.status || 'Active'
      ]);
    } else if (dataType === 'attendance') {
      headers = ['Student ID', 'Student Name', 'Date', 'Status', 'Session', 'Verified By'];
      rows = (attendance || []).map(a => [
        a.studentId, a.studentName || 'N/A', a.date, a.status, a.session || 'Full Day', a.verifiedBy || 'QR Cam'
      ]);
    } else if (dataType === 'clinic') {
      headers = ['Visit ID', 'Student Name', 'Class', 'Time', 'Complaint', 'Temperature (°F)', 'BP', 'Pulse', 'SpO2 (%)', 'Bed Allotted', 'Status'];
      rows = (clinicRecords || []).map(c => [
        c.id, c.studentName, c.classId, c.time, c.complaint, c.vitals?.temp || 'Normal', c.vitals?.bp || 'Normal', c.vitals?.pulse || 'Normal', `${c.vitals?.spo2 || 98}%`, c.bedAllotted || 'None', c.status
      ]);
    } else if (dataType === 'visitors') {
      headers = ['Pass ID', 'Visitor Name', 'Phone', 'Purpose', 'Host Staff', 'Vehicle No', 'Entry Time', 'Exit Time', 'Status'];
      rows = (visitors || []).map(v => [
        v.id, v.name, v.phone, v.purpose, v.hostFaculty, v.vehicleNumber || 'Pedestrian', v.entryTime, v.exitTime || 'Inside', v.status
      ]);
    } else if (dataType === 'inventory') {
      headers = ['Asset ID', 'Item Name', 'Category', 'Quantity', 'Unit Cost (INR)', 'Condition', 'Custodian', 'Location'];
      rows = (inventoryAssets || []).map(inv => [
        inv.id, inv.name, inv.category, inv.quantity, inv.costPerUnit || 0, inv.condition, inv.custodian || 'School Lab', inv.location
      ]);
    } else if (dataType === 'canteen') {
      headers = ['Tx ID', 'Student Name', 'Admission No', 'Amount (INR)', 'Type', 'Timestamp', 'Balance After'];
      rows = (canteenTransactions || []).map(tx => [
        tx.id, tx.studentName, tx.admissionNo, tx.amount, tx.type, tx.timestamp, tx.balanceAfter || 0
      ]);
    } else if (dataType === 'admissions') {
      headers = ['App ID', 'Applicant Name', 'Applying For', 'Previous School', 'Marks %', 'Guardian', 'Phone', 'Status', 'Applied Date'];
      rows = (admissions || []).map(adm => [
        adm.id, `${adm.firstName} ${adm.lastName}`, adm.applyingClass, adm.previousSchool || 'N/A', `${adm.previousPercentage || 0}%`, adm.guardianName, adm.guardianPhone, adm.status, adm.appliedDate
      ]);
    }

    return { headers, rows };
  };

  // 9. Data Exporter (CSV and Excel formats)
  const exportDataToCSV = (dataType) => {
    const { headers, rows } = getCollectionExportData(dataType);
    const filename = `mizoram_school_${dataType}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Add UTF-8 BOM so Excel opens Mizo characters properly
    const csvContent = '\uFEFF' + [
      headers.join(','), 
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDataToExcel = (dataType) => {
    const { headers, rows } = getCollectionExportData(dataType);
    const filename = `mizoram_school_${dataType}_${new Date().toISOString().split('T')[0]}.xls`;

    // Standard HTML-based Excel spreadsheet
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${dataType.toUpperCase()}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          th { background-color: #0284c7; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; }
          td { border: 1px solid #e2e8f0; padding: 6px; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 10. Class Routine / Time Table Management
  const updateTimeTableSlot = (classId, day, periodIndex, updatedSlot) => {
    setTimetables(prev => {
      const classSchedule = prev[classId] || {};
      const daySchedule = [...(classSchedule[day] || [])];
      daySchedule[periodIndex] = { ...daySchedule[periodIndex], ...updatedSlot };

      return {
        ...prev,
        [classId]: {
          ...classSchedule,
          [day]: daySchedule
        }
      };
    });
  };

  // 10b. Exam Routine & Date-Sheet Management (Principal & Vice Principal Executive Authority)
  const addExamRoutineSlot = (classId, examData) => {
    const newSlot = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      status: 'scheduled',
      ...examData
    };
    setExamRoutines(prev => {
      const classExams = prev[classId] || [];
      const updated = {
        ...prev,
        [classId]: [...classExams, newSlot]
      };
      try { localStorage.setItem('zoxs_exam_routines', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return newSlot;
  };

  const updateExamRoutineSlot = (classId, examId, updatedData) => {
    setExamRoutines(prev => {
      const classExams = prev[classId] || [];
      const updatedList = classExams.map(item => item.id === examId ? { ...item, ...updatedData } : item);
      const updated = {
        ...prev,
        [classId]: updatedList
      };
      try { localStorage.setItem('zoxs_exam_routines', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteExamRoutineSlot = (classId, examId) => {
    setExamRoutines(prev => {
      const classExams = prev[classId] || [];
      const updatedList = classExams.filter(item => item.id !== examId);
      const updated = {
        ...prev,
        [classId]: updatedList
      };
      try { localStorage.setItem('zoxs_exam_routines', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const publishExamRoutineNotice = (classId, term, publisherName = 'Principal & Vice Principal Council') => {
    const targetCls = classes.find(c => c.id === classId);
    const clsName = targetCls?.name || 'All Classes';
    const classExams = (examRoutines[classId] || []).filter(e => !term || e.term === term);

    if (classExams.length === 0) {
      return { success: false, error: 'He class tan hian exam routine ziah a la awm rih lo.' };
    }

    const examDatesStr = classExams
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => `• ${e.date} (${e.day}): ${e.subject} [${e.time}] - Room ${e.room} (Invigilator: ${e.invigilator || 'Faculty In-Charge'})`)
      .join('\n');

    const newNotice = {
      id: `ntc-exam-${Date.now()}`,
      title: `MBSE Official Exam Routine: ${clsName} (${term || 'Session 2026-2027'})`,
      content: `Hriattirna: ${clsName} zirlai leh nu/pa zawng zawngte hriat atan ${term || 'Examination'} routine official a chhuak ta e.\n\n${examDatesStr}\n\nCandidate zawng zawng ten admit card leh ID card kengin exam ṭan hma minute 15 ah room thlen fel vek tur a ni e.\n— ${publisherName}`,
      date: new Date().toISOString().split('T')[0],
      priority: 'high',
      category: 'Exam',
      targetAudience: 'all',
      targetClassId: classId,
      publishedBy: publisherName,
      readBy: [],
      scope: 'public'
    };

    setNotices(prev => [newNotice, ...prev]);
    return { success: true, notice: newNotice };
  };

  // 11. In-App Developer Studio & Extension Management Actions
  const saveCustomScripts = (newScripts) => {
    setCustomScripts(prev => ({ ...prev, ...newScripts }));
    return { success: true, message: 'Custom scripts saved and applied.' };
  };

  const togglePlugin = (pluginId) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const updated = { ...p, enabled: !p.enabled };
        if (updated.enabled && updated.script) {
          try {
            new Function(updated.script)();
          } catch (e) {
            console.warn(`Plugin execution warning for ${p.name}:`, e);
          }
        }
        return updated;
      }
      return p;
    }));
  };

  const addPlugin = (newPlugin) => {
    const pluginToAdd = {
      id: `plugin-custom-${Date.now()}`,
      version: '1.0.0',
      enabled: true,
      category: 'Custom Extensions',
      loadTiming: 'async',
      scope: 'all',
      config: {},
      ...newPlugin
    };
    setPlugins(prev => [pluginToAdd, ...prev]);
    return pluginToAdd;
  };

  const updatePlugin = (pluginId, updatedData) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const merged = { ...p, ...updatedData };
        if (merged.enabled && merged.script) {
          try {
            new Function('config', 'context', merged.script)(merged.config || {}, { classes, students, systemConfig });
          } catch (e) {
            console.warn(`Plugin execution warning for ${merged.name}:`, e);
          }
        }
        return merged;
      }
      return p;
    }));
    return { success: true };
  };

  const deletePlugin = (pluginId) => {
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
    // Clean up DOM tags if any
    const scriptEl = document.getElementById(`zoxs-cdn-${pluginId}`);
    if (scriptEl) scriptEl.remove();
    const cssEl = document.getElementById(`zoxs-css-${pluginId}`);
    if (cssEl) cssEl.remove();
    return { success: true };
  };

  const resetPluginConfig = (pluginId) => {
    const defaultPlugin = INITIAL_SYSTEM_PLUGINS.find(p => p.id === pluginId);
    if (defaultPlugin) {
      updatePlugin(pluginId, defaultPlugin);
    }
  };

  const updateSystemConfig = (newConfig) => {
    setSystemConfig(prev => ({ ...prev, ...newConfig }));
  };

  // 1-on-1 Private Call State (Video & Voice)
  const [activePrivateCall, setActivePrivateCall] = useState(null); // { user, type }
  const startPrivateCall = (targetUser, callType = 'video') => {
    setActivePrivateCall({ user: targetUser, type: callType });
  };
  const endPrivateCall = () => {
    setActivePrivateCall(null);
  };

  const updateLiveMediaConfig = (partial) => {
    setLiveMediaConfig(prev => {
      const updated = {
        ...prev,
        ...partial,
        audio: { ...(prev?.audio || {}), ...(partial?.audio || {}) },
        webrtc: { ...(prev?.webrtc || {}), ...(partial?.webrtc || {}) },
        broadcast: { ...(prev?.broadcast || {}), ...(partial?.broadcast || {}) },
        chat: { ...(prev?.chat || {}), ...(partial?.chat || {}) },
        agora: { ...(prev?.agora || {}), ...(partial?.agora || {}) },
        livekit: { ...(prev?.livekit || {}), ...(partial?.livekit || {}) },
        conference: { ...(prev?.conference || {}), ...(partial?.conference || {}) },
        privateCall: { ...(prev?.privateCall || {}), ...(partial?.privateCall || {}) }
      };
      localStorage.setItem('zoxs_live_media_config', JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Live communication configuration updated successfully!' };
  };

  const resetLiveMediaConfig = () => {
    setLiveMediaConfig(INITIAL_LIVE_MEDIA_CONFIG);
    localStorage.setItem('zoxs_live_media_config', JSON.stringify(INITIAL_LIVE_MEDIA_CONFIG));
    return { success: true, message: 'Live media configuration reset to defaults.' };
  };

  // 15. Class Teacher Live Video, Streaming & Online Tuition Governance Suite
  // (Vice Principal & Principal Gatekeeping & Approval Architecture)
  const requestLiveSession = (sessionData) => {
    const newSession = {
      id: `ls-${Date.now().toString().slice(-6)}`,
      title: sessionData.title || 'Online Live Academic Class',
      classId: sessionData.classId || 'cls-12-sci',
      className: sessionData.className || 'Class 12 Science',
      subject: sessionData.subject || 'General Studies',
      teacherId: sessionData.teacherId || 'stf-001',
      teacherName: sessionData.teacherName || 'Faculty Member',
      sessionType: sessionData.sessionType || 'live_class', // 'live_class' | 'live_stream' | 'live_tuition'
      mediaMode: sessionData.mediaMode || 'video_interactive', // 'video_interactive' | 'broadcast_stream' | 'voice_tuition'
      scheduledDate: sessionData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: sessionData.scheduledTime || '06:00 PM - 07:00 PM',
      durationMinutes: Number(sessionData.durationMinutes) || 60,
      targetGroup: sessionData.targetGroup || 'All Class Students',
      agenda: sessionData.agenda || '',
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'live' | 'completed'
      approvedBy: null,
      approvedAt: null,
      approvalRemarks: null,
      requestedAt: new Date().toLocaleString(),
      ...sessionData
    };

    setLiveSessionRequests(prev => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist live session requests', e);
      }
      return updated;
    });

    // Notify Vice Principal and Principal immediately
    sendPrivateNotification({
      title: `Live Session Dilna Thar: ${newSession.teacherName} (${newSession.className})`,
      content: `${newSession.teacherName}-in ${newSession.className} tan ${newSession.sessionType === 'live_tuition' ? 'Online Tuition' : newSession.sessionType === 'live_stream' ? 'Live Streaming' : 'Live Video Class'} (${newSession.subject}) buatsaih dilna a thehlut e. Hun: ${newSession.scheduledDate} ${newSession.scheduledTime}. Vice Principal leh Principal approve veleh chauh a kaltlangpui theih ang.`,
      category: 'general',
      priority: 'urgent',
      targetAudience: 'role',
      recipientRole: 'principal',
      senderId: newSession.teacherId,
      publishedBy: newSession.teacherName,
      channels: { inApp: true, whatsapp: false, push: true, sms: false }
    });

    return { success: true, session: newSession };
  };

  const approveLiveSession = (sessionId, approverName = 'Principal / Vice Principal', remarks = '') => {
    let approvedSession = null;
    setLiveSessionRequests(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          approvedSession = {
            ...s,
            status: 'approved',
            approvedBy: approverName,
            approvedAt: new Date().toLocaleString(),
            approvalRemarks: remarks || 'Approved by Administration for academic execution.'
          };
          return approvedSession;
        }
        return s;
      });
      try {
        localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist live session requests', e);
      }
      return updated;
    });

    if (approvedSession) {
      // 1. Notify the Class Teacher
      sendPrivateNotification({
        title: `Live Session Dilna Pawm A Ni: ${approvedSession.title}`,
        content: `Chibai ${approvedSession.teacherName}, ${approvedSession.className} tana i ${approvedSession.sessionType === 'live_tuition' ? 'Tuition' : 'Live Class'} dilna kha ${approverName}-in a pawmpui (approve) ta e. I start thei ta e. Remarks: "${remarks || 'All clear'}".`,
        category: 'general',
        priority: 'high',
        targetAudience: 'individual',
        targetUserId: approvedSession.teacherId,
        targetUserName: approvedSession.teacherName,
        recipientRole: 'teacher',
        publishedBy: approverName,
        channels: { inApp: true, whatsapp: true, push: true, sms: false }
      });

      // 2. Publish Official Notice to Students & Parents of that Class
      publishNotice({
        title: `🔴 Sanctioned Live Session: ${approvedSession.title}`,
        content: `${approvedSession.className} zirlai leh nu&pa zawng zawng te hriattir in ni e. Vice Principal & Principal phalsakna in ${approvedSession.subject} ${approvedSession.sessionType === 'live_tuition' ? 'Online Video/Voice Tuition' : 'Online Live Video Class'} a awm dawn e.\n\n📅 Tarik: ${approvedSession.scheduledDate}\n⏰ Hun: ${approvedSession.scheduledTime}\n👨‍🏫 Zirtirtu: ${approvedSession.teacherName}\n🎯 Target: ${approvedSession.targetGroup || 'All Class Students'}\n📋 Topic: ${approvedSession.agenda || 'Syllabus coverage & doubts'}\n\nStudent Portal atangin direct-in join theih a ni ang.`,
        category: 'academic',
        priority: 'high',
        targetAudience: 'class',
        targetClassId: approvedSession.classId,
        publishedBy: `${approverName} / ${approvedSession.teacherName}`
      });

      // 3. If specific students are selected (e.g. Remedial / Tuition batch), notify each selected student directly
      if (Array.isArray(approvedSession.selectedStudentIds) && approvedSession.selectedStudentIds.length > 0) {
        approvedSession.selectedStudentIds.forEach(stuId => {
          sendPrivateNotification({
            title: `🎯 Live Class/Tuition Thlan Bik: ${approvedSession.title}`,
            content: `I zirtirtu ${approvedSession.teacherName}-in ${approvedSession.subject} ${approvedSession.sessionType === 'live_tuition' ? 'Tuition / Coaching' : 'Live Class'} atan a thlang che a, Vice Principal/Principal-in an pawm e. Hun: ${approvedSession.scheduledDate} ${approvedSession.scheduledTime}. Khawngaihin join ngei ang che.`,
            category: 'academic',
            priority: 'urgent',
            targetAudience: 'individual',
            targetUserId: stuId,
            recipientRole: 'student',
            publishedBy: approvedSession.teacherName,
            channels: { inApp: true, whatsapp: true, push: true, sms: true }
          });
        });
      }
    }

    return { success: true };
  };

  const rejectLiveSession = (sessionId, rejecterName = 'Principal / Vice Principal', reason = '') => {
    let rejectedSession = null;
    setLiveSessionRequests(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          rejectedSession = {
            ...s,
            status: 'rejected',
            rejectedBy: rejecterName,
            rejectedAt: new Date().toLocaleString(),
            rejectionReason: reason || 'Kindly reschedule or modify timings.'
          };
          return rejectedSession;
        }
        return s;
      });
      try {
        localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist live session requests', e);
      }
      return updated;
    });

    if (rejectedSession) {
      sendPrivateNotification({
        title: `Live Session Dilna Hnawl / Sawn A Ni: ${rejectedSession.title}`,
        content: `Dear ${rejectedSession.teacherName}, i ${rejectedSession.className} live class/tuition dilna kha ${rejecterName}-in a pawm rih lo / hun sawn a ngen e. Chhan: "${reason || 'Schedule collision or timing adjustment needed'}". I edit a i re-submit leh thei e.`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: rejectedSession.teacherId,
        targetUserName: rejectedSession.teacherName,
        recipientRole: 'teacher',
        publishedBy: rejecterName,
        channels: { inApp: true, whatsapp: false, push: true, sms: false }
      });
    }

    return { success: true };
  };

  const startLiveSession = (sessionId) => {
    setLiveSessionRequests(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, status: 'live', startedAt: new Date().toLocaleString() } : s);
      try { localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    return { success: true };
  };

  const endLiveSession = (sessionId) => {
    setLiveSessionRequests(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, status: 'completed', endedAt: new Date().toLocaleString() } : s);
      try { localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    return { success: true };
  };

  const deleteLiveSession = (sessionId) => {
    setLiveSessionRequests(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      try { localStorage.setItem('zoxs_live_session_requests', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    return { success: true };
  };

  // Universal In-App Database / Collection CRUD
  const updateCollectionRecord = (collectionKey, recordId, updatedFields) => {
    const updaterMap = {
      students: setStudents,
      classes: setClasses,
      fees: setFees,
      grades: setGrades,
      staff: setStaff,
      payroll: setPayroll,
      library_books: setLibraryBooks,
      notices: setNotices,
      admissions: setAdmissions,
      transport_routes: setTransportRoutes,
      hostel_rooms: setHostelRooms
    };

    const updater = updaterMap[collectionKey];
    if (updater) {
      updater(prev => prev.map(item => item.id === recordId ? { ...item, ...updatedFields } : item));
      return { success: true };
    }
    return { success: false, error: 'Collection not found' };
  };

  const addCollectionRecord = (collectionKey, newRecord) => {
    const updaterMap = {
      students: setStudents,
      classes: setClasses,
      fees: setFees,
      grades: setGrades,
      staff: setStaff,
      payroll: setPayroll,
      library_books: setLibraryBooks,
      notices: setNotices,
      admissions: setAdmissions,
      transport_routes: setTransportRoutes,
      hostel_rooms: setHostelRooms
    };

    const updater = updaterMap[collectionKey];
    if (updater) {
      const recordWithId = { id: newRecord.id || `${collectionKey.slice(0, 3)}-${Date.now()}`, ...newRecord };
      updater(prev => [recordWithId, ...prev]);
      return { success: true, record: recordWithId };
    }
    return { success: false, error: 'Collection not found' };
  };

  const deleteCollectionRecord = (collectionKey, recordId) => {
    const updaterMap = {
      students: setStudents,
      classes: setClasses,
      fees: setFees,
      grades: setGrades,
      staff: setStaff,
      payroll: setPayroll,
      library_books: setLibraryBooks,
      notices: setNotices,
      admissions: setAdmissions,
      transport_routes: setTransportRoutes,
      hostel_rooms: setHostelRooms
    };

    const updater = updaterMap[collectionKey];
    if (updater) {
      updater(prev => prev.filter(item => item.id !== recordId));
      return { success: true };
    }
    return { success: false, error: 'Collection not found' };
  };

  // Full Database Snapshot Export & Restore
  const exportDatabaseSnapshot = () => {
    const snapshot = {
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      classes,
      students,
      grades,
      fees,
      attendance,
      staff,
      payroll,
      libraryBooks,
      notices,
      admissions,
      transportRoutes,
      hostelRooms,
      timetables,
      customScripts,
      plugins,
      systemConfig
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoxs-school-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreDatabaseSnapshot = (snapshotData) => {
    try {
      if (snapshotData.classes) setClasses(snapshotData.classes);
      if (snapshotData.students) setStudents(snapshotData.students);
      if (snapshotData.grades) setGrades(snapshotData.grades);
      if (snapshotData.fees) setFees(snapshotData.fees);
      if (snapshotData.attendance) setAttendance(snapshotData.attendance);
      if (snapshotData.staff) setStaff(snapshotData.staff);
      if (snapshotData.payroll) setPayroll(snapshotData.payroll);
      if (snapshotData.libraryBooks) setLibraryBooks(snapshotData.libraryBooks);
      if (snapshotData.notices) setNotices(snapshotData.notices);
      if (snapshotData.admissions) setAdmissions(snapshotData.admissions);
      if (snapshotData.transportRoutes) setTransportRoutes(snapshotData.transportRoutes);
      if (snapshotData.hostelRooms) setHostelRooms(snapshotData.hostelRooms);
      if (snapshotData.timetables) setTimetables(snapshotData.timetables);
      if (snapshotData.customScripts) setCustomScripts(snapshotData.customScripts);
      if (snapshotData.plugins) setPlugins(snapshotData.plugins);
      if (snapshotData.systemConfig) setSystemConfig(snapshotData.systemConfig);
      return { success: true, message: 'Snapshot successfully restored!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Initializes the active school as a clean, real institutional portal.
   * Clears all dummy mock data (students, grades, fees, admissions) so the
   * Principal and Admin can start fresh with real records.
   * Works for ANY registered school — reads from activeSchoolInfo dynamically.
   */
  const initializeCleanSchool = () => {
    const activePrefix = `zoxs_${activeSchoolId}_`;
    const info = activeSchoolInfo || {};
    const schoolName = info.name || 'School';
    const address = info.address || 'Mizoram, India';
    const phone = info.contactPhone || '';
    const email = info.contactEmail || '';
    const motto = info.motto || 'Excellence in Education';

    // Clear out dummy mock records
    setStudents([]);
    localStorage.setItem(`${activePrefix}students`, JSON.stringify([]));

    setFees([]);
    localStorage.setItem(`${activePrefix}fees`, JSON.stringify([]));

    setGrades([]);
    localStorage.setItem(`${activePrefix}grades`, JSON.stringify([]));

    setAdmissions([]);
    localStorage.setItem(`${activePrefix}admissions`, JSON.stringify([]));

    setAttendance([]);
    localStorage.setItem(`${activePrefix}attendance`, JSON.stringify([]));

    setLeaveApplications([]);
    localStorage.setItem(`${activePrefix}leave_applications`, JSON.stringify([]));

    // Apply clean institutional system config using this school's registered metadata
    const cleanSystemConfig = {
      ...systemConfig,
      schoolName,
      motto,
      address,
      contactPhone: phone,
      contactEmail: email,
      academicSession: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
      enableOnlineAdmissions: true,
      enableUpiPayments: true,
      enableSmsNotifications: true,
      enableHostelModule: true,
      enableTransportModule: true
    };
    setSystemConfig(cleanSystemConfig);
    localStorage.setItem(`${activePrefix}system_config`, JSON.stringify(cleanSystemConfig));

    // Apply clean website config
    const cleanWebsiteConfig = {
      ...websiteConfig,
      schoolName,
      tagline: info.affiliationBadge || 'MBSE Affiliated',
      motto,
      address,
      phone,
      email,
      hero: {
        ...(websiteConfig.hero || {}),
        headline: `Welcome to ${schoolName}`,
        subheadline: `${info.affiliationBadge || 'MBSE Affiliated'} — ${address}`
      },
      principalMessage: {
        ...(websiteConfig.principalMessage || {}),
        principalDesignation: `Principal, ${schoolName}`,
        fullMessage: websiteConfig.principalMessage?.fullMessage || `Welcome to ${schoolName}'s official digital portal. We are committed to academic excellence and holistic student development.`
      }
    };
    setWebsiteConfig(cleanWebsiteConfig);
    localStorage.setItem(`${activePrefix}website_config`, JSON.stringify(cleanWebsiteConfig));

    // Post a system welcome notice
    const cleanNotice = [
      {
        id: `not-${activeSchoolId}-welcome`,
        scope: 'campus',
        title: `${schoolName} Portal — Live & Operational`,
        content: `${schoolName} digital management portal has been initialized cleanly with zero mock records. The administration and faculty may now enroll students, configure fee structures, and receive online admissions.`,
        category: 'general',
        priority: 'high',
        targetAudience: 'all',
        publishedBy: 'System Architecture Cell',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        readBy: []
      }
    ];
    setNotices(cleanNotice);
    localStorage.setItem(`${activePrefix}notices`, JSON.stringify(cleanNotice));

    return { success: true, message: `${schoolName} cleanly initialized with zero mock data!` };
  };

  // Backward-compatible alias for any existing references
  const initializeCleanOhaAcademy = initializeCleanSchool;

  // In-App REPL / Terminal Sandbox Execution
  const executeTerminalCommand = (codeString) => {
    const startTime = performance.now();
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
      warn: (...args) => logs.push({ type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
      error: (...args) => logs.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
      table: (data) => logs.push({ type: 'table', data })
    };

    const sandboxedDb = {
      classes,
      students,
      grades,
      fees,
      staff,
      payroll,
      libraryBooks,
      notices,
      timetables,
      plugins,
      systemConfig
    };

    try {
      const runner = new Function('console', 'db', `
        ${codeString}
      `);
      const result = runner(customConsole, sandboxedDb);
      const endTime = performance.now();
      return {
        success: true,
        result: result !== undefined ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) : null,
        logs,
        execTime: `${(endTime - startTime).toFixed(2)}ms`
      };
    } catch (err) {
      const endTime = performance.now();
      return {
        success: false,
        error: err.message,
        logs,
        execTime: `${(endTime - startTime).toFixed(2)}ms`
      };
    }
  };

  // 12. Residential Hostel Suite Management
  const allocateHostelBed = (roomId, bedNumber, studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    setHostelRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedBeds = (room.beds || []).map(bed => {
          if (bed.bedNumber === bedNumber) {
            return {
              ...bed,
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              class: student.stream ? `Class ${student.classId.replace('cls-', '')} (${student.stream})` : `Class ${student.classId.replace('cls-', '')}`
            };
          }
          return bed;
        });

        const updatedEnrolled = Array.from(new Set([...(room.enrolledStudents || []), studentId]));
        return {
          ...room,
          beds: updatedBeds,
          enrolledStudents: updatedEnrolled,
          occupiedBeds: updatedBeds.filter(b => b.studentId).length
        };
      }
      return room;
    }));

    // Update student's hostelRoomId
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hostelRoomId: roomId } : s));
    return { success: true, message: `Allocated ${student.firstName} to Bed ${bedNumber}` };
  };

  const vacateHostelBed = (roomId, bedNumber) => {
    let vacatedStudentId = null;

    setHostelRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedBeds = (room.beds || []).map(bed => {
          if (bed.bedNumber === bedNumber) {
            vacatedStudentId = bed.studentId;
            return {
              ...bed,
              studentId: null,
              studentName: null,
              class: null
            };
          }
          return bed;
        });

        return {
          ...room,
          beds: updatedBeds,
          enrolledStudents: (room.enrolledStudents || []).filter(id => id !== vacatedStudentId),
          occupiedBeds: updatedBeds.filter(b => b.studentId).length
        };
      }
      return room;
    }));

    if (vacatedStudentId) {
      setStudents(prev => prev.map(s => s.id === vacatedStudentId ? { ...s, hostelRoomId: null } : s));
    }
    return { success: true, message: `Bed ${bedNumber} has been vacated.` };
  };

  const recordHostelRollCall = (date, records, wardenName) => {
    const newRollCall = {
      id: `rc-${Date.now()}`,
      date,
      curfewTime: '20:00 (8:00 PM)',
      wardenName: wardenName || 'Pu K. Vanlalhruaia',
      records
    };
    setHostelRollCalls(prev => [newRollCall, ...prev]);
    return { success: true, message: `Night Roll Call recorded for ${date}.` };
  };

  const issueGatePass = (passData) => {
    const newPass = {
      id: `gp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      actualReturnTime: null,
      status: 'approved',
      ...passData
    };
    setHostelGatePasses(prev => [newPass, ...prev]);
    return { success: true, pass: newPass };
  };

  const updateGatePassStatus = (passId, newStatus, actualReturnTime = null) => {
    setHostelGatePasses(prev => prev.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status: newStatus,
          actualReturnTime: actualReturnTime || p.actualReturnTime || (newStatus === 'returned' ? new Date().toLocaleTimeString().slice(0, 5) : null)
        };
      }
      return p;
    }));
    return { success: true };
  };

  const updateMessMenu = (day, mealType, menuText) => {
    setHostelMessMenu(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [mealType]: menuText
      }
    }));
    return { success: true };
  };

  // 13. Academic Calendar & School Events Management
  const addAcademicEvent = (eventData) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      color: eventData.category === 'holiday' ? 'emerald' : eventData.category === 'exam' ? 'amber' : eventData.category === 'sports' ? 'purple' : 'cyan',
      ...eventData
    };
    setAcademicEvents(prev => [...prev, newEvent]);
    return { success: true, event: newEvent };
  };

  const deleteAcademicEvent = (eventId) => {
    setAcademicEvents(prev => prev.filter(e => e.id !== eventId));
    return { success: true };
  };

  // 13b. Comprehensive Vacation & Holiday Management Engine
  const createVacation = (vacationData) => {
    const id = vacationData.id || `vac-${Date.now()}`;
    const newVacation = {
      id,
      totalDays: vacationData.totalDays || 1,
      status: vacationData.status || 'scheduled',
      dutyStaff: vacationData.dutyStaff || [],
      homeworkPackets: vacationData.homeworkPackets || [],
      ...vacationData
    };

    setVacations(prev => [newVacation, ...prev]);

    // Automatically sync as an academic event in the Calendar
    const syncEvent = {
      id: `evt-vac-${id}`,
      vacationId: id,
      title: vacationData.title,
      date: vacationData.startDate,
      endDate: vacationData.endDate || vacationData.startDate,
      category: 'holiday',
      badge: vacationData.category || 'School Vacation',
      description: vacationData.description || `Official school vacation: ${vacationData.title}. Reopens on ${vacationData.reopenDate || 'notified date'}.`,
      color: 'emerald'
    };
    setAcademicEvents(prev => [...prev.filter(e => e.vacationId !== id), syncEvent]);

    // Optional instant institutional broadcast notice
    if (vacationData.broadcastNotice) {
      publishNotice({
        title: `OFFICIAL VACATION NOTICE: ${vacationData.title}`,
        category: 'academic',
        priority: 'high',
        targetAudience: 'all',
        content: `School will observe ${vacationData.title} from ${vacationData.startDate} to ${vacationData.endDate}. Classes will officially resume on ${vacationData.reopenDate || 'as scheduled'}. Hosteler boarders must report by ${vacationData.hostelReportDate || 'evening prior'}. Official Circular No: ${vacationData.officialCircularNo || 'MS/VAC/2026'}.`
      });
    }

    return { success: true, vacation: newVacation };
  };

  const updateVacation = (id, updatedData) => {
    setVacations(prev => prev.map(v => v.id === id ? { ...v, ...updatedData } : v));
    // Synchronize with academicEvents
    setAcademicEvents(prev => prev.map(evt => {
      if (evt.vacationId === id || evt.id === `evt-vac-${id}`) {
        return {
          ...evt,
          title: updatedData.title || evt.title,
          date: updatedData.startDate || evt.date,
          endDate: updatedData.endDate || evt.endDate,
          badge: updatedData.category || evt.badge,
          description: updatedData.description || evt.description
        };
      }
      return evt;
    }));
    return { success: true };
  };

  const deleteVacation = (id) => {
    setVacations(prev => prev.filter(v => v.id !== id));
    setAcademicEvents(prev => prev.filter(e => e.vacationId !== id && e.id !== `evt-vac-${id}`));
    return { success: true };
  };

  const addVacationHomework = (vacationId, packet) => {
    const newPacket = {
      id: `hw-${Date.now()}`,
      ...packet
    };
    setVacations(prev => prev.map(v => {
      if (v.id === vacationId) {
        return {
          ...v,
          homeworkPackets: [...(v.homeworkPackets || []), newPacket]
        };
      }
      return v;
    }));
    return { success: true, packet: newPacket };
  };

  const updatePaymentConfig = (updated) => {
    setPaymentConfig(prev => {
      const next = typeof updated === 'function' ? updated(prev) : { ...prev, ...updated };
      try {
        localStorage.setItem('zoxs_payment_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist payment config', e);
      }
      return next;
    });
    return { success: true };
  };

  const setActivePaymentGateway = (gatewayId) => {
    setPaymentConfig(prev => {
      const next = {
        ...prev,
        activeGateway: gatewayId,
        gateways: {
          ...prev.gateways,
          [gatewayId]: {
            ...prev.gateways[gatewayId],
            enabled: true
          }
        }
      };
      try {
        localStorage.setItem('zoxs_payment_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist payment config', e);
      }
      return next;
    });
    return { success: true };
  };

  const updateGatewayDetails = (gatewayId, updatedFields) => {
    setPaymentConfig(prev => {
      const next = {
        ...prev,
        gateways: {
          ...prev.gateways,
          [gatewayId]: {
            ...prev.gateways[gatewayId],
            ...updatedFields
          }
        }
      };
      try {
        localStorage.setItem('zoxs_payment_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist payment config', e);
      }
      return next;
    });
    return { success: true };
  };

  // 14. Staff Governance & Responsibility Allocation Management
  const addStaff = (staffData) => {
    const newStaff = {
      id: `stf-${Date.now().toString().slice(-4)}`,
      employeeId: staffData.employeeId || `EMP-FAC-${String(staff.length + 1).padStart(3, '0')}`,
      joiningDate: staffData.joiningDate || new Date().toISOString().slice(0, 10),
      photoUrl: staffData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'active',
      baseSalary: Number(staffData.baseSalary) || 40000,
      allowances: Number(staffData.allowances) || 6000,
      deductions: Number(staffData.deductions) || 3500,
      classTeacherOf: staffData.classTeacherOf || null,
      subjectsTaught: staffData.subjectsTaught || [],
      committees: staffData.committees || [],
      weeklyPeriods: Number(staffData.weeklyPeriods) || 18,
      specialDuty: staffData.specialDuty || '',
      bloodGroup: staffData.bloodGroup || 'O+',
      ...staffData
    };
    setStaff(prev => [newStaff, ...prev]);
    return { success: true, staff: newStaff };
  };

  const updateStaff = (staffId, updatedFields) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          ...updatedFields,
          baseSalary: updatedFields.baseSalary !== undefined ? Number(updatedFields.baseSalary) : s.baseSalary,
          allowances: updatedFields.allowances !== undefined ? Number(updatedFields.allowances) : s.allowances,
          deductions: updatedFields.deductions !== undefined ? Number(updatedFields.deductions) : s.deductions,
          weeklyPeriods: updatedFields.weeklyPeriods !== undefined ? Number(updatedFields.weeklyPeriods) : s.weeklyPeriods
        };
      }
      return s;
    }));
    return { success: true };
  };

  const deleteStaff = (staffId) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    return { success: true };
  };

  // 14c. Distinct Class Master Governance (Vice Principal & Principal Authority)
  const assignClassMaster = (classId, teacherId, assignerName = 'Principal / Vice Principal') => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return { success: false, error: 'Class not found' };

    const targetTeacher = teacherId ? staff.find(s => s.id === teacherId) : null;
    const oldTeacher = staff.find(s => s.classTeacherOf === classId);

    // 1. If teacherId is provided and already assigned to another class, relieve them from the old class to guarantee distinctness ("a hran hranin awm rawh se")
    setStaff(prev => prev.map(s => {
      if (s.id === teacherId) {
        return { ...s, classTeacherOf: classId };
      }
      // If someone else held this class, clear it
      if (s.classTeacherOf === classId && s.id !== teacherId) {
        return { ...s, classTeacherOf: null };
      }
      return s;
    }));

    // 2. Update classes array to store both teacherName and classTeacherId
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          classTeacherId: teacherId || null,
          teacherName: targetTeacher ? targetTeacher.name : 'Unassigned'
        };
      }
      // If the newly assigned teacher was previously classTeacherId of another class, update that class
      if (teacherId && cls.classTeacherId === teacherId && cls.id !== classId) {
        return {
          ...cls,
          classTeacherId: null,
          teacherName: 'Unassigned'
        };
      }
      return cls;
    }));

    // 3. Dispatch official notification to the newly appointed Class Master
    if (targetTeacher) {
      sendPrivateNotification({
        title: `Class Master Mawhphurhna Pek Thar: ${targetClass.name}`,
        content: `Dear ${targetTeacher.name}, Vice Principal & Principal thuneihna hnuaiah ${targetClass.name} Class Master (Section In-Charge) mawhphurhna pek thar i ni e. Zirlai attendance, discipline, leh leave application endik hi i mawhphurhna a ni ang. Ruattu: ${assignerName}.`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: targetTeacher.id,
        targetUserName: `${targetTeacher.name} (${targetTeacher.designation})`,
        recipientRole: 'teacher',
        senderId: 'principal_vp_council',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: true, push: true, sms: true }
      });
    }

    // 4. If an old teacher was relieved, inform them politely
    if (oldTeacher && oldTeacher.id !== teacherId) {
      sendPrivateNotification({
        title: `Class Master Mawhphurhna In-Hlan: ${targetClass.name}`,
        content: `Dear ${oldTeacher.name}, ${targetClass.name} Class Master mawhphurhna chu ${targetTeacher ? targetTeacher.name : 'Unassigned'} hnenah Vice Principal / Principal Council-in an hlan fel ta e.`,
        category: 'general',
        priority: 'normal',
        targetAudience: 'individual',
        targetUserId: oldTeacher.id,
        targetUserName: `${oldTeacher.name} (${oldTeacher.designation})`,
        recipientRole: 'teacher',
        senderId: 'principal_vp_council',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: true, push: true, sms: false }
      });
    }

    return { success: true, targetClass, targetTeacher };
  };

  // 14e. Office Staff Appointment & Module Access Governance (Principal & Vice Principal Authority)
  const assignOfficeStaffDuties = (staffId, officeData, assignerName = 'Principal / Vice Principal') => {
    const targetTeacher = staff.find(s => s.id === staffId);
    if (!targetTeacher) return { success: false, error: 'Staff member not found' };

    let updatedStaffObj = null;
    setStaff(prev => {
      const updated = prev.map(s => {
        if (s.id === staffId) {
          updatedStaffObj = {
            ...s,
            isOfficeStaff: Boolean(officeData.isOfficeStaff),
            officeDesignation: officeData.officeDesignation || (officeData.isOfficeStaff ? 'Designated Office Staff' : ''),
            officeDuties: officeData.officeDuties || [],
            assignedModuleAccess: officeData.assignedModuleAccess || [],
            appointedBy: officeData.isOfficeStaff ? assignerName : null,
            appointedAt: officeData.isOfficeStaff ? (s.appointedAt || new Date().toLocaleString()) : null,
            officeNotes: officeData.officeNotes || ''
          };
          return updatedStaffObj;
        }
        return s;
      });
      return updated;
    });

    // Notify teacher of the appointment or revocation
    if (officeData.isOfficeStaff) {
      sendPrivateNotification({
        title: `Office Staff & Administrative Duty Pek Thar: ${targetTeacher.name}`,
        content: `Dear ${targetTeacher.name}, Vice Principal & Principal thuneihna hnuaiah Office Staff mawhphurhna pek i ni e.\n\n📌 Designation: ${officeData.officeDesignation || 'Office Staff'}\n📋 Duties: ${(officeData.officeDuties || []).join(', ') || 'General Office Duties'}\n🔑 Module Access: ${(officeData.assignedModuleAccess || []).join(', ') || 'Designated Modules'}\n\nRuattu: ${assignerName}. System-ah heng module access te hi i pualin hawn a ni nghal e.`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: targetTeacher.id,
        targetUserName: targetTeacher.name,
        recipientRole: 'teacher',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: true, push: true, sms: false }
      });
    } else {
      sendPrivateNotification({
        title: `Office Duty Aṭanga Chawlhtirna: ${targetTeacher.name}`,
        content: `Dear ${targetTeacher.name}, i Office Staff mawhphurhna leh module access te kha ${assignerName}-in a titawp ta e. Academic faculty mawhphurhna pangngai i chhunzawm ang.`,
        category: 'general',
        priority: 'high',
        targetAudience: 'individual',
        targetUserId: targetTeacher.id,
        targetUserName: targetTeacher.name,
        recipientRole: 'teacher',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: false, push: true, sms: false }
      });
    }

    return { success: true, staff: updatedStaffObj };
  };

  // 14d. Class Leader & Assistant Class Leader Governance (Class Master Authority)
  const assignClassLeaders = (classId, leaderStudentId, asstLeaderStudentId, assignerName = 'Class Master') => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return { success: false, error: 'Class not found' };

    const leaderStudent = leaderStudentId ? students.find(s => s.id === leaderStudentId) : null;
    const asstLeaderStudent = asstLeaderStudentId ? students.find(s => s.id === asstLeaderStudentId) : null;

    // 1. Update classes state
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          classLeaderId: leaderStudentId || null,
          classLeaderName: leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : null,
          asstClassLeaderId: asstLeaderStudentId || null,
          asstClassLeaderName: asstLeaderStudent ? `${asstLeaderStudent.firstName} ${asstLeaderStudent.lastName}` : null,
          leadersAppointedAt: new Date().toISOString().slice(0, 10),
          leadersAppointedBy: assignerName
        };
      }
      return cls;
    }));

    // 2. Update students state (mark leadership flags for students of this class)
    setStudents(prev => prev.map(stu => {
      if (stu.classId === classId) {
        const isLeader = stu.id === leaderStudentId;
        const isAsst = stu.id === asstLeaderStudentId;
        return {
          ...stu,
          isClassLeader: isLeader,
          isAsstClassLeader: isAsst,
          leadershipRole: isLeader ? 'class_leader' : isAsst ? 'asst_class_leader' : null
        };
      }
      return stu;
    }));

    // 3. Dispatch official notification to the newly appointed Class Leader
    if (leaderStudent) {
      sendPrivateNotification({
        title: `👑 Class Leader Ruat I Ni: ${targetClass.name}`,
        content: `Dear ${leaderStudent.firstName}, i Class Master (${assignerName}) chuan ${targetClass.name} atan Class Leader (Monitor) ah a ruat fel ta che e. Class attendance, discipline, leh classroom kaihhruainaah i zirtirtu leh zirlai puite țanpui chu i mawhphurhna a ni ang. Lawmpuina kan hlan a che!`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: leaderStudent.id,
        targetUserName: `${leaderStudent.firstName} ${leaderStudent.lastName}`,
        recipientRole: 'student',
        senderId: 'class_master',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: true, push: true, sms: true }
      });
    }

    // 4. Dispatch official notification to the newly appointed Asst. Class Leader
    if (asstLeaderStudent) {
      sendPrivateNotification({
        title: `⭐ Assistant Class Leader Ruat I Ni: ${targetClass.name}`,
        content: `Dear ${asstLeaderStudent.firstName}, i Class Master (${assignerName}) chuan ${targetClass.name} atan Assistant Class Leader (Vice Monitor) ah a ruat fel ta che e. Class Leader leh Class Master te țanpui leh classroom rorelnaah mawhphurhna i nei e. Lawmpuina kan hlan a che!`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: asstLeaderStudent.id,
        targetUserName: `${asstLeaderStudent.firstName} ${asstLeaderStudent.lastName}`,
        recipientRole: 'student',
        senderId: 'class_master',
        publishedBy: assignerName,
        channels: { inApp: true, whatsapp: true, push: true, sms: true }
      });
    }

    return { success: true, targetClass, leaderStudent, asstLeaderStudent };
  };

  // 14e. Sibling Fee Concession & Discount Governance (Admin & Vice Principal Authority)
  const [siblingPolicy, setSiblingPolicy] = useState(() => loadInitial('sibling_discount_policy', {
    secondChildDiscount: 15,
    thirdChildDiscount: 25,
    fourthPlusDiscount: 40,
    autoApply: true
  }));

  const configureSiblingDiscountPolicy = (policy) => {
    const updated = { ...siblingPolicy, ...policy };
    setSiblingPolicy(updated);
    localStorage.setItem('zoxs_sibling_discount_policy', JSON.stringify(updated));
    return updated;
  };

  const updateStudentFeeConcession = (studentId, {
    concessionType = 'sibling',
    discountPercent = 0,
    customDiscountAmount = 0,
    reason = '',
    approvedBy = 'Vice Principal'
  }) => {
    let affectedStudent = null;

    setStudents(prev => prev.map(stu => {
      if (stu.id === studentId) {
        const baseTotal = stu.baseTotalFees || stu.totalFees || 36000;
        let discountAmt = customDiscountAmount > 0 
          ? customDiscountAmount 
          : Math.round((baseTotal * discountPercent) / 100);
        
        const newTotalFees = Math.max(0, baseTotal - discountAmt);
        const newFeeStatus = (stu.paidFees >= newTotalFees) 
          ? 'cleared' 
          : (stu.paidFees > 0 ? 'partial' : 'pending');

        affectedStudent = {
          ...stu,
          baseTotalFees: baseTotal,
          totalFees: newTotalFees,
          feeStatus: newFeeStatus,
          feeConcession: {
            concessionType,
            discountPercent,
            discountAmount: discountAmt,
            reason,
            approvedBy,
            appliedAt: new Date().toISOString().slice(0, 10)
          }
        };
        return affectedStudent;
      }
      return stu;
    }));

    // Update fees list record if matching exists
    setFees(prev => prev.map(f => {
      if (f.studentId === studentId) {
        const base = f.baseAmount || f.totalAmount || f.amount || 36000;
        const discountAmt = customDiscountAmount > 0 
          ? customDiscountAmount 
          : Math.round((base * discountPercent) / 100);
        const newTotal = Math.max(0, base - discountAmt);
        return {
          ...f,
          baseAmount: base,
          totalAmount: newTotal,
          discountAmount: discountAmt,
          concessionReason: reason,
          approvedBy
        };
      }
      return f;
    }));

    return { success: true, student: affectedStudent };
  };

  // 14f. Special Category / Discretionary Student Management (Principal's Executive Power)
  const toggleSpecialStudentCategory = (studentId, {
    isSpecial = true,
    specialCategoryNotes = '',
    discretionaryFeeWaiverPercent = 0,
    policyExemptions = ['fee_flexibility', 'attendance_exemption'],
    approvedBy = 'Principal'
  }) => {
    let affectedStudent = null;

    setStudents(prev => prev.map(stu => {
      if (stu.id === studentId) {
        const baseTotal = stu.baseTotalFees || stu.totalFees || 36000;
        const waiverAmt = Math.round((baseTotal * discretionaryFeeWaiverPercent) / 100);
        const newTotalFees = Math.max(0, baseTotal - waiverAmt);
        const newFeeStatus = (stu.paidFees >= newTotalFees) 
          ? 'cleared' 
          : (stu.paidFees > 0 ? 'partial' : 'pending');

        affectedStudent = {
          ...stu,
          baseTotalFees: baseTotal,
          totalFees: newTotalFees,
          feeStatus: newFeeStatus,
          isSpecialCategory: isSpecial,
          specialCategoryData: isSpecial ? {
            specialCategoryNotes,
            discretionaryFeeWaiverPercent,
            waiverAmount: waiverAmt,
            policyExemptions: policyExemptions || ['fee_flexibility', 'attendance_exemption'],
            designatedAt: new Date().toISOString().slice(0, 10),
            authorizedBy: approvedBy
          } : null
        };
        return affectedStudent;
      }
      return stu;
    }));

    return { success: true, student: affectedStudent };
  };

  // 15. Progress Report Card Withholding & Clearance Governance
  const checkReportCardAccess = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { canAccess: true, isWithheld: false };

    // 1. Check if principal waiver exemption exists
    const exemption = reportCardWithholds?.exemptions?.[studentId];
    if (exemption?.waived) {
      return {
        canAccess: true,
        isWithheld: false,
        isWaived: true,
        waiverInfo: exemption
      };
    }

    // 2. Check if explicit manual hold exists
    const hold = reportCardWithholds?.holds?.[studentId];
    if (hold?.withheld) {
      return {
        canAccess: false,
        isWithheld: true,
        reason: hold.reason || 'manual_admin',
        customReason: hold.customReason || hold.notes || 'Institutional Administrative Hold',
        notes: hold.notes || '',
        withheldBy: hold.withheldBy || 'School Administration',
        date: hold.date || new Date().toISOString().slice(0, 10)
      };
    }

    // 3. Check automatic fee dues policy
    if (reportCardWithholds?.autoFeeWithhold) {
      const total = Number(student.totalFees) || 32000;
      const paid = Number(student.paidFees) || 0;
      const pending = Math.max(0, total - paid);
      const threshold = Number(reportCardWithholds?.feeDueThreshold) || 0;

      if (pending > threshold) {
        return {
          canAccess: false,
          isWithheld: true,
          reason: 'fee_due',
          customReason: `Pending fee balance of ₹${pending.toLocaleString('en-IN')}`,
          notes: `School fee clearance pending. Please clear outstanding balance of ₹${pending.toLocaleString('en-IN')} to unlock progress report.`,
          pendingAmount: pending,
          withheldBy: 'System / Fee Clearance Policy',
          date: new Date().toISOString().slice(0, 10)
        };
      }
    }

    return { canAccess: true, isWithheld: false };
  };

  const setStudentReportHold = (studentId, holdData) => {
    setReportCardWithholds(prev => ({
      ...prev,
      holds: {
        ...prev.holds,
        [studentId]: {
          withheld: holdData.withheld !== undefined ? holdData.withheld : true,
          reason: holdData.reason || 'manual_admin',
          customReason: holdData.customReason || '',
          notes: holdData.notes || '',
          withheldBy: holdData.withheldBy || 'School Administration',
          date: new Date().toISOString().slice(0, 10)
        }
      }
    }));
    return { success: true };
  };

  const waiveStudentReportHold = (studentId, waiverData) => {
    setReportCardWithholds(prev => ({
      ...prev,
      exemptions: {
        ...prev.exemptions,
        [studentId]: {
          waived: waiverData.waived !== undefined ? waiverData.waived : true,
          waivedBy: waiverData.waivedBy || 'Rev. Dr. L. H. Rohmingliana (Principal)',
          note: waiverData.note || 'Special administrative waiver granted',
          date: new Date().toISOString().slice(0, 10)
        }
      }
    }));
    return { success: true };
  };

  const updateReportWithholdSettings = (newSettings) => {
    setReportCardWithholds(prev => ({
      ...prev,
      ...newSettings
    }));
    return { success: true };
  };

  const resetToMockData = () => {
    localStorage.clear();
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setGrades(INITIAL_GRADES);
    setFees(INITIAL_FEES);
    setAttendance(INITIAL_ATTENDANCE);
    setStaff(INITIAL_STAFF);
    setPayroll(INITIAL_PAYROLL);
    setLibraryBooks(INITIAL_LIBRARY_BOOKS);
    setNotices(INITIAL_NOTICES);
    setAdmissions(INITIAL_ADMISSIONS);
    setTransportRoutes(INITIAL_TRANSPORT_ROUTES);
    setHostelRooms(INITIAL_HOSTEL_ROOMS);
    setHostelGatePasses(INITIAL_HOSTEL_GATE_PASSES);
    setHostelRollCalls(INITIAL_HOSTEL_ROLL_CALLS);
    setHostelMessMenu(INITIAL_HOSTEL_MESS_MENU);
    setHostelRules(INITIAL_HOSTEL_RULES);
    setAcademicEvents(INITIAL_ACADEMIC_EVENTS);
    setTimetables(INITIAL_TIMETABLES);
    setCustomScripts(INITIAL_CUSTOM_SCRIPTS);
    setPlugins(INITIAL_SYSTEM_PLUGINS);
    setSystemConfig(INITIAL_SYSTEM_CONFIG);
    setPaymentConfig(INITIAL_PAYMENT_CONFIG);
    setAdmissionRequirements(INITIAL_ADMISSION_REQUIREMENTS);
    setIssuedCertificates(INITIAL_ISSUED_CERTIFICATES);
    setReportCardWithholds(INITIAL_REPORT_CARD_WITHHOLDS);
    setTasks(INITIAL_TASKS);
    setVacations(INITIAL_VACATIONS);
    setLiveMediaConfig(INITIAL_LIVE_MEDIA_CONFIG);
    setClinicRecords(INITIAL_CLINIC_RECORDS);
    setClinicConfig(INITIAL_CLINIC_CONFIG);
    setVisitors(INITIAL_VISITORS);
    setVisitorConfig(INITIAL_VISITOR_CONFIG);
    setInventoryAssets(INITIAL_INVENTORY_ASSETS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setInventoryConfig(INITIAL_INVENTORY_CONFIG);
    setPtmEvents(INITIAL_PTM_EVENTS);
    setPtmConfig(INITIAL_PTM_CONFIG);
    setAlumni(INITIAL_ALUMNI);
    setTranscriptRequests(INITIAL_TRANSCRIPT_REQUESTS);
    setAlumniConfig(INITIAL_ALUMNI_CONFIG);
    setCanteenMenu(INITIAL_CANTEEN_MENU);
    setCanteenWallets(INITIAL_CANTEEN_WALLETS);
    setCanteenTransactions(INITIAL_CANTEEN_TRANSACTIONS);
    setCanteenConfig(INITIAL_CANTEEN_CONFIG);
    setStudyMaterials(INITIAL_STUDY_MATERIALS);
    setStudyConfig(INITIAL_STUDY_CONFIG);
    setSealConfig(INITIAL_SEAL_CONFIG);
    setSubjects(INITIAL_SUBJECTS);
    setGradingScales(INITIAL_GRADING_SCALES);
    setFeeHeads(INITIAL_FEE_HEADS);
    setDocumentTemplates(INITIAL_DOCUMENT_TEMPLATES);
    setSystemNomenclature(INITIAL_NOMENCLATURE);
    setCustomStudentFields([]);
    localStorage.removeItem('zoxs_live_media_config');
    window.location.reload();
  };

  // ==========================================
  // HELPER FUNCTIONS FOR 6 NEW INSTITUTIONAL SUITES
  // ==========================================
  
  // 1. Health Clinic & Infirmary
  const recordClinicVisit = (visitData) => {
    const newRecord = {
      id: `cln-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'resting',
      ...visitData
    };
    setClinicRecords(prev => [newRecord, ...prev]);

    if (clinicConfig?.autoParentAlertOnAdmission && visitData.parentNotified) {
      sendPrivateNotification({
        title: `🏥 Health Clinic Update: ${visitData.studentName}`,
        content: `Dear Parent/Guardian, i fate ${visitData.studentName} chu school clinic/sick bay-ah enkawl mek a ni a. Vitals: Temp ${visitData.vitals?.temp || 'Normal'}. Treatment: ${visitData.treatment || 'Under Observation'}. A ngaihtuahawm loh e.`,
        category: 'general',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: visitData.studentId,
        targetUserName: visitData.studentName,
        recipientRole: 'parent',
        senderId: 'clinic_nurse',
        publishedBy: clinicConfig?.nurseInCharge || 'School Nurse',
        channels: clinicConfig?.emergencyAlertChannels || { inApp: true, sms: true, whatsapp: true, push: true }
      });
    }

    return { success: true, record: newRecord };
  };

  const updateClinicVisit = (id, updatedFields) => {
    setClinicRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    return { success: true };
  };

  const updateClinicConfig = (newConfig) => {
    const updated = { ...clinicConfig, ...newConfig };
    setClinicConfig(updated);
    localStorage.setItem('zoxs_clinic_config', JSON.stringify(updated));
    return { success: true };
  };

  const triggerEmergencySos = (studentId, customNote = '') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    sendPrivateNotification({
      title: `🚨 EMERGENCY MEDICAL SOS: ${student.firstName} ${student.lastName}`,
      content: `CRITICAL ALERT: Student ${student.firstName} ${student.lastName} (Roll #${student.rollNo}) requires immediate emergency care. ${customNote || 'Infirmary emergency protocol initiated.'} Guardian Contact: ${student.guardianPhone || student.phone}.`,
      category: 'general',
      priority: 'urgent',
      targetAudience: 'all',
      senderId: 'clinic_emergency_sos',
      publishedBy: 'School Emergency Infirmary Dispatch',
      channels: { inApp: true, sms: true, whatsapp: true, push: true }
    });

    return { success: true, message: `Emergency SOS broadcasted for ${student.firstName}!` };
  };

  // 2. Campus Visitors
  const issueVisitorPass = (passData) => {
    const newPass = {
      id: `vis-${Date.now()}`,
      passNo: `GP-${new Date().getFullYear()}-${String(visitors.length + 1).padStart(3, '0')}`,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exitTime: null,
      status: 'inside',
      ...passData
    };
    setVisitors(prev => [newPass, ...prev]);
    return { success: true, pass: newPass };
  };

  const checkoutVisitor = (passId) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === passId) {
        return {
          ...v,
          exitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'checked_out'
        };
      }
      return v;
    }));
    return { success: true };
  };

  const updateVisitorConfig = (newConfig) => {
    const updated = { ...visitorConfig, ...newConfig };
    setVisitorConfig(updated);
    localStorage.setItem('zoxs_visitor_config', JSON.stringify(updated));
    return { success: true };
  };

  // 3. Inventory & Lab Assets
  const addInventoryAsset = (assetData) => {
    const newAsset = {
      id: `ast-${Date.now()}`,
      code: assetData.code || `MZS-${(assetData.category || 'GEN').slice(0, 3).toUpperCase()}-${String(inventoryAssets.length + 1).padStart(2, '0')}`,
      purchaseDate: assetData.purchaseDate || new Date().toISOString().slice(0, 10),
      condition: assetData.condition || 'good',
      lastInspected: new Date().toISOString().slice(0, 10),
      ...assetData
    };
    setInventoryAssets(prev => [newAsset, ...prev]);
    return { success: true, asset: newAsset };
  };

  const updateInventoryAsset = (assetId, updatedFields) => {
    setInventoryAssets(prev => prev.map(a => a.id === assetId ? { ...a, ...updatedFields } : a));
    return { success: true };
  };

  const createMaintenanceTicket = (ticketData) => {
    const newTicket = {
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'open',
      ...ticketData
    };
    setMaintenanceTickets(prev => [newTicket, ...prev]);
    return { success: true, ticket: newTicket };
  };

  const updateMaintenanceTicket = (ticketId, status, resolutionNotes = '') => {
    setMaintenanceTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, resolutionNotes } : t));
    return { success: true };
  };

  const updateInventoryConfig = (newConfig) => {
    const updated = { ...inventoryConfig, ...newConfig };
    setInventoryConfig(updated);
    localStorage.setItem('zoxs_inventory_config', JSON.stringify(updated));
    return { success: true };
  };

  // 4. Parent-Teacher Meeting (PTM)
  const bookPtmSlot = (eventId, teacherId, slotId, studentData, parentName) => {
    setPtmEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedTeachers = (evt.teachersAvailable || []).map(t => {
          if (t.teacherId === teacherId) {
            const updatedSlots = (t.slots || []).map(s => {
              if (s.id === slotId) {
                return {
                  ...s,
                  status: 'booked',
                  parentName,
                  studentName: studentData.name,
                  studentId: studentData.id,
                  rollNo: studentData.rollNo
                };
              }
              return s;
            });
            return { ...t, slots: updatedSlots };
          }
          return t;
        });
        return { ...evt, teachersAvailable: updatedTeachers };
      }
      return evt;
    }));
    return { success: true };
  };

  const cancelPtmSlot = (eventId, teacherId, slotId) => {
    setPtmEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedTeachers = (evt.teachersAvailable || []).map(t => {
          if (t.teacherId === teacherId) {
            const updatedSlots = (t.slots || []).map(s => {
              if (s.id === slotId) {
                return {
                  ...s,
                  status: 'available',
                  parentName: null,
                  studentName: null,
                  studentId: null,
                  rollNo: null
                };
              }
              return s;
            });
            return { ...t, slots: updatedSlots };
          }
          return t;
        });
        return { ...evt, teachersAvailable: updatedTeachers };
      }
      return evt;
    }));
    return { success: true };
  };

  const createPtmEvent = (eventData) => {
    const newEvent = {
      id: `ptm-${Date.now()}`,
      status: 'open',
      ...eventData
    };
    setPtmEvents(prev => [newEvent, ...prev]);
    return { success: true, event: newEvent };
  };

  const updatePtmConfig = (newConfig) => {
    const updated = { ...ptmConfig, ...newConfig };
    setPtmConfig(updated);
    localStorage.setItem('zoxs_ptm_config', JSON.stringify(updated));
    return { success: true };
  };

  // 5. Alumni Network
  const registerAlumni = (alumniData) => {
    const newAlumni = {
      id: `alm-${Date.now()}`,
      status: 'active',
      ...alumniData
    };
    setAlumni(prev => [newAlumni, ...prev]);
    return { success: true, alumni: newAlumni };
  };

  const requestTranscript = (reqData) => {
    const newReq = {
      id: `tr-${Date.now()}`,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
      feePaid: alumniConfig?.transcriptFeeAmount || 300,
      trackingNo: null,
      ...reqData
    };
    setTranscriptRequests(prev => [newReq, ...prev]);
    return { success: true, request: newReq };
  };

  const updateTranscriptStatus = (id, status, trackingNo = null) => {
    setTranscriptRequests(prev => prev.map(r => r.id === id ? { ...r, status, trackingNo: trackingNo || r.trackingNo } : r));
    return { success: true };
  };

  const updateAlumniConfig = (newConfig) => {
    const updated = { ...alumniConfig, ...newConfig };
    setAlumniConfig(updated);
    localStorage.setItem('zoxs_alumni_config', JSON.stringify(updated));
    return { success: true };
  };

  // 6. Canteen & Smart Lunch Card
  const recordCanteenPurchase = (studentId, items, totalAmount) => {
    const student = students.find(s => s.id === studentId);
    const currentWallet = canteenWallets[studentId] || { balance: 0, dailySpentToday: 0 };
    
    if (currentWallet.balance < totalAmount && canteenConfig?.cashlessSmartCardOnly) {
      return { success: false, error: 'Insufficient smart meal card balance' };
    }

    const newBalance = Math.max(0, currentWallet.balance - totalAmount);
    const updatedWallet = {
      balance: newBalance,
      dailySpentToday: (currentWallet.dailySpentToday || 0) + totalAmount,
      status: 'active'
    };

    setCanteenWallets(prev => ({
      ...prev,
      [studentId]: updatedWallet
    }));

    const newTx = {
      id: `ctx-${Date.now()}`,
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
      item: items.map(i => i.name).join(', '),
      amount: totalAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10),
      type: 'debit'
    };

    setCanteenTransactions(prev => [newTx, ...prev]);
    return { success: true, balance: newBalance, transaction: newTx };
  };

  const topupCanteenWallet = (studentId, amount, paymentMode = 'UPI Online') => {
    const student = students.find(s => s.id === studentId);
    const currentWallet = canteenWallets[studentId] || { balance: 0, dailySpentToday: 0 };
    const newBalance = currentWallet.balance + Number(amount);

    setCanteenWallets(prev => ({
      ...prev,
      [studentId]: {
        ...currentWallet,
        balance: newBalance
      }
    }));

    const newTx = {
      id: `ctx-${Date.now()}`,
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
      item: `Smart Wallet Recharge (${paymentMode})`,
      amount: Number(amount),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10),
      type: 'credit'
    };

    setCanteenTransactions(prev => [newTx, ...prev]);
    return { success: true, balance: newBalance };
  };

  const updateCanteenMenu = (itemId, itemData) => {
    setCanteenMenu(prev => prev.map(m => m.id === itemId ? { ...m, ...itemData } : m));
    return { success: true };
  };

  const addCanteenMenuItem = (itemData) => {
    const newItem = {
      id: `cnt-${Date.now()}`,
      inStock: true,
      image: itemData.image || '🍱',
      ...itemData
    };
    setCanteenMenu(prev => [...prev, newItem]);
    return { success: true, item: newItem };
  };

  const updateCanteenConfig = (newConfig) => {
    const updated = { ...canteenConfig, ...newConfig };
    setCanteenConfig(updated);
    localStorage.setItem('zoxs_canteen_config', JSON.stringify(updated));
    return { success: true };
  };

  // 7. Academic Study Materials
  const addStudyMaterial = (materialData) => {
    const newMaterial = {
      id: `mat-${Date.now()}`,
      uploadedDate: new Date().toISOString().slice(0, 10),
      downloadsCount: 0,
      downloadUrl: '#',
      ...materialData
    };
    setStudyMaterials(prev => [newMaterial, ...prev]);
    return { success: true, material: newMaterial };
  };

  const deleteStudyMaterial = (id) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    return { success: true };
  };

  const updateStudyConfig = (newConfig) => {
    const updated = { ...studyConfig, ...newConfig };
    setStudyConfig(updated);
    localStorage.setItem('zoxs_study_config', JSON.stringify(updated));
    return { success: true };
  };

  // 8. Official School Seal & Principal Signature
  const updateSealConfig = (newConfig) => {
    const updated = { ...sealConfig, ...newConfig };
    setSealConfig(updated);
    localStorage.setItem('zoxs_seal_config', JSON.stringify(updated));
    return { success: true };
  };

  // 9. Public School Website & CMS Config
  const updateWebsiteConfig = (newConfig) => {
    setWebsiteConfig(prev => {
      const updated = typeof newConfig === 'function' ? newConfig(prev) : { ...prev, ...newConfig };
      try {
        localStorage.setItem('zoxs_website_config', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist website config', e);
      }
      return updated;
    });
    return { success: true };
  };

  // 10. Student Disciplinary & Suspension Operations
  const suspendStudent = async ({
    studentId,
    actionType = 'suspension',
    severity = 'high',
    reasonCategory = 'misconduct',
    title = '',
    description = '',
    startDate = new Date().toISOString().split('T')[0],
    endDate = '',
    durationDays = 7,
    issuedBy = 'Faculty / Staff',
    issuedByRole = 'teacher',
    authorizedBy = 'School Administration',
    hearingNotes = '',
    notifyParents = true
  }) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return { success: false, error: 'Student not found' };

    const newRecord = {
      id: `disp-${Date.now()}`,
      studentId,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      admissionNo: targetStudent.admissionNo,
      classId: targetStudent.classId,
      actionType,
      severity,
      reasonCategory,
      title: title || `${actionType.toUpperCase().replace(/_/g, ' ')} Order`,
      description,
      startDate,
      endDate: endDate || startDate,
      durationDays: parseInt(durationDays) || 1,
      issuedBy,
      issuedByRole,
      authorizedBy,
      hearingNotes,
      status: 'active',
      notifiedParents,
      guardianPhone: targetStudent.guardianPhone,
      createdAt: new Date().toISOString(),
      revokedAt: null,
      revokedReason: null,
      revokedBy: null
    };

    // 1. Update Disciplinary Records state & localStorage
    setDisciplinaryRecords(prev => {
      const next = [newRecord, ...prev];
      try {
        localStorage.setItem('zoxs_disciplinary_records', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Update Student status & active suspension record
    const isFullSuspension = actionType === 'suspension';
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            status: isFullSuspension ? 'suspended' : (s.status || 'active'),
            restrictionType: isFullSuspension ? 'campus_suspension' : actionType,
            activeSuspension: isFullSuspension ? newRecord : s.activeSuspension
          };
        }
        return s;
      });
      try {
        localStorage.setItem('zoxs_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 3. Dispatch Parent SMS & WhatsApp notification
    if (notifyParents && targetStudent.guardianPhone) {
      const parentMsg = `MIZORAM SCHOOL DISCIPLINARY NOTICE: Formal disciplinary action (${actionType.toUpperCase().replace(/_/g, ' ')}) has been issued for student ${targetStudent.firstName} ${targetStudent.lastName} (Roll #${targetStudent.rollNo}, ${targetStudent.admissionNo}). Duration: ${startDate} to ${endDate || startDate} (${durationDays} days). Reason: ${title}. Please contact Principal's Desk.`;
      try {
        await sendSmsAlert(targetStudent.guardianPhone, parentMsg, 'sms');
        await sendWhatsAppAlert(targetStudent.guardianPhone, parentMsg);
      } catch (e) {
        console.warn('Failed to dispatch parent alert', e);
      }
    }

    return { success: true, record: newRecord };
  };

  const revokeSuspension = async ({ studentId, recordId, reason = 'Suspension served / Conduct restored', revokedBy = 'Principal Desk' }) => {
    const nowIso = new Date().toISOString();

    // 1. Mark record as revoked
    setDisciplinaryRecords(prev => {
      const next = prev.map(rec => {
        if (rec.id === recordId || (studentId && rec.studentId === studentId && rec.status === 'active')) {
          return {
            ...rec,
            status: 'revoked',
            revokedAt: nowIso,
            revokedReason: reason,
            revokedBy
          };
        }
        return rec;
      });
      try {
        localStorage.setItem('zoxs_disciplinary_records', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Reset student status to active
    const targetStudent = students.find(s => s.id === studentId);
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'active',
            restrictionType: null,
            activeSuspension: null
          };
        }
        return s;
      });
      try {
        localStorage.setItem('zoxs_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 3. Dispatch parent clearance SMS / WhatsApp
    if (targetStudent?.guardianPhone) {
      const parentMsg = `MIZORAM SCHOOL NOTICE: The disciplinary suspension for student ${targetStudent.firstName} ${targetStudent.lastName} has been officially REVOKED. The student is cleared to resume classes.`;
      try {
        await sendSmsAlert(targetStudent.guardianPhone, parentMsg, 'sms');
        await sendWhatsAppAlert(targetStudent.guardianPhone, parentMsg);
      } catch (e) {}
    }

    return { success: true };
  };

  const addDisciplinaryWarning = async (warningData) => {
    return suspendStudent({ ...warningData, actionType: 'warning' });
  };

  // ==========================================
  // IN-APP MASTER ARCHITECTURE CRUD METHODS (Zero External Software Needed)
  // ==========================================

  // 1. Classes & Sections Master
  const addClass = (classData) => {
    const newClass = {
      id: classData.id || `cls-${Date.now()}`,
      name: classData.name || 'New Class',
      level: classData.level || 'custom',
      stream: classData.stream || null,
      section: classData.section || 'A',
      roomNumber: classData.roomNumber || 'Room-TBD',
      academicYear: classData.academicYear || '2026-2027',
      teacherName: classData.teacherName || 'Unassigned',
      classTeacherId: classData.classTeacherId || null,
      classLeaderId: null,
      classLeaderName: null,
      asstClassLeaderId: null,
      asstClassLeaderName: null,
      ...classData
    };
    setClasses(prev => [newClass, ...prev]);
    return { success: true, class: newClass };
  };

  const updateClass = (classId, updatedData) => {
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...updatedData } : c));
    return { success: true };
  };

  const deleteClass = (classId) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    return { success: true };
  };

  // 2. Subjects & Curriculum Master
  const addSubject = (subjectData) => {
    const newSubject = {
      id: subjectData.id || `sub-${Date.now()}`,
      name: subjectData.name || 'New Subject',
      code: subjectData.code || 'SUB-101',
      stream: subjectData.stream || 'all',
      category: subjectData.category || 'General Subject',
      fullMarks: Number(subjectData.fullMarks) || 100,
      passMarks: Number(subjectData.passMarks) || 40,
      classes: subjectData.classes || [],
      ...subjectData
    };
    setSubjects(prev => [...prev, newSubject]);
    return { success: true, subject: newSubject };
  };

  const updateSubject = (subjectId, updatedData) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updatedData } : s));
    return { success: true };
  };

  const deleteSubject = (subjectId) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    return { success: true };
  };

  const resetSubjects = () => {
    setSubjects(INITIAL_SUBJECTS);
    return { success: true };
  };

  // 3. Grading Scales Master
  const addGradeScale = (scaleData) => {
    const newScale = {
      id: scaleData.id || `grd-${Date.now()}`,
      grade: scaleData.grade || 'X',
      minScore: Number(scaleData.minScore) || 0,
      maxScore: Number(scaleData.maxScore) || 100,
      gradePoint: Number(scaleData.gradePoint) || 0,
      remark: scaleData.remark || 'Standard',
      color: scaleData.color || '#6366f1',
      ...scaleData
    };
    setGradingScales(prev => [...prev, newScale]);
    return { success: true, scale: newScale };
  };

  const updateGradeScale = (scaleId, updatedData) => {
    setGradingScales(prev => prev.map(g => g.id === scaleId ? { ...g, ...updatedData } : g));
    return { success: true };
  };

  const deleteGradeScale = (scaleId) => {
    setGradingScales(prev => prev.filter(g => g.id !== scaleId));
    return { success: true };
  };

  const resetGradeScales = () => {
    setGradingScales(INITIAL_GRADING_SCALES);
    return { success: true };
  };

  // 4. Fee Heads & Financial Structure Master
  const addFeeHead = (headData) => {
    const newHead = {
      id: headData.id || `fh-${Date.now()}`,
      name: headData.name || 'New Fee Head',
      code: headData.code || `FEE_${Date.now().toString().slice(-4)}`,
      frequency: headData.frequency || 'monthly',
      defaultAmount: Number(headData.defaultAmount) || 0,
      mandatory: Boolean(headData.mandatory ?? true),
      description: headData.description || '',
      ...headData
    };
    setFeeHeads(prev => [...prev, newHead]);
    return { success: true, head: newHead };
  };

  const updateFeeHead = (headId, updatedData) => {
    setFeeHeads(prev => prev.map(f => f.id === headId ? { ...f, ...updatedData } : f));
    return { success: true };
  };

  const deleteFeeHead = (headId) => {
    setFeeHeads(prev => prev.filter(f => f.id !== headId));
    return { success: true };
  };

  const resetFeeHeads = () => {
    setFeeHeads(INITIAL_FEE_HEADS);
    return { success: true };
  };

  // 5. Document & Certificate Templates Designer
  const updateDocumentTemplates = (newTemplates) => {
    setDocumentTemplates(prev => ({ ...prev, ...newTemplates }));
    return { success: true };
  };

  const resetDocumentTemplates = () => {
    setDocumentTemplates(INITIAL_DOCUMENT_TEMPLATES);
    return { success: true };
  };

  // 6. Institutional Terminology / Nomenclature
  const updateSystemNomenclature = (newNomenclature) => {
    setSystemNomenclature(prev => ({ ...prev, ...newNomenclature }));
    return { success: true };
  };

  const resetSystemNomenclature = () => {
    setSystemNomenclature(INITIAL_NOMENCLATURE);
    return { success: true };
  };

  // 7. Student Custom Profile Fields
  const addCustomStudentField = (fieldData) => {
    const newField = {
      id: `csf-${Date.now()}`,
      label: fieldData.label || 'Custom Field',
      key: fieldData.key || `custom_${Date.now().toString().slice(-4)}`,
      type: fieldData.type || 'text',
      options: fieldData.options || [],
      required: Boolean(fieldData.required),
      ...fieldData
    };
    setCustomStudentFields(prev => [...prev, newField]);
    return { success: true, field: newField };
  };

  const updateCustomStudentField = (fieldId, updatedData) => {
    setCustomStudentFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updatedData } : f));
    return { success: true };
  };

  const deleteCustomStudentField = (fieldId) => {
    setCustomStudentFields(prev => prev.filter(f => f.id !== fieldId));
    return { success: true };
  };

  // ==========================================
  // MULTI-TENANT ACTIONS & CLEAN SLATE INITIALIZATION
  // ==========================================
  const switchSchool = (schoolId) => {
    switchActiveSchool(schoolId);
  };

  const registerSchoolTenant = (schoolData) => {
    const created = registerNewSchool(schoolData);
    setRegisteredSchools(getRegisteredSchools());
    return created;
  };

  const generateCleanClasses = (levelsOffered = {}, streamsOffered = {}, academicSession = '2026 - 2027') => {
    const generated = [];
    if (levelsOffered?.prePrimary) {
      generated.push(
        { id: 'cls-nursery', name: 'Nursery', level: 'nursery', stream: null, section: 'A', roomNumber: 'N-101', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
        { id: 'cls-lkg', name: 'LKG', level: 'lkg', stream: null, section: 'A', roomNumber: 'K-101', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
        { id: 'cls-ukg', name: 'UKG', level: 'ukg', stream: null, section: 'A', roomNumber: 'K-102', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
      );
    }
    if (levelsOffered?.primary) {
      for (let i = 1; i <= 5; i++) {
        generated.push({
          id: `cls-${i}`,
          name: `Class ${i}`,
          level: `${i}`,
          stream: null,
          section: 'A',
          roomNumber: `P-${100 + i}`,
          academicYear: academicSession,
          teacherName: 'Unassigned',
          classTeacherId: null,
          classLeaderId: null,
          classLeaderName: null
        });
      }
    }
    if (levelsOffered?.middle) {
      for (let i = 6; i <= 8; i++) {
        generated.push({
          id: `cls-${i}`,
          name: `Class ${i}`,
          level: `${i}`,
          stream: null,
          section: 'A',
          roomNumber: `M-${200 + i}`,
          academicYear: academicSession,
          teacherName: 'Unassigned',
          classTeacherId: null,
          classLeaderId: null,
          classLeaderName: null
        });
      }
    }
    if (levelsOffered?.highSchool) {
      generated.push(
        { id: 'cls-9', name: 'Class 9', level: '9', stream: null, section: 'A', roomNumber: 'H-301', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
        { id: 'cls-10', name: 'Class 10 (Board)', level: '10', stream: null, section: 'A', roomNumber: 'H-302', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
      );
    }
    if (levelsOffered?.higherSecondary) {
      if (streamsOffered?.science) {
        generated.push(
          { id: 'cls-11-sci', name: 'Class 11 - Science', level: '11', stream: 'science', section: 'A', roomNumber: 'S-401', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
          { id: 'cls-12-sci', name: 'Class 12 - Science', level: '12', stream: 'science', section: 'A', roomNumber: 'S-402', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
        );
      }
      if (streamsOffered?.arts) {
        generated.push(
          { id: 'cls-11-arts', name: 'Class 11 - Arts', level: '11', stream: 'arts', section: 'A', roomNumber: 'A-401', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
          { id: 'cls-12-arts', name: 'Class 12 - Arts', level: '12', stream: 'arts', section: 'A', roomNumber: 'A-402', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
        );
      }
      if (streamsOffered?.commerce) {
        generated.push(
          { id: 'cls-11-comm', name: 'Class 11 - Commerce', level: '11', stream: 'commerce', section: 'A', roomNumber: 'C-401', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null },
          { id: 'cls-12-comm', name: 'Class 12 - Commerce', level: '12', stream: 'commerce', section: 'A', roomNumber: 'C-402', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
        );
      }
    }
    if (generated.length === 0) {
      generated.push(
        { id: 'cls-1', name: 'Class 1', level: '1', stream: null, section: 'A', roomNumber: '101', academicYear: academicSession, teacherName: 'Unassigned', classTeacherId: null, classLeaderId: null, classLeaderName: null }
      );
    }
    return generated;
  };

  const initializeCleanSlateSchool = (options = {}) => {
    if (isShowcaseMode) {
      triggerShowcaseNotice('Clean Slate Institutional Reset');
      return { success: false, error: 'Database reset is protected in Showcase Demo Mode.' };
    }
    const targetSchoolId = options.schoolId || activeSchoolId;
    try {
      localStorage.setItem(`zoxs_${targetSchoolId}_clean_slate`, 'true');
    } catch (e) {}

    const cleanClasses = generateCleanClasses(
      options.levelsOffered || { prePrimary: true, primary: true, middle: true, highSchool: true, higherSecondary: true },
      options.streamsOffered || { science: true, arts: true, commerce: true },
      options.academicSession || '2026 - 2027'
    );

    const cleanStaff = [
      {
        id: `stf-${Date.now().toString().slice(-4)}`,
        name: options.principalName || 'Principal',
        role: 'principal',
        designation: options.principalTitle || 'Principal & Head of Institution',
        department: 'Administration',
        email: options.contactEmail || 'principal@school.edu.in',
        phone: options.contactPhone || '+91 94361 00000',
        status: 'active',
        joiningDate: `${options.establishedYear || new Date().getFullYear()}-01-15`,
        qualification: 'M.Ed / Post Graduate',
        assignedDuties: ['General Administration', 'Institutional Council Head', 'Financial Signatory']
      }
    ];

    const cleanNotices = [
      {
        id: `not-${Date.now()}`,
        title: `🎉 Welcome to ${options.schoolName || 'Our School'}`,
        content: `Academic session ${options.academicSession || '2026 - 2027'} has officially commenced. Student registration, admissions, and routine are now configured.`,
        category: 'academic',
        priority: 'high',
        author: options.principalName || 'Principal Office',
        date: new Date().toISOString().split('T')[0],
        targetRole: 'all',
        audience: 'public'
      }
    ];

    setClasses(cleanClasses);
    setStudents([]);
    setGrades([]);
    setFees([]);
    setAttendance([]);
    setStaff(cleanStaff);
    setPayroll([]);
    setLibraryBooks([]);
    setNotices(cleanNotices);
    setAdmissions([]);
    setIssuedCertificates([]);
    setReportCardWithholds([]);
    setTasks([]);
    setClinicRecords([]);
    setVisitors([]);
    setMaintenanceTickets([]);
    setPtmEvents([]);
    setAlumni([]);
    setTranscriptRequests([]);

    try {
      localStorage.setItem(`zoxs_${targetSchoolId}_classes`, JSON.stringify(cleanClasses));
      localStorage.setItem(`zoxs_${targetSchoolId}_students`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_grades`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_fees`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_attendance`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_staff`, JSON.stringify(cleanStaff));
      localStorage.setItem(`zoxs_${targetSchoolId}_payroll`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_library_books`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_notices`, JSON.stringify(cleanNotices));
      localStorage.setItem(`zoxs_${targetSchoolId}_admissions`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_issued_certificates`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_report_card_withholds`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_tasks`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_clinic_records`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_visitors`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_maintenance_tickets`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_ptm_events`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_alumni`, JSON.stringify([]));
      localStorage.setItem(`zoxs_${targetSchoolId}_transcript_requests`, JSON.stringify([]));

      if (targetSchoolId === 'oha' || targetSchoolId === 'default') {
        localStorage.setItem('zoxs_students', JSON.stringify([]));
        localStorage.setItem('zoxs_classes', JSON.stringify(cleanClasses));
        localStorage.setItem('zoxs_staff', JSON.stringify(cleanStaff));
        localStorage.setItem('zoxs_grades', JSON.stringify([]));
        localStorage.setItem('zoxs_fees', JSON.stringify([]));
        localStorage.setItem('zoxs_attendance', JSON.stringify([]));
        localStorage.setItem('zoxs_notices', JSON.stringify(cleanNotices));
      }
    } catch (e) {
      console.warn('Error saving clean slate:', e);
    }

    return { success: true, count: cleanClasses.length };
  };

  return (
    <SchoolContext.Provider value={{
      classes,
      students,
      grades,
      fees,
      attendance,
      staff,
      addStaff,
      updateStaff,
      deleteStaff,
      assignClassMaster,
      assignOfficeStaffDuties,
      assignClassLeaders,
      payroll,
      libraryBooks,
      notices,
      admissions,
      admissionRequirements,
      onlineAdmissionConfig,
      updateOnlineAdmissionConfig,
      offlineAdmissionConfig,
      updateOfflineAdmissionConfig,
      academicSessions,
      startNewAcademicSession,
      switchActiveAcademicSession,
      promoteStudent,
      batchPromoteStudents,
      reEnrollStudent,
      updateAdmissionRecord,
      requestAdmissionDocument,
      updateAdmissionDocumentStatus,
      addAdmissionRequirement,
      updateAdmissionRequirement,
      deleteAdmissionRequirement,
      issuedCertificates,
      issueCertificate,
      revokeCertificate,
      deleteCertificate,
      reportCardWithholds,
      checkReportCardAccess,
      setStudentReportHold,
      waiveStudentReportHold,
      updateReportWithholdSettings,
      transportRoutes,
      hostelRooms,
      hostelGatePasses,
      hostelRollCalls,
      hostelMessMenu,
      hostelRules,
      allocateHostelBed,
      vacateHostelBed,
      recordHostelRollCall,
      issueGatePass,
      updateGatePassStatus,
      updateMessMenu,
      academicEvents,
      addAcademicEvent,
      deleteAcademicEvent,
      paymentConfig,
      updatePaymentConfig,
      setActivePaymentGateway,
      timetables,
      updateTimeTableSlot,
      examRoutines,
      addExamRoutineSlot,
      updateExamRoutineSlot,
      deleteExamRoutineSlot,
      publishExamRoutineNotice,
      plugins,
      systemConfig,
      liveMediaConfig,
      updateLiveMediaConfig,
      resetLiveMediaConfig,
      liveSessionRequests,
      requestLiveSession,
      approveLiveSession,
      rejectLiveSession,
      startLiveSession,
      endLiveSession,
      deleteLiveSession,
      activePrivateCall,
      startPrivateCall,
      endPrivateCall,
      language,
      setLanguage,
      toggleLanguage,
      t,
      saveCustomScripts,
      togglePlugin,
      addPlugin,
      updatePlugin,
      deletePlugin,
      resetPluginConfig,
      updateSystemConfig,
      updateCollectionRecord,
      addCollectionRecord,
      deleteCollectionRecord,
      exportDatabaseSnapshot,
      restoreDatabaseSnapshot,
      initializeCleanSchool,
      initializeCleanOhaAcademy: initializeCleanSchool, // backward-compatible alias
      executeTerminalCommand,
      recordAttendance,
      bulkMarkAttendance,
      autoAbsentNotificationEnabled,
      toggleAutoAbsentNotification,
      dispatchBulkAbsentNotifications,
      recordPayment,
      addGrade,
      issueBook,
      returnBook,
      processPayroll,
      payScales,
      updatePayScale,
      addPayScale,
      adjustStaffSalary,
      submitAdmission,
      reviewAdmission,
      submitOnlineAdmission,
      publishNotice,
      sendPrivateNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotice,
      tasks,
      createTask,
      updateTaskStatus,
      deleteTask,
      vacations,
      mizoramGazettedHolidays: MIZORAM_GAZETTED_HOLIDAYS_2026,
      createVacation,
      updateVacation,
      deleteVacation,
      addVacationHomework,
      leaveApplications,
      applyForLeave,
      reviewLeaveApplication,
      deleteLeaveApplication,
      assignTransport,
      assignHostel,
      siblingPolicy,
      configureSiblingDiscountPolicy,
      updateStudentFeeConcession,
      toggleSpecialStudentCategory,
      exportDataToCSV,
      exportDataToExcel,
      resetToMockData,
      // 1. Clinic
      clinicRecords,
      clinicConfig,
      recordClinicVisit,
      updateClinicVisit,
      updateClinicConfig,
      triggerEmergencySos,
      // 2. Visitors
      visitors,
      visitorConfig,
      issueVisitorPass,
      checkoutVisitor,
      updateVisitorConfig,
      // 3. Inventory
      inventoryAssets,
      maintenanceTickets,
      inventoryConfig,
      addInventoryAsset,
      updateInventoryAsset,
      createMaintenanceTicket,
      updateMaintenanceTicket,
      updateInventoryConfig,
      // 4. PTM
      ptmEvents,
      ptmConfig,
      bookPtmSlot,
      cancelPtmSlot,
      createPtmEvent,
      updatePtmConfig,
      // 5. Alumni
      alumni,
      transcriptRequests,
      alumniConfig,
      registerAlumni,
      requestTranscript,
      updateTranscriptStatus,
      updateAlumniConfig,
      // 6. Canteen
      canteenMenu,
      canteenWallets,
      canteenTransactions,
      canteenConfig,
      recordCanteenPurchase,
      topupCanteenWallet,
      updateCanteenMenu,
      addCanteenMenuItem,
      updateCanteenConfig,
      // 7. Study Materials
      studyMaterials,
      addStudyMaterial,
      deleteStudyMaterial,
      studyConfig,
      updateStudyConfig,
      // 8. Seal & Signature
      sealConfig,
      updateSealConfig,
      // 9. Public School Website & CMS Config
      websiteConfig,
      updateWebsiteConfig,
      // 10. SMS & WhatsApp Gateway
      gatewayConfig,
      updateGatewayConfig,
      sendSmsAlert,
      sendWhatsAppAlert,
      // 10. Web Push Notifications
      requestPushPermission,
      triggerNativePush,
      // 10. Student Disciplinary & Suspension Operations
      disciplinaryRecords,
      suspendStudent,
      revokeSuspension,
      addDisciplinaryWarning,
      // 11. In-App Master Architecture Suite (Zero External Software Needed)
      addClass,
      updateClass,
      deleteClass,
      subjects,
      addSubject,
      updateSubject,
      deleteSubject,
      resetSubjects,
      gradingScales,
      addGradeScale,
      updateGradeScale,
      deleteGradeScale,
      resetGradeScales,
      feeHeads,
      addFeeHead,
      updateFeeHead,
      deleteFeeHead,
      resetFeeHeads,
      documentTemplates,
      updateDocumentTemplates,
      resetDocumentTemplates,
      systemNomenclature,
      updateSystemNomenclature,
      resetSystemNomenclature,
      customStudentFields,
      addCustomStudentField,
      updateCustomStudentField,
      deleteCustomStudentField,
      // 12. Multi-Tenant Architecture & Registry
      activeSchoolId,
      activeSchoolInfo,
      registeredSchools,
      switchSchool,
      registerSchoolTenant,
      initializeCleanSlateSchool,
      isSyncing,
      lastSyncTime,
      isOfflinePersistenceActive,
      firebaseSyncStatus,
      testFirebaseConnection,
      syncToFirestore,
      pullFromFirestore,
      // 13. Showcase Demo Mode Guard
      isShowcaseMode,
      isSuperAdmin,
      showcaseNotice,
      triggerShowcaseNotice,
    }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
