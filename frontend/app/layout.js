import { Geist, Geist_Mono } from "next/font/google";
import "@/css/globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PaperVault - University Past Papers Archive",
  description:
    "Access and share past examination papers for academic excellence",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Toaster />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
