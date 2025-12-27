/**
 * アプリケーション定数
 * 予約システムの設定値を定義
 */

// 時間帯設定
export const TEACHER_TIMEZONE = process.env.TEACHER_TIMEZONE || "Asia/Tokyo";
export const DEFAULT_STUDENT_TIMEZONE = "Asia/Taipei";

// 授業時間設定（分単位）
export const LESSON_DURATION_MINUTES = 50;
export const BUFFER_TIME_MINUTES = 10; // 授業間の休憩時間

// 老師的工作時間（老師時區）
export const WORKING_HOURS = {
  start: 9, // 09:00
  end: 21, // 21:00
};

// 預約規則
export const BOOKING_RULES = {
  cancelDeadlineHours: 24, // 課前 24 小時可取消
  modifyDeadlineHours: 24, // 課前 24 小時可修改
  maxModifications: 2, // 最多修改 2 次
  advanceBookingDays: 30, // 最多預約 30 天後的課
  minAdvanceBookingHours: 24, // 最少提前 24 小時預約
};

// 預約 ID 前綴
export const BOOKING_ID_PREFIX = "MZK";

// 時段間隔（分鐘）- 用於生成可用時段
export const SLOT_INTERVAL_MINUTES = 60; // 每小時一個時段
