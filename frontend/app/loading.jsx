// skeleton/spinner shown during route transitions

"use client";

export default function Loading() {
  return (
    // <main className="flex-1 flex items-center justify-center">
    //   <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    // </main>

    // -------------------------------------
    // <div className="flex items-center justify-center">
    //   <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
    // </div>

    // -------------------------------------
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}
