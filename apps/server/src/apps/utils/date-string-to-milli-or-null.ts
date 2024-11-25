/**
 * This is assuming date string is formatted 2024-06-08T16:23:21.257Z
 */
export function DateStringToMilliOrNull(
  value: string | undefined | null,
): string | null {
  if (!value) {
    return null;
  }

  const newDate = new Date(value);

  if (!newDate) {
    return null;
  } else {
    return newDate.getTime().toString();
  }
}
