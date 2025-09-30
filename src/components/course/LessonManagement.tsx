"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumberInput, handleKeyDown } from "@/lib/formUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  // When true, render mock-only UI and disable actions (for create page)
  mockOnly?: boolean;
}

interface SortableLessonRowProps {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: number) => void;
  courseId?: string;
  mockOnly?: boolean;
}

function SortableLessonRow({ lesson, index, onEdit, onDelete, courseId, mockOnly }: SortableLessonRowProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`border-t border-gray-200 hover:bg-gray-50 ${isDragging ? 'z-50' : ''}`}
    >
      <td className="px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          disabled={!!mockOnly}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </td>
      <td className="px-4 py-3 text-b3 text-gray-700">{index + 1}</td>
      <td className="px-4 py-3 text-b3 text-gray-900">{lesson.name}</td>
      <td className="px-4 py-3 text-b3 text-gray-900">{lesson.subLessons}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (mockOnly) return;
              onDelete(lesson.id);
            }}
            disabled={!!mockOnly}
            className={`p-2 rounded transition-colors ${mockOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-blue-300" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (mockOnly) return;
              if (courseId) {
                router.push(`/admin/lessons/${courseId}/${lesson.id}/edit`);
              } else {
                onEdit(lesson);
              }
            }}
            disabled={!!mockOnly}
            className={`p-2 rounded transition-colors ${mockOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            title="Edit"
          >
            <Edit className="h-4 w-4 text-blue-300" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function LessonManagement({ lessons, errors, onLessonsChange, courseId, mockOnly }: LessonManagementProps) {
  const router = useRouter();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonSubLessons, setNewLessonSubLessons] = useState('1');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      onLessonsChange(newLessons);

      // If we have a courseId and we're not in mock mode, persist the order to the database
      if (courseId && !mockOnly) {
        try {
          const lessonOrders = newLessons.map((lesson, index) => ({
            id: lesson.id,
            order_index: index + 1
          }));

          const response = await fetch('/api/lessons/reorder', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              courseId: courseId,
              lessonOrders: lessonOrders
            }),
          });

          if (!response.ok) {
            console.error('Failed to update lesson order');
            // Optionally show a toast notification or error message
          }
        } catch (error) {
          console.error('Error updating lesson order:', error);
        }
      }
    }
  };

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

  /*
  const cancelEdit = () => {
    setEditingLesson(null);
    setNewLessonName('');
    setNewLessonSubLessons('1');
    setShowAddLessonForm(false);
  };
  */

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm mt-12 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-h3 font-medium text-[#2A2E3F] leading-[125%] tracking-[-2%]">Lesson</h2>
        <button
          type="button"
          onClick={() => {
            if (mockOnly) {
              setShowAddLessonForm(true);
              return;
            }
            if (courseId) {
              router.push(`/admin/lessons/${courseId}`);
            } else {
              router.push('/admin/lessons');
            }
          }}
          title={mockOnly ? 'Add lesson locally (for course creation)' : undefined}
          className={`w-full sm:w-auto h-[60px] pt-[18px] pr-[32px] pb-[18px] pl-[32px] gap-[10px] rounded-[12px] bg-primary text-primary-foreground shadow-[4px_4px_24px_0px_#00000014] opacity-100 flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer`}
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </button>
      </div>

      {/* Add/Edit Lesson Form */}
      {!mockOnly && (showAddLessonForm || editingLesson) && (
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
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
      {!mockOnly && errors.lessons && (
        <div className="mb-4 p-3 bg-purple-50 border border-[#9B2FAC] rounded-lg">
          <p className="text-[#9B2FAC] text-sm">{errors.lessons}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-300 border-none">
                <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-16"></th>
                <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-12"></th>
                <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Lesson name</th>
                <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Sub-lesson</th>
                <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-32">Action</th>
              </tr>
            </thead>
            <SortableContext items={lessons.map(lesson => lesson.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {lessons.map((lesson, idx) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={idx}
                    onEdit={editLesson}
                    onDelete={deleteLesson}
                    courseId={courseId}
                    mockOnly={mockOnly}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
