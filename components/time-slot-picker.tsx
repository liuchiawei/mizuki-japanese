'use client';

/**
 * 時間枠選択コンポーネント
 * 指定日の利用可能な時間枠を表示し、選択を処理
 */

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Clock, Loader2 } from 'lucide-react';

interface TimeSlot {
  startTimeISO: string;
  endTimeISO: string;
  teacherTime: string;
  studentTime: string;
  displayTeacher: string;
  displayStudent: string;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
  showTeacherTime?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  showTeacherTime = true,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">載入可用時段中...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">此日期沒有可預約的時段</p>
        <p className="text-sm text-muted-foreground/70 mt-1">請選擇其他日期</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((slot, index) => {
        const isSelected = selectedSlot?.startTimeISO === slot.startTimeISO;
        
        return (
          <motion.button
            key={slot.startTimeISO}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectSlot(slot)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border bg-card hover:bg-accent/30'
            )}
          >
            {/* 学生の時間（メイン表示） */}
            <div className="text-lg font-semibold text-foreground">
              {slot.studentTime}
            </div>
            
            {/* 老師の時間（サブ表示） */}
            {showTeacherTime && (
              <div className="text-xs text-muted-foreground mt-1">
                老師: {slot.teacherTime}
              </div>
            )}
            
            {/* 選択インジケーター */}
            {isSelected && (
              <motion.div
                layoutId="selected-indicator"
                className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

