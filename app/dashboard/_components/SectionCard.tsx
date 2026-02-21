import React from "react";

export default function SectionCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
      {children}
    </div>
  );
}
