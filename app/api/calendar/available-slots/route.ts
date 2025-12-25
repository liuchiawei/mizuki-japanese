/**
 * 利用可能な時間枠を取得する API
 * GET /api/calendar/available-slots?date=2024-01-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/google-calendar';
import { formatForTimezone } from '@/lib/timezone';
import { TEACHER_TIMEZONE, DEFAULT_STUDENT_TIMEZONE } from '@/lib/constants';
import { isBookingTimeValid } from '@/lib/booking';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const studentTimezone = searchParams.get('timezone') || DEFAULT_STUDENT_TIMEZONE;

    // 日付パラメータの検証
    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '請提供日期參數' } },
        { status: 400 }
      );
    }

    // 日付を解析
    const parsedDate = parseISO(dateParam);
    if (!isValid(parsedDate)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '無效的日期格式，請使用 YYYY-MM-DD' } },
        { status: 400 }
      );
    }

    // 老師のタイムゾーンでの日付の開始時刻を取得
    const targetDate = fromZonedTime(startOfDay(parsedDate), TEACHER_TIMEZONE);

    // 利用可能なスロットを取得
    const slots = await getAvailableSlots(targetDate);

    // 各スロットに対して予約可能かチェックし、学生のタイムゾーンでの時間も追加
    const formattedSlots = slots
      .filter((slot) => {
        const validation = isBookingTimeValid(slot.startTime);
        return validation.valid;
      })
      .map((slot) => ({
        ...slot,
        teacherTime: formatForTimezone(slot.startTime, TEACHER_TIMEZONE, 'HH:mm'),
        studentTime: formatForTimezone(slot.startTime, studentTimezone, 'HH:mm'),
        displayTeacher: `${formatForTimezone(slot.startTime, TEACHER_TIMEZONE, 'HH:mm')} - ${formatForTimezone(slot.endTime, TEACHER_TIMEZONE, 'HH:mm')}`,
        displayStudent: `${formatForTimezone(slot.startTime, studentTimezone, 'HH:mm')} - ${formatForTimezone(slot.endTime, studentTimezone, 'HH:mm')}`,
      }));

    return NextResponse.json({
      success: true,
      date: dateParam,
      teacherTimezone: TEACHER_TIMEZONE,
      studentTimezone,
      slots: formattedSlots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '取得可用時段時發生錯誤' } },
      { status: 500 }
    );
  }
}

