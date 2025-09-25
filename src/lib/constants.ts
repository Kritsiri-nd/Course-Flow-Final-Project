// Application constants

export const COURSE_CATEGORIES = [
  "Technology",
  "Business", 
  "Design",
  "Marketing",
  "Programming",
  "Data Science",
  "Digital Marketing",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Project Management",
  "Finance",
  "Language",
  "Photography",
  "Music",
  "Health & Fitness",
  "Personal Development",
  "Other"
] as const;

export const FILE_CONSTRAINTS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    ALLOWED_EXTENSIONS: ['.jpg', '.png', '.jpeg']
  },
  VIDEO: {
    MAX_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_TYPES: ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'],
    ALLOWED_EXTENSIONS: ['.mp4', '.mov', '.avi']
  }
} as const;

export const VALIDATION_PATTERNS = {
  COURSE_NAME: /^[a-zA-Z0-9\s]+$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  DURATION: /^\d+(\.\d+)?$/,
  TEXT_CONTENT: /^[^<>{}[\]\\|`~]+$/
} as const;
