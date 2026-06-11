import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import ComplianceBanner from "@/components/ComplianceBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Intelligence CRM",
  description:
    "LinkedIn-safe career networking CRM for contacts, companies, jobs, and outreach.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="main">
            <ComplianceBanner />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
