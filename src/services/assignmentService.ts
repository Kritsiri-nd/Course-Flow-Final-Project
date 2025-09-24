import { Assignment, ApiResponse } from "@/types";

const API_BASE_URL = "/api";

export const assignmentService = {
    // Fetch all assignments
    async getAssignments(): Promise<Assignment[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/assignments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching assignments:", error);
            throw error;
        }
    },

    // Create new assignment
    async createAssignment(assignmentData: {
        question: string;
        answer?: string;
        lesson_id: string;
        course_id?: string;
        sub_lesson?: string;
    }): Promise<Assignment> {
        try {
            const response = await fetch(`${API_BASE_URL}/assignments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(assignmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error creating assignment:", error);
            throw error;
        }
    },
};
