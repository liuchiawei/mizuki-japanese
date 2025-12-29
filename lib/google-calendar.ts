/**
 * Google Calendar API ラッパー
 * カレンダーの読み取りと予約の作成を処理
 */

import { google, calendar_v3 } from 'googleapis';
import { addMinutes, addDays, startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import {
  TEACHER_TIMEZONE,
  WORKING_HOURS,
  LESSON_DURATION_MINUTES,
  BUFFER_TIME_MINUTES,
  SLOT_INTERVAL_MINUTES,
  BOOKING_ID_PREFIX,
} from './constants';

// Google Calendar クライアントの初期化
function getCalendarClient(): calendar_v3.Calendar {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// カレンダー ID を取得
function getCalendarId(): string {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID is not set');
  }
  return calendarId;
}

/**
 * 予約 ID を生成
 * 形式: MZK-YYYYMMDD-XXXXXX
 */
export function generateBookingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${BOOKING_ID_PREFIX}-${dateStr}-${random}`;
}

/**
 * 指定期間の busy 時間を取得
 */
export async function getBusySlots(
  startDate: Date,
  endDate: Date
): Promise<{ start: Date; end: Date }[]> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: calendarId }],
      timeZone: TEACHER_TIMEZONE,
    },
  });

  const busySlots = response.data.calendars?.[calendarId]?.busy || [];

  return busySlots.map((slot) => ({
    start: new Date(slot.start!),
    end: new Date(slot.end!),
  }));
}

/**
 * 指定日の利用可能な時間枠を計算
 */
export async function getAvailableSlots(date: Date): Promise<
  {
    startTime: Date;
    endTime: Date;
    startTimeISO: string;
    endTimeISO: string;
  }[]
> {
  // 老師のタイムゾーンでの日付範囲を設定
  const teacherDate = toZonedTime(date, TEACHER_TIMEZONE);
  const dayStart = startOfDay(teacherDate);
  const dayEnd = endOfDay(teacherDate);

  // UTC に変換
  const startUTC = fromZonedTime(dayStart, TEACHER_TIMEZONE);
  const endUTC = fromZonedTime(dayEnd, TEACHER_TIMEZONE);

  // busy スロットを取得
  const busySlots = await getBusySlots(startUTC, endUTC);

  // 利用可能なスロットを計算
  const availableSlots: {
    startTime: Date;
    endTime: Date;
    startTimeISO: string;
    endTimeISO: string;
  }[] = [];

  // 営業時間内のスロットを生成
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    // スロット開始時間を老師のタイムゾーンで作成
    const slotStartLocal = new Date(dayStart);
    slotStartLocal.setHours(hour, 0, 0, 0);
    const slotStartUTC = fromZonedTime(slotStartLocal, TEACHER_TIMEZONE);

    // スロット終了時間（授業時間 + バッファ）
    const slotEndUTC = addMinutes(slotStartUTC, LESSON_DURATION_MINUTES);
    const slotWithBufferEnd = addMinutes(slotStartUTC, LESSON_DURATION_MINUTES + BUFFER_TIME_MINUTES);

    // 営業時間内かチェック
    const endHour = new Date(toZonedTime(slotEndUTC, TEACHER_TIMEZONE)).getHours();
    if (endHour > WORKING_HOURS.end) continue;

    // busy スロットと重複していないかチェック
    const isAvailable = !busySlots.some((busy) => {
      // 時間帯が重複しているか確認
      return slotStartUTC < busy.end && slotWithBufferEnd > busy.start;
    });

    // 過去の時間はスキップ
    const now = new Date();
    if (slotStartUTC <= now) continue;

    if (isAvailable) {
      availableSlots.push({
        startTime: slotStartUTC,
        endTime: slotEndUTC,
        startTimeISO: slotStartUTC.toISOString(),
        endTimeISO: slotEndUTC.toISOString(),
      });
    }
  }

  return availableSlots;
}

/**
 * 予約イベントを作成
 */
export interface BookingInfo {
  studentName: string;
  studentEmail: string;
  studentTimezone: string;
  note?: string;
}

export interface BookingEventData {
  startTime: Date;
  endTime: Date;
  bookingInfo: BookingInfo;
}

export async function createBookingEvent(data: BookingEventData): Promise<{
  eventId: string;
  bookingId: string;
  htmlLink: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();
  const bookingId = generateBookingId();

  const { startTime, endTime, bookingInfo } = data;

  // イベントの説明に予約情報を JSON で保存
  const bookingMetadata = {
    bookingId,
    studentName: bookingInfo.studentName,
    studentEmail: bookingInfo.studentEmail,
    studentTimezone: bookingInfo.studentTimezone,
    note: bookingInfo.note || '',
    createdAt: new Date().toISOString(),
    modificationCount: 0,
  };

  const event: calendar_v3.Schema$Event = {
    summary: `日本語レッスン - ${bookingInfo.studentName}`,
    description: `📚 予約情報\n\n学生: ${bookingInfo.studentName}\nEmail: ${bookingInfo.studentEmail}\n予約ID: ${bookingId}\n\n備考: ${bookingInfo.note || 'なし'}\n\n---\nMETADATA:${JSON.stringify(bookingMetadata)}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: TEACHER_TIMEZONE,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: TEACHER_TIMEZONE,
    },
    attendees: [
      { email: bookingInfo.studentEmail, displayName: bookingInfo.studentName },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1日前
        { method: 'popup', minutes: 30 },       // 30分前
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all', // 参加者にメール通知
  });

  return {
    eventId: response.data.id!,
    bookingId,
    htmlLink: response.data.htmlLink!,
  };
}

/**
 * 予約 ID でイベントを検索
 */
export async function findEventByBookingId(
  bookingId: string
): Promise<calendar_v3.Schema$Event | null> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  // 過去30日から未来30日まで検索
  const timeMin = addDays(new Date(), -30);
  const timeMax = addDays(new Date(), 60);

  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    q: bookingId, // 予約 ID で検索
    singleEvents: true,
  });

  const events = response.data.items || [];
  
  // 予約 ID が description に含まれるイベントを探す
  const event = events.find((e) => e.description?.includes(bookingId));
  
  return event || null;
}

/**
 * イベントからメタデータを抽出
 */
export function extractBookingMetadata(event: calendar_v3.Schema$Event): {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  studentTimezone: string;
  note: string;
  createdAt: string;
  modificationCount: number;
} | null {
  const description = event.description || '';
  const metadataMatch = description.match(/METADATA:(.+)$/);
  
  if (!metadataMatch) return null;
  
  try {
    return JSON.parse(metadataMatch[1]);
  } catch {
    return null;
  }
}

/**
 * 予約を更新（時間変更）
 */
export async function updateBookingTime(
  eventId: string,
  newStartTime: Date,
  newEndTime: Date,
  currentMetadata: ReturnType<typeof extractBookingMetadata>
): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  if (!currentMetadata) return false;

  // メタデータの更新
  const updatedMetadata = {
    ...currentMetadata,
    modificationCount: currentMetadata.modificationCount + 1,
    lastModifiedAt: new Date().toISOString(),
  };

  const updatedDescription = `📚 予約情報\n\n学生: ${currentMetadata.studentName}\nEmail: ${currentMetadata.studentEmail}\n予約ID: ${currentMetadata.bookingId}\n\n備考: ${currentMetadata.note || 'なし'}\n\n---\nMETADATA:${JSON.stringify(updatedMetadata)}`;

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      start: {
        dateTime: newStartTime.toISOString(),
        timeZone: TEACHER_TIMEZONE,
      },
      end: {
        dateTime: newEndTime.toISOString(),
        timeZone: TEACHER_TIMEZONE,
      },
      description: updatedDescription,
    },
    sendUpdates: 'all',
  });

  return true;
}

/**
 * 予約をキャンセル（イベント削除）
 */
export async function cancelBooking(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  await calendar.events.delete({
    calendarId,
    eventId,
    sendUpdates: 'all', // 参加者にキャンセル通知
  });

  return true;
}

/**
 * 指定時間帯が利用可能かチェック（予約時の二重チェック用）
 */
export async function checkSlotAvailability(
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const busySlots = await getBusySlots(
    addMinutes(startTime, -BUFFER_TIME_MINUTES),
    addMinutes(endTime, BUFFER_TIME_MINUTES)
  );

  return busySlots.length === 0;
}


