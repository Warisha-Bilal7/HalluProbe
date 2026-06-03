import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HalluProbe - Hallucination Detection",
  description: "Domain-Invariant Hallucination Detection for Large Language Models",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
