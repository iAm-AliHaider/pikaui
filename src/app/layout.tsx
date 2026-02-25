import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pikAui - Voice-Powered Generative UI",
  description: "A multimodal agent that speaks to users via voice AND drives the UI in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
