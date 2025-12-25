"use client";

/**
 * 予約フォームコンポーネント
 * 学生情報の入力と予約送信を処理
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bookingFormSchema, type BookingFormData } from "@/lib/booking";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  startTimeISO: string;
  endTimeISO: string;
  displayStudent: string;
  displayTeacher: string;
}

interface BookingFormProps {
  selectedSlot: TimeSlot | null;
  selectedDate: Date | null;
  studentTimezone: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingSuccess: (bookingId: string) => void;
}

export function BookingForm({
  selectedSlot,
  selectedDate,
  studentTimezone,
  isOpen,
  onOpenChange,
  onBookingSuccess,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    bookingId?: string;
    message: string;
  } | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
      studentTimezone,
      startTimeISO: selectedSlot?.startTimeISO || "",
      note: "",
    },
  });

  // スロットが変更されたらフォームを更新
  if (
    selectedSlot &&
    form.getValues("startTimeISO") !== selectedSlot.startTimeISO
  ) {
    form.setValue("startTimeISO", selectedSlot.startTimeISO);
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setBookingResult(null);

    try {
      const response = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setBookingResult({
          success: true,
          bookingId: result.bookingId,
          message: result.message,
        });
        toast.success("預約成功！");
        onBookingSuccess(result.bookingId);
      } else {
        setBookingResult({
          success: false,
          message: result.error?.message || "預約失敗，請稍後再試",
        });
        toast.error(result.error?.message || "預約失敗");
      }
    } catch {
      setBookingResult({
        success: false,
        message: "網路錯誤，請檢查網路連線後再試",
      });
      toast.error("網路錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // 關閉後重置結果
      setTimeout(() => {
        setBookingResult(null);
        form.reset();
      }, 300);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            預約日語課程
          </DialogTitle>
          <DialogDescription>請填寫您的資料以完成預約</DialogDescription>
        </DialogHeader>

        {/* 結果表示 */}
        {bookingResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6"
          >
            {bookingResult.success ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  預約成功！
                </h3>
                <p className="text-muted-foreground mb-4">
                  {bookingResult.message}
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">您的預約編號</p>
                  <p className="text-lg font-mono font-bold text-primary">
                    {bookingResult.bookingId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    請妥善保存此編號，用於查詢或修改預約
                  </p>
                </div>
                <Button onClick={handleClose} className="mt-6">
                  完成
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  預約失敗
                </h3>
                <p className="text-muted-foreground mb-4">
                  {bookingResult.message}
                </p>
                <Button
                  onClick={() => setBookingResult(null)}
                  variant="outline"
                >
                  重新填寫
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 選択した時間の表示 */}
            {selectedSlot && selectedDate && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedDate)}
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {selectedSlot.displayStudent}
                  <span className="text-sm font-normal text-muted-foreground">
                    (台北時間)
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  老師時間: {selectedSlot.displayTeacher} (東京時間)
                </div>
              </div>
            )}

            {/* 氏名 */}
            <div className="space-y-2">
              <Label htmlFor="studentName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentName"
                placeholder="請輸入您的姓名"
                {...form.register("studentName")}
                disabled={isSubmitting}
              />
              {form.formState.errors.studentName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.studentName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="studentEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentEmail"
                type="email"
                placeholder="your@email.com"
                {...form.register("studentEmail")}
                disabled={isSubmitting}
              />
              {form.formState.errors.studentEmail && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.studentEmail.message}
                </p>
              )}
            </div>

            {/* 備註 */}
            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                備註{" "}
                <span className="text-muted-foreground text-xs">(選填)</span>
              </Label>
              <Input
                id="note"
                placeholder="想學習的內容、程度等..."
                {...form.register("note")}
                disabled={isSubmitting}
              />
            </div>

            {/* 提交ボタン */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedSlot}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    預約中...
                  </>
                ) : (
                  "確認預約"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
