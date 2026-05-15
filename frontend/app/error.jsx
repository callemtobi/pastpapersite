// error boundary UI for uncaught runtime errors

"use client";

export default function Error({ error, reset }) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">An error occurred</h1>
        <p className="text-lg">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

//     <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
//   <h2 className="text-2xl font-semibold">Something went wrong</h2>
//   <p className="text-muted-foreground text-sm max-w-md">{error?.message || "An unexpected error occurred."}</p>
//   <button
//     onClick={reset}
//     className="px-4 py-2 rounded-md bg-foreground text-background text-sm hover:opacity-80 transition"
//   >
//     Try again
//   </button>
// </div>
