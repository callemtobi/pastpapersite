<Link
  key={item.path}
  href={item.path}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
    isActive(item.path)
      ? "bg-primary/10 text-primary"
      : "text-foreground/60 hover:bg-accent"
  }`}
></Link>;

<div className="grid grid-cols-3 gap-4 sm:gap-6">
  {stats.map((stat) => (
    <div key={stat.label} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
        {stat.value}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {stat.label}
      </div>
    </div>
  ))}
</div>;

<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-1">
    <Calendar className="w-4 h-4" />
    {paper.semester} {paper.year}
  </span>
  <span className="flex items-center gap-1">
    <Download className="w-4 h-4" />
    {paper.downloads} downloads
  </span>
  <span className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    {paper.rating}
  </span>
  <span>{paper.pages} pages</span>
</div>;

// -------------------------------------------------------------------------------------- layout
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#DDE3EA] relative">
      {/* Diagonal colour split */}
      <div
        className="absolute inset-0 bg-[#4FC3F7] pointer-events-none"
        style={{
          clipPath: "polygon(100% 0, 100% 41%, 0 100%, 0 56%)",
        }}
      />

      <Header />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-3">
        {children}
      </main>
    </div>
  );
}

// -------------------------------------------------------------------------------------- Header
("use client");

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import "../globals.css";
import {
  GraduationCap,
  Home,
  Download,
  Upload,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = () => {
    router.push("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/download", label: "Download", icon: Download },
    { path: "/upload", label: "Upload", icon: Upload },
  ];
  const isActive = (path) => pathname === path;

  return (
    <header className="custom-nav bg-white  sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground cursor-pointer">
              Pasty Paperyyy
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-[#4FC3F7]/10 text-[#4FC3F7]"
                      : "text-foreground/60 hover:bg-[#DDE3EA]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              size="icon"
              className="custom-nav-buttons"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/60 hover:bg-accent transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} size="icon">
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/60 hover:bg-accent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/60 hover:bg-accent w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

// ------------------------ server.js
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:"),
);
mongoose.connection.once("open", () => {
  console.log("-----> Database connected");
});

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = { origin: [process.env.FRONTEND_URL], credentials: true };
app.use(cors(corsOptions)); // for cross-origin requests/frontend-backend communication

// ROUTES
import auth from "./routes/auth.js";

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server ready");
});

app.use("/api/auth", auth);

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
