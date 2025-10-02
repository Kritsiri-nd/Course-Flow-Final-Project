"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, X, AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SubLesson = {
  id: number;
  name: string;
  file: File | null;
  previewUrl?: string | null;
  existingUrl?: string | null;
  databaseId?: number; // Add this to track the actual database ID
};

interface SubLessonFormProps {
  lessonName: string;
  onLessonNameChange: (value: string) => void;
  subLessons: SubLesson[];
  onSubLessonsChange: (items: SubLesson[]) => void;
  errors?: Record<string, string>;
  moduleId?: string;
  onDeleteLesson?: () => void;
  isDeleting?: boolean;
}

interface SortableSubLessonProps {
  subLesson: SubLesson;
  onRemove: (id: number) => void;
  onChangeName: (id: number, value: string) => void;
  onFilePick: (id: number, file: File | null) => void;
  onClearVideo: (id: number) => void;
  fileInputsRef: React.MutableRefObject<
    Record<number, HTMLInputElement | null>
  >;
  isDeletingVideo?: boolean;
}

function SortableSubLesson({
  subLesson,
  onRemove,
  onChangeName,
  onFilePick,
  onClearVideo,
  fileInputsRef,
  isDeletingVideo = false,
}: SortableSubLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subLesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-6 relative rounded-[12px] border border-[#E7E9F1] bg-[#F6F8FE] p-6 ${
        isDragging ? "z-50" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onRemove(subLesson.id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-sm"
      >
        Delete
      </button>
      <div className="flex items-start gap-3 mb-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded mt-6"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        <div className="flex-1">
          <label className="block font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-black mb-2">
            Sub-lesson name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter sub-lesson name"
            value={subLesson.name}
            onChange={(e) => onChangeName(subLesson.id, e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="pl-7">
        <label className="block font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-black mb-2">
          Video <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-6">
          {subLesson.previewUrl ? (
            <div className="relative w-[160px] h-[160px]">
              <video
                src={subLesson.previewUrl}
                className="w-[160px] h-[160px] rounded-[12px] object-cover"
                controls
              />
              <button
                type="button"
                onClick={() => onClearVideo(subLesson.id)}
                disabled={isDeletingVideo}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-[#6B3FEA] text-white flex items-center justify-center shadow-md hover:bg-[#5a2fe4] focus:outline-none focus:ring-2 focus:ring-[#6B3FEA]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear video"
              >
                {isDeletingVideo ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <label className="w-[160px] h-[160px] rounded-[12px] border border-dashed border-[#D6D9E4] bg-white flex flex-col items-center justify-center text-[#2F5FAC] cursor-pointer hover:bg-gray-50">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Upload Video</span>
              <input
                ref={(el) => {
                  fileInputsRef.current[subLesson.id] = el;
                }}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) =>
                  onFilePick(subLesson.id, e.target.files?.[0] || null)
                }
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubLessonForm({
  lessonName,
  onLessonNameChange,
  subLessons,
  onSubLessonsChange,
  errors = {},
  moduleId,
  onDeleteLesson,
  isDeleting = false,
}: SubLessonFormProps) {
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});
  const [deletingVideoIds, setDeletingVideoIds] = useState<Set<number>>(
    new Set()
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subLessons.findIndex(
        (subLesson) => subLesson.id === active.id
      );
      const newIndex = subLessons.findIndex(
        (subLesson) => subLesson.id === over.id
      );

      const newSubLessons = arrayMove(subLessons, oldIndex, newIndex);
      onSubLessonsChange(newSubLessons);

      // If we have a moduleId, persist the order to the database
      if (moduleId) {
        try {
          const subLessonOrders = newSubLessons.map((subLesson, index) => ({
            id: subLesson.databaseId || subLesson.id, // Use database ID if available
            order_index: index + 1,
          }));

          const response = await fetch("/api/lessons/sublessons/reorder", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              moduleId: moduleId,
              subLessonOrders: subLessonOrders,
            }),
          });

          if (!response.ok) {
            console.error("Failed to update sub-lesson order");
            // Optionally show a toast notification or error message
          }
        } catch (error) {
          console.error("Error updating sub-lesson order:", error);
        }
      }
    }
  };

  const addSubLesson = () => {
    const nextId = Math.max(0, ...subLessons.map((s) => s.id)) + 1;
    onSubLessonsChange([
      ...subLessons,
      { id: nextId, name: "", file: null, previewUrl: null },
    ]);
  };

  const removeSubLesson = (id: number) => {
    onSubLessonsChange(subLessons.filter((s) => s.id !== id));
  };

  const changeSubLessonName = (id: number, value: string) => {
    onSubLessonsChange(
      subLessons.map((s) => (s.id === id ? { ...s, name: value } : s))
    );
  };

  const onFilePick = (id: number, file: File | null) => {
    onSubLessonsChange(
      subLessons.map((s) =>
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

  const clearVideo = async (id: number) => {
    const subLesson = subLessons.find((s) => s.id === id);
    if (!subLesson) return;

    // If there's an existing video URL (from Mux), delete it from Mux only
    // We don't need to update the database here since we're in edit mode
    if (
      subLesson.existingUrl &&
      subLesson.existingUrl.includes("stream.mux.com")
    ) {
      setDeletingVideoIds((prev) => new Set(prev).add(id));

      try {
        console.log(`Deleting video for sub-lesson ID: ${id}`);
        console.log(`Video URL: ${subLesson.existingUrl}`);

        // Extract asset ID from URL
        const extractAssetId = (url: string): string | null => {
          const patterns = [
            /https:\/\/stream\.mux\.com\/([a-zA-Z0-9]+)\.m3u8/,
            /https:\/\/stream\.mux\.com\/([a-zA-Z0-9]+)/,
          ];

          for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
              return match[1];
            }
          }
          return null;
        };

        const assetId = extractAssetId(subLesson.existingUrl);

        if (assetId) {
          console.log(`Extracted asset ID: ${assetId}`);

          // Delete directly from Mux using the asset ID
          const response = await fetch("/api/upload/mux", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoUrl: subLesson.existingUrl,
              recordType: "lesson",
              recordId: subLesson.databaseId || subLesson.id, // Use database ID if available
              forceDelete: true, // Allow partial success
            }),
          });

          const result = await response.json();

          if (response.ok || response.status === 207) {
            // 200 or 207 (partial success)
            console.log("Video deletion result:", result);

            // Show success message even for partial success
            if (
              result.success ||
              result.details?.muxSuccess ||
              result.details?.supabaseSuccess
            ) {
              console.log("Video deleted successfully (full or partial)");
            }
          } else {
            console.error("Failed to delete video:", result);
            // Don't throw error - still allow UI clearing for better UX
          }
        } else {
          console.error(
            "Could not extract asset ID from URL:",
            subLesson.existingUrl
          );
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        // Don't throw error - still allow UI clearing for better UX
      } finally {
        setDeletingVideoIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }

    // Clear the file input and update the UI state
    const input = fileInputsRef.current[id];
    if (input) input.value = "";

    // Update the sub-lesson state to remove video
    onSubLessonsChange(
      subLessons.map((s) =>
        s.id === id
          ? {
              ...s,
              file: null,
              previewUrl: null,
              existingUrl: null, // Clear existing URL as well
            }
          : s
      )
    );
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
            className={`w-full pr-10 ${
              errors.lessonName
                ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                : ""
            }`}
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
        <h3 className="font-inter font-semibold text-[20px] leading-[150%] tracking-[0%] text-[#646D89] mb-3">
          Sub-Lesson
        </h3>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subLessons.map((subLesson) => subLesson.id)}
            strategy={verticalListSortingStrategy}
          >
            {subLessons.map((s) => (
              <SortableSubLesson
                key={s.id}
                subLesson={s}
                onRemove={removeSubLesson}
                onChangeName={changeSubLessonName}
                onFilePick={onFilePick}
                onClearVideo={clearVideo}
                fileInputsRef={fileInputsRef}
                isDeletingVideo={deletingVideoIds.has(s.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          onClick={addSubLesson}
          className="mt-2 w-[208px] h-[60px] px-[32px] py-[18px] gap-[10px] bg-white border border-[#F47E20] text-[#F47E20] rounded-[12px] shadow-[0_1px_6px_0_rgba(0,0,0,0.08)] hover:bg-white hover:text-[#F47E20] hover:border-[#F47E20] active:bg-white focus:bg-white transition-none"
        >
          + Add Sub-lesson
        </Button>
      </div>

      {/* Delete Lesson Button */}
      {onDeleteLesson && (
        <div className="flex justify-end mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="p-0 m-0 bg-transparent border-0 text-[#2F5FAC] font-inter font-bold text-base leading-[150%] tracking-normal cursor-pointer"
              >
                Delete Lesson
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[528px] h-[212px] p-0 !rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-b1 font-medium h-14 border-b border-gray-300 py-2 px-6 flex justify-between items-center">
                  Confirmation
                  <AlertDialogCancel
                    asChild
                    className="!border-none !bg-none !shadow-none"
                  >
                    <button className="text-gray-500">×</button>
                  </AlertDialogCancel>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-b2 text-gray-700 pt-4 px-6">
                  Are you sure you want to delete this lesson?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pb-2 pt-2 px-6 flex gap-3 !justify-center">
                <AlertDialogAction
                  asChild
                  className="h-15 w-2/3 border border-orange-500 !text-orange-500 bg-transparent hover:bg-orange-100 px-4 py-2 rounded-lg text-b2 font-medium"
                >
                  <button onClick={onDeleteLesson} disabled={isDeleting}>
                    {isDeleting
                      ? "Deleting..."
                      : "Yes, I want to delete this lesson"}
                  </button>
                </AlertDialogAction>
                <AlertDialogCancel className="h-15 w-1/3 bg-[#2F5FAC] hover:bg-[#2F5FAC] !text-white px-4 py-2 rounded-lg text-b2 font-medium">
                  No, keep it
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
