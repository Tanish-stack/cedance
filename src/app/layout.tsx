import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cedance — AI Autonomous Group Project Coordinator",
  description: "Autonomous AI coordinator for engineering teams, turning claims into verified milestones.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground font-sans`}>
        {children}
      </body>
    </html>
  );
}
