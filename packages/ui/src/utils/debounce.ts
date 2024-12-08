/* eslint-disable @typescript-eslint/no-this-alias */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
