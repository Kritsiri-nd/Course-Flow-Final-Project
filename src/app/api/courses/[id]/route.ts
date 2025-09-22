import { NextRequest, NextResponse } from "next/server";


// GET /api/courses/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Convert string id to number for comparison
        const courseId = parseInt(id);

        // Find the course by ID
        const course = courses.find((c) => c.id === courseId);

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(course, { status: 200 });
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const courseId = parseInt(id);

        const courseIndex = courses.findIndex((c) => c.id === courseId);

        if (courseIndex === -1) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Update the course
        courses[courseIndex] = { ...courses[courseIndex], ...body };

        return NextResponse.json(courses[courseIndex], { status: 200 });
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const courseId = parseInt(id);

        const courseIndex = courses.findIndex((c) => c.id === courseId);

        if (courseIndex === -1) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Remove the course
        courses.splice(courseIndex, 1);

        return NextResponse.json(
            { message: "Course deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
