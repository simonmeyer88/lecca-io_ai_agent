import { DateTime } from 'luxon';

function isValidStringNumber(value: string) {
  return /^\d+$/.test(value);
}

/**
 * @param date Handles various date formats and returns an ISO string
 * @returns string
 *
 * @description Enter unix timestamps of seconds or milliseconds, ISO strings, or JavaScript Date objects and get an ISO string in return.
 */
export function parseDateToISO(date: any): string {
  // Handle ISO strings and Unix timestamp strings
  if (typeof date === 'string') {
    const isoDate = DateTime.fromISO(date, { zone: 'utc' });
    if (isoDate.isValid) {
      return isoDate.toISO();
    }

    // Handle string representations of Unix timestamps (milliseconds)
    if (isValidStringNumber(date) && date.length === 13) {
      const unixMsDate = DateTime.fromMillis(parseInt(date), { zone: 'utc' });
      if (unixMsDate.isValid) {
        return unixMsDate.toISO();
      }
    }

    // Handle string representations of Unix timestamps (seconds)
    if (isValidStringNumber(date) && date.length === 10) {
      const unixDate = DateTime.fromSeconds(parseInt(date), { zone: 'utc' });
      if (unixDate.isValid) {
        return unixDate.toISO();
      }
    }
  }

  // Handle Unix timestamps (in seconds)
  if (typeof date === 'number' && date.toString().length === 10) {
    const unixDate = DateTime.fromSeconds(date, { zone: 'utc' });
    if (unixDate.isValid) {
      return unixDate.toISO();
    }
  }

  // Handle Unix timestamps (in milliseconds)
  if (typeof date === 'number' && date.toString().length === 13) {
    const unixMsDate = DateTime.fromMillis(date, { zone: 'utc' });
    if (unixMsDate.isValid) {
      return unixMsDate.toISO();
    }
  }

  // Handle JavaScript Date object
  if (date instanceof Date) {
    const jsDate = DateTime.fromJSDate(date, { zone: 'utc' });
    if (jsDate.isValid) {
      return jsDate.toISO();
    }
  }

  // If none of the formats match, throw an error
  throw new Error(
    'Invalid date format, must be unix timestamp, ISO string, or Date object',
  );
}
