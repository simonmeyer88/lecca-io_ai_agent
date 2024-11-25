export const luxonTimeFormats = [
  {
    label:
      'Full date with full time (e.g., Sunday, September 17, 2023, 11:23:58 AM)',
    value: 'EEEE, MMMM dd, yyyy, hh:mm:ss a',
  },
  {
    label:
      'Full date with abbreviated time (e.g., Sunday, September 17, 2023, 11:23 AM)',
    value: 'EEEE, MMMM dd, yyyy, hh:mm a',
  },
  {
    label: 'Medium date with time (e.g., Sep 17, 2023, 11:23 AM)',
    value: 'MMM dd, yyyy, hh:mm a',
  },
  {
    label: 'Medium date without time (e.g., Sep 17, 2023)',
    value: 'MMM dd, yyyy',
  },
  { label: 'Long date (e.g., September 17, 2023)', value: 'MMMM dd, yyyy' },
  { label: 'Short date with slashes (e.g., 9/17/2023)', value: 'M/d/yyyy' },
  { label: 'Short date with dashes (e.g., 17-09-2023)', value: 'dd-MM-yyyy' },
  { label: 'Compact date (e.g., 09172023)', value: 'MMddyyyy' },
  {
    label: 'ISO date with time (e.g., 2023-09-17T11:23:58)',
    value: "yyyy-MM-dd'T'HH:mm:ss",
  },
  { label: 'ISO date only (e.g., 2023-09-17)', value: 'yyyy-MM-dd' },
  { label: 'Year and month only (e.g., September 2023)', value: 'MMMM yyyy' },
  { label: 'Year and week number (e.g., 2023-W38)', value: "yyyy-'W'WW" },
  { label: 'Year only (e.g., 2023)', value: 'yyyy' },
  { label: '24-hour time with seconds (e.g., 23:23:58)', value: 'HH:mm:ss' },
  {
    label: '12-hour time with seconds (e.g., 11:23:58 PM)',
    value: 'hh:mm:ss a',
  },
  { label: '24-hour time without seconds (e.g., 23:23)', value: 'HH:mm' },
  { label: '12-hour time without seconds (e.g., 11:23 PM)', value: 'hh:mm a' },
  { label: 'Unix timestamp (seconds since epoch)', value: 'X' },
  { label: 'Unix timestamp (milliseconds since epoch)', value: 'x' },
] as const;
