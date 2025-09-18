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

export default function register() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    educationalBackground: '',
    email: '',
    password: ''
  });

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [dobAnchorEl, setDobAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
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

        <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <nav className="w-full h-[88px] opacity-100 flex items-center justify-between px-6 bg-white border-b border-gray-200 box-border">
        <div className="text-2xl font-bold text-gray-800">
          CourseFlow
        </div>
        <div className="flex gap-6 items-center">
          <a href="/public/courses" className="no-underline text-gray-500 hover:text-gray-700 transition-colors">Courses</a>
          <a href="/auth/login" className="no-underline text-gray-500 hover:text-gray-700 transition-colors">Login</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-88px)] px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Form Title */}
          <h1 className="font-inter font-medium text-[36px] leading-[125%] tracking-[-0.02em] text-[#22269E] text-left mb-8">
            Register to start learning!
          </h1>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="name">Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Name and Lastname" 
                required
              />
            </div>

            {/* Date of Birth Field */}
            <div className="grid w-full max-w-sm items-center gap-3">
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
                  className="pr-10 cursor-pointer"
                  readOnly
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <rect x="3" y="5" width="14" height="12" rx="2" stroke="#A0AEC0" strokeWidth="1.2"/>
                    <path d="M7 3V6" stroke="#A0AEC0" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M13 3V6" stroke="#A0AEC0" strokeWidth="1.2" strokeLinecap="round"/>
                    <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#A0AEC0"/>
                  </svg>
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
                    value={formData.dateOfBirth ? dayjs(formData.dateOfBirth, 'DD/MM/YY') : null}
                    onChange={(newValue) => {
                      const formatted = newValue ? dayjs(newValue).format('DD/MM/YY') : ''
                      setFormData((prev) => ({ ...prev, dateOfBirth: formatted }))
                      setDobAnchorEl(null)
                    }}
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
            </div>

            {/* Educational Background Field */}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="educationalBackground">Educational Background</Label>
              <Input 
                type="text" 
                id="educationalBackground" 
                name="educationalBackground"
                value={formData.educationalBackground}
                onChange={handleInputChange}
                placeholder="Enter Educational Background" 
                required
              />
            </div>

            {/* Email Field */}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email" 
                required
              />
            </div>

            {/* Password Field */}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password" 
                required
              />
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="cta"
              size="cta"
              className="w-full"
            >
              Register
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-left mt-6">
            <p className="font-inter font-normal text-[16px] leading-[150%] tracking-normal text-black">
              Already have an account?{' '}
              <a href="/auth/login" className="font-inter font-bold text-[16px] leading-[150%] tracking-normal text-[#2F5FAC] hover:text-[#2b559c] transition-colors">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
