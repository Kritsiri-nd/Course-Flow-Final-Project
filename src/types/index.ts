// Assignment related types
export interface Assignment {
    id: number;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
    lesson: {
        id: number;
        title: string;
        module: {
            id: number;
            title: string;
            course: {
                id: number;
                title: string;
                category: string;
            } | null;
        } | null;
    } | null;
}

// Course related types
export interface Course {
    id: number;
    category: string;
    title: string;
    summary: string;
    description: string;
    price: number;
    currency: string;
    thumbnail: string | null;
    video_url: string | null;
    instructor: string | null;
    duration_hours: number;
    created_at: string;
    modules?: Module[];
}

export interface Module {
    id: number;
    title: string;
    order_index: number;
    created_at: string;
    course_id: number;
    lessons?: Lesson[];
}

export interface Lesson {
    id: number;
    title: string;
    order_index: number;
    created_at: string;
    content?: string;
    video_url?: string;
    video_asset_id?: string | null;
    module_id: number;
}

// User related types
export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}
