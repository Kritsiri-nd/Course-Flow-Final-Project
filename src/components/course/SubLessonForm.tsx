"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, X, AlertCircle } from "lucide-react";

type SubLesson = {
  id: number;
  name: string;
  file: File | null;
  previewUrl?: string | null;
};

interface SubLessonFormProps {
  lessonName: string;
  onLessonNameChange: (value: string) => void;
  subLessons: SubLesson[];
  onSubLessonsChange: (items: SubLesson[]) => void;
  errors?: Record<string, string>;
}

export function SubLessonForm({
  lessonName,
  onLessonNameChange,
  subLessons,
  onSubLessonsChange,
  errors = {},
}: SubLessonFormProps) {
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  const addSubLesson = () => {
    const nextId = Math.max(0, ...subLessons.map(s => s.id)) + 1;
    onSubLessonsChange([
      ...subLessons,
      { id: nextId, name: "", file: null, previewUrl: null },
    ]);
  };

  const removeSubLesson = (id: number) => {
    onSubLessonsChange(subLessons.filter(s => s.id !== id));
  };

  const changeSubLessonName = (id: number, value: string) => {
    onSubLessonsChange(
      subLessons.map(s => (s.id === id ? { ...s, name: value } : s))
    );
  };

  const onFilePick = (id: number, file: File | null) => {
    onSubLessonsChange(
      subLessons.map(s =>
        s.id === id
          ? {
              ...s,
              file,
              previewUrl: file ? URL.createObjectURL(file) : null,
            }
          : s
      )
    );
  };

  const clearVideo = (id: number) => {
    const input = fileInputsRef.current[id];
    if (input) input.value = "";
    onFilePick(id, null);
  };

  return (
    <div className="w-[1120px] mx-auto bg-white rounded-[16px] pt-10 pr-[100px] pb-15 pl-[100px] shadow-sm border border-[#D6D9E4] space-y-10 opacity-100">
      <div>
        <label className="block font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-black mb-2">
          Lesson name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            placeholder="Enter lesson name"
            value={lessonName}
            onChange={(e) => onLessonNameChange(e.target.value)}
            className={`w-full pr-10 ${errors.lessonName ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : ''}`}
          />
          {errors.lessonName && (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
          )}
        </div>
        {errors.lessonName && (
          <p className="text-[#9B2FAC] text-sm mt-1">{errors.lessonName}</p>
        )}
      </div>

      <hr className="border-t border-[#E7E9F1]" />

      <div>
        <h3 className="font-inter font-semibold text-[20px] leading-[150%] tracking-[0%] text-[#646D89] mb-3">Sub-Lesson</h3>

        {subLessons.map((s) => (
          <div key={s.id} className="mb-6 relative rounded-[12px] border border-[#E7E9F1] bg-[#F6F8FE] p-6">
            <button
              type="button"
              onClick={() => removeSubLesson(s.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-sm"
            >
              Delete
            </button>
            <div className="flex items-start gap-3 mb-4">
              <GripVertical className="h-4 w-4 text-gray-400 mt-8" />
              <div className="flex-1">
                <label className="block font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-black mb-2">Sub-lesson name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Enter sub-lesson name"
                  value={s.name}
                  onChange={(e) => changeSubLessonName(s.id, e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="pl-7">
              <label className="block font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-black mb-2">Video <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-6">
                {s.previewUrl ? (
                  <div className="relative w-[160px] h-[160px]">
                    <video src={s.previewUrl} className="w-[160px] h-[160px] rounded-[12px] object-cover" controls />
                    <button
                      type="button"
                      onClick={() => clearVideo(s.id)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-[#6B3FEA] text-white flex items-center justify-center shadow-md hover:bg-[#5a2fe4] focus:outline-none focus:ring-2 focus:ring-[#6B3FEA]/40"
                      aria-label="Clear video"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-[160px] h-[160px] rounded-[12px] border border-dashed border-[#D6D9E4] bg-white flex flex-col items-center justify-center text-[#2F5FAC] cursor-pointer hover:bg-gray-50">
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-xs">Upload Video</span>
                    <input
                      ref={(el) => {
                        fileInputsRef.current[s.id] = el;
                      }}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => onFilePick(s.id, e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSubLesson}
          className="mt-2 w-[208px] h-[60px] px-[32px] py-[18px] gap-[10px] bg-white border border-[#F47E20] text-[#F47E20] rounded-[12px] shadow-[0_1px_6px_0_rgba(0,0,0,0.08)] hover:bg-white hover:text-[#F47E20] hover:border-[#F47E20] active:bg-white focus:bg-white transition-none"
        >
          + Add Sub-lesson
        </Button>
      </div>
    </div>
  );
}


