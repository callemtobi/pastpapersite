import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import "@/css/globals.css";
import Sidebar from "@/app/components/Sidebar";
import AdminHeader from "@/components/AdminHeader";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function AdminLayout({ children }) {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) redirect("/login");

  let user;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    user = payload;
  } catch {
    redirect("/login");
  }

  // Check if user has admin role
  if (user.role !== "admin" && user.role !== "super_admin") {
    redirect("/");
  }

  const userName = user.name || "Admin";
  const userEmail = user.email || "admin@papervault.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Pass user data to client components */}
      <Sidebar
        user={{ name: userName, email: userEmail, initial: userInitial }}
      />
      <div className="lg:pl-72">
        <AdminHeader
          user={{ name: userName, email: userEmail, initial: userInitial }}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
