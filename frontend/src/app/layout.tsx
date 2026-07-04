import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduOS AI — Autonomous Education Operating System",
  description:
    "AI-powered multi-agent system that continuously improves student success, instructor effectiveness, curriculum quality, and placement readiness.",
  keywords: ["EdTech", "AI", "Multi-Agent", "Education", "LMS", "Student Analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-[#070b14] text-white">
        {children}
      </body>
    </html>
  );
}
