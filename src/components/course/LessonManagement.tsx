"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumberInput, handleKeyDown } from "@/lib/formUtils";

interface Lesson {
  id: number;
  name: string;
  subLessons: number;
}

interface LessonManagementProps {
  lessons: Lesson[];
  errors: Record<string, string>;
  onLessonsChange: (lessons: Lesson[]) => void;
  courseId?: string;
}

export function LessonManagement({ lessons, errors, onLessonsChange, courseId }: LessonManagementProps) {
  const router = useRouter();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonSubLessons, setNewLessonSubLessons] = useState('1');

  const addLesson = () => {
    if (!newLessonName.trim()) {
      alert('Please enter a lesson name');
      return;
    }
    
    const subLessonsCount = parseInt(newLessonSubLessons) || 1;
    if (subLessonsCount < 1) {
      alert('Sub-lessons must be at least 1');
      return;
    }

    const newId = Math.max(...lessons.map(l => l.id), 0) + 1;
    const newLesson: Lesson = {
      id: newId,
      name: newLessonName.trim(),
      subLessons: subLessonsCount
    };

    onLessonsChange([...lessons, newLesson]);
    setNewLessonName('');
    setNewLessonSubLessons('1');
  };

  const editLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLessonName(lesson.name);
    setNewLessonSubLessons(lesson.subLessons.toString());
    setShowAddLessonForm(false);
  };

  const updateLesson = () => {
    if (!editingLesson || !newLessonName.trim()) {
      alert('Please enter a lesson name');
      return;
    }

    const subLessonsCount = parseInt(newLessonSubLessons) || 1;
    if (subLessonsCount < 1) {
      alert('Sub-lessons must be at least 1');
      return;
    }

    const updatedLessons = lessons.map(lesson => 
      lesson.id === editingLesson.id 
        ? { ...lesson, name: newLessonName.trim(), subLessons: subLessonsCount }
        : lesson
    );

    onLessonsChange(updatedLessons);
    setEditingLesson(null);
    setNewLessonName('');
    setNewLessonSubLessons('1');
    setShowAddLessonForm(false);
  };

  const deleteLesson = (lessonId: number) => {
    if (lessons.length <= 1) {
      alert('Course must have at least 1 lesson');
      return;
    }

    onLessonsChange(lessons.filter(lesson => lesson.id !== lessonId));
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setNewLessonName('');
    setNewLessonSubLessons('1');
    setShowAddLessonForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm mt-12 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-h3 font-medium text-[#2A2E3F] leading-[125%] tracking-[-2%]">Lesson</h2>
        <button
          type="button"
          onClick={() => {
            if (courseId) {
              router.push(`/admin/lessons/${courseId}`);
            } else {
              router.push('/admin/lessons');
            }
          }}
          className="w-full sm:w-[171px] h-[60px] pt-[18px] pr-[32px] pb-[18px] pl-[32px] gap-[10px] rounded-[12px] bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-[#2F5FAC] hover:scale-105 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </button>
      </div>

      {/* Add/Edit Lesson Form */}
      {(showAddLessonForm || editingLesson) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Lesson Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter lesson name"
                value={newLessonName}
                onChange={(e) => setNewLessonName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Number of Sub-lessons <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Enter number of sub-lessons"
                value={newLessonSubLessons}
                onChange={(e) => setNewLessonSubLessons(formatNumberInput(e.target.value))}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={editingLesson ? updateLesson : addLesson}
              className="bg-[#2F5FAC] text-white hover:bg-[#2F5FAC]"
            >
              {editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingLesson(null);
                setNewLessonName('');
                setNewLessonSubLessons('1');
                setShowAddLessonForm(false);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {editingLesson ? 'Cancel' : 'Close'}
            </Button>
          </div>
        </div>
      )}

      {/* Lesson Error Display */}
      {errors.lessons && (
        <div className="mb-4 p-3 bg-purple-50 border border-[#9B2FAC] rounded-lg">
          <p className="text-[#9B2FAC] text-sm">{errors.lessons}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-300 border-none">
              <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-12">#</th>
              <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Lesson name</th>
              <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Sub-lesson</th>
              <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson, idx) => (
              <tr key={lesson.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-b3 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-3 text-b3 text-gray-900">{lesson.name}</td>
                <td className="px-4 py-3 text-b3 text-gray-900">{lesson.subLessons}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteLesson(lesson.id)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-blue-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editLesson(lesson)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-blue-300" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
