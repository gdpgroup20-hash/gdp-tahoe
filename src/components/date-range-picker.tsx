"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  format,
  differenceInCalendarDays,
  getDay,
} from "date-fns";

interface DateRangePickerProps {
  selected: { from: Date | undefined; to: Date | undefined } | undefined;
  onSelect: (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => void;
  disabled?: (date: Date) => boolean;
  minNights?: number;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysForMonth(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  // Pad beginning with days from previous month
  const startDow = getDay(start);
  const prevMonth = subMonths(month, 1);
  const prevEnd = endOfMonth(prevMonth);
  const leadingDays: Date[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(prevEnd);
    d.setDate(prevEnd.getDate() - i);
    leadingDays.push(d);
  }

  // Pad end to fill 6 rows (42 cells)
  const totalCells = 42;
  const nextMonth = addMonths(month, 1);
  const trailingDays: Date[] = [];
  const remaining = totalCells - leadingDays.length - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
    trailingDays.push(d);
  }

  return [...leadingDays, ...days, ...trailingDays];
}

export function DateRangePicker({
  selected,
  onSelect,
  disabled,
  minNights = 2,
}: DateRangePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(today));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const rightMonth = useMemo(() => addMonths(currentMonth, 1), [currentMonth]);
  const canGoBack = isAfter(currentMonth, startOfMonth(today));

  const navigateBack = useCallback(() => {
    if (canGoBack) setCurrentMonth((m) => subMonths(m, 1));
  }, [canGoBack]);

  const navigateForward = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      if (disabled?.(date)) return;

      const from = selected?.from;
      const to = selected?.to;

      // If no start selected, or range is complete, or clicked before/equal to start: start fresh
      if (!from || to || !isAfter(date, from)) {
        onSelect({ from: date, to: undefined });
        return;
      }

      // Check minimum nights
      if (differenceInCalendarDays(date, from) < minNights) return;

      onSelect({ from, to: date });
    },
    [selected, onSelect, disabled, minNights]
  );

  const isInRange = useCallback(
    (date: Date) => {
      const from = selected?.from;
      const to = selected?.to;
      if (!from || !to) return false;
      return isAfter(date, from) && isBefore(date, to);
    },
    [selected]
  );

  const isInPreview = useCallback(
    (date: Date) => {
      const from = selected?.from;
      const to = selected?.to;
      if (!from || to || !hoverDate) return false;
      if (differenceInCalendarDays(hoverDate, from) < minNights) return false;
      return isAfter(date, from) && isBefore(date, hoverDate);
    },
    [selected, hoverDate, minNights]
  );

  const isPreviewEnd = useCallback(
    (date: Date) => {
      const from = selected?.from;
      const to = selected?.to;
      if (!from || to || !hoverDate) return false;
      if (differenceInCalendarDays(hoverDate, from) < minNights) return false;
      return isSameDay(date, hoverDate);
    },
    [selected, hoverDate, minNights]
  );

  const renderMonth = (month: Date, showLeftNav: boolean, showRightNav: boolean) => {
    const days = getDaysForMonth(month);

    return (
      <div className="flex-1 min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {showLeftNav ? (
            <button
              type="button"
              onClick={navigateBack}
              disabled={!canGoBack}
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#0f1d3d]/8 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <ChevronLeft />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <span className="text-[15px] font-semibold text-[#0f1d3d]">
            {format(month, "MMMM yyyy")}
          </span>
          {showRightNav ? (
            <button
              type="button"
              onClick={navigateForward}
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#0f1d3d]/8"
              aria-label="Next month"
            >
              <ChevronRight />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="h-10 flex items-center justify-center text-xs font-medium text-[#0f1d3d]/40 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const outside = !isSameMonth(date, month);
            const isDisabled = outside || (disabled?.(date) ?? false);
            const isToday = isSameDay(date, today);
            const isStart =
              selected?.from && isSameDay(date, selected.from);
            const isEnd =
              selected?.to && isSameDay(date, selected.to);
            const inRange = isInRange(date);
            const inPreview = isInPreview(date);
            const previewEnd = isPreviewEnd(date);

            // Range fill background on the cell
            let cellBg = "";
            if (isStart && (selected?.to || previewEnd || inPreview || (hoverDate && !selected?.to && isAfter(hoverDate, date) && differenceInCalendarDays(hoverDate, selected!.from!) >= minNights))) {
              cellBg = "bg-gradient-to-r from-transparent from-50% to-[#0f1d3d]/8 to-50%";
            } else if (isEnd) {
              cellBg = "bg-gradient-to-l from-transparent from-50% to-[#0f1d3d]/8 to-50%";
            } else if (inRange) {
              cellBg = "bg-[#0f1d3d]/8";
            } else if (inPreview) {
              cellBg = "bg-[#0f1d3d]/5";
            } else if (previewEnd) {
              cellBg = "bg-gradient-to-l from-transparent from-50% to-[#0f1d3d]/5 to-50%";
            }

            return (
              <div key={i} className={`h-10 flex items-center justify-center ${cellBg}`}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => !isDisabled && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    relative h-10 w-10 flex items-center justify-center text-sm transition-colors
                    ${outside ? "text-gray-300 cursor-default" : ""}
                    ${isDisabled && !outside ? "text-gray-300 cursor-not-allowed" : ""}
                    ${!isDisabled && !outside && !isStart && !isEnd ? "text-[#0f1d3d]" : ""}
                    ${!isDisabled && !outside && !isStart && !isEnd ? "hover:bg-[#0f1d3d]/5 hover:rounded-full" : ""}
                    ${isStart || isEnd ? "bg-[#0f1d3d] text-white rounded-full font-semibold" : ""}
                    ${isToday && !isStart && !isEnd ? "font-bold" : ""}
                  `}
                >
                  {date.getDate()}
                  {isToday && !isStart && !isEnd && (
                    <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0f1d3d]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop: two months */}
      <div className="hidden md:flex gap-8">
        {renderMonth(currentMonth, true, false)}
        {renderMonth(rightMonth, false, true)}
      </div>
      {/* Mobile: single month */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={navigateBack}
            disabled={!canGoBack}
            className="h-8 w-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#0f1d3d]/8 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
          <span className="text-[15px] font-semibold text-[#0f1d3d]">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={navigateForward}
            className="h-8 w-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#0f1d3d]/8"
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="h-10 flex items-center justify-center text-xs font-medium text-[#0f1d3d]/40 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Day grid */}
        <div className="grid grid-cols-7">
          {getDaysForMonth(currentMonth).map((date, i) => {
            const outside = !isSameMonth(date, currentMonth);
            const isDisabled = outside || (disabled?.(date) ?? false);
            const isToday = isSameDay(date, today);
            const isStart =
              selected?.from && isSameDay(date, selected.from);
            const isEnd =
              selected?.to && isSameDay(date, selected.to);
            const inRange = isInRange(date);
            const inPreview = isInPreview(date);
            const previewEnd = isPreviewEnd(date);

            let cellBg = "";
            if (isStart && (selected?.to || previewEnd || inPreview || (hoverDate && !selected?.to && isAfter(hoverDate, date) && differenceInCalendarDays(hoverDate, selected!.from!) >= minNights))) {
              cellBg = "bg-gradient-to-r from-transparent from-50% to-[#0f1d3d]/8 to-50%";
            } else if (isEnd) {
              cellBg = "bg-gradient-to-l from-transparent from-50% to-[#0f1d3d]/8 to-50%";
            } else if (inRange) {
              cellBg = "bg-[#0f1d3d]/8";
            } else if (inPreview) {
              cellBg = "bg-[#0f1d3d]/5";
            } else if (previewEnd) {
              cellBg = "bg-gradient-to-l from-transparent from-50% to-[#0f1d3d]/5 to-50%";
            }

            return (
              <div key={i} className={`h-10 flex items-center justify-center ${cellBg}`}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => !isDisabled && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    relative h-10 w-10 flex items-center justify-center text-sm transition-colors
                    ${outside ? "text-gray-300 cursor-default" : ""}
                    ${isDisabled && !outside ? "text-gray-300 cursor-not-allowed" : ""}
                    ${!isDisabled && !outside && !isStart && !isEnd ? "text-[#0f1d3d]" : ""}
                    ${!isDisabled && !outside && !isStart && !isEnd ? "hover:bg-[#0f1d3d]/5 hover:rounded-full" : ""}
                    ${isStart || isEnd ? "bg-[#0f1d3d] text-white rounded-full font-semibold" : ""}
                    ${isToday && !isStart && !isEnd ? "font-bold" : ""}
                  `}
                >
                  {date.getDate()}
                  {isToday && !isStart && !isEnd && (
                    <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0f1d3d]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0f1d3d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0f1d3d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
