"use client";

import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { COURSE_CATEGORIES } from "@/lib/constants";
import { formatNumberInput, handleKeyDown } from "@/lib/formUtils";

interface CourseFormData {
  title: string;
  price: string;
  duration_hours: string;
  category: string;
  summary: string;
  description: string;
  instructor: string;
  thumbnail: File | null;
  video_url: File | null;
  attachedFile: File | null;
}

interface CourseInformationProps {
  formData: CourseFormData;
  errors: Record<string, string>;
  onInputChange: (field: keyof CourseFormData, value: string) => void;
}

export function CourseInformation({ formData, errors, onInputChange }: CourseInformationProps) {
  return (
    <div>
      <h2 className="text-h3 font-semibold text-gray-900 mb-4">Course Information</h2>
      <div className="space-y-4">
        {/* Course Name */}
        <div>
          <label className="block text-b3 font-medium text-gray-700 mb-2">
            Course name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input 
              placeholder="Enter course name" 
              className={`w-full pr-10 ${errors.title ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : ''}`}
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
            />
            {errors.title && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
            )}
          </div>
          {errors.title && (
            <p className="text-[#9B2FAC] text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-b3 font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input 
                placeholder="Enter price in THB" 
                className={`w-full pr-10 ${errors.price ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : ''}`}
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => onInputChange('price', formatNumberInput(e.target.value))}
                onKeyDown={handleKeyDown}
              />
              {errors.price && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
              )}
            </div>
            {errors.price && (
              <p className="text-[#9B2FAC] text-sm mt-1">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-b3 font-medium text-gray-700 mb-2">
              Total learning time (hours) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input 
                placeholder="Enter duration in hours" 
                className={`w-full pr-10 ${errors.duration_hours ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : ''}`}
                type="number"
                min="0"
                step="0.1"
                value={formData.duration_hours}
                onChange={(e) => onInputChange('duration_hours', formatNumberInput(e.target.value))}
                onKeyDown={handleKeyDown}
              />
              {errors.duration_hours && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
              )}
            </div>
            {errors.duration_hours && (
              <p className="text-[#9B2FAC] text-sm mt-1">{errors.duration_hours}</p>
            )}
          </div>
        </div>

        {/* Category and Instructor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-b3 font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className={`w-full h-12 rounded-lg border bg-white pt-3 pr-10 pb-3 pl-3 font-inter font-normal text-base leading-[150%] tracking-[0%] text-[#9AA1B9] focus:text-black focus-visible:outline-none focus-visible:border-[#F47E20] disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-right bg-[length:16px] ${
                  errors.category ? 'border-[#9B2FAC] focus:border-[#9B2FAC]' : 'border-[#D6D9E4]'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center'
                }}
                value={formData.category}
                onChange={(e) => onInputChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                {COURSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <AlertCircle className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
              )}
            </div>
            {errors.category && (
              <p className="text-[#9B2FAC] text-sm mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-b3 font-medium text-gray-700 mb-2">
              Instructor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input 
                placeholder="Enter instructor name" 
                className={`w-full pr-10 ${errors.instructor ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : ''}`}
                value={formData.instructor}
                onChange={(e) => onInputChange('instructor', e.target.value)}
              />
              {errors.instructor && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
              )}
            </div>
            {errors.instructor && (
              <p className="text-[#9B2FAC] text-sm mt-1">{errors.instructor}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
