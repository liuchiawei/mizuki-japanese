/**
 * 予約の照会・変更・キャンセル API
 * GET    /api/calendar/booking/[bookingId]?email=xxx
 * PATCH  /api/calendar/booking/[bookingId]
 * DELETE /api/calendar/booking/[bookingId]
 */

import { NextRequest, NextResponse } from "next/server";
import {
  findEventByBookingId,
  extractBookingMetadata,
  updateBookingTime,
  cancelBooking,
  checkSlotAvailability,
} from "@/lib/google-calendar";
import {
  bookingQuerySchema,
  modifyBookingSchema,
  canCancelBooking,
  canModifyBooking,
  isBookingTimeValid,
  createBookingError,
} from "@/lib/booking";
import { formatForTimezone } from "@/lib/timezone";
import {
  TEACHER_TIMEZONE,
  DEFAULT_STUDENT_TIMEZONE,
  LESSON_DURATION_MINUTES,
} from "@/lib/constants";
import { addMinutes } from "date-fns";

interface RouteParams {
  params: Promise<{ bookingId: string }>;
}

/**
 * 予約詳細を取得
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { bookingId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    // 入力の検証
    const parseResult = bookingQuerySchema.safeParse({ bookingId, email });
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", firstError.message),
        },
        { status: 400 }
      );
    }

    // イベントを検索
    const event = await findEventByBookingId(bookingId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("BOOKING_NOT_FOUND", "找不到此預約"),
        },
        { status: 404 }
      );
    }

    // メタデータを抽出
    const metadata = extractBookingMetadata(event);
    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INTERNAL_ERROR", "無法讀取預約資料"),
        },
        { status: 500 }
      );
    }

    // Email 検証
    if (metadata.studentEmail.toLowerCase() !== email?.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("EMAIL_MISMATCH", "Email 與預約資料不符"),
        },
        { status: 403 }
      );
    }

    const startTime = new Date(event.start?.dateTime!);
    const endTime = new Date(event.end?.dateTime!);
    const studentTimezone =
      metadata.studentTimezone || DEFAULT_STUDENT_TIMEZONE;

    // キャンセル・変更可否をチェック
    const cancelStatus = canCancelBooking(startTime);
    const modifyStatus = canModifyBooking(
      startTime,
      metadata.modificationCount
    );

    return NextResponse.json({
      success: true,
      booking: {
        bookingId: metadata.bookingId,
        studentName: metadata.studentName,
        studentEmail: metadata.studentEmail,
        note: metadata.note,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        displayTeacher:
          formatForTimezone(
            startTime,
            TEACHER_TIMEZONE,
            "yyyy/MM/dd (EEE) HH:mm"
          ) +
          " - " +
          formatForTimezone(endTime, TEACHER_TIMEZONE, "HH:mm") +
          " (東京)",
        displayStudent:
          formatForTimezone(
            startTime,
            studentTimezone,
            "yyyy/MM/dd (EEE) HH:mm"
          ) +
          " - " +
          formatForTimezone(endTime, studentTimezone, "HH:mm") +
          " (台北)",
        createdAt: metadata.createdAt,
        modificationCount: metadata.modificationCount,
        canCancel: cancelStatus.canCancel,
        cancelError: cancelStatus.error,
        canModify: modifyStatus.canModify,
        modifyError: modifyStatus.error,
      },
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: createBookingError("INTERNAL_ERROR", "查詢預約時發生錯誤"),
      },
      { status: 500 }
    );
  }
}

/**
 * 予約時間を変更
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { bookingId } = await params;
    const body = await request.json();

    // 入力の検証
    const parseResult = modifyBookingSchema.safeParse({ ...body, bookingId });
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", firstError.message),
        },
        { status: 400 }
      );
    }

    const { email, newStartTimeISO } = parseResult.data;

    // イベントを検索
    const event = await findEventByBookingId(bookingId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("BOOKING_NOT_FOUND", "找不到此預約"),
        },
        { status: 404 }
      );
    }

    // メタデータを抽出
    const metadata = extractBookingMetadata(event);
    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INTERNAL_ERROR", "無法讀取預約資料"),
        },
        { status: 500 }
      );
    }

    // Email 検証
    if (metadata.studentEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("EMAIL_MISMATCH", "Email 與預約資料不符"),
        },
        { status: 403 }
      );
    }

    // 変更可否をチェック
    const currentStartTime = new Date(event.start?.dateTime!);
    const modifyStatus = canModifyBooking(
      currentStartTime,
      metadata.modificationCount
    );
    if (!modifyStatus.canModify) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("CANNOT_MODIFY", modifyStatus.error!),
        },
        { status: 400 }
      );
    }

    // 新しい時間の検証
    const newStartTime = new Date(newStartTimeISO);
    const newEndTime = addMinutes(newStartTime, LESSON_DURATION_MINUTES);

    const timeValidation = isBookingTimeValid(newStartTime);
    if (!timeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", timeValidation.error!),
        },
        { status: 400 }
      );
    }

    // 新しいスロットの空き状況を確認
    const isAvailable = await checkSlotAvailability(newStartTime, newEndTime);
    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError(
            "SLOT_TAKEN",
            "新的時段已被預約，請選擇其他時間"
          ),
        },
        { status: 409 }
      );
    }

    // 予約を更新
    await updateBookingTime(event.id!, newStartTime, newEndTime, metadata);

    return NextResponse.json({
      success: true,
      bookingId,
      message: "預約已成功修改",
    });
  } catch (error) {
    console.error("Error modifying booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: createBookingError("INTERNAL_ERROR", "修改預約時發生錯誤"),
      },
      { status: 500 }
    );
  }
}

/**
 * 予約をキャンセル
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { email } = body;

    // 入力の検証
    const parseResult = bookingQuerySchema.safeParse({ bookingId, email });
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INVALID_INPUT", firstError.message),
        },
        { status: 400 }
      );
    }

    // イベントを検索
    const event = await findEventByBookingId(bookingId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("BOOKING_NOT_FOUND", "找不到此預約"),
        },
        { status: 404 }
      );
    }

    // メタデータを抽出
    const metadata = extractBookingMetadata(event);
    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("INTERNAL_ERROR", "無法讀取預約資料"),
        },
        { status: 500 }
      );
    }

    // Email 検証
    if (metadata.studentEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("EMAIL_MISMATCH", "Email 與預約資料不符"),
        },
        { status: 403 }
      );
    }

    // キャンセル可否をチェック
    const startTime = new Date(event.start?.dateTime!);
    const cancelStatus = canCancelBooking(startTime);
    if (!cancelStatus.canCancel) {
      return NextResponse.json(
        {
          success: false,
          error: createBookingError("CANNOT_CANCEL", cancelStatus.error!),
        },
        { status: 400 }
      );
    }

    // 予約をキャンセル
    await cancelBooking(event.id!);

    return NextResponse.json({
      success: true,
      bookingId,
      message: "預約已成功取消",
    });
  } catch (error) {
    console.error("Error canceling booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: createBookingError("INTERNAL_ERROR", "取消預約時發生錯誤"),
      },
      { status: 500 }
    );
  }
}
