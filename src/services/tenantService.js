/**
 * ============================================================================
 * MULTI-TENANT SUBDOMAIN & DEDICATED SCHOOL REGISTRY SERVICE
 * ============================================================================
 * Handles resolving active school tenant from:
 * 1. URL Query Parameter (?school=stpauls, ?school=oha)
 * 2. Hostname Subdomain (e.g. oha.zoxs.in -> oha, stpauls.zoxs.in -> stpauls)
 * 3. Stored Active School in LocalStorage
 * 4. Master Default Fallback ('oha' - One Heart Academy, Lunglawn)
 */

export const DEFAULT_REGISTERED_SCHOOLS = [
  {
    id: 'oha',
    name: 'One Heart Academy',
    shortName: 'OHA Lunglawn',
    subdomain: 'oha',
    code: 'OHA-MZ-02',
    address: 'Lunglawn, Lunglei, Mizoram - 796701',
    contactPhone: '+91 98623 45678',
    contactEmail: 'admissions@ohalunglawn.edu.in',
    motto: 'Knowledge is Light (Hriatna chu Eng a ni)',
    affiliationBadge: 'MBSE Affiliated • Lunglawn, Lunglei',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    establishedYear: 2004
  },
  {
    id: 'stpauls',
    name: "St. Paul's Higher Secondary School",
    shortName: "St. Paul's HSS",
    subdomain: 'stpauls',
    code: 'STP-AZL-01',
    address: 'Tlangnuam, Aizawl, Mizoram - 796005',
    contactPhone: '+91 94361 40012',
    contactEmail: 'office@stpaulsaizawl.edu.in',
    motto: 'Virtue and Labor',
    affiliationBadge: 'MBSE Affiliated • Aizawl',
    primaryColor: '#0ea5e9',
    secondaryColor: '#10b981',
    establishedYear: 1985
  },
  {
    id: 'gmhs',
    name: 'Govt. Mizo Higher Secondary School',
    shortName: 'Govt. Mizo HSS',
    subdomain: 'gmhs',
    code: 'GMH-AZL-03',
    address: 'Zarkawt, Aizawl, Mizoram - 796001',
    contactPhone: '+91 94361 52834',
    contactEmail: 'gmhss.aizawl@gmail.com',
    motto: 'Knowledge is Power',
    affiliationBadge: 'State Govt. • MBSE Affiliated',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    establishedYear: 1952
  },
  {
    id: 'ghhss',
    name: 'Govt. Hnahthial Higher Secondary School',
    shortName: 'GHHSS Hnahthial',
    subdomain: 'ghhss',
    code: 'GHSS-HNL-01',
    address: 'Venglai, Hnahthial, Mizoram - 796571',
    contactPhone: '+91 94361 58820',
    contactEmail: 'ghhss.hnahthial@gmail.com',
    motto: 'Strive to Excel (Taimakna chu Hlawhtlinna)',
    affiliationBadge: 'State Govt. • MBSE Affiliated (HSS)',
    primaryColor: '#0284c7',
    secondaryColor: '#0d9488',
    establishedYear: 1974
  }
];

/**
 * Get full list of registered schools from localStorage or defaults
 */
export function getRegisteredSchools() {
  try {
    const saved = localStorage.getItem('zoxs_registered_schools');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default schools are included
        const existingIds = new Set(parsed.map(s => s.id));
        const missing = DEFAULT_REGISTERED_SCHOOLS.filter(s => !existingIds.has(s.id));
        return [...parsed, ...missing];
      }
    }
  } catch (e) {
    console.warn('[TenantService] Failed to parse registered schools:', e);
  }
  return DEFAULT_REGISTERED_SCHOOLS;
}

/**
 * Register a new school tenant dynamically
 */
export function registerNewSchool(schoolData = {}) {
  const currentSchools = getRegisteredSchools();
  const rawSubdomain = (schoolData.subdomain || schoolData.name || `school-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const newSchool = {
    id: schoolData.id || rawSubdomain,
    name: schoolData.name || 'New Academy',
    shortName: schoolData.shortName || schoolData.name || 'New Academy',
    subdomain: rawSubdomain,
    customDomain: schoolData.customDomain ? schoolData.customDomain.toLowerCase().trim() : '',
    code: schoolData.code || `SCH-${Date.now().toString().slice(-4)}`,
    address: schoolData.address || 'Mizoram, India',
    contactPhone: schoolData.contactPhone || '+91 98620 00000',
    contactEmail: schoolData.contactEmail || 'office@school.edu.in',
    motto: schoolData.motto || 'Excellence in Education',
    affiliationBadge: schoolData.affiliationBadge || 'MBSE Affiliated',
    primaryColor: schoolData.primaryColor || '#6366f1',
    secondaryColor: schoolData.secondaryColor || '#8b5cf6',
    establishedYear: Number(schoolData.establishedYear) || new Date().getFullYear()
  };

  const updated = [newSchool, ...currentSchools.filter(s => s.id !== newSchool.id)];
  try {
    localStorage.setItem('zoxs_registered_schools', JSON.stringify(updated));
  } catch (e) {
    console.warn('[TenantService] Failed to save registered school:', e);
  }

  return newSchool;
}

/**
 * Resolves the active school ID from URL parameter, Subdomain, or LocalStorage
 */
export function getActiveSchoolId() {
  if (typeof window === 'undefined') return 'oha';

  // 1. Check Query Parameter: ?school=ghhss or ?tenant=ghhss (highest priority for explicit switcher links)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const querySchool = urlParams.get('school') || urlParams.get('tenant');
    if (querySchool && querySchool.trim()) {
      const cleanQuery = querySchool.trim().toLowerCase();
      localStorage.setItem('zoxs_active_school_id', cleanQuery);
      return cleanQuery;
    }
  } catch {}

  // 2. Check URL Path Parameter: e.g. /ghhss, /stpauls, /gmhs, /oha
  try {
    const pathname = (window.location.pathname || '').replace(/^\/+|\/+$/g, '');
    const firstSegment = pathname.split('/')[0];
    const reservedRoutes = ['login', 'assets', 'api', 'public_website', 'favicon.ico', 'index.html', 'default'];
    if (firstSegment && !reservedRoutes.includes(firstSegment.toLowerCase())) {
      const cleanPath = firstSegment.trim().toLowerCase();
      localStorage.setItem('zoxs_active_school_id', cleanPath);
      return cleanPath;
    }
  } catch {}

  // 3. Check Custom Domain (e.g. school has its own domain name like stpaulsaizawl.edu.in)
  try {
    const rawHost = (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    const isLocalhost = rawHost === 'localhost' || rawHost === '127.0.0.1';
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(rawHost);

    if (!isLocalhost && !isIp && rawHost) {
      const allRegistered = getRegisteredSchools();
      const domainMatch = allRegistered.find(s => {
        if (!s.customDomain) return false;
        const cleanCustom = s.customDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        return cleanCustom === rawHost;
      });

      if (domainMatch) {
        localStorage.setItem('zoxs_active_school_id', domainMatch.id);
        return domainMatch.id;
      }
    }
  } catch {}

  // 4. Check Hostname Subdomain (e.g. stpauls.zoxs.in -> stpauls)
  try {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Ignore localhost, IP addresses, and apex domains
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

    if (!isLocalhost && !isIp && parts.length >= 3) {
      const sub = parts[0].toLowerCase();
      if (sub !== 'www' && sub !== 'app' && sub !== 'portal' && sub !== 'sms') {
        localStorage.setItem('zoxs_active_school_id', sub);
        return sub;
      }
    }
  } catch {}

  // 5. Check Stored Active School in LocalStorage
  try {
    const saved = localStorage.getItem('zoxs_active_school_id');
    if (saved && saved.trim()) {
      return saved.trim().toLowerCase();
    }
  } catch {}

  // 6. Default Fallback Master Tenant
  return 'oha';
}

/**
 * Get active school tenant metadata
 */
export function getActiveSchoolInfo() {
  const activeId = getActiveSchoolId();
  const allSchools = getRegisteredSchools();
  const matched = allSchools.find(s => s.id === activeId || s.subdomain === activeId);
  return matched || allSchools[0] || DEFAULT_REGISTERED_SCHOOLS[0];
}

/**
 * Switch active school tenant and navigate cleanly to /:schoolId
 */
export function switchActiveSchool(schoolId) {
  try {
    const cleanId = (schoolId || 'oha').toLowerCase().trim();
    localStorage.setItem('zoxs_active_school_id', cleanId);
    
    // Navigate cleanly to the new center's URL path: e.g. /ghhss or /stpauls
    if (typeof window !== 'undefined') {
      window.location.href = `/${cleanId}`;
    }
  } catch (e) {
    console.error('[TenantService] Failed to switch school:', e);
  }
}

/**
 * Dynamically update Document Title and PWA Manifest for personalized mobile & desktop installation
 */
export function updateDynamicPwaBranding(school) {
  if (typeof document === 'undefined' || !school) return;

  // 1. Update Browser Page Title
  document.title = `${school.name} | Portal`;

  // 2. Update Theme Color Meta Tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', school.primaryColor || '#090d16');
  }

  // 3. Update Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `${school.name} - Institutional Management Portal (${school.affiliationBadge})`);
  }

  // 4. Inject Dynamic School-Specific PWA Manifest for Android, iOS & Windows Desktop App
  try {
    const currentHref = typeof window !== 'undefined' ? window.location.href : '/';
    const dynamicManifest = {
      name: school.name,
      short_name: school.shortName || school.name.slice(0, 12),
      description: `${school.name} - Official School & Student Mobile Portal (${school.affiliationBadge})`,
      start_url: currentHref,
      id: currentHref,
      display: "standalone",
      background_color: "#090d16",
      theme_color: school.primaryColor || "#090d16",
      orientation: "portrait-primary",
      icons: [
        {
          src: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="${encodeURIComponent(school.primaryColor || '#6366f1')}"/><text x="50" y="68" font-size="52" text-anchor="middle" fill="white">🏫</text></svg>`,
          sizes: "192x192 512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ],
      categories: ["education", "productivity"]
    };

    const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/manifest+json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute('href', manifestUrl);
    } else {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      manifestLink.setAttribute('href', manifestUrl);
      document.head.appendChild(manifestLink);
    }
  } catch (e) {
    console.warn('[TenantService] Failed to inject dynamic manifest:', e);
  }
}
