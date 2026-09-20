import React, { useState } from 'react';
import { 
  Building2, 
  Bed, 
  Moon, 
  Ticket, 
  UtensilsCrossed, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  Sparkles,
  Edit3,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function HostelView() {
  const { 
    hostelRooms, 
    hostelGatePasses, 
    hostelRollCalls, 
    hostelMessMenu, 
    hostelRules,
    students,
    allocateHostelBed,
    vacateHostelBed,
    recordHostelRollCall,
    issueGatePass,
    updateGatePassStatus,
    updateMessMenu
  } = useSchool();

  const { isWarden, isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const canManage = isWarden || isPrincipal || isVicePrincipal || isSuperAdmin;

  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'rollcall' | 'gatepass' | 'mess' | 'rules'
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Allocation Modal State
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedRoomForAlloc, setSelectedRoomForAlloc] = useState(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState('Bed-1');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [allocationMessage, setAllocationMessage] = useState(null);

  // Gate Pass Modal State
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [newGatePass, setNewGatePass] = useState({
    studentId: '',
    destination: '',
    purpose: '',
    departureTime: '16:00',
    expectedReturnTime: '18:30',
    guardianContact: ''
  });
  const [gatePassFilter, setGatePassFilter] = useState('all');

  // Roll Call State
  const [rollCallDate, setRollCallDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentRosterStatus, setCurrentRosterStatus] = useState(() => {
    // Collect all resident students
    const residentIds = [];
    hostelRooms.forEach(room => {
      (room.beds || []).forEach(bed => {
        if (bed.studentId) residentIds.push({ studentId: bed.studentId, studentName: bed.studentName, room: room.roomNumber });
      });
    });
    const initial = {};
    residentIds.forEach(res => {
      initial[res.studentId] = { status: 'present', remarks: 'In dormitory room' };
    });
    return initial;
  });
  const [rollCallSaved, setRollCallSaved] = useState(false);

  // Mess Menu Edit State
  const [editingDay, setEditingDay] = useState(null);
  const [editingMealType, setEditingMealType] = useState('dinner');
  const [mealTextDraft, setMealTextDraft] = useState('');

  // Filtered Rooms
  const filteredRooms = hostelRooms.filter(room => {
    if (buildingFilter === 'boys') return room.buildingName.includes('Boys');
    if (buildingFilter === 'girls') return room.buildingName.includes('Girls');
    return true;
  });

  // Calculate Metrics
  const totalBeds = hostelRooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = hostelRooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const totalVacant = totalBeds - totalOccupied;
  const activeGatePasses = hostelGatePasses.filter(p => p.status === 'checked_out').length;

  // Handle Allocate Bed
  const handleConfirmAllocation = (e) => {
    e.preventDefault();
    if (!selectedRoomForAlloc || !selectedBedNumber || !selectedStudentId) return;

    const res = allocateHostelBed(selectedRoomForAlloc.id, selectedBedNumber, selectedStudentId);
    if (res.success) {
      setAllocationMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        setAllocationMessage(null);
        setIsAllocateModalOpen(false);
      }, 1500);
    } else {
      setAllocationMessage({ type: 'error', text: res.error });
    }
  };

  // Handle Vacate Bed
  const handleVacate = (roomId, bedNumber, studentName) => {
    if (window.confirm(`Are you sure you want to vacate Bed ${bedNumber} occupied by ${studentName}?`)) {
      vacateHostelBed(roomId, bedNumber);
    }
  };

  // Handle Issue Gate Pass
  const handleCreateGatePass = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === newGatePass.studentId);
    if (!student) return;

    // Find student's room
    let studentRoom = 'Hostel';
    let studentBuilding = 'Hostel';
    hostelRooms.forEach(room => {
      if (room.enrolledStudents?.includes(student.id)) {
        studentRoom = room.roomNumber;
        studentBuilding = room.buildingName;
      }
    });

    issueGatePass({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      hostelBuilding: studentBuilding,
      roomNumber: studentRoom,
      destination: newGatePass.destination,
      purpose: newGatePass.purpose,
      departureTime: newGatePass.departureTime,
      expectedReturnTime: newGatePass.expectedReturnTime,
      guardianContact: newGatePass.guardianContact || student.guardianPhone,
      issuedBy: 'Hostel Warden Office'
    });

    setIsGatePassModalOpen(false);
    setNewGatePass({
      studentId: '',
      destination: '',
      purpose: '',
      departureTime: '16:00',
      expectedReturnTime: '18:30',
      guardianContact: ''
    });
  };

  // Handle Save Roll Call
  const handleSaveRollCall = () => {
    const records = [];
    hostelRooms.forEach(room => {
      (room.beds || []).forEach(bed => {
        if (bed.studentId) {
          const current = currentRosterStatus[bed.studentId] || { status: 'present', remarks: 'In dormitory room' };
          records.push({
            studentId: bed.studentId,
            studentName: bed.studentName,
            room: room.roomNumber,
            status: current.status,
            remarks: current.remarks
          });
        }
      });
    });

    recordHostelRollCall(rollCallDate, records, 'Pu K. Vanlalhruaia (Chief Warden)');
    setRollCallSaved(true);
    setTimeout(() => setRollCallSaved(false), 3000);
  };

  // Mark all resident students present
  const markAllInDorm = () => {
    const updated = { ...currentRosterStatus };
    hostelRooms.forEach(room => {
      (room.beds || []).forEach(bed => {
        if (bed.studentId) {
          updated[bed.studentId] = { status: 'present', remarks: 'In dormitory room' };
        }
      });
    });
    setCurrentRosterStatus(updated);
  };

  // Save Mess Menu
  const handleSaveMessMenu = () => {
    if (!editingDay || !editingMealType) return;
    updateMessMenu(editingDay, editingMealType, mealTextDraft);
    setEditingDay(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Residential Campus
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {totalVacant} Beds Available
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3 font-['Outfit']">
              Hostel Boarding &amp; Residential Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Lushai Boys Hostel leh Chhimhe Girls Hostel room allocation, zan tin roll-call attendance, zirlai outing gate pass, leh mess chawhmeh timetable.
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setSelectedRoomForAlloc(hostelRooms[0]);
                  setIsAllocateModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
              >
                <Bed className="w-4 h-4" />
                <span>Allocate Student Bed</span>
              </button>
              <button
                onClick={() => setIsGatePassModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs sm:text-sm font-semibold border border-purple-500/30 flex items-center gap-2 transition"
              >
                <Ticket className="w-4 h-4" />
                <span>Issue Outing Pass</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80 text-left">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Total Capacity</span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">{totalBeds} Beds</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Occupied Residents</span>
            <span className="text-lg sm:text-xl font-bold text-purple-300 font-mono">{totalOccupied} Students</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Vacant Beds</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">{totalVacant} Vacant</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Checked-Out / Outing</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono">{activeGatePasses} Outside</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'rooms' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Rooms &amp; Bed Allocations</span>
          </button>

          <button
            onClick={() => setActiveTab('rollcall')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'rollcall' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Night Roll Call (Attendance)</span>
          </button>

          <button
            onClick={() => setActiveTab('gatepass')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'gatepass' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Outing &amp; Gate Passes</span>
            {activeGatePasses > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200 border border-amber-500/40">
                {activeGatePasses} Out
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mess')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'mess' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Weekly Mess Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'rules' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Hostel Rules &amp; Curfew</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ROOMS & BED ALLOCATIONS */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Building Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setBuildingFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                buildingFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Hostels ({hostelRooms.length} Rooms)
            </button>
            <button
              onClick={() => setBuildingFilter('boys')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                buildingFilter === 'boys' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lushai Boys Hostel
            </button>
            <button
              onClick={() => setBuildingFilter('girls')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                buildingFilter === 'girls' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chhimhe Girls Hostel
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRooms.map((room) => {
              const vacancy = room.capacity - room.occupiedBeds;

              return (
                <div 
                  key={room.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {room.buildingName}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        vacancy > 0 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {vacancy > 0 ? `${vacancy} Beds Vacant` : 'Fully Occupied'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white font-['Outfit']">
                          Room #{room.roomNumber} <span className="text-xs text-slate-400 font-normal">({room.floor})</span>
                        </h3>
                        <p className="text-xs text-slate-400">Boarding &amp; Mess: ₹{room.monthlyFee} / month</p>
                      </div>

                      {canManage && vacancy > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRoomForAlloc(room);
                            setIsAllocateModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 flex items-center gap-1 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign Bed</span>
                        </button>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                      <div>Warden: <strong className="text-slate-200">{room.wardenName}</strong></div>
                      <div className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {room.wardenPhone}
                      </div>
                    </div>

                    {/* Interactive Bed Map */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>Dormitory Bed Matrix ({room.occupiedBeds}/{room.capacity} occupied)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {(room.beds || []).map((bed) => {
                          const isOccupied = Boolean(bed.studentId);

                          return (
                            <div
                              key={bed.bedNumber}
                              className={`p-3 rounded-xl border transition ${
                                isOccupied
                                  ? 'bg-slate-950/80 border-purple-500/40'
                                  : 'bg-slate-950/30 border-dashed border-slate-800 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <span className="font-mono font-bold text-slate-400">{bed.bedNumber}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  isOccupied ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {isOccupied ? 'Occupied' : 'Vacant'}
                                </span>
                              </div>

                              {isOccupied ? (
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-white truncate">{bed.studentName}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{bed.class}</div>
                                  {canManage && (
                                    <button
                                      onClick={() => handleVacate(room.id, bed.bedNumber, bed.studentName)}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline pt-1 block"
                                    >
                                      Vacate Bed
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-500 italic py-1">
                                  Empty bed ready for allocation
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: NIGHT ROLL CALL ATTENDANCE */}
      {activeTab === 'rollcall' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-400" />
                Dormitory Night Curfew Roll Call (Dar 8:00 PM)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Zan tin dar 8:00 PM roll call: hostel zirlaite an room theuhvah an awm ngei em tih enfiahna.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={rollCallDate}
                onChange={(e) => setRollCallDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                onClick={markAllInDorm}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Mark All in Dorm
              </button>
              {canManage && (
                <button
                  onClick={handleSaveRollCall}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Night Record</span>
                </button>
              )}
            </div>
          </div>

          {rollCallSaved && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Zan dar 8:00 PM Night Roll Call record chu hlawhtling takin a in-save e!</span>
            </div>
          )}

          {/* Roll Call Student Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Resident Student</th>
                  <th className="p-3.5">Hostel &amp; Room</th>
                  <th className="p-3.5">Curfew Status</th>
                  <th className="p-3.5">Warden Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {hostelRooms.flatMap(r => (r.beds || []).filter(b => b.studentId).map(b => ({ ...b, roomNo: r.roomNumber, building: r.buildingName }))).map((res) => {
                  const current = currentRosterStatus[res.studentId] || { status: 'present', remarks: 'In dormitory room' };

                  return (
                    <tr key={res.studentId} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{res.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{res.class} • {res.bedNumber}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-purple-300">Room #{res.roomNo}</div>
                        <div className="text-[11px] text-slate-500">{res.building}</div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={current.status}
                          onChange={(e) => {
                            setCurrentRosterStatus(prev => ({
                              ...prev,
                              [res.studentId]: { ...current, status: e.target.value }
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none ${
                            current.status === 'present' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : current.status === 'approved_leave'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : current.status === 'late'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <option value="present">🟢 Present (In Dorm)</option>
                          <option value="approved_leave">🔵 On Approved Leave (Gate Pass)</option>
                          <option value="late">🟠 Late / Curfew Breach</option>
                          <option value="absent">🔴 Absent / Missing</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={current.remarks}
                          onChange={(e) => {
                            setCurrentRosterStatus(prev => ({
                              ...prev,
                              [res.studentId]: { ...current, remarks: e.target.value }
                            }));
                          }}
                          placeholder="e.g. In study room, unwell..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OUTING & GATE PASSES */}
      {activeTab === 'gatepass' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                Student Outing &amp; Gate Pass Registry
              </h3>
              <p className="text-xs text-slate-400">
                Medical clinic kal, bazaar kal, emaw weekend home visit dilna lo pawm leh gate check-in/out record.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setGatePassFilter('all')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${gatePassFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  All ({hostelGatePasses.length})
                </button>
                <button
                  onClick={() => setGatePassFilter('checked_out')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${gatePassFilter === 'checked_out' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
                >
                  Outside ({activeGatePasses})
                </button>
                <button
                  onClick={() => setGatePassFilter('returned')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${gatePassFilter === 'returned' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Returned
                </button>
              </div>

              {canManage && (
                <button
                  onClick={() => setIsGatePassModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Pass</span>
                </button>
              )}
            </div>
          </div>

          {/* Gate Pass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostelGatePasses
              .filter(p => {
                if (gatePassFilter === 'checked_out') return p.status === 'checked_out';
                if (gatePassFilter === 'returned') return p.status === 'returned';
                return true;
              })
              .map((pass) => (
                <div
                  key={pass.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{pass.id}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        pass.status === 'returned'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : pass.status === 'checked_out'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : pass.status === 'approved'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {pass.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{pass.studentName}</h4>
                      <p className="text-xs text-purple-300 font-mono">
                        {pass.hostelBuilding} • Room #{pass.roomNumber}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300">Destination: <strong>{pass.destination}</strong></span>
                      </div>
                      <div className="text-slate-400 pl-5">{pass.purpose}</div>
                      <div className="flex items-center gap-2 pl-5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Out: {pass.departureTime} • Return by: {pass.expectedReturnTime}</span>
                      </div>
                      {pass.actualReturnTime && (
                        <div className="pl-5 text-[11px] text-emerald-400">
                          Returned safely at: {pass.actualReturnTime}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Guardian: {pass.guardianContact}</span>
                      <span>{pass.date}</span>
                    </div>
                  </div>

                  {/* Pass Status Action Buttons */}
                  {canManage && (
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {pass.status === 'approved' && (
                        <button
                          onClick={() => updateGatePassStatus(pass.id, 'checked_out')}
                          className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Student Left (Check Out)</span>
                        </button>
                      )}

                      {pass.status === 'checked_out' && (
                        <button
                          onClick={() => updateGatePassStatus(pass.id, 'returned')}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Student Returned (Check In)</span>
                        </button>
                      )}

                      {pass.status === 'returned' && (
                        <span className="text-xs text-slate-500 italic text-center w-full">
                          Gate pass completed &amp; closed.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY MESS MENU */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-400" />
                Weekly Hostel Mess Timetable &amp; Menu
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hostel zirlaite thlai hnah, sa, leh chawhmeh tuihnai hrang hrang kar tluan menu.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Fresh Local Produce (Aizawl)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(hostelMessMenu).map(([day, meals]) => (
              <div
                key={day}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="text-base font-bold text-white font-['Outfit']">{day}</h4>
                  <span className="text-[10px] uppercase font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">
                    Day Schedule
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-amber-400 uppercase text-[10px] block mb-0.5">☕ Tukthuan / Breakfast</span>
                    <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{meals.breakfast}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-cyan-400 uppercase text-[10px] block mb-0.5">🍲 Chhun Chaw / Lunch</span>
                    <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{meals.lunch}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-purple-400 uppercase text-[10px] block mb-0.5">🫖 Tlai Thingpui / Snacks</span>
                    <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{meals.snacks}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-400 uppercase text-[10px] block mb-0.5">🍗 Zanriah / Dinner</span>
                    <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{meals.dinner}</p>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingDay(day);
                      setEditingMealType('dinner');
                      setMealTextDraft(meals.dinner);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit {day} Menu</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Edit Mess Menu Modal */}
          {editingDay && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    Update {editingDay} Menu
                  </h3>
                  <button onClick={() => setEditingDay(null)} className="text-slate-400 hover:text-slate-200">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Select Meal</label>
                    <select
                      value={editingMealType}
                      onChange={(e) => {
                        setEditingMealType(e.target.value);
                        setMealTextDraft(hostelMessMenu[editingDay][e.target.value]);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Evening Tea / Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Meal Items</label>
                    <textarea
                      rows={3}
                      value={mealTextDraft}
                      onChange={(e) => setMealTextDraft(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setEditingDay(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMessMenu}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25"
                  >
                    Save Meal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RULES & CURFEW */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              Mizoram School Hostel Boarding Rules &amp; Code of Conduct
            </h3>
            <p className="text-xs text-slate-400">
              Hostel zirlai zawng zawngte leh nu leh pate zawm ngei tur dan leh hrai duan te:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {hostelRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {rule.category}
                    </span>
                    <span className="text-[10px] text-rose-400 font-medium">Penalty: {rule.penalty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{rule.title}</h4>
                  <p className="text-xs text-slate-300 leading-5">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALLOCATE BED MODAL */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bed className="w-4 h-4 text-purple-400" />
                Assign Student to Bed
              </h3>
              <button onClick={() => setIsAllocateModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            {allocationMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                allocationMessage.type === 'success' 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {allocationMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{allocationMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmAllocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Hostel Room</label>
                <select
                  value={selectedRoomForAlloc?.id || ''}
                  onChange={(e) => setSelectedRoomForAlloc(hostelRooms.find(r => r.id === e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {hostelRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.buildingName} - Room #{r.roomNumber} ({r.capacity - r.occupiedBeds} beds vacant)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Bed Number</label>
                <select
                  value={selectedBedNumber}
                  onChange={(e) => setSelectedBedNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {['Bed-1', 'Bed-2', 'Bed-3', 'Bed-4'].map(bed => {
                    const bedObj = (selectedRoomForAlloc?.beds || []).find(b => b.bedNumber === bed);
                    const isOccupied = Boolean(bedObj?.studentId);
                    return (
                      <option key={bed} value={bed} disabled={isOccupied}>
                        {bed} {isOccupied ? `(Occupied by ${bedObj.studentName})` : '(Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Enrolled Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNo} • Class {s.classId.replace('cls-', '')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/25"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE GATE PASS MODAL */}
      {isGatePassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-purple-400" />
                Issue Outing Gate Pass
              </h3>
              <button onClick={() => setIsGatePassModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateGatePass} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Student</label>
                <select
                  required
                  value={newGatePass.studentId}
                  onChange={(e) => setNewGatePass({ ...newGatePass, studentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="">-- Choose Resident Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={newGatePass.destination}
                  onChange={(e) => setNewGatePass({ ...newGatePass, destination: e.target.value })}
                  placeholder="e.g. Civil Hospital, Home Weekend, Market"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  required
                  value={newGatePass.purpose}
                  onChange={(e) => setNewGatePass({ ...newGatePass, purpose: e.target.value })}
                  placeholder="e.g. Doctor check-up, Family visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={newGatePass.departureTime}
                    onChange={(e) => setNewGatePass({ ...newGatePass, departureTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Return Curfew</label>
                  <input
                    type="time"
                    value={newGatePass.expectedReturnTime}
                    onChange={(e) => setNewGatePass({ ...newGatePass, expectedReturnTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guardian Phone &amp; Consent</label>
                <input
                  type="text"
                  value={newGatePass.guardianContact}
                  onChange={(e) => setNewGatePass({ ...newGatePass, guardianContact: e.target.value })}
                  placeholder="+91 94361 45671 (Parent confirmed by call)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGatePassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/25"
                >
                  Approve &amp; Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
