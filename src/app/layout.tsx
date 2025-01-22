import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import AuthButton from "@/components/AuthButton";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealUp - Find the Best Deals",
  description: "Discover and share the best deals online",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    DealUp
                  </Link>
                </div>
                <div className="flex items-center">
                  <AuthButton session={session} />
                </div>
              </div>
            </div>
          </nav>
          <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
