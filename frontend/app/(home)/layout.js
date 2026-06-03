"use client";

import Header from "../components/Header";
import "../globals.css";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
