import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  Bed, 
  Plus, 
  CheckCircle2, 
  DollarSign,
  Radio,
  Navigation,
  Gauge,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Sliders,
  Check,
  Fuel,
  Send,
  X,
  RefreshCw
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function TransportHostelView() {
  const { transportRoutes, hostelRooms, students, sendPrivateNotification, systemConfig } = useSchool();
  const [activeTab, setActiveTab] = useState('transport'); // 'transport' | 'gps' | 'hostel'

  // Live GPS Simulation State
  const [selectedRouteId, setSelectedRouteId] = useState(transportRoutes[0]?.id || 'route-1');
  const [busProgress, setBusProgress] = useState(42); // 0 to 100%
  const [currentSpeed, setCurrentSpeed] = useState(32); // km/h
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [isFleetConfigOpen, setIsFleetConfigOpen] = useState(false);

  // Fleet Settings Configuration
  const [fleetConfig, setFleetConfig] = useState({
    speedLimitKm: 40,
    gpsPingSeconds: 3,
    autoArrivalSms: true,
    emergencySosNumber: '+91 94361 22000'
  });

  const activeRoute = transportRoutes.find(r => r.id === selectedRouteId) || transportRoutes[0];
  const enrolledStudents = students.filter(s => s.transportRouteId === activeRoute?.id || activeRoute?.enrolledStudents?.includes(s.id));

  // Auto GPS Movement Simulation
  useEffect(() => {
    let interval = null;
    if (activeTab === 'gps' && isEngineRunning) {
      interval = setInterval(() => {
        setBusProgress(prev => {
          const next = prev + 1;
          return next > 100 ? 0 : next;
        });

        // Fluctuate speed realistically
        setCurrentSpeed(prev => {
          const delta = (Math.random() - 0.48) * 4;
          const next = Math.max(18, Math.min(48, Math.round(prev + delta)));
          return next;
        });
      }, fleetConfig.gpsPingSeconds * 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isEngineRunning, fleetConfig.gpsPingSeconds]);

  // Handle SOS Emergency Broadcast
  const handleTriggerSos = () => {
    setSosActive(true);
    sendPrivateNotification?.({
      title: `🚨 EMERGENCY VEHICLE ALERT: School Bus ${activeRoute?.vehicleNo}`,
      content: `Emergency alert triggered for Bus ${activeRoute?.vehicleNo} (${activeRoute?.routeName}). Driver: ${activeRoute?.driverName}. Admin and campus security notified.`,
      category: 'emergency',
      priority: 'urgent',
      targetAudience: 'all_admin',
      channels: { inApp: true, whatsapp: true, push: true, sms: true }
    });
    setToast('Emergency SOS dispatched to Principal, Wardens & Campus Security!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Transport Fleet &amp; Hostel Facilities</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Campus Logistics
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            School bus routes, live GPS tracking, driver dispatch, and boarding hostel room allocations.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'transport' ? 'bg-cyan-500 text-slate-950 shadow font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Routes Catalog ({transportRoutes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gps')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'gps' ? 'bg-emerald-500 text-slate-950 shadow font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 animate-pulse" />
            <span>Live GPS Fleet Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('hostel')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'hostel' ? 'bg-purple-500 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hostel Boarding ({hostelRooms.length} Rooms)</span>
          </button>
        </div>
      </div>

      {/* Global Toast Alert */}
      {toast && (
        <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* VIEW 1: ROUTE CATALOG */}
      {activeTab === 'transport' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {transportRoutes.map((route) => {
            const enrolled = students.filter(s => s.transportRouteId === route.id || route.enrolledStudents?.includes(s.id));

            return (
              <div
                key={route.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Active Route
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      ₹{route.monthlyFee} / month
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    {route.routeName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Vehicle: {route.vehicleNo}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Driver: <strong>{route.driverName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Contact: <a href={`tel:${route.driverPhone}`} className="text-cyan-400 hover:underline">{route.driverPhone}</a></span>
                    </div>
                  </div>

                  {/* Pickup Points */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Designated Bus Stops</span>
                    <div className="flex flex-wrap gap-1.5">
                      {route.pickupPoints.map((pt, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
                        >
                          <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{pt}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Enrolled Commuters:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300 font-mono">{enrolled.length} Students</span>
                    <button
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        setActiveTab('gps');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] transition flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Track GPS</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIVE GPS FLEET TRACKING & SIMULATOR */}
      {activeTab === 'gps' && (
        <div className="space-y-5">
          {/* Top GPS Status & Fleet Controls */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    {systemConfig?.schoolName || 'OHA'} Bus Fleet Live GPS Telemetry
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase animate-pulse">
                    LIVE SATELLITE FEED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time telemetry, stop arrival countdowns, speed limit geofencing, and driver emergency dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
              >
                {transportRoutes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName} ({r.vehicleNo})</option>
                ))}
              </select>

              <button
                onClick={() => setIsFleetConfigOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Fleet Config</span>
              </button>
            </div>
          </div>

          {/* Telemetry Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Current Speed</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-black font-mono ${
                  currentSpeed > fleetConfig.speedLimitKm ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  {currentSpeed}
                </span>
                <span className="text-xs text-slate-400">km/h</span>
              </div>
              <span className={`text-[10px] font-mono ${
                currentSpeed > fleetConfig.speedLimitKm ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}>
                {currentSpeed > fleetConfig.speedLimitKm ? '⚠️ Over Speed Limit!' : '✓ Safe Transit Speed'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next Stop ETA</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-white">
                  {Math.max(1, Math.round((100 - (busProgress % 33) * 3) / 10))}
                </span>
                <span className="text-xs text-slate-400">minutes</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono truncate block">
                Next: {activeRoute?.pickupPoints[Math.min(activeRoute.pickupPoints.length - 1, Math.floor((busProgress / 100) * activeRoute.pickupPoints.length) + 1)] || 'Campus'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Commuters Onboard</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-white">
                  {enrolledStudents.length}
                </span>
                <span className="text-xs text-slate-400">/ 32 Seats</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {32 - enrolledStudents.length} Available Seats
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>Fuel &amp; Diagnostics</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-white">78%</span>
                <span className="text-xs text-slate-400">Diesel</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">✓ OBD-II Engine Normal</span>
            </div>
          </div>

          {/* Interactive Visual Route Map Simulator */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Route Topology: {activeRoute?.routeName}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Vehicle: <strong className="text-cyan-400 font-mono">{activeRoute?.vehicleNo}</strong> • Driver: {activeRoute?.driverName} ({activeRoute?.driverPhone})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeRoute?.driverPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Driver</span>
                </a>

                <button
                  onClick={handleTriggerSos}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/25 transition animate-pulse"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Broadcast SOS</span>
                </button>
              </div>
            </div>

            {/* Interactive Timeline Track */}
            <div className="py-6 px-4">
              <div className="relative">
                {/* Background Track Line */}
                <div className="h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 transition-all duration-700 rounded-full"
                    style={{ width: `${busProgress}%` }}
                  />
                </div>

                {/* Moving Bus Pin Icon */}
                <div 
                  className="absolute -top-3.5 transform -translate-x-1/2 transition-all duration-700 z-10"
                  style={{ left: `${busProgress}%` }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 border-2 border-white animate-bounce">
                    <Bus className="w-5 h-5 font-bold" />
                  </div>
                  <div className="text-[10px] font-mono text-center font-bold text-cyan-300 whitespace-nowrap mt-1 bg-black/80 px-1.5 py-0.5 rounded shadow">
                    {activeRoute?.vehicleNo} ({currentSpeed} km/h)
                  </div>
                </div>

                {/* Stop Markers */}
                <div className="flex justify-between items-start mt-8">
                  {activeRoute?.pickupPoints.map((stop, idx) => {
                    const stopPercentage = (idx / (activeRoute.pickupPoints.length - 1)) * 100;
                    const isPassed = busProgress >= stopPercentage;

                    return (
                      <div key={idx} className="flex flex-col items-center text-center max-w-[90px]">
                        <div className={`w-4 h-4 rounded-full border-2 transition ${
                          isPassed ? 'bg-cyan-500 border-white shadow' : 'bg-slate-950 border-slate-700'
                        }`} />
                        <span className={`text-[11px] font-bold mt-1.5 leading-tight ${
                          isPassed ? 'text-white' : 'text-slate-500'
                        }`}>
                          {stop}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                          Stop #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HOSTEL ROOMS */}
      {activeTab === 'hostel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {hostelRooms.map((room) => {
            const vacancy = room.capacity - room.occupiedBeds;
            const enrolled = students.filter(s => s.hostelRoomId === room.id);

            return (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {room.gender === 'male' ? "Boys' Wing" : "Girls' Wing"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      vacancy > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {vacancy > 0 ? `${vacancy} Beds Vacant` : 'Fully Occupied'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Room #{room.roomNumber} ({room.floor})
                    </h3>
                    <p className="text-xs text-slate-400">Boarding &amp; Mess: ₹{room.monthlyFee} / month</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div>Warden: <strong className="text-slate-200">{room.wardenName}</strong></div>
                    <div className="text-slate-400">Contact: {room.wardenPhone}</div>
                  </div>

                  {/* Bed Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Occupancy</span>
                      <span className="font-mono">{room.occupiedBeds} / {room.capacity} Beds</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Resident student info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Allocated Residents:</span>
                  <span className="font-bold text-purple-300">{enrolled.length} Students</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLEET CONFIGURATION MODAL */}
      {isFleetConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Fleet Telemetry Configuration</span>
              </h3>
              <button
                onClick={() => setIsFleetConfigOpen(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Speed Limit Alert Threshold ({fleetConfig.speedLimitKm} km/h)
                </label>
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="5"
                  value={fleetConfig.speedLimitKm}
                  onChange={(e) => setFleetConfig({ ...fleetConfig, speedLimitKm: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">GPS Telemetry Refresh Interval</label>
                <select
                  value={fleetConfig.gpsPingSeconds}
                  onChange={(e) => setFleetConfig({ ...fleetConfig, gpsPingSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value={1}>1 Second (High Precision Satellite)</option>
                  <option value={3}>3 Seconds (Standard Fleet Default)</option>
                  <option value={5}>5 Seconds (Data Saver)</option>
                </select>
              </div>

              <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-200">Auto Arrival SMS to Guardians</div>
                  <p className="text-[11px] text-slate-400">Sends SMS alert when bus is 2 stops away.</p>
                </div>
                <input
                  type="checkbox"
                  checked={fleetConfig.autoArrivalSms}
                  onChange={(e) => setFleetConfig({ ...fleetConfig, autoArrivalSms: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </label>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Campus Emergency Dispatch Number</label>
                <input
                  type="text"
                  value={fleetConfig.emergencySosNumber}
                  onChange={(e) => setFleetConfig({ ...fleetConfig, emergencySosNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsFleetConfigOpen(false);
                  setToast('Fleet telemetry settings updated successfully!');
                  setTimeout(() => setToast(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Fleet Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
