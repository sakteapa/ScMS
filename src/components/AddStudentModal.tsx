import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Save, QrCode, Download, Eye } from 'lucide-react';
import { FirestoreStudent, SchoolClass } from '../types';
import { addDocument, updateDocument } from '../lib/firebase';
import {
  buildStudentQrPayload,
  serializeStudentQr,
  generateStudentQrDataUrl,
} from '../lib/qrCodeService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  initialStudent?: FirestoreStudent | null;
  existingStudents: FirestoreStudent[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  initialStudent,
  existingStudents,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState<number>(1);
  const [classId, setClassId] = useState(classes[0]?.id || 'class_10_a');
  const [parentPhone, setParentPhone] = useState('+91 9862');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('Khatla, Aizawl');
  const [emergencyContact, setEmergencyContact] = useState('+91 9436');
  const [marks, setMarks] = useState<number>(85);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');
  const [showQrPreview, setShowQrPreview] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId) || classes[0],
    [classes, classId]
  );

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name);
      setRollNo(initialStudent.rollNo);
      setClassId(initialStudent.classId);
      setParentPhone(initialStudent.parentPhone);
      setGender(initialStudent.gender);
      setBloodGroup(initialStudent.bloodGroup || 'B+');
      setAddress(initialStudent.address);
      setEmergencyContact(initialStudent.emergencyContact || initialStudent.parentPhone);
      setMarks(initialStudent.marks || 80);
      setRemarks(initialStudent.remarks || '');
    } else {
      const nextRoll =
        existingStudents.length > 0
          ? Math.max(...existingStudents.map((s) => s.rollNo)) + 1
          : 1;
      setName('');
      setRollNo(nextRoll);
      setClassId(classes[0]?.id || 'class_10_a');
      setParentPhone('+91 9862');
      setGender('Male');
      setBloodGroup('B+');
      setAddress('Aizawl, Mizoram');
      setEmergencyContact('+91 9436');
      setMarks(80);
      setRemarks('');
    }
  }, [initialStudent, isOpen, existingStudents, classes]);

  // Live QR Code generation whenever student name, roll, or class changes
  useEffect(() => {
    if (!name.trim()) {
      setPreviewQrUrl('');
      return;
    }
    const payload = buildStudentQrPayload({
      id: initialStudent?.id || `std-preview-${rollNo}`,
      name: name.trim(),
      rollNo: Number(rollNo) || 1,
      classId: selectedClass?.id || classId,
      className: selectedClass?.name || 'Class 10',
      stage: selectedClass?.stage,
      stream: selectedClass?.stream,
      parentPhone: parentPhone.trim(),
      bloodGroup,
    });

    generateStudentQrDataUrl(payload, { width: 180 })
      .then(setPreviewQrUrl)
      .catch((err) => console.error('Error generating preview QR:', err));
  }, [name, rollNo, classId, selectedClass, parentPhone, bloodGroup, initialStudent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const className = selectedClass ? selectedClass.name : 'Class 10 - Section A';
      const studentId = initialStudent ? initialStudent.id : `std-${Date.now()}`;

      // Build standardized dynamic QR payload
      const qrPayload = buildStudentQrPayload({
        id: studentId,
        name: name.trim(),
        rollNo: Number(rollNo),
        classId,
        className,
        stage: selectedClass?.stage,
        stream: selectedClass?.stream,
        parentPhone: parentPhone.trim(),
        bloodGroup,
      });
      const qrCodeData = serializeStudentQr(qrPayload);

      if (initialStudent) {
        await updateDocument('students', initialStudent.id, {
          name: name.trim(),
          rollNo: Number(rollNo),
          classId,
          className,
          stage: selectedClass?.stage,
          stream: selectedClass?.stream,
          parentPhone: parentPhone.trim(),
          gender,
          bloodGroup,
          address: address.trim(),
          emergencyContact: emergencyContact.trim(),
          marks: Number(marks),
          remarks: remarks.trim(),
          qrCodeData,
        });
      } else {
        await addDocument('students', {
          id: studentId,
          name: name.trim(),
          rollNo: Number(rollNo),
          classId,
          className,
          stage: selectedClass?.stage,
          stream: selectedClass?.stream,
          parentPhone: parentPhone.trim(),
          gender,
          bloodGroup,
          address: address.trim(),
          emergencyContact: emergencyContact.trim(),
          marks: Number(marks),
          status: 'Active',
          createdAt: new Date().toISOString(),
          remarks: remarks.trim() || 'Directly enrolled via dashboard with auto QR badge',
          qrCodeData,
        });

        // Add corresponding initial attendance record
        await addDocument('attendance', {
          date: new Date().toISOString().slice(0, 10),
          studentId,
          studentName: name.trim(),
          rollNo: Number(rollNo),
          classId,
          className,
          status: 'Present',
          markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          remarks: 'Auto-enrolled attendance entry with registered QR badge',
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving student to Firestore:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full p-6 text-gray-100 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialStudent ? 'Edit Student Record' : 'Add New Student (Zirlai Thar)'}
              </h3>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span>Firestore: <code className="text-indigo-300">students</code></span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Auto-QR Enabled
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Real-time Dynamic QR Badge Preview Card */}
          {name.trim() && previewQrUrl && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={previewQrUrl}
                  alt="QR Preview"
                  className="w-14 h-14 bg-white p-1 rounded-md shrink-0 border border-indigo-400/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                      Dynamic QR Code Generated
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      zoxs-sms
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    {name} • Roll #{rollNo}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {selectedClass?.name || 'Class 10'} • ID: std-{rollNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowQrPreview(!showQrPreview)}
                  className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] cursor-pointer"
                  title="Toggle QR Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <a
                  href={previewQrUrl}
                  download={`QR_${rollNo}_${name.replace(/\s+/g, '_')}.png`}
                  className="p-1.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[11px] transition-colors cursor-pointer"
                  title="Download QR PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {showQrPreview && (
            <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 font-mono text-[10px] text-gray-400 break-all">
              <span className="text-indigo-400 font-semibold block mb-0.5">Encoded QR Payload:</span>
              {JSON.stringify({
                system: 'zoxs-sms',
                v: 1,
                name,
                rollNo,
                classId,
                stage: selectedClass?.stage,
                stream: selectedClass?.stream,
                phone: parentPhone,
                bloodGroup,
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entirnan: Lalruatkima Colney"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Roll Number *
              </label>
              <input
                type="number"
                required
                min={1}
                value={rollNo}
                onChange={(e) => setRollNo(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Class / Section *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.stream ? `(${cls.stream})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Male">Male (Mipa)</option>
                <option value="Female">Female (Hmeichhia)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Parent Phone *
              </label>
              <input
                type="text"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+91 9862..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Emergency Phone
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 9436..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Residential Address / Veng (Mizoram)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Mission Veng, Aizawl"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Conduct / Health / Academic Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. School bus route #3, Science club member, Allergies..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
              <QrCode className="w-3 h-3 text-indigo-400" />
              ID Badge QR created automatically
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmitting ? 'Registering...' : initialStudent ? 'Update Record' : 'Register Student & Issue QR'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

