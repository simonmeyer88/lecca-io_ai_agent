/**
 * Returns the value if it is a valid millisecond timestamp, otherwise returns null.
 */
export function isValidMilliOrNull(value: any): string | null {
  //Check if the value is a number or a numeric string

  if (typeof value === 'number') {
    value = value.toString();
  } else if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  // Ensure the value can be converted to a number
  const num = Number(value);
  if (isNaN(num)) {
    return null;
  }

  // Check if the value is an integer and within a reasonable range
  const minMillis = 0;
  const maxMillis = Date.now();
  if (Number.isInteger(num) && num >= minMillis && num <= maxMillis) {
    return num.toString();
  } else {
    return null;
  }
}
