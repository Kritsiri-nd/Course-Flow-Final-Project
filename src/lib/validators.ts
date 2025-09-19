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
  
  // Parse the date with strict format validation
  const selectedDate = dayjs(dateString, 'DD/MM/YY', true);
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

