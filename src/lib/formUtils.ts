// Form validation and formatting utilities

export interface ValidationErrors {
  [key: string]: string;
}

// Number formatting utilities
export const clampNonNegative = (rawValue: string): string => {
  if (rawValue === '') return '';
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return '';
  return numericValue < 0 ? '0' : rawValue;
};

export const stripLeadingZeros = (rawValue: string): string => {
  if (rawValue === '0' || rawValue.startsWith('0.')) return rawValue;
  return rawValue.replace(/^0+(?=\d)/, '');
};

export const sanitizeNumberInput = (rawValue: string): string => {
  return rawValue.replace(/[^0-9.]/g, '');
};

export const formatNumberInput = (rawValue: string): string => {
  const sanitized = sanitizeNumberInput(rawValue);
  const clamped = clampNonNegative(sanitized);
  return stripLeadingZeros(clamped);
};

export const formatPercentageInput = (rawValue: string): string => {
  const formatted = formatNumberInput(rawValue);
  if (formatted === '') return '';
  const numericValue = Number(formatted);
  if (Number.isNaN(numericValue)) return '';
  if (numericValue > 100) return '100';
  return formatted;
};

// Keyboard event handler for number inputs
export const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  
  if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
    return;
  }
  
  if (e.key >= '0' && e.key <= '9') {
    return;
  }
  
  if (e.key === '.' && !e.currentTarget.value.includes('.')) {
    return;
  }
  
  e.preventDefault();
};

// Form validation functions
export const validateCourseForm = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lessons: any[],
  errors: ValidationErrors,
  options?: {
    allowExistingMedia?: boolean;
    existingThumbnailUrl?: string | null;
    existingVideoUrl?: string | null;
    // When true, lesson validations are skipped (used on create page where lessons are added later)
    skipLessonValidation?: boolean;
  }
): { isValid: boolean; newErrors: ValidationErrors } => {
  const newErrors: ValidationErrors = {};

  // Course name validation
  if (!formData.title.trim()) {
    newErrors.title = 'Course name is required';
  } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.title.trim())) {
    newErrors.title = 'Course name can only contain letters and numbers';
  }

  // Price validation
  if (!formData.price.trim()) {
    newErrors.price = 'Price is required';
  } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    newErrors.price = 'Price must be a valid number greater than 0';
  } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
    newErrors.price = 'Price can have up to 2 decimal places';
  }

  // Duration validation
  if (!formData.duration_hours.trim()) {
    newErrors.duration_hours = 'Duration is required';
  } else if (isNaN(Number(formData.duration_hours)) || Number(formData.duration_hours) <= 0) {
    newErrors.duration_hours = 'Duration must be a valid number greater than 0';
  } else if (!/^\d+(\.\d+)?$/.test(formData.duration_hours)) {
    newErrors.duration_hours = 'Duration can only contain numbers';
  }

  // Category validation
  if (!formData.category.trim()) {
    newErrors.category = 'Category is required';
  }

  // Instructor validation
  if (!formData.instructor.trim()) {
    newErrors.instructor = 'Instructor name is required';
  } else if (formData.instructor.trim().length < 2) {
    newErrors.instructor = 'Instructor name must be at least 2 characters';
  }

  // Course summary validation
  if (!formData.summary.trim()) {
    newErrors.summary = 'Course summary is required';
  } else if (!/^[^<>{}[\]\\|`~]+$/.test(formData.summary.trim())) {
    newErrors.summary = 'Course summary can only contain letters, numbers, and basic punctuation';
  }

  // Course detail validation
  if (!formData.description.trim()) {
    newErrors.description = 'Course detail is required';
  } else if (!/^[^<>{}[\]\\|`~]+$/.test(formData.description.trim())) {
    newErrors.description = 'Course detail can only contain letters, numbers, and basic punctuation';
  }

  // Cover image validation
  const hasExistingThumbnail = options?.allowExistingMedia && !!options?.existingThumbnailUrl;
  if (!formData.thumbnail && !hasExistingThumbnail) {
    newErrors.thumbnail = 'Cover image is required';
  } else if (formData.thumbnail) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedImageTypes.includes(formData.thumbnail.type)) {
      newErrors.thumbnail = 'Cover image must be in .jpg, .png, or .jpeg format';
    } else if (formData.thumbnail.size > 5 * 1024 * 1024) {
      newErrors.thumbnail = 'Cover image size must not exceed 5 MB';
    }
  }

  // Video trailer validation
  const hasExistingVideo = options?.allowExistingMedia && !!options?.existingVideoUrl;
  if (!formData.video_url && !hasExistingVideo) {
    newErrors.video_url = 'Video trailer is required';
  } else if (formData.video_url) {
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (!allowedVideoTypes.includes(formData.video_url.type)) {
      newErrors.video_url = 'Video trailer must be in .mp4, .mov, or .avi format';
    } else if (formData.video_url.size > 20 * 1024 * 1024) {
      newErrors.video_url = 'Video trailer size must not exceed 20 MB';
    }
  }

  // Lesson validation
  if (!options?.skipLessonValidation) {
    if (lessons.length === 0) {
      newErrors.lessons = 'Course must have at least 1 lesson';
    } else {
      const totalSubLessons = lessons.reduce((sum, lesson) => sum + lesson.subLessons, 0);
      if (totalSubLessons === 0) {
        newErrors.lessons = 'Course must have at least 1 sub-lesson';
      }
    }
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    newErrors
  };
};
