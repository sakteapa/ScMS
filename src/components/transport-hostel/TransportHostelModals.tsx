import React, { useState, useMemo } from 'react';
import {
  X,
  Bus,
  Home,
  UserCheck,
  UserMinus,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Bed,
  Shield,
} from 'lucide-react';
import {
  TransportRoute,
  TransportPickupPoint,
  TransportStudentAssignment,
  HostelRoom,
  HostelResident,
  FirestoreStudent,
  FeeRecord,
} from '../../types';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routeData: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialRoute?: TransportRoute | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({ isOpen, onClose, onSave, initialRoute }) => {
  const [routeNumber, setRouteNumber] = useState(initialRoute?.routeNumber || '');
  const [busNumber, setBusNumber] = useState(initialRoute?.busNumber || '');
  const [vehicleModel, setVehicleModel] = useState(initialRoute?.vehicleModel || 'Tata Starbus 34-Seater');
  const [capacity, setCapacity] = useState(initialRoute?.capacity || 32);
  const [driverName, setDriverName] = useState(initialRoute?.driverName || '');
  const [driverPhone, setDriverPhone] = useState(initialRoute?.driverPhone || '');
  const [driverLicense, setDriverLicense] = useState(initialRoute?.driverLicense || '');
  const [conductorName, setConductorName] = useState(initialRoute?.conductorName || '');
  const [conductorPhone, setConductorPhone] = useState(initialRoute?.conductorPhone || '');
  const [monthlyFee, setMonthlyFee] = useState(initialRoute?.monthlyFee || 1500);
  const [status, setStatus] = useState<'Active' | 'Under Maintenance' | 'Inactive'>(initialRoute?.status || 'Active');
  const [emergencyContact, setEmergencyContact] = useState(initialRoute?.emergencyContact || '');
  const [notes, setNotes] = useState(initialRoute?.notes || '');
  const [stops, setStops] = useState<TransportPickupPoint[]>(
    initialRoute?.pickupPoints || [
      {
        id: `stop_${Date.now()}_1`,
        pointName: 'Khatla Junction',
        locality: 'Khatla',
        pickupTime: '07:30 AM',
        dropTime: '03:45 PM',
        order: 1,
        landmark: 'Near Khatla Presbyterian Kohhran',
        monthlyFee: 1500,
      },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddStop = () => {
    const newOrder = stops.length + 1;
    setStops([
      ...stops,
      {
        id: `stop_${Date.now()}_${newOrder}`,
        pointName: '',
        locality: 'Aizawl',
        pickupTime: '07:45 AM',
        dropTime: '03:30 PM',
        order: newOrder,
        landmark: '',
        monthlyFee,
      },
    ]);
  };

  const handleRemoveStop = (idx: number) => {
    if (stops.length <= 1) return;
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handleUpdateStop = (idx: number, field: keyof TransportPickupPoint, val: any) => {
    const updated = [...stops];
    updated[idx] = { ...updated[idx], [field]: val };
    setStops(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busNumber.trim() || !routeNumber.trim() || !driverName.trim()) {
      alert('Please fill in required fields: Route Number, Bus Number, and Driver Name.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSave({
        routeNumber,
        busNumber,
        vehicleModel,
        capacity: Number(capacity),
        driverName,
        driverPhone,
        driverLicense,
        conductorName: conductorName || undefined,
        conductorPhone: conductorPhone || undefined,
        monthlyFee: Number(monthlyFee),
        status,
        emergencyContact: emergencyContact || driverPhone,
        notes: notes || undefined,
        pickupPoints: stops.filter((s) => s.pointName.trim() !== ''),
        assignedStudents: initialRoute?.assignedStudents || [],
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save route details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialRoute ? 'Edit Transport Route & Fleet' : 'Add New Transport Route & Bus'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure bus number, driver details, monthly fare, and Aizawl pickup points
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Row 1: Bus No & Route Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bus Registration Number *
              </label>
              <input
                type="text"
                required
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. MZ-01-E-4281"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Route Code & Name *
              </label>
              <input
                type="text"
                required
                value={routeNumber}
                onChange={(e) => setRouteNumber(e.target.value)}
                placeholder="e.g. Route 01 - Khatla / Mission Veng Express"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Vehicle Model, Capacity, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vehicle Model
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Tata Starbus 34-Seater"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Route Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="Active">Active / On Duty</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          {/* Row 3: Driver Details */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Driver & Conductor Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Lalmuanpuia Ralte"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Driver Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+91 94361 23456"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Driving License Number</label>
                <input
                  type="text"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value)}
                  placeholder="MZ0120180042918"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Conductor / Helper Name</label>
                <input
                  type="text"
                  value={conductorName}
                  onChange={(e) => setConductorName(e.target.value)}
                  placeholder="e.g. C. Vanlalruata"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Conductor Phone</label>
                <input
                  type="tel"
                  value={conductorPhone}
                  onChange={(e) => setConductorPhone(e.target.value)}
                  placeholder="+91 98623 88123"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Monthly Fare & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Standard Monthly Transport Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-emerald-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Emergency Helpline / SOS Phone
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="0389-2321100 or Driver Phone"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup Stops */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Pickup & Drop Stops along Route
                </span>
                <span className="text-[11px] text-slate-400 ml-2">({stops.length} designated stops)</span>
              </div>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Stop
              </button>
            </div>

            <div className="space-y-2.5">
              {stops.map((stop, idx) => (
                <div
                  key={stop.id || idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Stop #{idx + 1}
                    </span>
                    {stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        value={stop.pointName}
                        onChange={(e) => handleUpdateStop(idx, 'pointName', e.target.value)}
                        placeholder="Stop Name (e.g. Khatla West Junction)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={stop.locality}
                        onChange={(e) => handleUpdateStop(idx, 'locality', e.target.value)}
                        placeholder="Locality / Veng"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Pickup Time</label>
                      <input
                        type="text"
                        value={stop.pickupTime}
                        onChange={(e) => handleUpdateStop(idx, 'pickupTime', e.target.value)}
                        placeholder="07:30 AM"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Drop Time</label>
                      <input
                        type="text"
                        value={stop.dropTime}
                        onChange={(e) => handleUpdateStop(idx, 'dropTime', e.target.value)}
                        placeholder="03:45 PM"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400">Landmark</label>
                      <input
                        type="text"
                        value={stop.landmark || ''}
                        onChange={(e) => handleUpdateStop(idx, 'landmark', e.target.value)}
                        placeholder="e.g. Near Church / YMA Hall"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Operational Notes / Inspection Status
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Speed governor calibrated, GPS live, first aid kit inspected."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Route...' : initialRoute ? 'Update Route' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: TransportRoute[];
  students: FirestoreStudent[];
  targetRoute?: TransportRoute | null;
  onAssign: (routeId: string, assignment: TransportStudentAssignment) => Promise<void>;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  onClose,
  routes,
  students,
  targetRoute,
  onAssign,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState(targetRoute?.id || routes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Filter students who are not already on this bus
  const availableStudents = useMemo(() => {
    const assignedIds = new Set(
      routes.flatMap((r) => r.assignedStudents.map((s) => s.studentId))
    );
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toString().includes(searchQuery) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && !assignedIds.has(s.id);
    });
  }, [students, routes, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const selectedStop = useMemo(() => {
    return activeRoute?.pickupPoints.find((p) => p.id === selectedStopId) || activeRoute?.pickupPoints[0];
  }, [activeRoute, selectedStopId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !selectedStudent || !selectedStop) {
      alert('Please select both a student and a pickup stop.');
      return;
    }

    try {
      setIsSubmitting(true);
      const assignment: TransportStudentAssignment = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        rollNo: selectedStudent.rollNo,
        classId: selectedStudent.classId,
        className: selectedStudent.className,
        pickupPointId: selectedStop.id,
        pickupPointName: selectedStop.pointName,
        parentPhone: selectedStudent.parentPhone,
        emergencyContact: emergencyContact || selectedStudent.parentPhone,
        feeStatus: 'Pending',
        monthlyFee: selectedStop.monthlyFee || activeRoute.monthlyFee || 1500,
        assignedDate: new Date().toISOString().split('T')[0],
      };
      await onAssign(selectedRouteId, assignment);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to assign student to bus route.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Assign Student to Bus Route</h3>
              <p className="text-xs text-slate-400">Enroll pupil into school transit and configure stop</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Transport Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setSelectedStopId('');
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.busNumber} - {r.routeNumber} ({r.assignedStudents.length}/{r.capacity} Seats Filled)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Pickup / Drop Stop Point *
            </label>
            <select
              required
              value={selectedStopId || activeRoute?.pickupPoints[0]?.id || ''}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
            >
              {activeRoute?.pickupPoints.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pointName} ({p.locality}) - {p.pickupTime} [₹{p.monthlyFee}/mo]
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector with search */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Search & Select Enrolled Student *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name, roll number, or class..."
              className="w-full px-3 py-1.5 mb-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-850 bg-slate-950">
              {availableStudents.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching unassigned students found.
                </div>
              ) : (
                availableStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setEmergencyContact(s.parentPhone);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/60 transition ${
                      selectedStudentId === s.id ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.className} • Roll #{s.rollNo} • Phone: {s.parentPhone}
                      </div>
                    </div>
                    {selectedStudentId === s.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedStudent && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Monthly Transport Fare:</span>
                <span className="ml-1 font-bold text-amber-400">
                  ₹{(selectedStop?.monthlyFee || activeRoute?.monthlyFee || 1500).toLocaleString()}/month
                </span>
              </div>
              <div className="text-slate-300">
                Stop: <span className="font-semibold text-white">{selectedStop?.pointName}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Emergency Contact / Guardian Phone
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Parent Phone for Transit SOS"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Omit<HostelRoom, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialRoom?: HostelRoom | null;
}

export const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, onSave, initialRoom }) => {
  const [roomNumber, setRoomNumber] = useState(initialRoom?.roomNumber || '');
  const [blockName, setBlockName] = useState(initialRoom?.blockName || 'Boys Hostel - Hmuifang Block');
  const [gender, setGender] = useState<'Boys' | 'Girls'>(initialRoom?.gender || 'Boys');
  const [floor, setFloor] = useState(initialRoom?.floor || 'Ground Floor');
  const [roomType, setRoomType] = useState<HostelRoom['roomType']>(initialRoom?.roomType || 'Double');
  const [capacity, setCapacity] = useState(initialRoom?.capacity || 2);
  const [monthlyFee, setMonthlyFee] = useState(initialRoom?.monthlyFee || 4800);
  const [status, setStatus] = useState<HostelRoom['status']>(initialRoom?.status || 'Available');
  const [wardenName, setWardenName] = useState(initialRoom?.wardenName || 'Sir Zonunsanga Colney');
  const [wardenPhone, setWardenPhone] = useState(initialRoom?.wardenPhone || '+91 94361 99882');
  const [amenities, setAmenities] = useState<string[]>(
    initialRoom?.amenities || [
      'Attached Bathroom',
      'Solar Hot Water Geyser',
      'Study Desks',
      'Lockable Steel Wardrobes',
    ]
  );
  const [notes, setNotes] = useState(initialRoom?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAmenitiesList = [
    'Attached Bathroom',
    'Solar Hot Water Geyser',
    'Electric Geyser 24x7',
    'Study Desks & LED Reading Lamps',
    'Lockable Steel Wardrobes',
    'Inverter Power Backup',
    'Balcony Valley View',
    'Filtered RO Drinking Water',
    'Washing Machine & Drying Area',
    'CCTV Monitored Corridor',
  ];

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleGenderChange = (val: 'Boys' | 'Girls') => {
    setGender(val);
    if (val === 'Girls') {
      if (!initialRoom) {
        setBlockName('Girls Hostel - Reiek Block');
        setWardenName('Madam Lalhmingmawii Sailo');
        setWardenPhone('+91 94361 44558');
      }
    } else {
      if (!initialRoom) {
        setBlockName('Boys Hostel - Hmuifang Block');
        setWardenName('Sir Zonunsanga Colney');
        setWardenPhone('+91 94361 99882');
      }
    }
  };

  const handleRoomTypeChange = (type: HostelRoom['roomType']) => {
    setRoomType(type);
    if (type === 'Single') setCapacity(1);
    else if (type === 'Double') setCapacity(2);
    else if (type === 'Triple') setCapacity(3);
    else if (type === 'Dormitory (4-Bed)') setCapacity(4);
    else if (type === 'Dormitory (6-Bed)') setCapacity(6);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !blockName.trim()) {
      alert('Please fill in room number and block name.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSave({
        roomNumber,
        blockName,
        gender,
        floor,
        roomType,
        capacity: Number(capacity),
        occupiedBeds: initialRoom?.residents.filter((r) => r.status === 'Active').length || 0,
        status,
        monthlyFee: Number(monthlyFee),
        wardenName,
        wardenPhone,
        amenities,
        residents: initialRoom?.residents || [],
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save hostel room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialRoom ? 'Edit Hostel Room & Capacity' : 'Add New Hostel Room'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure dormitory block, bed quota, boarding fees, and room amenities
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Gender & Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hostel Wing / Gender</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderChange('Boys')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    gender === 'Boys'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  Boys Hostel
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('Girls')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    gender === 'Girls'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  Girls Hostel
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hostel Block Name *</label>
              <input
                type="text"
                required
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="e.g. Boys Hostel - Hmuifang Block"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Room Number, Floor, Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 101 or Room G-102"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Floor</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Room Layout Type</label>
              <select
                value={roomType}
                onChange={(e) => handleRoomTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Single">Single (1-Bed)</option>
                <option value="Double">Double (2-Bed)</option>
                <option value="Triple">Triple (3-Bed)</option>
                <option value="Dormitory (4-Bed)">Dormitory (4-Bed)</option>
                <option value="Dormitory (6-Bed)">Dormitory (6-Bed)</option>
              </select>
            </div>
          </div>

          {/* Bed Capacity & Monthly Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Bed Capacity</label>
              <input
                type="number"
                min="1"
                max="12"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Boarding & Lodging Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-emerald-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Warden Credentials */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Hostel Warden Contact
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Warden Name</label>
                <input
                  type="text"
                  value={wardenName}
                  onChange={(e) => setWardenName(e.target.value)}
                  placeholder="e.g. Sir Zonunsanga Colney"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Warden Phone</label>
                <input
                  type="tel"
                  value={wardenPhone}
                  onChange={(e) => setWardenPhone(e.target.value)}
                  placeholder="+91 94361 99882"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Amenities checklist */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Room Amenities & Facilities</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableAmenitiesList.map((item) => (
                <label
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                    amenities.includes(item)
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(item)}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Room Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Corner room with good natural sunlight and ventilation."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: HostelRoom[];
  students: FirestoreStudent[];
  targetRoom?: HostelRoom | null;
  onCheckIn: (
    roomId: string,
    resident: HostelResident,
    createFeeNow: boolean,
    feeMonth: string
  ) => Promise<void>;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  rooms,
  students,
  targetRoom,
  onCheckIn,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState(targetRoom?.id || rooms[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [remarks, setRemarks] = useState('');
  const [createFeeNow, setCreateFeeNow] = useState(true);
  const [feeMonth, setFeeMonth] = useState('September 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  // Exclude students who are currently actively resident in any room
  const availableStudents = useMemo(() => {
    const activeResidentStudentIds = new Set(
      rooms.flatMap((rm) =>
        rm.residents.filter((r) => r.status === 'Active').map((r) => r.studentId)
      )
    );
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toString().includes(searchQuery) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && !activeResidentStudentIds.has(s.id);
    });
  }, [students, rooms, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  if (!isOpen) return null;

  const handleSelectStudent = (s: FirestoreStudent) => {
    setSelectedStudentId(s.id);
    setGuardianPhone(s.parentPhone);
    setBloodGroup(s.bloodGroup || 'O+');
    const existingActiveCount = activeRoom?.residents.filter((r) => r.status === 'Active').length || 0;
    const nextBedLetter = String.fromCharCode(65 + existingActiveCount); // A, B, C, D
    setBedNumber(`Bed ${activeRoom?.roomNumber || 'Room'}-${nextBedLetter}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !selectedStudent) {
      alert('Please select both a room and a student to check in.');
      return;
    }

    try {
      setIsSubmitting(true);
      const resident: HostelResident = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        rollNo: selectedStudent.rollNo,
        classId: selectedStudent.classId,
        className: selectedStudent.className,
        bedNumber: bedNumber || `Bed ${activeRoom.roomNumber}-A`,
        checkInDate,
        status: 'Active',
        gender: activeRoom.gender === 'Boys' ? 'Male' : 'Female',
        parentName: guardianName || undefined,
        parentPhone: guardianPhone || selectedStudent.parentPhone,
        bloodGroup: bloodGroup || selectedStudent.bloodGroup,
        hostelFeeStatus: createFeeNow ? 'Pending' : 'Paid',
        monthlyFee: activeRoom.monthlyFee,
        lastPaidMonth: createFeeNow ? undefined : feeMonth,
        remarks: remarks || undefined,
      };

      await onCheckIn(selectedRoomId, resident, createFeeNow, feeMonth);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to check in resident student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hostel Check-In & Bed Allocation</h3>
              <p className="text-xs text-slate-400">Register new resident student into boarding quarters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Hostel Room *</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
            >
              {rooms.map((r) => {
                const activeCount = r.residents.filter((res) => res.status === 'Active').length;
                const isFull = activeCount >= r.capacity;
                return (
                  <option key={r.id} value={r.id} disabled={isFull}>
                    {r.roomNumber} ({r.blockName}) - {activeCount}/{r.capacity} Beds ({r.roomType}){' '}
                    {isFull ? '[FULL]' : `[₹${r.monthlyFee}/mo]`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Student picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Enrolled Student *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll number..."
              className="w-full px-3 py-1.5 mb-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
            />
            <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-850 bg-slate-950">
              {availableStudents.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching unassigned students found.
                </div>
              ) : (
                availableStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/60 transition ${
                      selectedStudentId === s.id ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.className} • Roll #{s.rollNo} • Phone: {s.parentPhone}
                      </div>
                    </div>
                    {selectedStudentId === s.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Allocated Bed Label *</label>
              <input
                type="text"
                required
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g. Bed 101-A"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Check-In Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. C. Lalramliana"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Emergency Phone</label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 94361 77881"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Fee Integration Toggle */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createFeeNow}
                onChange={(e) => setCreateFeeNow(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs font-semibold text-emerald-300">
                Post Hostel Fee Invoice Directly to Student Fee Ledger
              </span>
            </label>
            {createFeeNow && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-slate-400">Monthly Boarding Fee:</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    ₹{(activeRoom?.monthlyFee || 4800).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Billing Month:</span>
                  <input
                    type="text"
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    placeholder="September 2026"
                    className="w-full mt-0.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Special Remarks / Dietary Needs</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Vegetarian diet, evening prep study exemption, etc."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: HostelRoom;
  resident: HostelResident;
  fees: FeeRecord[];
  onCheckOut: (roomId: string, residentStudentId: string, checkoutDate: string, remarks: string) => Promise<void>;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  room,
  resident,
  fees,
  onCheckOut,
}) => {
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if student has pending hostel fee dues
  const studentHostelFees = useMemo(() => {
    return fees.filter((f) => f.studentId === resident.studentId && f.feeType === 'Hostel');
  }, [fees, resident.studentId]);

  const hasUnpaidHostelFees = useMemo(() => {
    return studentHostelFees.some((f) => f.status === 'Pending' || f.status === 'Overdue');
  }, [studentHostelFees]);

  const pendingAmount = useMemo(() => {
    return studentHostelFees.reduce(
      (acc, f) => acc + (f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount),
      0
    );
  }, [studentHostelFees]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onCheckOut(room.id, resident.studentId, checkoutDate, remarks);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to check out resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hostel Check-Out & Clearance</h3>
              <p className="text-xs text-slate-400">{room.blockName} • {room.roomNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="font-bold text-white">{resident.studentName}</div>
            <div className="text-xs text-slate-400">
              {resident.className} • Roll #{resident.rollNo} • Bed: {resident.bedNumber}
            </div>
            <div className="text-xs text-slate-400">Check-in: {resident.checkInDate}</div>
          </div>

          {/* Fee clearance status warning */}
          {hasUnpaidHostelFees ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-300">Hostel Fee Dues Pending!</span>
                <p className="text-rose-200/80 mt-0.5">
                  Student has ₹{pendingAmount.toLocaleString()} unpaid hostel boarding dues. Ensure settlement at the Bursar Counter before issuing gate pass.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hostel Account Cleared. No outstanding boarding balance detected.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Check-Out Date *</label>
            <input
              type="date"
              required
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Check-Out Reason / Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Session completion / Relocating to family home in Chanmari."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Check-Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
