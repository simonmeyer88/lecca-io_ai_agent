export function parseNumberOrThrow({
  value,
  propertyName,
  emptyStringIsUndefined,
}: {
  value: string | number;
  propertyName?: string;
  /**
   * Defaults to `true`
   *
   * If `true`, an empty string will be treated as `undefined`
   */
  emptyStringIsUndefined?: boolean;
}): number | undefined {
  if (emptyStringIsUndefined != false) {
    if (value === '' || value === undefined || value === null) {
      return undefined;
    }
  }

  const parsedValue = Number(value);

  if (isNaN(parsedValue)) {
    throw new Error(
      `${propertyName ?? 'Value'} must be a number. It was: ${value}`,
    );
  }

  return parsedValue;
}
