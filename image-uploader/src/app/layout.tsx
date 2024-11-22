import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import gallaryIcon from "./gallary.ico";
import NavBar from '@/components/nav-bar';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Uploader",
  description: "Upload and crop images with ease",
  icons: {
    icon: gallaryIcon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <NavBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}