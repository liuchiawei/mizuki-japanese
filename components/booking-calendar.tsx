'use client';

/**
 * 予約カレンダーコンポーネント
 * 日付選択と時間枠選択を統合
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeSlotPicker } from '@/components/time-slot-picker';
import { BookingForm } from '@/components/booking-form';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight } from 'lucide-react';
import { BOOKING_RULES, DEFAULT_STUDENT_TIMEZONE } from '@/lib/constants';

interface TimeSlot {
  startTimeISO: string;
  endTimeISO: string;
  teacherTime: string;
  studentTime: string;
  displayTeacher: string;
  displayStudent: string;
}

interface BookingCalendarProps {
  studentTimezone?: string;
}

export function BookingCalendar({ studentTimezone = DEFAULT_STUDENT_TIMEZONE }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 可預約的日期範圍
  const today = startOfDay(new Date());
  const minDate = addDays(today, 1); // 明天開始
  const maxDate = addDays(today, BOOKING_RULES.advanceBookingDays);

  // 取得可用時段
  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setIsLoading(true);
    setSlots([]);
    setSelectedSlot(null);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/calendar/available-slots?date=${dateStr}&timezone=${studentTimezone}`
      );
      const data = await response.json();

      if (data.success) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studentTimezone]);

  // 日期變更時取得時段
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  // 判斷日期是否可選
  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    return isBefore(day, minDate) || isBefore(maxDate, day);
  };

  // 預約成功後的處理
  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    setSelectedDate(undefined);
    setSlots([]);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 日曆選擇 */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            選擇日期
          </CardTitle>
          <CardDescription>
            選擇您想要預約課程的日期
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              locale={zhTW}
              className="rounded-md"
              classNames={{
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                day_today: 'bg-accent text-accent-foreground font-bold',
              }}
            />
          </div>
          
          {/* 時區提示 */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>您的時區：台北 (UTC+8)</span>
          </div>
        </CardContent>
      </Card>

      {/* 時段選擇 */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            選擇時段
          </CardTitle>
          <CardDescription>
            {selectedDate ? (
              <>
                {format(selectedDate, 'yyyy年M月d日 (EEEE)', { locale: zhTW })}
                {' '}可預約的時段
              </>
            ) : (
              '請先選擇日期'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="no-date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">請在左側選擇日期</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  選擇後將顯示可預約的時段
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="slots"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  isLoading={isLoading}
                />
                
                {/* 預約按鈕 */}
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => setIsFormOpen(true)}
                    >
                      預約此時段
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 預約表單 Dialog */}
      <BookingForm
        selectedSlot={selectedSlot}
        selectedDate={selectedDate ?? null}
        studentTimezone={studentTimezone}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}

