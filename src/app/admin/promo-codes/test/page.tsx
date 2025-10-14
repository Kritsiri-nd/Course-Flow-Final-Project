'use client'; // คอมโพเนนต์นี้ต้องใช้ State จึงต้องเป็น Client Component

import * as React from "react";
// 🔽 1. Import คอมโพเนนต์ MultiSelect ที่เราสร้างไว้
import { MultiSelect } from "@/components/ui/multi-select";

// 🔽 2. สร้าง Page Component ที่เป็น default export
export default function TestMultiSelectPage() {
    
    // 3. สร้าง State เพื่อเก็บค่าที่ผู้ใช้เลือก
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    // 4. เตรียมข้อมูลตัวเลือก (Options) สำหรับใส่ใน MultiSelect
    const courseOptions = [
        { value: "course-1", label: "Software Design Essentials" },
        { value: "course-2", label: "Software Developer" },
        { value: "course-3", label: "UX/UI Design Beginner" },
        { value: "course-4", label: "Product Design for Business 101" },
        { value: "course-5", label: "Product Design for Business 201", disabled: true },
    ];

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Test Multi-Select</h1>
            
            {/* 🔽 5. เรียกใช้งาน MultiSelect component */}
            <MultiSelect
                options={courseOptions}
                onValueChange={setSelectedValues}
                defaultValue={[]} // หรือค่าเริ่มต้นที่ต้องการ
                placeholder="โปรดเลือกคอร์ส"
                className="w-full"
                maxCount={2}
            />
            
            {/* ส่วนนี้ใช้แสดงผลค่าที่เลือก (สำหรับทดสอบ) */}
            <div className="mt-4">
                <p className="font-semibold">Selected Values:</p>
                <pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm">
                    {JSON.stringify(selectedValues, null, 2)}
                </pre>
            </div>
        </div>
    );
}