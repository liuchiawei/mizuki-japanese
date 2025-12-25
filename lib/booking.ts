/**
 * 予約ロジックとバリデーション
 * 予約に関するビジネスルールを定義
 */

import { z } from 'zod';
import { addHours, addDays, isBefore, isAfter } from 'date-fns';
import { BOOKING_RULES, LESSON_DURATION_MINUTES } from './constants';

/**
 * 予約フォームのバリデーションスキーマ
 */
export const bookingFormSchema = z.object({
  studentName: z
    .string()
    .min(1, '請輸入姓名')
    .max(50, '姓名不能超過 50 字'),
  studentEmail: z
    .string()
    .email('請輸入有效的 Email'),
  studentTimezone: z
    .string()
    .default('Asia/Taipei'),
  startTimeISO: z
    .string()
    .datetime('無效的時間格式'),
  note: z
    .string()
    .max(500, '備註不能超過 500 字')
    .optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

/**
 * 查詢/修改/取消預約的驗證スキーマ
 */
export const bookingQuerySchema = z.object({
  bookingId: z
    .string()
    .regex(/^MZK-\d{8}-[A-Z0-9]{6}$/, '無效的預約編號格式'),
  email: z
    .string()
    .email('請輸入有效的 Email'),
});

export type BookingQueryData = z.infer<typeof bookingQuerySchema>;

/**
 * 修改預約的驗證スキーマ
 */
export const modifyBookingSchema = z.object({
  bookingId: z
    .string()
    .regex(/^MZK-\d{8}-[A-Z0-9]{6}$/, '無效的預約編號格式'),
  email: z
    .string()
    .email('請輸入有效的 Email'),
  newStartTimeISO: z
    .string()
    .datetime('無效的時間格式'),
});

export type ModifyBookingData = z.infer<typeof modifyBookingSchema>;

/**
 * 預約時間是否在允許範圍內
 */
export function isBookingTimeValid(startTime: Date): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  
  // 檢查是否超過最小提前預約時間
  const minBookingTime = addHours(now, BOOKING_RULES.minAdvanceBookingHours);
  if (isBefore(startTime, minBookingTime)) {
    return {
      valid: false,
      error: `請至少提前 ${BOOKING_RULES.minAdvanceBookingHours} 小時預約`,
    };
  }

  // 檢查是否超過最大預約天數
  const maxBookingTime = addDays(now, BOOKING_RULES.advanceBookingDays);
  if (isAfter(startTime, maxBookingTime)) {
    return {
      valid: false,
      error: `只能預約 ${BOOKING_RULES.advanceBookingDays} 天內的課程`,
    };
  }

  return { valid: true };
}

/**
 * 是否可以取消預約
 */
export function canCancelBooking(lessonStartTime: Date): {
  canCancel: boolean;
  error?: string;
} {
  const now = new Date();
  const cancelDeadline = addHours(lessonStartTime, -BOOKING_RULES.cancelDeadlineHours);

  if (isAfter(now, cancelDeadline)) {
    return {
      canCancel: false,
      error: `課程開始前 ${BOOKING_RULES.cancelDeadlineHours} 小時內無法取消`,
    };
  }

  return { canCancel: true };
}

/**
 * 是否可以修改預約
 */
export function canModifyBooking(
  lessonStartTime: Date,
  currentModificationCount: number
): {
  canModify: boolean;
  error?: string;
} {
  const now = new Date();
  const modifyDeadline = addHours(lessonStartTime, -BOOKING_RULES.modifyDeadlineHours);

  // 檢查修改次數
  if (currentModificationCount >= BOOKING_RULES.maxModifications) {
    return {
      canModify: false,
      error: `每次預約最多只能修改 ${BOOKING_RULES.maxModifications} 次`,
    };
  }

  // 檢查時間限制
  if (isAfter(now, modifyDeadline)) {
    return {
      canModify: false,
      error: `課程開始前 ${BOOKING_RULES.modifyDeadlineHours} 小時內無法修改`,
    };
  }

  return { canModify: true };
}

/**
 * 計算課程結束時間
 */
export function calculateEndTime(startTime: Date): Date {
  return addHours(startTime, 0); // 使用 addMinutes
}

/**
 * API 錯誤回應類型
 */
export type BookingErrorCode =
  | 'INVALID_INPUT'
  | 'SLOT_TAKEN'
  | 'BOOKING_NOT_FOUND'
  | 'EMAIL_MISMATCH'
  | 'CANNOT_CANCEL'
  | 'CANNOT_MODIFY'
  | 'INTERNAL_ERROR';

export interface BookingError {
  code: BookingErrorCode;
  message: string;
}

/**
 * 創建錯誤回應
 */
export function createBookingError(
  code: BookingErrorCode,
  message: string
): BookingError {
  return { code, message };
}

/**
 * 成功回應類型
 */
export interface BookingSuccessResponse {
  success: true;
  bookingId: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * 失敗回應類型
 */
export interface BookingErrorResponse {
  success: false;
  error: BookingError;
}

export type BookingResponse = BookingSuccessResponse | BookingErrorResponse;

