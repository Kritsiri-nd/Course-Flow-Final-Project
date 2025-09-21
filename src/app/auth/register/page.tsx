'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as React from 'react';
import Popover from '@mui/material/Popover'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validatePassword, validateEducationalBackground } from '@/lib/validators';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navbar';

export default function register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    educationalBackground: '',
    email: '',
    password: ''
  });

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [dobAnchorEl, setDobAnchorEl] = useState<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (name: string, value: string) => {
    let validation;
    
    switch (name) {
      case 'firstName':
        validation = validateFirstName(value);
        break;
      case 'lastName':
        validation = validateLastName(value);
        break;
      case 'dateOfBirth':
        validation = validateDateOfBirth(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'educationalBackground':
        validation = validateEducationalBackground(value);
        break;
      default:
        return;
    }
    
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.message || ''
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    // Clear previous errors
    setErrors({});
    
    // Validate all fields
    // Name validations with field-specific messages
    const firstNameValidation = validateFirstName(formData.firstName);
    const lastNameValidation = validateLastName(formData.lastName);
    const dobValidation = validateDateOfBirth(formData.dateOfBirth);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const backgroundValidation = validateEducationalBackground(formData.educationalBackground);
    
    const validationErrors: {[key: string]: string} = {};
    
    if (!firstNameValidation.isValid) {
      validationErrors.firstName = firstNameValidation.message || '';
    }
    if (!lastNameValidation.isValid) {
      validationErrors.lastName = lastNameValidation.message || '';
    }
    if (!dobValidation.isValid) {
      validationErrors.dateOfBirth = dobValidation.message || '';
    }
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.message || '';
    }
    if (!passwordValidation.isValid) {
      validationErrors.password = passwordValidation.message || '';
    }
    if (!backgroundValidation.isValid) {
      validationErrors.educationalBackground = backgroundValidation.message || '';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Email uniqueness will be checked on the server side
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: data.message || 'Registration successful! Please check your email to verify your account.'
        });
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          educationalBackground: '',
          email: '',
          password: ''
        });
        setSelectedDate(null);
        // Navigate to success page
        router.push('/auth/register/success');
      } else {
        // Map duplicate email server error to the email field inline error
        if (data?.message && typeof data.message === 'string' && data.message.toLowerCase().includes('email is already registered')) {
          setErrors((prev) => ({ ...prev, email: data.message }));
        } else {
          setSubmitMessage({
            type: 'error',
            text: data.message || 'This email is already registered'
          });
        }
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen relative overflow-hidden">
        {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[#F6F7FC]">
        {/* Orange semi-circle - left side */}
        <img 
          src="/assets/Vector 9.png" 
          alt="Orange semi-circle" 
          className="absolute w-[113px] h-[418px] opacity-100 top-[421px] left-[-20px]"
        />
        
        {/* Light blue circle - top left */}
        <img 
          src="/assets/Ellipse 5.png" 
          alt="Light blue circle" 
          className="absolute w-[73px] h-[73px] opacity-100 top-[169px] left-[87px] rotate-[75deg]"
        />
        
        {/* Green plus sign */}
        <img 
          src="/assets/Group 5.png" 
          alt="Green plus sign" 
          className="absolute w-[13.68px] h-[13.68px] opacity-100 top-[284px] left-[187px] rotate-[30deg]"
        />
        
        {/* Dark blue wave shape - top right */}
        <img 
          src="/assets/Vector 8.png" 
          alt="Dark blue wave shape" 
          className="absolute top-0 right-[0px] w-[172.64px] h-[617px] opacity-100 pointer-events-none select-none rotate-0"
        />
        
        {/* Orange circle outline - right side */}
        <img 
          src="/assets/Ellipse 4.png" 
          alt="Orange circle outline" 
          className="absolute w-[35px] h-[35px] opacity-100 top-[589px] right-[50px]"
        />
    </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-88px)] px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Form Title */}
          <h1 className="font-inter font-medium text-[28px] leading-[125%] tracking-[-0.02em] text-[#22269E] text-left mb-6">
            Register to start learning!
          </h1>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
              <Input 
                type="text" 
                id="firstName" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your first name" 
                required
                className={`${errors.firstName ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''} pr-10`}
              />
              {errors.firstName && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                    <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                  </svg>
                </span>
              )}
              </div>
              {errors.firstName && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
              <Input 
                type="text" 
                id="lastName" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your last name" 
                required
                className={`${errors.lastName ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''} pr-10`}
              />
              {errors.lastName && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                    <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                  </svg>
                </span>
              )}
              </div>
              {errors.lastName && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.lastName}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div
                className="relative"
                onClick={(e) => {
                  const target = e.currentTarget as HTMLDivElement
                  setDobAnchorEl(target)
                }}
              >
                <Input
                  type="text"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  placeholder="DD/MM/YY"
                  autoComplete="off"
                  className={`pr-10 cursor-pointer ${errors.dateOfBirth ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''}`}
                  readOnly
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {errors.dateOfBirth ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                      <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <rect x="3" y="5" width="14" height="12" rx="2" stroke="#A0AEC0" strokeWidth="1.2"/>
                      <path d="M7 3V6" stroke="#A0AEC0" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M13 3V6" stroke="#A0AEC0" strokeWidth="1.2" strokeLinecap="round"/>
                      <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#A0AEC0"/>
                    </svg>
                  )}
                </span>
              </div>
              <Popover
                open={Boolean(dobAnchorEl)}
                anchorEl={dobAnchorEl}
                onClose={() => setDobAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      boxShadow:
                        '0px 8px 24px rgba(31, 42, 85, 0.08), 0px 2px 8px rgba(31, 42, 85, 0.06)',
                      border: '1px solid #EEF0F6',
                      p: 1,
                    },
                  },
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={formData.dateOfBirth ? dayjs(formData.dateOfBirth, 'DD/MM/YY', true) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const formatted = dayjs(newValue).format('DD/MM/YY')
                        setFormData((prev) => ({ ...prev, dateOfBirth: formatted }))
                        setDobAnchorEl(null)
                        
                        // Validate the date immediately
                        validateField('dateOfBirth', formatted)
                      } else {
                        setFormData((prev) => ({ ...prev, dateOfBirth: '' }))
                        setDobAnchorEl(null)
                      }
                    }}
                    maxDate={dayjs().subtract(1, 'day')} // Prevent selecting today or future dates
                    minDate={dayjs().subtract(120, 'year')} // Prevent selecting dates more than 120 years ago
                    sx={{
                      '& .MuiPickersCalendarHeader-label': {
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#1F2A55',
                      },
                      '& .MuiPickersArrowSwitcher-root': { color: '#9AA1B9' },
                      '& .MuiDayCalendar-weekDayLabel': { color: '#9AA1B9' },
                      '& .MuiPickersDay-root': {
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#1F2A55',
                      },
                      '& .MuiPickersDay-root:hover': { backgroundColor: '#FFF4EB' },
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#F47E20',
                        color: '#FFFFFF',
                      },
                      '& .MuiPickersDay-root.Mui-selected:hover': { backgroundColor: '#E56F10' },
                      '& .MuiPickersDay-root.MuiPickersDay-today': { border: '1px solid #F47E20' },
                      '& .MuiPickersDay-root.Mui-disabled': { color: '#CCD1E0' },
                    }}
                  />
                </LocalizationProvider>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Educational Background Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="educationalBackground">Educational Background</Label>
              <div className="relative">
              <Input 
                type="text" 
                id="educationalBackground" 
                name="educationalBackground"
                value={formData.educationalBackground}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter Educational Background" 
                required
                className={`${errors.educationalBackground ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''} pr-10`}
              />
              {errors.educationalBackground && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                    <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                  </svg>
                </span>
              )}
              </div>
              {errors.educationalBackground && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.educationalBackground}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
              <Input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email" 
                required
                className={`${errors.email ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''} pr-10`}
              />
              {errors.email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                    <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                  </svg>
                </span>
              )}
              </div>
              {errors.email && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
              <Input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password" 
                required
                className={`${errors.password ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : ''} pr-10`}
              />
              {errors.password && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#9B2FAC"/>
                    <path d="M8 4.5v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11.5" r="0.75" fill="#FFFFFF"/>
                  </svg>
                </span>
              )}
              </div>
              {errors.password && (
                <p className="text-sm leading-none mt-0 text-[#9B2FAC]">{errors.password}</p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="cta"
              size="cta"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-left mt-4">
            <p className="font-inter font-normal text-[14px] leading-[150%] tracking-normal text-black">
              Already have an account?{' '}
              <a href="/auth/login" className="font-inter font-bold text-[14px] leading-[150%] tracking-normal text-[#2F5FAC] hover:text-[#2b559c] transition-colors">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}