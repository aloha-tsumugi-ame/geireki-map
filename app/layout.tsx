import type { Metadata } from "next";
import { Dela_Gothic_One, Noto_Sans_JP } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// 本文: Noto Sans JP（可変フォント）。日本語グリフは unicode-range で必要な分だけ読み込まれる。
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

// 見出し・年号: Dela Gothic One（太い見出し用フォント）
const delaGothic = Dela_Gothic_One({
  variable: "--font-dela-gothic",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "芸歴DB｜芸人の芸歴開始年・先輩後輩探索サービス",
    template: "%s｜芸歴DB",
  },
  description:
    "芸人名を検索して、芸歴開始年・芸歴開始年が同じ芸人・芸歴上の前後関係を一目で確認できるサービスです。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${delaGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
