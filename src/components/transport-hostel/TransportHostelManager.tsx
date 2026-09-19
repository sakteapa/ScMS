import React, { useState, useMemo } from 'react';
import {
  Bus,
  Home,
  CreditCard,
  MapPin,
  Plus,
  Search,
  Users,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  UserCheck,
  UserMinus,
  DollarSign,
  Shield,
  Printer,
  Sparkles,
  Bed,
  FileText,
  Filter,
} from 'lucide-react';
import {
  TransportRoute,
  HostelRoom,
  HostelResident,
  TransportStudentAssignment,
  FirestoreStudent,
  FeeRecord,
} from '../../types';
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '../../lib/firebase';
import {
  RouteModal,
  AssignStudentModal,
  RoomModal,
  CheckInModal,
  CheckOutModal,
} from './TransportHostelModals';
import { TransportHostelFeeManager } from './TransportHostelFeeManager';
import {
  postTransportFeeToStudentLedger,
  postHostelFeeToStudentLedger,
} from '../../lib/transportHostelFeeService';

interface TransportHostelManagerProps {
  routes: TransportRoute[];
  rooms: HostelRoom[];
  students: FirestoreStudent[];
  fees: FeeRecord[];
  userRole?: string;
}

export const TransportHostelManager: React.FC<TransportHostelManagerProps> = ({
  routes,
  rooms,
  students,
  fees,
  userRole = 'Principal',
}) => {
  const [activeTab, setActiveTab] = useState<'transport' | 'hostel' | 'fees' | 'stops'>('transport');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Boys' | 'Girls'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<TransportRoute | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetRouteForAssign, setTargetRouteForAssign] = useState<TransportRoute | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<HostelRoom | null>(null);

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [targetRoomForCheckIn, setTargetRoomForCheckIn] = useState<HostelRoom | null>(null);

  const [checkOutData, setCheckOutData] = useState<{
    room: HostelRoom;
    resident: HostelResident;
  } | null>(null);

  // Manifest Print Modal
  const [manifestRoute, setManifestRoute] = useState<TransportRoute | null>(null);

  // KPI Calculations
  const totalBuses = routes.length;
  const activeBuses = routes.filter((r) => r.status === 'Active').length;
  const totalBusCapacity = routes.reduce((acc, r) => acc + r.capacity, 0);
  const totalRiders = routes.reduce((acc, r) => acc + r.assignedStudents.length, 0);
  const busUtilizationRate = totalBusCapacity > 0 ? Math.round((totalRiders / totalBusCapacity) * 100) : 0;

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, rm) => acc + rm.capacity, 0);
  const activeResidents = rooms.reduce(
    (acc, rm) => acc + rm.residents.filter((res) => res.status === 'Active').length,
    0
  );
  const hostelOccupancyRate = totalBeds > 0 ? Math.round((activeResidents / totalBeds) * 100) : 0;

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchesSearch =
        r.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pickupPoints.some((p) => p.pointName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.assignedStudents.some((s) => s.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((rm) => {
      const matchesSearch =
        rm.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.blockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.wardenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.residents.some((res) => res.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGender = genderFilter === 'All' || rm.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [rooms, searchQuery, genderFilter]);

  // Aggregated Stops Directory
  const allStops = useMemo(() => {
    const list: Array<{
      id: string;
      pointName: string;
      locality: string;
      pickupTime: string;
      dropTime: string;
      busNumber: string;
      routeNumber: string;
      monthlyFee: number;
      assignedStudentsCount: number;
    }> = [];

    routes.forEach((route) => {
      route.pickupPoints.forEach((stop) => {
        const studentCount = route.assignedStudents.filter(
          (s) => s.pickupPointId === stop.id || s.pickupPointName === stop.pointName
        ).length;
        list.push({
          id: stop.id,
          pointName: stop.pointName,
          locality: stop.locality,
          pickupTime: stop.pickupTime,
          dropTime: stop.dropTime,
          busNumber: route.busNumber,
          routeNumber: route.routeNumber,
          monthlyFee: stop.monthlyFee,
          assignedStudentsCount: studentCount,
        });
      });
    });

    return list.sort((a, b) => a.pointName.localeCompare(b.pointName));
  }, [routes]);

  // --- CRUD Handlers for Transport Routes ---
  const handleSaveRoute = async (
    data: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    if (routeToEdit) {
      await updateDocument<TransportRoute>('transport_routes', routeToEdit.id, {
        ...data,
        updatedAt: now,
      });
    } else {
      const newRoute: TransportRoute = {
        id: `route_${Date.now()}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      await addDocument<TransportRoute>('transport_routes', newRoute);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (window.confirm('Are you sure you want to remove this bus route? Assigned students will need to be reallocated.')) {
      await deleteDocument('transport_routes', routeId);
    }
  };

  const handleAssignStudent = async (routeId: string, assignment: TransportStudentAssignment) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;

    const updated = [...route.assignedStudents, assignment];
    await updateDocument<TransportRoute>('transport_routes', routeId, {
      assignedStudents: updated,
      updatedAt: new Date().toISOString(),
    });

    // Auto post current month transport invoice to student fee ledger
    const currentMonth = 'September 2026';
    await postTransportFeeToStudentLedger({
      route,
      student: assignment,
      feeMonth: currentMonth,
      dueDate: '2026-09-30',
      allFees: fees,
      allStudents: students,
    });
  };

  const handleRemoveStudentFromRoute = async (routeId: string, studentId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;
    if (!window.confirm('Remove student from bus route?')) return;

    const updated = route.assignedStudents.filter((s) => s.studentId !== studentId);
    await updateDocument<TransportRoute>('transport_routes', routeId, {
      assignedStudents: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- CRUD Handlers for Hostel Rooms ---
  const handleSaveRoom = async (
    data: Omit<HostelRoom, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    if (roomToEdit) {
      await updateDocument<HostelRoom>('hostel_rooms', roomToEdit.id, {
        ...data,
        updatedAt: now,
      });
    } else {
      const newRoom: HostelRoom = {
        id: `room_${Date.now()}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      await addDocument<HostelRoom>('hostel_rooms', newRoom);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this hostel room?')) {
      await deleteDocument('hostel_rooms', roomId);
    }
  };

  const handleCheckInResident = async (
    roomId: string,
    resident: HostelResident,
    createFeeNow: boolean,
    feeMonth: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedResidents = [...room.residents, resident];
    const occupiedBeds = updatedResidents.filter((r) => r.status === 'Active').length;
    const status = occupiedBeds >= room.capacity ? 'Full' : 'Available';

    await updateDocument<HostelRoom>('hostel_rooms', roomId, {
      residents: updatedResidents,
      occupiedBeds,
      status,
      updatedAt: new Date().toISOString(),
    });

    if (createFeeNow) {
      await postHostelFeeToStudentLedger({
        room,
        resident,
        feeMonth,
        dueDate: '2026-09-30',
        allFees: fees,
        allStudents: students,
      });
    }
  };

  const handleCheckOutResident = async (
    roomId: string,
    residentStudentId: string,
    checkoutDate: string,
    remarks: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedResidents = room.residents.map((res) => {
      if (res.studentId === residentStudentId) {
        return {
          ...res,
          status: 'Checked-Out' as const,
          checkOutDate: checkoutDate,
          remarks: remarks ? `${res.remarks ? res.remarks + '; ' : ''}Checked out: ${remarks}` : res.remarks,
        };
      }
      return res;
    });

    const occupiedBeds = updatedResidents.filter((r) => r.status === 'Active').length;
    const status = occupiedBeds >= room.capacity ? 'Full' : 'Available';

    await updateDocument<HostelRoom>('hostel_rooms', roomId, {
      residents: updatedResidents,
      occupiedBeds,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleResidentLeave = async (roomId: string, residentStudentId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedResidents = room.residents.map((res) => {
      if (res.studentId === residentStudentId) {
        const nextStatus = res.status === 'Active' ? 'On Leave' : 'Active';
        return { ...res, status: nextStatus as any };
      }
      return res;
    });

    await updateDocument<HostelRoom>('hostel_rooms', roomId, {
      residents: updatedResidents,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Campus Logistics & Residential Life
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Mizoram School Education Department</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Transport & Hostel Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage school buses, pickup routes, driver rosters, dormitory rooms, bed allocations, and
            direct automatic student fee ledger billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => {
              setRouteToEdit(null);
              setIsRouteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Bus Route
          </button>
          <button
            onClick={() => {
              setTargetRouteForAssign(null);
              setIsAssignModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <Bus className="w-4 h-4 text-amber-400" /> Assign Bus Rider
          </button>
          <button
            onClick={() => {
              setRoomToEdit(null);
              setIsRoomModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Hostel Room
          </button>
          <button
            onClick={() => {
              setTargetRoomForCheckIn(null);
              setIsCheckInModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <UserCheck className="w-4 h-4 text-indigo-400" /> Check-In Boarder
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Bus Fleet Status</span>
            <Bus className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {activeBuses} <span className="text-sm font-normal text-slate-400">/ {totalBuses} Active</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Riders: {totalRiders}</span>
            <span className="text-amber-400 font-semibold">{busUtilizationRate}% Seats</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pickup Stops</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{allStops.length}</div>
          <div className="mt-1 text-xs text-slate-400">
            Across Aizawl North, South & Central
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Hostel Bed Quota</span>
            <Home className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {activeResidents} <span className="text-sm font-normal text-slate-400">/ {totalBeds} Beds</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>{totalRooms} Rooms</span>
            <span className="text-indigo-400 font-semibold">{hostelOccupancyRate}% Occupied</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Fee Ledger Integration</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            ₹{(
              fees
                .filter((f) => f.feeType === 'Transport' || f.feeType === 'Hostel')
                .reduce((acc, f) => acc + (f.paidAmount || 0), 0)
            ).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Directly collected via school ledger
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'transport'
                ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Bus className="w-4 h-4" /> Transport & Bus Routes ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('hostel')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'hostel'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Home className="w-4 h-4" /> Hostel & Boarding ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'fees'
                ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Fee Ledger & Billing Sync
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'stops'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <MapPin className="w-4 h-4" /> Stop Directory ({allStops.length})
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes, buses, students..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* =========================================================================
         TAB 1: TRANSPORT & BUS ROUTES
         ========================================================================= */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span>
              Showing {filteredRoutes.length} of {routes.length} registered transport routes
            </span>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredRoutes.map((route) => {
              const seatPercent = Math.round((route.assignedStudents.length / route.capacity) * 100);
              const isFull = route.assignedStudents.length >= route.capacity;

              return (
                <div
                  key={route.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            {route.busNumber}
                          </span>
                          <h3 className="text-base font-bold text-white">{route.routeNumber}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              route.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {route.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>{route.vehicleModel}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            Standard Fare: ₹{route.monthlyFee.toLocaleString()}/month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Card & Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
                        <div>
                          <div className="text-slate-400 text-[10px]">DRIVER ON DUTY</div>
                          <div className="font-semibold text-white">{route.driverName}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{route.driverPhone}</div>
                        </div>
                        {route.conductorName && (
                          <div className="border-l border-slate-800 pl-3">
                            <div className="text-slate-400 text-[10px]">CONDUCTOR</div>
                            <div className="font-semibold text-slate-200">{route.conductorName}</div>
                            <div className="text-slate-400 text-[11px] font-mono">{route.conductorPhone}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTargetRouteForAssign(route);
                            setIsAssignModalOpen(true);
                          }}
                          disabled={isFull}
                          className="px-3 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Rider
                        </button>
                        <button
                          onClick={() => setManifestRoute(route)}
                          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-750 transition"
                          title="Print Bus Passenger Manifest"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRouteToEdit(route);
                            setIsRouteModalOpen(true);
                          }}
                          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-750 transition"
                          title="Edit Route & Fleet"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-750 transition"
                          title="Delete Route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Seating Capacity Progress */}
                  <div className="mt-4 pt-1">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Seat Occupancy: <span className="font-semibold text-white">{route.assignedStudents.length} / {route.capacity} Seats</span>
                      </span>
                      <span className={`font-semibold ${isFull ? 'text-rose-400' : 'text-amber-400'}`}>
                        {seatPercent}% {isFull ? '(FULL CAPACITY)' : 'Allocated'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-rose-500' : seatPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(seatPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Two Columns: Pickup Stops & Assigned Students */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                    {/* Pickup Points */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Pickup Stops ({route.pickupPoints.length})
                        </span>
                        <span className="text-[11px] text-slate-500">Chronological Route Order</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {route.pickupPoints.map((stop, idx) => {
                          const stopCount = route.assignedStudents.filter(
                            (s) => s.pickupPointId === stop.id || s.pickupPointName === stop.pointName
                          ).length;
                          return (
                            <div
                              key={stop.id || idx}
                              className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="font-semibold text-white">{stop.pointName}</div>
                                  <div className="text-[10px] text-slate-400">{stop.landmark || stop.locality}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-amber-300 font-mono text-[11px]">{stop.pickupTime}</div>
                                <div className="text-[10px] text-slate-500">{stopCount} Students</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assigned Students Roster */}
                    <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Assigned Pupils ({route.assignedStudents.length})
                        </span>
                        <span className="text-[11px] text-slate-500">Live Fee Clearance</span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {route.assignedStudents.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500">
                            No students currently assigned to this bus route.
                          </div>
                        ) : (
                          route.assignedStudents.map((std) => (
                            <div
                              key={std.studentId}
                              className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{std.studentName}</span>
                                  <span className="text-[10px] text-slate-400">({std.className})</span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Stop: {std.pickupPointName}</span>
                                  <span>•</span>
                                  <span>Parent: {std.parentPhone}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    std.feeStatus === 'Paid'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {std.feeStatus}
                                </span>
                                <button
                                  onClick={() => handleRemoveStudentFromRoute(route.id, std.studentId)}
                                  className="text-slate-500 hover:text-rose-400 p-1"
                                  title="Unassign student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: HOSTEL & BOARDING ROOMS
         ========================================================================= */}
      {activeTab === 'hostel' && (
        <div className="space-y-4">
          {/* Hostel Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Filter Wing:</span>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  onClick={() => setGenderFilter('All')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    genderFilter === 'All' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Wings ({rooms.length})
                </button>
                <button
                  onClick={() => setGenderFilter('Boys')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    genderFilter === 'Boys' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Boys Hostel
                </button>
                <button
                  onClick={() => setGenderFilter('Girls')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    genderFilter === 'Girls' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Girls Hostel
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Total Boarders Enrolled: <span className="font-bold text-white">{activeResidents}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRooms.map((room) => {
              const activeResidentsInRoom = room.residents.filter((r) => r.status === 'Active');
              const occupancyPercent = Math.round((activeResidentsInRoom.length / room.capacity) * 100);
              const isFull = activeResidentsInRoom.length >= room.capacity;

              return (
                <div
                  key={room.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-2xl border shrink-0 ${
                            room.gender === 'Boys'
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                        >
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-white">{room.roomNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                room.gender === 'Boys'
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {room.gender} Wing
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {room.roomType}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {room.blockName} • {room.floor}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setTargetRoomForCheckIn(room);
                            setIsCheckInModalOpen(true);
                          }}
                          disabled={isFull}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow transition disabled:opacity-40 flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Check-In
                        </button>
                        <button
                          onClick={() => {
                            setRoomToEdit(room);
                            setIsRoomModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 rounded-lg hover:bg-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rent & Warden Banner */}
                    <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Monthly Boarding Fee:</span>
                        <div className="font-bold text-emerald-400 text-sm">
                          ₹{room.monthlyFee.toLocaleString()}/mo
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Hostel Warden:</span>
                        <div className="font-medium text-white line-clamp-1">{room.wardenName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{room.wardenPhone}</div>
                      </div>
                    </div>

                    {/* Bed Capacity Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-indigo-400" />
                          Bed Allocation: <span className="font-semibold text-white">{activeResidentsInRoom.length} / {room.capacity} Beds</span>
                        </span>
                        <span className={`font-semibold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isFull ? 'FULL' : `${room.capacity - activeResidentsInRoom.length} Bed(s) Available`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Residents List */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Allocated Resident Students
                      </div>
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {room.residents.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl">
                            No resident students assigned to this room yet.
                          </div>
                        ) : (
                          room.residents.map((res) => (
                            <div
                              key={res.studentId}
                              className={`p-2.5 rounded-xl border transition ${
                                res.status === 'Checked-Out'
                                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                                  : 'bg-slate-950 border-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                                    <span>{res.studentName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({res.bedNumber})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {res.className} • In: {res.checkInDate} • Phone: {res.parentPhone}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                      res.hostelFeeStatus === 'Paid'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    Fee: {res.hostelFeeStatus}
                                  </span>

                                  {res.status === 'Active' ? (
                                    <>
                                      <button
                                        onClick={() => handleToggleResidentLeave(room.id, res.studentId)}
                                        className="text-[10px] text-slate-400 hover:text-amber-300 px-1.5 py-0.5 bg-slate-850 rounded"
                                        title="Mark Outing / Church Camp Leave"
                                      >
                                        Leave
                                      </button>
                                      <button
                                        onClick={() => setCheckOutData({ room, resident: res })}
                                        className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded"
                                        title="Check-out student"
                                      >
                                        Check-Out
                                      </button>
                                    </>
                                  ) : res.status === 'On Leave' ? (
                                    <button
                                      onClick={() => handleToggleResidentLeave(room.id, res.studentId)}
                                      className="text-[10px] text-amber-400 hover:text-emerald-400 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded"
                                    >
                                      Return
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-500">Checked-Out</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {room.amenities.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 3: FEE BILLING & LEDGER INTEGRATION
         ========================================================================= */}
      {activeTab === 'fees' && (
        <TransportHostelFeeManager
          fees={fees}
          students={students}
          routes={routes}
          rooms={rooms}
          cashierName={userRole}
        />
      )}

      {/* =========================================================================
         TAB 4: PICKUP STOPS DIRECTORY
         ========================================================================= */}
      {activeTab === 'stops' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Centralized Aizawl Transit Stop Directory</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of all morning pickup stations and assigned bus lines
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold">
              {allStops.length} Active Stops
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStops.map((stop) => (
              <div
                key={stop.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{stop.pointName}</h4>
                      <span className="text-xs text-slate-400">{stop.locality}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {stop.pickupTime}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Assigned Bus:</span>
                    <div className="font-semibold text-white mt-0.5 font-mono">{stop.busNumber}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Boarding Count:</span>
                    <div className="font-bold text-emerald-400 mt-0.5">{stop.assignedStudentsCount} Students</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => {
          setIsRouteModalOpen(false);
          setRouteToEdit(null);
        }}
        onSave={handleSaveRoute}
        initialRoute={routeToEdit}
      />

      <AssignStudentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTargetRouteForAssign(null);
        }}
        routes={routes}
        students={students}
        targetRoute={targetRouteForAssign}
        onAssign={handleAssignStudent}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setRoomToEdit(null);
        }}
        onSave={handleSaveRoom}
        initialRoom={roomToEdit}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setTargetRoomForCheckIn(null);
        }}
        rooms={rooms}
        students={students}
        targetRoom={targetRoomForCheckIn}
        onCheckIn={handleCheckInResident}
      />

      {checkOutData && (
        <CheckOutModal
          isOpen={true}
          onClose={() => setCheckOutData(null)}
          room={checkOutData.room}
          resident={checkOutData.resident}
          fees={fees}
          onCheckOut={handleCheckOutResident}
        />
      )}

      {/* Printable Passenger Manifest Modal */}
      {manifestRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Daily Bus Transit Manifest</h3>
              </div>
              <button
                onClick={() => setManifestRoute(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 my-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-center border-b border-slate-800 pb-2">
                <div className="font-bold text-sm text-white">MIZORAM SCHOOL SYSTEM (zoxs-sms)</div>
                <div className="text-slate-400">Daily Bus Passenger Roster & Emergency Contact Sheet</div>
                <div className="text-amber-400 mt-1">
                  Bus {manifestRoute.busNumber} • {manifestRoute.routeNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Driver: {manifestRoute.driverName} ({manifestRoute.driverPhone})</div>
                <div>Conductor: {manifestRoute.conductorName || 'N/A'} ({manifestRoute.conductorPhone || 'N/A'})</div>
                <div>Total Riders: {manifestRoute.assignedStudents.length} / {manifestRoute.capacity} Seats</div>
                <div>Date: {new Date().toLocaleDateString()}</div>
              </div>

              <table className="w-full text-left text-[11px] border-t border-slate-800 pt-2">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-1">Roll</th>
                    <th className="py-1">Student Name</th>
                    <th className="py-1">Class</th>
                    <th className="py-1">Stop Point</th>
                    <th className="py-1">Emergency Phone</th>
                    <th className="py-1">Attendance Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {manifestRoute.assignedStudents.map((s) => (
                    <tr key={s.studentId}>
                      <td className="py-1.5">#{s.rollNo}</td>
                      <td className="py-1.5 font-bold text-white">{s.studentName}</td>
                      <td className="py-1.5">{s.className}</td>
                      <td className="py-1.5 text-amber-300">{s.pickupPointName}</td>
                      <td className="py-1.5 font-mono">{s.parentPhone}</td>
                      <td className="py-1.5 text-slate-500">[ &nbsp; ] In &nbsp; [ &nbsp; ] Out</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setManifestRoute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Passenger Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
