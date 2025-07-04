import type { Metadata } from "next";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SessionProviderWrapper } from "../contexts/SessionContext";
import { NextAuthProvider } from "../components/providers/NextAuthProvider";
import { FlashCardProvider } from "../contexts/FlashCardContext";
import { GuestProvider } from "../contexts/GuestContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ace-it-ai-wine.vercel.app"),
  title: "Ace It AI",
  description: "Ready to Ace your Exams? Generate quizzes, flashcards, and mind maps with AI. Interactive learning sessions powered by artificial intelligence.",
  keywords: "Ace It AI, AI learning, quiz generator, flashcards, mind maps, study tools, exam preparation",
  authors: [{ name: "Ace It AI" }],
  verification: {
    google: "BZ9QNKtlxe57HZ-HLfplUwAW9I7Od4HvaJ2wXLWxxw4"
  },
  openGraph: {
    title: "Ace It AI - AI-Powered Learning Platform",
    description: "Ready to Ace your Exams? Generate quizzes, flashcards, and mind maps with AI.",
    url: "https://ace-it-ai-wine.vercel.app",
    siteName: "Ace It AI",
    images: [
      {
        url: "/Ace It AI.png",
        width: 1200,
        height: 630,
        alt: "Ace It AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ace It AI - AI-Powered Learning Platform",
    description: "Ready to Ace your Exams? Generate quizzes, flashcards, and mind maps with AI.",
    images: ["/Ace It AI.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: 'normal' }} suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider>
          <SessionProviderWrapper>
            <NextAuthProvider>
              <GuestProvider>
                <FlashCardProvider>
                  {children}
                  <SpeedInsights />
                </FlashCardProvider>
              </GuestProvider>
            </NextAuthProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
