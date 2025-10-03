"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LearningSidebar() {
  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-orange-500 text-b3">Course</p>
          <h2 className="text-h3 leading-tight">Service Design Essentials</h2>
          <p className="text-b3 text-muted-foreground">
            Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-b3 text-muted-foreground">15% Complete</p>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-[15%] bg-blue-600" />
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="module-1" className="border rounded-md">
            <AccordionTrigger className="px-4 py-3">
              01 Introduction
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full bg-green-500" />
                  Welcome to the Course
                </li>
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full bg-green-500" />
                  Course Overview
                </li>
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full bg-green-500" />
                  Getting to Know You
                </li>
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full bg-green-500" />
                  What is Service Design ?
                </li>
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full bg-green-500" />
                  Service Design vs. UX vs. UI vs. Design Thinking
                </li>
                <li className="flex items-center gap-3 text-b2 bg-blue-50 rounded-md p-3">
                  <span className="size-2 rounded-full bg-blue-500" />4 Levels
                  of Service Design in an Organization
                </li>
                <li className="flex items-center gap-3 text-b2">
                  <span className="size-2 rounded-full border border-gray-400" />
                  Scope of Service Design
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="module-2" className="border rounded-md">
            <AccordionTrigger className="px-4 py-3">
              02 Service Design Theories and Principles
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-b2 text-muted-foreground">
              Coming up next...
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
}
