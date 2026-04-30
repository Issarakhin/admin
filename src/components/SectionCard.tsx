import React from "react";

export default function SectionCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      {children}
    </div>
  );
}
