/**
 * Verhoeff checksum algorithm tables
 */
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates a 12-digit Aadhaar number using the standard Verhoeff checksum algorithm.
 */
export function validateAadhaarVerhoeff(aadhaar: string): boolean {
  const clean = aadhaar.replace(/[\s-]/g, '');
  if (!/^\d{12}$/.test(clean)) {
    return false;
  }
  let c = 0;
  const reversed = clean.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][reversed[i]]];
  }
  return c === 0;
}

/**
 * Calculates the Verhoeff check digit for an 11-digit number string
 * (useful if generating or repairing a valid sample number)
 */
export function calculateVerhoeffCheckDigit(numStr: string): number {
  const inv: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
  let c = 0;
  const reversed = numStr.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[(i + 1) % 8][reversed[i]]];
  }
  return inv[c];
}

/**
 * Validates a standard Indian PAN format: 5 letters, 4 numbers, 1 letter.
 * Example: ABCDE1234F
 */
export function validatePANFormat(pan: string): boolean {
  if (!pan) return false;
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(clean);
}

/**
 * Validates a 10-digit mobile number.
 */
export function validateMobileNumber(mobile: string): boolean {
  if (!mobile) return false;
  const clean = mobile.replace(/[\s-]/g, '');
  return /^[0-9]{10}$/.test(clean);
}

/**
 * Formats Aadhaar number into masked representation: e.g. "•••• •••• 1234"
 */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return '';
  const clean = aadhaar.replace(/[\s-]/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
}

/**
 * Formats PAN number into masked representation: e.g. "••••••123A"
 */
export function maskPAN(pan: string): string {
  if (!pan) return '';
  const clean = pan.trim().toUpperCase();
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `••••••${last4}`;
}

/**
 * Formats phone number for display (e.g. "+91 98765 43210")
 */
export function formatPhoneNumber(mobile: string): string {
  if (!mobile) return '';
  const clean = mobile.replace(/[\s-]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean;
}
