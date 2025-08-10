// src/app/(dashboard)/layout.tsx (ปรับปรุง)
'use client'

import AdminSidebarWrapper from '../components/AdminSidebarWrapper'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-200">
      <div className="flex-shrink-0">
        <AdminSidebarWrapper />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-200 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}