'use client';

/**
 * 予約管理コンポーネント
 * 予約の照会・変更・キャンセルを処理
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { bookingQuerySchema, type BookingQueryData } from '@/lib/booking';
import {
  Search,
  Loader2,
  Calendar,
  Clock,
  User,
  Mail,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetails {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  note: string;
  startTime: string;
  endTime: string;
  displayTeacher: string;
  displayStudent: string;
  createdAt: string;
  modificationCount: number;
  canCancel: boolean;
  cancelError?: string;
  canModify: boolean;
  modifyError?: string;
}

export function ManageBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  
  // キャンセル確認ダイアログ
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const form = useForm<BookingQueryData>({
    resolver: zodResolver(bookingQuerySchema),
    defaultValues: {
      bookingId: '',
      email: '',
    },
  });

  const onSubmit = async (data: BookingQueryData) => {
    setIsLoading(true);
    setError(null);
    setBooking(null);
    setEmail(data.email);

    try {
      const response = await fetch(
        `/api/calendar/booking/${data.bookingId}?email=${encodeURIComponent(data.email)}`
      );
      const result = await response.json();

      if (result.success) {
        setBooking(result.booking);
      } else {
        setError(result.error?.message || '查詢失敗');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    
    setIsCanceling(true);
    try {
      const response = await fetch(`/api/calendar/booking/${booking.bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        setCancelSuccess(true);
        toast.success('預約已取消');
      } else {
        toast.error(result.error?.message || '取消失敗');
      }
    } catch {
      toast.error('網路錯誤');
    } finally {
      setIsCanceling(false);
      setShowCancelDialog(false);
    }
  };

  const resetForm = () => {
    setBooking(null);
    setError(null);
    setCancelSuccess(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* 查詢表單 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            查詢預約
          </CardTitle>
          <CardDescription>
            輸入您的預約編號和 Email 來查詢預約詳情
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingId">預約編號</Label>
                <Input
                  id="bookingId"
                  placeholder="MZK-20231225-ABC123"
                  {...form.register('bookingId')}
                  disabled={isLoading}
                />
                {form.formState.errors.bookingId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.bookingId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="queryEmail">Email</Label>
                <Input
                  id="queryEmail"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register('email')}
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  查詢中...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  查詢
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 錯誤訊息 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 取消成功訊息 */}
      <AnimatePresence>
        {cancelSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">預約已成功取消</h3>
                <p className="text-muted-foreground mb-4">
                  取消通知已發送至您的信箱
                </p>
                <Button onClick={resetForm} variant="outline">
                  查詢其他預約
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 預約詳情 */}
      <AnimatePresence>
        {booking && !cancelSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    預約詳情
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {booking.bookingId}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 時間資訊 */}
                <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{booking.displayStudent}</p>
                      <p className="text-sm text-muted-foreground">台北時間</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground pl-8">
                    老師時間: {booking.displayTeacher}
                  </div>
                </div>

                {/* 學生資訊 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">姓名</p>
                      <p className="font-medium">{booking.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{booking.studentEmail}</p>
                    </div>
                  </div>
                </div>

                {/* 備註 */}
                {booking.note && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">備註</p>
                      <p>{booking.note}</p>
                    </div>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    disabled={!booking.canModify}
                    className="flex-1"
                    onClick={() => toast.info('修改功能開發中')}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    修改時間
                    {!booking.canModify && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({booking.modifyError})
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!booking.canCancel}
                    className="flex-1"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    取消預約
                    {!booking.canCancel && (
                      <span className="ml-2 text-xs">
                        ({booking.cancelError})
                      </span>
                    )}
                  </Button>
                </div>

                {/* 修改次數提示 */}
                {booking.modificationCount > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    此預約已修改 {booking.modificationCount} 次
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 取消確認對話框 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認取消預約？</DialogTitle>
            <DialogDescription>
              取消後將無法恢復，老師會收到取消通知。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCanceling}
            >
              返回
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  取消中...
                </>
              ) : (
                '確認取消'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

