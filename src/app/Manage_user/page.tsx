// app/page.tsx
import React from "react";
import ExaminerList from "../components/Exam_List";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <ExaminerList />
    </div>
  );
}
