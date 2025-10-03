"use client";

import { Card } from "@/components/ui/card";

export default function AssignmentCard() {
  return (
    <Card className="bg-blue-50/60 border-none p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-h3">Assignment</h3>
        <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 text-b4">
          Submitted
        </span>
      </div>
      <div className="space-y-4">
        <p className="text-b2 text-muted-foreground">
          What are the 4 elements of service design?
        </p>
        <div className="text-h4 text-gray-600">
          Four Key Elements of Service Design
        </div>
        <div className="text-b2 text-gray-600 space-y-1">
          <p>People.</p>
          <p>Processes.</p>
          <p>Products.</p>
          <p>Partners.</p>
        </div>
      </div>
    </Card>
  );
}
