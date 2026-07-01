// custom 404 page

"use client";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        Sorry we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Back
      </button>
    </main>
  );
}

// <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
//   <h2 className="text-4xl font-bold">404</h2>
//   <p className="text-muted-foreground text-sm">This page could not be found.</p>
//   <Link href="/" className="px-4 py-2 rounded-md bg-foreground text-background text-sm hover:opacity-80 transition">
//     Go Home
//   </Link>
// </div>
