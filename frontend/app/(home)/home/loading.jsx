// skeleton/spinner shown during route transitions

"use client";

export default function Loading() {
  return (
    <div className="min-h-screen p-6 space-y-12 animate-pulse ">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}
