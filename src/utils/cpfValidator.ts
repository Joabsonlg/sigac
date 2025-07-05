/**
 * CPF validation utilities
 */

/**
 * Remove all non-numeric characters from CPF
 */
export const cleanCpf = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Format CPF with dots and dash (123.456.789-01)
 */
export const formatCpf = (cpf: string): string => {
  const cleaned = cleanCpf(cpf);
  
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Validate CPF format and check digits
 */
export const isValidCpf = (cpf: string): boolean => {
  const cleaned = cleanCpf(cpf);
  
  // Check if CPF has 11 digits
  if (cleaned.length !== 11) return false;
  
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate check digits
  let sum = 0;
  let remainder;
  
  // First check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  // Second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
};

/**
 * Get CPF validation error message
 */
export const getCpfValidationMessage = (cpf: string): string | null => {
  const cleaned = cleanCpf(cpf);
  
  if (!cleaned) return 'CPF é obrigatório';
  if (cleaned.length !== 11) return 'CPF deve ter 11 dígitos';
  if (/^(\d)\1{10}$/.test(cleaned)) return 'CPF inválido';
  if (!isValidCpf(cpf)) return 'CPF inválido';
  
  return null;
};
