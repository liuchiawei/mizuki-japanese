/**
 * 予約を作成する API
 * POST /api/calendar/book
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createBookingEvent,
  checkSlotAvailability,
} from "@/lib/google-calendar";
import {
  bookingFormSchema,
  isBookingTimeValid,
  createBookingError,
} from "@/lib/booking";
import { LESSON_DURATION_MINUTES } from "@/lib/constants";
import { addMinutes } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 入力の検証
    const parseResult = bookingFormSchema.safeParse(body);
    if (!parseResult.success) {
      // ZodError は errors ではなく issues を使用する
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", firstError.message),
        },
        { status: 400 }
      );
    }

    const { studentName, studentEmail, studentTimezone, startTimeISO, note } =
      parseResult.data;
    const startTime = new Date(startTimeISO);
    const endTime = addMinutes(startTime, LESSON_DURATION_MINUTES);

    // 予約時間の検証
    const timeValidation = isBookingTimeValid(startTime);
    if (!timeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", timeValidation.error!),
        },
        { status: 400 }
      );
    }

    // スロットの空き状況を再確認（競合状態を防ぐ）
    const isAvailable = await checkSlotAvailability(startTime, endTime);
    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError(
            "SLOT_TAKEN",
            "抱歉，此時段剛被預約，請選擇其他時間"
          ),
        },
        { status: 409 }
      );
    }

    // 予約イベントを作成
    const result = await createBookingEvent({
      startTime,
      endTime,
      bookingInfo: {
        studentName,
        studentEmail,
        studentTimezone,
        note,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      message: "預約成功！確認信已發送至您的信箱",
      data: {
        eventId: result.eventId,
        calendarLink: result.htmlLink,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: createBookingError(
          "INTERNAL_ERROR",
          "創建預約時發生錯誤，請稍後再試"
        ),
      },
      { status: 500 }
    );
  }
}
