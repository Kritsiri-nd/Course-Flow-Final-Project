import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// First name validation
export const validateFirstName = (name: string): { isValid: boolean; message?: string } => {
  if (!name.trim()) {
    return { isValid: false, message: 'First name is required' };
  }
  const nameRegex = /^[a-zA-Z'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: "Must consist of English letters only. You can include ' or -. Special characters and numbers are not allowed." };
  }
  return { isValid: true };
};

// Last name validation
export const validateLastName = (name: string): { isValid: boolean; message?: string } => {
  if (!name.trim()) {
    return { isValid: false, message: 'Last name is required' };
  }
  const nameRegex = /^[a-zA-Z'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: "Must consist of English letters only. You can include ' or -. Special characters and numbers are not allowed." };
  }
  return { isValid: true };
};

// Date of birth validation: no future dates, minimum 6 years old
export const validateDateOfBirth = (dateString: string): { isValid: boolean; message?: string } => {
  if (!dateString) {
    return { isValid: false, message: 'Date of birth is required' };
  }
  
  // Parse the date - try different formats
  let selectedDate = dayjs(dateString, 'DD/MM/YY', true);
  
  // If DD/MM/YY format doesn't work, try YYYY-MM-DD format (from HTML date input)
  if (!selectedDate.isValid()) {
    selectedDate = dayjs(dateString, 'YYYY-MM-DD', true);
  }
  
  // If still not valid, try parsing as ISO string
  if (!selectedDate.isValid()) {
    selectedDate = dayjs(dateString);
  }
  
  const today = dayjs();
  
  // Check if date is valid
  if (!selectedDate.isValid()) {
    return { isValid: false, message: 'The minimum age for registration is 6 years old.' };
  }
  
  // Check if date is in the future
  if (selectedDate.isAfter(today, 'day')) {
    return { isValid: false, message: 'Users cannot select the current date or any future dates.' };
  }
  
  // Check if date is today
  if (selectedDate.isSame(today, 'day')) {
    return { isValid: false, message: 'The minimum age for registration is 6 years old.' };
  }
  
  // Check minimum age (6 years)
  const age = today.diff(selectedDate, 'year');
  if (age < 6) {
    return { isValid: false, message: 'The minimum age for registration is 6 years old.' };
  }
  
  // Check maximum age (reasonable limit to prevent invalid dates)
  if (age > 120) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }
  
  return { isValid: true };
};

// Email validation: format and basic structure
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Must be in a valid email format, containing "@" and ".com".' };
  }
  
  // Must contain .com domain per requirements
  if (!email.toLowerCase().includes('.com')) {
    return { isValid: false, message: 'Must be in a valid email format, containing "@" and ".com".' };
  }
  
  return { isValid: true };
};

// Password validation: minimum 12 characters
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  // Must be strictly longer than 12 characters
  if (password.length <= 12) {
    return { isValid: false, message: 'Must be longer than 12 characters.' };
  }
  
  return { isValid: true };
};

// Educational background validation: required field
export const validateEducationalBackground = (background: string): { isValid: boolean; message?: string } => {
  if (!background.trim()) {
    return { isValid: false, message: 'This field is required and cannot be null.' };
  }
  
  return { isValid: true };
};

// ============================================
// Credit Card Validation Functions
// ============================================

// Luhn Algorithm สำหรับตรวจสอบหมายเลขบัตร
export const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Card Type Detection
export const getCardType = (cardNumber: string): string | null => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  
  return null;
};

// Card Number Validation
export const validateCardNumber = (cardNumber: string): { isValid: boolean; message?: string } => {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!cleanNumber) {
    return { isValid: false, message: 'Card number is required' };
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, message: 'Card number must contain only digits' };
  }

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, message: 'Card number must be between 13-19 digits' };
  }

  if (!luhnCheck(cleanNumber)) {
    return { isValid: false, message: 'Invalid card number' };
  }

  return { isValid: true };
};

// Name on Card Validation
export const validateCardName = (name: string): { isValid: boolean; message?: string } => {
  if (!name.trim()) {
    return { isValid: false, message: 'Cardholder name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }

  const nameRegex = /^[a-zA-Z\s\-\.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and periods' };
  }

  return { isValid: true };
};

// Expiry Date Validation
export const validateCardExpiry = (expiry: string): { isValid: boolean; message?: string } => {
  if (!expiry.trim()) {
    return { isValid: false, message: 'Expiry date is required' };
  }

  const parts = expiry.split('/');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Expiry must be in MM/YY format' };
  }

  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);

  if (isNaN(month) || isNaN(year)) {
    return { isValid: false, message: 'Invalid expiry date' };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, message: 'Month must be between 01-12' };
  }

  // แปลง YY เป็น YYYY
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;
  const fullYear = currentCentury + year;

  // ตรวจสอบว่าปีไม่เกิน 20 ปีจากปัจจุบัน
  if (fullYear > currentYear + 20) {
    return { isValid: false, message: 'Invalid expiry year' };
  }

  // ตรวจสอบว่าบัตรไม่หมดอายุแล้ว
  const currentMonth = new Date().getMonth() + 1;
  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { isValid: false, message: 'Card has expired' };
  }

  return { isValid: true };
};

// CVV Validation
export const validateCardCVV = (cvv: string, cardType?: string): { isValid: boolean; message?: string } => {
  if (!cvv.trim()) {
    return { isValid: false, message: 'CVV is required' };
  }

  if (!/^\d+$/.test(cvv)) {
    return { isValid: false, message: 'CVV must contain only digits' };
  }

  const expectedLength = cardType === 'amex' ? 4 : 3;
  if (cvv.length !== expectedLength) {
    return { isValid: false, message: `CVV must be ${expectedLength} digits` };
  }

  return { isValid: true };
};

// Validate All Card Data
export const validateCardData = (cardData: {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const numberValidation = validateCardNumber(cardData.number);
  if (!numberValidation.isValid) {
    errors.number = numberValidation.message || 'Invalid card number';
  }

  const cardType = getCardType(cardData.number);
  
  const nameValidation = validateCardName(cardData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message || 'Invalid name';
  }

  const expiryValidation = validateCardExpiry(cardData.expiry);
  if (!expiryValidation.isValid) {
    errors.expiry = expiryValidation.message || 'Invalid expiry date';
  }

  const cvvValidation = validateCardCVV(cardData.cvv, cardType || undefined);
  if (!cvvValidation.isValid) {
    errors.cvv = cvvValidation.message || 'Invalid CVV';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
