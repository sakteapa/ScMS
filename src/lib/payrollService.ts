import { StaffMember, PayrollRecord, StaffLeave } from '../types';

/**
 * Calculate Mizoram Professional Tax based on monthly gross income.
 * Mizoram standard slab:
 * - Up to ₹10,000: ₹0
 * - ₹10,001 to ₹15,000: ₹150
 * - Above ₹15,000: ₹200 (₹300 in Feb/Mar reconciliation)
 */
export function calculateProfessionalTax(monthlyGross: number): number {
  if (monthlyGross <= 10000) return 0;
  if (monthlyGross <= 15000) return 150;
  return 200;
}

/**
 * Calculate Statutory EPF (Employee Provident Fund)
 * 12% of Base Salary (capped at statutory wage ceiling ₹15,000 or full basic for private/aided institutions)
 */
export function calculateEpf(baseSalary: number): number {
  return Math.round(baseSalary * 0.12);
}

/**
 * Convert numbers to Indian English words for official payslips
 */
export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit !== 0 ? ' ' + a[digit] : '');
  }

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  let str = '';
  if (crore > 0) str += inWords(crore) + ' Crore ';
  if (lakh > 0) str += inWords(lakh) + ' Lakh ';
  if (thousand > 0) str += inWords(thousand) + ' Thousand ';
  if (hundred > 0) str += inWords(hundred) + ' Hundred ';
  if (remainder > 0) {
    if (str !== '') str += 'and ';
    str += inWords(remainder) + ' ';
  }
  return `Rupees ${str.trim()} Only`;
}

/**
 * Generate a monthly payroll record for a single staff member
 */
export function generateStaffPayroll(
  staff: StaffMember,
  month: string, // YYYY-MM
  leaves: StaffLeave[] = [],
  overrides?: {
    bonus?: number;
    advanceRecovery?: number;
    tds?: number;
    otherDeductions?: number;
  }
): PayrollRecord {
  const workingDays = 26; // Standard school working days per month (Sundays excluded)

  // Calculate unpaid leave days for this staff member in this month
  const staffMonthLeaves = leaves.filter((l) => {
    return (
      l.staffId === staff.id &&
      l.status === 'Approved' &&
      l.startDate.startsWith(month)
    );
  });

  const unpaidLeaveDays = staffMonthLeaves
    .filter((l) => l.isLwp || l.leaveType === 'Leave Without Pay')
    .reduce((acc, l) => acc + l.totalDays, 0);

  const paidLeaveDays = staffMonthLeaves
    .filter((l) => !l.isLwp && l.leaveType !== 'Leave Without Pay')
    .reduce((acc, l) => acc + l.totalDays, 0);

  const presentDays = Math.max(0, workingDays - unpaidLeaveDays);

  // Per-day rate for LWP
  const perDaySalary = Math.round(staff.baseSalary / workingDays);
  const leaveWithoutPayDeduction = Math.round(unpaidLeaveDays * perDaySalary);

  const hra = staff.allowances.hra || 0;
  const da = staff.allowances.da || 0;
  const medical = staff.allowances.medical || 0;
  const conveyance = staff.allowances.conveyance || 0;
  const bonus = overrides?.bonus || 0;
  const otherAllowance = staff.allowances.special || 0;

  const totalEarnings = staff.baseSalary + hra + da + medical + conveyance + bonus + otherAllowance;

  const epf = calculateEpf(staff.baseSalary);
  const profTax = calculateProfessionalTax(totalEarnings);
  const tds = overrides?.tds || 0;
  const advanceRecovery = overrides?.advanceRecovery || 0;
  const other = overrides?.otherDeductions || 0;

  const totalDeductions = epf + profTax + leaveWithoutPayDeduction + tds + advanceRecovery + other;
  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  const monthFormatted = month.replace('-', '');
  const seqSuffix = String(Math.floor(100 + Math.random() * 900));
  const payslipNumber = `SLIP-${monthFormatted}-${seqSuffix}`;

  return {
    id: `pay-${monthFormatted}-${staff.id}`,
    payslipNumber,
    month,
    staffId: staff.id,
    staffName: staff.name,
    employeeId: staff.employeeId,
    designation: staff.designation,
    department: staff.department,
    baseSalary: staff.baseSalary,
    allowances: {
      hra,
      da,
      medical,
      bonus,
      conveyance,
      other: otherAllowance,
    },
    totalEarnings,
    deductions: {
      epf,
      profTax,
      leaveWithoutPay: leaveWithoutPayDeduction,
      tds,
      advanceRecovery,
      other,
    },
    totalDeductions,
    netSalary,
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    paymentStatus: 'Pending',
    paymentDate: null,
    paymentMethod: staff.bankDetails.accountNumber ? 'Bank Transfer' : 'Cash',
    transactionRef: '',
    disbursedBy: '',
    notes: `Monthly payroll auto-generated for ${month}.`,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Format currency in Indian format
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
