"use client";

/**
 * 予約管理ページ
 * 予約の照会・変更・キャンセル
 */

import { motion } from "motion/react";
import Link from "next/link";
import { ManageBooking } from "@/components/manage-booking";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Info } from "lucide-react";
import { BOOKING_RULES } from "@/lib/constants";

export default function ManagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
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
            <Settings className="h-8 w-8 text-primary" />
            管理預約
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            查詢、修改或取消您的課程預約
          </p>
        </motion.div>

        {/* 說明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-muted/50 border rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">注意事項</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • 課程開始前 {BOOKING_RULES.cancelDeadlineHours}{" "}
                    小時內無法取消
                  </li>
                  <li>
                    • 課程開始前 {BOOKING_RULES.modifyDeadlineHours}{" "}
                    小時內無法修改時間
                  </li>
                  <li>
                    • 每次預約最多可修改 {BOOKING_RULES.maxModifications} 次
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 管理コンポーネント */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <ManageBooking />
        </motion.div>

        {/* 下部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            還沒有預約？
            <Link href="/booking" className="text-primary hover:underline ml-1">
              立即預約課程
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
