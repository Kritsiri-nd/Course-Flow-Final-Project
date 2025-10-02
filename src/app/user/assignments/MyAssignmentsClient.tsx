'use client';

import { useState } from 'react';
import AssignmentCard from './AssignmentCard';

interface Assignment {
  id: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  answer: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'overdue';
  courseId: string;
}


interface MyAssignmentsClientProps {
  assignments: Assignment[];
}

export default function MyAssignmentsClient({ assignments }: MyAssignmentsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'submitted'>('all');
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>(assignments);

  // Filter assignments based on active tab
  const filteredAssignments = assignmentsState.filter(assignment => {
    console.log(`🔍 Filtering assignment ${assignment.id}: status=${assignment.status}, activeTab=${activeTab}`);
    switch (activeTab) {
      case 'in-progress':
        return assignment.status === 'in-progress';
      case 'submitted':
        return assignment.status === 'submitted';
      default:
        // แสดงทั้งหมด (pending, in-progress, submitted, overdue)
        return true;
    }
  });

  // Count assignments by status
  const statusCounts = {
    all: assignmentsState.length,
    'in-progress': assignmentsState.filter(a => a.status === 'in-progress').length,
    submitted: assignmentsState.filter(a => a.status === 'submitted').length
  };
  
  console.log('🔍 Filtered assignments:', filteredAssignments);

  const handleSubmitAssignment = (assignmentId: string, answer: string) => {
    setAssignmentsState(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, answer, status: 'submitted' as const }
          : assignment
      )
    );
  };

  const handleAnswerChange = (assignmentId: string, answer: string) => {
    setAssignmentsState(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, answer }
          : assignment
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full opacity-30 -translate-x-16 -translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full opacity-30 translate-x-12 -translate-y-12"></div>
      <div className="absolute top-1/2 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-30 translate-x-10"></div>

      <div className="relative py-6 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-h2 text-black">
            My Assignments
          </h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'in-progress', label: 'In progress' },
            { key: 'submitted', label: 'Submitted' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'all' | 'in-progress' | 'submitted')}
              className={`text-b2 transition-colors pb-2 relative whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          ))}
        </div>

        {/* Assignment Cards */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl space-y-6">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={handleSubmitAssignment}
                  onAnswerChange={handleAnswerChange}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {activeTab === 'in-progress' 
                    ? 'No assignments in progress.' 
                    : activeTab === 'submitted'
                    ? 'No submitted assignments.'
                    : 'No assignments found for this filter.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
