"use client";

/**
 * 予約ページ
 * 日付と時間を選択して予約
 */

import { motion } from "motion/react";
import Link from "next/link";
import { BookingCalendar } from "@/components/booking-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Info, Clock, AlertCircle } from "lucide-react";
import { BOOKING_RULES, LESSON_DURATION_MINUTES } from "@/lib/constants";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sakura-light/30 to-background">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-serif text-xl font-semibold text-primary">
              Mizuki
            </span>
          </Link>
          <Link
            href="/manage"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            查詢預約
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首頁
            </Link>
          </Button>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 flex items-center justify-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            預約課程
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            選擇您方便的日期和時段，與 Mizuki 老師一起開始日語學習之旅
          </p>
        </motion.div>

        {/* 預約說明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">預約說明</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    每堂課 {LESSON_DURATION_MINUTES} 分鐘
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    可預約 {BOOKING_RULES.advanceBookingDays} 天內的課程
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    請至少提前 {BOOKING_RULES.minAdvanceBookingHours} 小時預約
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 予約カレンダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <BookingCalendar />
        </motion.div>

        {/* 下部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            已經預約？
            <Link href="/manage" className="text-primary hover:underline ml-1">
              查詢或修改預約
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
