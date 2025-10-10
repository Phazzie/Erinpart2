import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AnimatedBackground from "@/components/common/animated-background";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Erin's Escapades",
  description: "A collaborative task management app with neon cyberpunk styling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-primary text-white`}>
        {/* Background image layer */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url(https://github.com/user-attachments/assets/1c29799f-26f2-4d3e-a6c2-849f3cf3d7c0)'
          }}
        />
        <AnimatedBackground variant="particles" intensity="medium" />
        <Toaster position="top-right" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
