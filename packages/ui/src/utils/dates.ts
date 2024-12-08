import { format, formatDistanceToNow, isToday } from 'date-fns';

export const newDateOrUndefined = (date: string | Date | undefined) => {
  return date ? new Date(date) : undefined;
};

export const toLocaleDateStringOrUndefined = (
  date: string | Date | undefined,
) => {
  return date ? new Date(date).toLocaleDateString() : undefined;
};

export const toLocaleStringOrUndefined = (date: string | Date | undefined) => {
  return date ? new Date(date).toLocaleString() : undefined;
};

export const toLocaleTimeOrDateTimeOrUndefined = (
  date: string | Date | undefined,
): string | undefined => {
  if (!date) return undefined;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is today
  if (isToday(dateObj)) {
    return format(dateObj, 'p'); // 'p' stands for localized time in the date-fns format
  } else {
    return format(dateObj, 'Pp'); // 'Pp' shows localized date and time
  }
};

export function timeAgo(
  date: Date | number | undefined,
  args?: { includeSeconds: boolean },
): string {
  // Convert input to a Date object if it's a number (timestamp)
  if (date == null) return '';

  const dateObj = typeof date === 'number' ? new Date(date) : date;

  // Use formatDistanceToNow to get the time difference in words
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    includeSeconds: args?.includeSeconds,
  });
}
