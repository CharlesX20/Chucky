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
  icons: {
    icon: [
      // Use the exact filenames from your download
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/android-chrome-192x192.png", 
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png", // Note: 512x512 not 515x512
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
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