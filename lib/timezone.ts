/**
 * タイムゾーン処理ユーティリティ
 * 台湾（UTC+8）と東京（UTC+9）間の時間変換を処理
 */

import { format, parse, addMinutes, startOfDay, setHours, setMinutes } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { TEACHER_TIMEZONE, DEFAULT_STUDENT_TIMEZONE } from './constants';

/**
 * UTC 時間を指定タイムゾーンでフォーマット
 */
export function formatForTimezone(
  date: Date,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm'
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * 指定タイムゾーンの日付文字列を Date オブジェクトに変換
 */
export function parseInTimezone(
  dateString: string,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm'
): Date {
  const parsed = parse(dateString, formatStr, new Date());
  return fromZonedTime(parsed, timezone);
}

/**
 * 学生の時間を老師の時間に変換
 */
export function studentTimeToTeacherTime(
  studentTime: Date,
  studentTimezone: string = DEFAULT_STUDENT_TIMEZONE
): Date {
  // 学生のローカル時間を UTC に変換してから老師の時間に
  const studentZoned = toZonedTime(studentTime, studentTimezone);
  return toZonedTime(studentTime, TEACHER_TIMEZONE);
}

/**
 * 老師の時間を学生の時間に変換（表示用）
 */
export function teacherTimeToStudentTime(
  teacherTime: Date,
  studentTimezone: string = DEFAULT_STUDENT_TIMEZONE
): Date {
  return toZonedTime(teacherTime, studentTimezone);
}

/**
 * 日付を老師のタイムゾーンでの一日の始まりに設定
 */
export function startOfDayInTimezone(date: Date, timezone: string = TEACHER_TIMEZONE): Date {
  const zonedDate = toZonedTime(date, timezone);
  const startOfZonedDay = startOfDay(zonedDate);
  return fromZonedTime(startOfZonedDay, timezone);
}

/**
 * 指定タイムゾーンで特定の時刻を設定した Date を作成
 */
export function createTimeInTimezone(
  date: Date,
  hours: number,
  minutes: number = 0,
  timezone: string = TEACHER_TIMEZONE
): Date {
  const zonedDate = toZonedTime(date, timezone);
  const withTime = setMinutes(setHours(zonedDate, hours), minutes);
  return fromZonedTime(withTime, timezone);
}

/**
 * 二つの時間を人間が読みやすい形式で表示
 * 例: "14:00 - 14:50"
 */
export function formatTimeRange(
  startTime: Date,
  endTime: Date,
  timezone: string,
  includeDate: boolean = false
): string {
  const dateFormat = includeDate ? 'MM/dd HH:mm' : 'HH:mm';
  const start = formatInTimeZone(startTime, timezone, dateFormat);
  const end = formatInTimeZone(endTime, timezone, 'HH:mm');
  return `${start} - ${end}`;
}

/**
 * 日付を指定タイムゾーンでの曜日名を含むフォーマット
 */
export function formatDateWithWeekday(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy/MM/dd (EEE)');
}

/**
 * ISO 文字列から Date オブジェクトを作成
 */
export function parseISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Date オブジェクトを ISO 文字列に変換
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}


