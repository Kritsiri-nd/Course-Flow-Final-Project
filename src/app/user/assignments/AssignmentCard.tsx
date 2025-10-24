'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  answer: string;
  modelAnswer?: string; // เฉลยจาก admin
  status: 'pending' | 'in-progress' | 'submitted' | 'overdue';
  courseId: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit: (assignmentId: string, answer: string) => void;
  onAnswerChange: (assignmentId: string, answer: string) => void;
}

export default function AssignmentCard({ assignment, onSubmit, onAnswerChange }: AssignmentCardProps) {
  const [answer, setAnswer] = useState(assignment.answer);
  const router = useRouter();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleSubmit = async () => {
    if (answer.trim()) {
      try {
        const response = await fetch('/api/assignments/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignmentId: assignment.id,
            answer: answer
          }),
        });

        if (response.ok) {
          onSubmit(assignment.id, answer);
        }
      } catch (error) {
        // Handle error silently or show user-friendly message
      }
    }
  };

  const handleAnswerChange = async (newAnswer: string) => {
    setAnswer(newAnswer);
    onAnswerChange(assignment.id, newAnswer);
    
    // Auto-save answer as user types (debounced)
    try {
      await fetch('/api/assignments/submit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          answer: newAnswer
        }),
      });
    } catch (error) {
      // Handle error silently
    }
  };

  const handleOpenCourse = () => {
    router.push(`/user/courses/${assignment.courseId}/learning`);
  };

  const canEdit = assignment.status === 'pending' || assignment.status === 'in-progress' || assignment.status === 'overdue';

  return (
    <div className="bg-blue-50 rounded-lg p-4 sm:p-6 shadow-sm border border-blue-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black mb-1">
            Course: {assignment.courseTitle}
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            {assignment.lessonTitle}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium self-start sm:self-auto mt-1 sm:mt-0 rounded ${getStatusStyle(assignment.status)}`}>
          {getStatusText(assignment.status)}
        </span>
      </div>

      {/* Horizontal Layout for Question/Answer and Buttons - Responsive */}
      <div className="flex flex-col lg:flex-row gap-4 justify-center bg-white rounded-lg p-4">
        {/* Question and Answer Box */}
        <div className="flex-1 bg-white rounded-lg p-4">
          <h4 className="text-gray-800 font-medium mb-3">{assignment.question}</h4>
          
          {assignment.status === 'submitted' ? (
            <div className="space-y-4">
              {/* User's Answer */}
              <div>
                <h5 className="text-gray-600 font-medium mb-2">Your Answer:</h5>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {assignment.answer}
                </div>
              </div>
              
              {/* Model Answer/Solution */}
              {assignment.modelAnswer && (
                <div>
                  <h5 className="text-gray-600 font-medium mb-2">Model Answer (เฉลย):</h5>
                  <div className="bg-blue-50 p-3 rounded-lg text-gray-700 leading-relaxed whitespace-pre-line border-l-4 border-blue-500">
                    {assignment.modelAnswer}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Answer..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          )}
        </div>

        {/* Button Box - Vertical Layout */}
        <div className="flex flex-col items-center justify-center rounded-lg p-4">
          <div className="flex flex-col gap-3 items-center">
             {assignment.status !== 'submitted' && (
               <button
                 onClick={handleSubmit}
                 className="w-[279px] sm:w-[119px] h-[60px] pt-[18px] pr-[32px] pb-[18px] pl-[32px] sm:px-8 sm:py-[18px] gap-[10px] rounded-[12px] sm:rounded-xl btn-blue-500 text-center font-medium transition-colors"
               >
                 Submit
               </button>
             )}
              <button
                onClick={handleOpenCourse}
                className="text-[#2F5FAC] text-center font-bold text-base leading-6 tracking-normal hover:text-[#234781] transition-colors"
              >
                Open in Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
