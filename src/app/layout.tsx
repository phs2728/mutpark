import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MutPark | 한국 식품 이커머스",
    template: "%s | MutPark",
  },
  description:
    "MutPark는 터키에서 믿고 구매할 수 있는 한국 식품 이커머스 플랫폼입니다. 할랄 인증 재료와 정통 레시피를 만나보세요.",
  metadataBase: new URL("https://mutpark.app"),
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const locale = params?.locale ?? "ko";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
