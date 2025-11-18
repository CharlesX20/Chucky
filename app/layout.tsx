import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";


// Since Georgia is a common system font, we can use it directly
const georgia = {
  variable: "--font-georgia",
  style: "normal",
};

const fontSans = {
  variable: "--font-sans",
  style: "normal",
};

export const metadata: Metadata = {
  title: "Chucky InterviewPrep",
  description: "An AI-powered platform for preparing for mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`font-georgia antialiased`}
      >
        {children}
        <Toaster/>
      </body>
    </html>
  );
}