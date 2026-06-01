// "use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import "../globals.css";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
